import uasyncio as asyncio
from ble_uart_peripheral import BLEUART
import machine
import json
import re
import gc
import sys
from machine import Pin, ADC
import time

# GPIO pins that can be reset
GPIO_PINS = [0, 2, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33]

# Global task reference
main_task = None

# Pin definitions - only analog input pins
ANALOG_PINS = [0, 2, 4,  12, 13, 14, 15, 25, 26, 27, 32, 33, 34, 35, 36, 39]
writing_code = False
code = ""
ULTRASOUND_PIN = Pin(26, Pin.OUT)  # single pin

def read_ultrasound():
    try:
        # Send trigger pulse
        ULTRASOUND_PIN.init(Pin.OUT)
        ULTRASOUND_PIN.value(0)
        time.sleep_us(2)
        ULTRASOUND_PIN.value(1)
        time.sleep_us(10)
        ULTRASOUND_PIN.value(0)

        # Switch to input to read echo
        ULTRASOUND_PIN.init(Pin.IN)
        duration = machine.time_pulse_us(ULTRASOUND_PIN, 1, 30000)  # max 30ms
        distance_cm = (duration / 2) / 29.1
        return round(distance_cm, 2)
    except Exception as e:
        print(f"Ultrasound read error: {e}")
        return None
 
    
def reset_gpio_pins():
    """Reset all GPIO pins to low state"""
    for pin_num in GPIO_PINS:
        try:
            Pin(pin_num, Pin.OUT).value(0)
        except Exception as e:
            print(f"Pin {pin_num} reset failed: {e}")

def clear_modules():
    """Clear main and keyboardhandler modules from cache"""
    for mod in ["main", "keyboardhandler"]:
        if mod in sys.modules:
            del sys.modules[mod]

async def reload_user_code():
    """Reload and restart user code modules"""
    global main_task
    
    print("Reloading user code...")

    # Reset GPIO pins
    reset_gpio_pins()
    
    # Clear module cache
    clear_modules()
    
    # Cancel existing main task
    if main_task and not main_task.done():
        main_task.cancel()
        try:
            await main_task
        except asyncio.CancelledError:
            pass
    
    # Import fresh modules and start new task
    import main
    import keyboardhandler
    
    main_task = asyncio.create_task(main.mainLoop())
    gc.collect()
    
    print("User code reloaded successfully")
    return True
    


def process_code_upload(code_buffer):
    """Process uploaded code and save to files"""
    try:
        # Split main code and event handlers
        parts = code_buffer.split("#Event Handlers")
        main_code = parts[0] if parts else ""
        handler_code = "".join(parts[1:]) if len(parts) > 1 else ""
        
        # Process main.py
        with open('main.py', 'w') as f:
            main_code = "import uasyncio as asyncio\n" + main_code
            lines = main_code.splitlines()
            converted = []
            
            for line in lines:
                # Convert time.sleep to asyncio.sleep
               if re.match(r'^\s*while\s+True\s*:', line):
                    converted.append("    " + line)               # indent once inside async def
                    converted.append("      await asyncio.sleep(0)")  # properly nested sleep
               else:
                    converted.append("    " + line)     
            
            final_code = "async def mainLoop():\n" + "\n".join(converted) + "\n"
            print(final_code)
            f.write(final_code)
        
        with open('keyboardhandler.py', 'w') as f:
            f.write("import uasyncio as asyncio\nfrom machine import Pin\nimport neopixel\n")
            # Convert to async functions
            handler_code = re.sub(r'time\.sleep', r'await asyncio.sleep', handler_code)
            handler_code = re.sub(r'def ', r'async def ', handler_code)
            print(handler_code)
            # Remove indentation
            f.write(handler_code)
        
        print("Code files written successfully")
        return True
        
    except Exception as e:
        print(f"Code processing error: {e}")
        return False

async def handle_keypress(key_name):
    """Handle keypress events"""
    method_name = f"key_{key_name}_pressed"
    try:
        # Clear module cache and reimport
        if "keyboardhandler" in sys.modules:
            del sys.modules["keyboardhandler"]
        
        import keyboardhandler
        method = getattr(keyboardhandler, method_name, None)
        
        if method:
            await method()
        else:
            print(f"Method {method_name} not found")
            
    except Exception as e:
        print(f"Keypress error: {e}")

