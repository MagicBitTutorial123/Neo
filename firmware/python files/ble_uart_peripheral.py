# This example demonstrates a peripheral implementing the Nordic UART Service (NUS).

# This example demonstrates the low-level bluetooth module. For most
# applications, we recommend using the higher-level aioble library which takes
# care of all IRQ handling and connection management. See
# https://github.com/micropython/micropython-lib/tree/master/micropython/bluetooth/aioble

import bluetooth
from ble_advertising import advertising_payload
from machine import PWM, Pin

from micropython import const

_IRQ_CENTRAL_CONNECT = const(1)
_IRQ_CENTRAL_DISCONNECT = const(2)
_IRQ_GATTS_WRITE = const(3)

_FLAG_WRITE = const(0x0008)
_FLAG_NOTIFY = const(0x0010)

_UART_UUID = bluetooth.UUID("6E400001-B5A3-F393-E0A9-E50E24DCCA9E")
_UART_TX = (
    bluetooth.UUID("6E400003-B5A3-F393-E0A9-E50E24DCCA9E"),
    _FLAG_NOTIFY,
)
_UART_RX = (
    bluetooth.UUID("6E400002-B5A3-F393-E0A9-E50E24DCCA9E"),
    _FLAG_WRITE,
)
_UART_SERVICE = (
    _UART_UUID,
    (_UART_TX, _UART_RX),
)

# org.bluetooth.characteristic.gap.appearance.xml
_ADV_APPEARANCE_GENERIC_COMPUTER = const(128)


def play_connect_sound():
    """Play a buzzer sound when BLE connects"""
    try:
        # Use GPIO pin 25 for buzzer (common on many ESP32 boards)
        # You can change this pin number based on your hardware
        buzzer_pin = Pin(25, Pin.OUT)
        pwm = PWM(buzzer_pin)
        
        # Play a short beep sound
        pwm.freq(1000)  # 1kHz frequency
        pwm.duty_u16(32768)  # 50% duty cycle
        
        import time
        time.sleep_ms(200)  # Sound for 200ms
        
        # Stop the sound
        pwm.duty_u16(0)
        pwm.deinit()
        
        print("BLE connection sound played")
        
    except Exception as e:
        print(f"Buzzer error: {e}")


class BLEUART:
    def __init__(self, ble, name="mpy-uart", rxbuf=100):
        self._ble = ble
        self._ble.active(True)
        self._ble.irq(self._irq)

        ((self._tx_handle, self._rx_handle),) = self._ble.gatts_register_services((_UART_SERVICE,))
        # Increase the size of the rx buffer and enable append mode.
        self._ble.gatts_set_buffer(self._rx_handle, rxbuf, True)
        self._connections = set()
        self._rx_buffer = bytearray()
        self._handler = None
        self._payload = advertising_payload(
            name=name,
            appearance=_ADV_APPEARANCE_GENERIC_COMPUTER,
              services=[_UART_UUID]
        )
        import time
        time.sleep_ms(1000)

        self._advertise()

    def irq(self, handler):
        self._handler = handler

    def _irq(self, event, data):
        # Track connections so we can send notifications.
        if event == _IRQ_CENTRAL_CONNECT:
            conn_handle, _, _ = data
            self._connections.add(conn_handle)
            print("BLE connected:", conn_handle)
            print("Currently connected:", len(self._connections) > 0)
            # Play connection sound
            play_connect_sound()
        elif event == _IRQ_CENTRAL_DISCONNECT:
            conn_handle, _, _ = data
            if conn_handle in self._connections:
                self._connections.remove(conn_handle)
                print("BLE disconnected:", conn_handle)
                print("Currently connected:", len(self._connections) > 0)
            # Start advertising again to allow a new connection.
            self._advertise()
        elif event == _IRQ_GATTS_WRITE:
            conn_handle, value_handle = data
            if conn_handle in self._connections and value_handle == self._rx_handle:
                self._rx_buffer += self._ble.gatts_read(self._rx_handle)
                if self._handler:
                    self._handler()

    def any(self):
        return len(self._rx_buffer)

    def read(self, sz=None):
        if not sz:
            sz = len(self._rx_buffer)
        result = self._rx_buffer[0:sz]
        self._rx_buffer = self._rx_buffer[sz:]
        return result

    def write(self, data):
        for conn_handle in self._connections:
            self._ble.gatts_notify(conn_handle, self._tx_handle, data)

    def close(self):
        for conn_handle in self._connections:
            self._ble.gap_disconnect(conn_handle)
        self._connections.clear()

    def _advertise(self, interval_us=500000):
        self._ble.gap_advertise(interval_us, adv_data=self._payload)



