import uasyncio as asyncio
import machine
import gc
import os

def check_reset_flag():
    """Check for reset flag and perform soft reset if needed"""
    try:
        if "reset.txt" in os.listdir():
            with open("reset.txt") as f:
                if "1" in f.read():
                    os.remove("reset.txt")
                    print("Soft reset triggered")
                    machine.reset()
    except Exception as e:
        print(f"Reset check error: {e}")

def reset_code_files():
    """Reset code files to default state"""
    try:
        with open('keyboardhandler.py', 'w') as f:
            f.write("# Default keyboard handler\n")
        with open('main.py', 'w') as f:
            f.write("import uasyncio as asyncio\n\nasync def mainLoop():\n    print('Default mainLoop running. Upload new code via BLE.')\n    await asyncio.sleep(5)\n")
        print("Code files reset to default")
    except Exception as e:
        print(f"File reset error: {e}")

async def main():
    """Main entry point - starts BLE service"""
    try:
        from initBLE import start_ble_service
        
        print("Starting Magicbit Firmware...")
        
        # Start BLE service (this will run indefinitely)
        await start_ble_service()
        
    except Exception as e:
        print(f"Boot error: {e}")
        reset_code_files()
        machine.reset()

# Start the system
asyncio.run(main())