async def process_ble_command(data_json, uart):
    global writing_code,code
    
    """Process incoming BLE commands"""
    mode = data_json.get('mode', '')
        
    if mode == "start":
        writing_code = True
        print("Code upload started")
        
    elif mode == "upload":
        code += data_json.get('data', '') + '\n'
        
    elif mode == "end":
        print("Code upload finished, processing...")
        uart.write(b"Upload complete\n")
        process_code_upload(code)
        code = ""
        await reload_user_code()
            
    elif mode == "keypress":
        key_name = data_json.get('data', '')
        await handle_keypress(key_name)
    
    elif mode == "get_analog_data":
        # Send current analog readings
        uart.write((json.dumps({"ack": "get_analog_data", "message": "Analog data streaming"}) + "\n").encode())

async def start_ble_service():
    """Main BLE service loop"""
    print("Starting BLE service...")
    
    try:
        ble = bluetooth.BLE()
        uart = BLEUART(ble, name="Neo")

        async def analog_sensor_loop():
            """Continuously read analog pins and send data when connected"""
            # ADC cache for analog pins
            adc_cache = {}
            
            def get_adc(pin_num):
                if pin_num not in ANALOG_PINS:
                    return None
                if pin_num in adc_cache:
                    return adc_cache[pin_num]
                try:
                    adc_obj = ADC(Pin(pin_num))
                    adc_cache[pin_num] = adc_obj
                    return adc_obj
                except Exception as e:
                    print(f"ADC init failed on pin {pin_num}: {e}")
                    adc_cache[pin_num] = None
                    return None

            while True:
                try:
                    if len(uart._connections) > 0:
                        # Read all analog pins
                        payload = {
                            "type": "sensors",
                            "timestamp": time.ticks_ms() if hasattr(time, 'ticks_ms') else int(time.time() * 1000),
                            "analog": {},
                        }
                        
                        # Read analog values from all analog pins
                        for pin_num in ANALOG_PINS:
                            adc = get_adc(pin_num)
                            if adc is not None:
                                try:
                                    if (pin_num == 26):
                                        payload["analog"][str(pin_num)] = read_ultrasound()
                                    else:
                                        payload["analog"][str(pin_num)] = adc.read()
                                except Exception as e:
                                    print(f"Error reading pin {pin_num}: {e}")

                        # Send data if we have any readings
                        if payload["analog"]:
                            uart.write((json.dumps(payload) + "\n").encode())
                                
                        # Send data 5 times per second
                        await asyncio.sleep(0.2)
                    else:
                        # No connections, sleep longer
                        await asyncio.sleep(1.0)
                        
                except Exception as e:
                    print(f"Analog sensor loop error: {e}")
                    await asyncio.sleep(0.5)
        
        print("BLE service ready")
        print(f"Analog pins: {ANALOG_PINS}")
        print("Streaming analog sensor data when connected")

        # Start background analog sensor streaming task
        asyncio.create_task(analog_sensor_loop())
        
        # Status indicator
        last_status_time = 0
        
        while True:
            if uart.any():
                try:
                    chunk = uart.read().decode('utf-8')
                    buffer = chunk
                    
                    # Process complete lines
                    while '\n' in buffer:
                        line, buffer = buffer.split('\n', 1)
                        line = line.strip()
                        
                        if not line:
                            continue
                        
                        data_json = json.loads(line)
                        print(f"Received command: {data_json}")
                        await process_ble_command(data_json, uart)
                        
                except Exception as e:
                    print(f"BLE processing error: {e}")
            
            # Show status every 10 seconds
            current_time = time.ticks_ms() if hasattr(time, 'ticks_ms') else int(time.time() * 1000)
            if current_time - last_status_time > 10000:  # 10 seconds
                if len(uart._connections) > 0:
                    print("Status: Connected - streaming analog data")
                else:
                    print("Status: No connections - waiting for connection")
                last_status_time = current_time
            
            await asyncio.sleep(0.01)
            
    except Exception as e:
        print(f"BLE service error: {e}")
        machine.reset()