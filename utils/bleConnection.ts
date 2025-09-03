// Common BLE connection utility for both playground and missions

// Use any types to avoid conflicts between playground and missions type definitions
type BluetoothDevice = any;
type BluetoothRemoteGATTServer = any;
type BluetoothRemoteGATTService = any;
type BluetoothRemoteGATTCharacteristic = any;
type NotifiableCharacteristic = any;

export const createBLEConnection = ({
  bluetoothDeviceRef,
  writeCharacteristicRef,
  notifyCharacteristicRef,
  server,
  setIsConnected,
  setConnectionStatus,
  setTryingToConnect,
  setShowBLETroubleshootingModal,
  tryingToConnect,
  bleConnectionTimeout,
  setBleConnectionTimeout
}: any) => {
  const connectBluetooth = async () => {
    try {
      setConnectionStatus("connecting");
      
      // Request device with timeout handling
      if (!bluetoothDeviceRef.current) {
        const navBle = (
          navigator as unknown as {
            bluetooth: {
              requestDevice: (options: {
                filters: Array<{ name: string }>;
                optionalServices: string[];
              }) => Promise<BluetoothDevice>;
            };
          }
        ).bluetooth;
        
        bluetoothDeviceRef.current = await navBle.requestDevice({
          filters: [{ name: "Neo" }],
          optionalServices: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"],
        });

        // Handle disconnection
        bluetoothDeviceRef.current.addEventListener(
          "gattserverdisconnected",
          async () => {
            setIsConnected(false);
            setConnectionStatus("disconnected");
            try {
              window.dispatchEvent(
                new CustomEvent("bleConnection", {
                  detail: { connected: false },
                })
              );
            } catch {}
          }
        );
      }

      if (!server.current?.connected) {
        console.log("Connecting to server");
        const device = bluetoothDeviceRef.current;
        if (!device || !device.gatt) {
          throw new Error("No GATT available on device");
        }

        server.current = await device.gatt.connect();
        console.log(server.current);
        const service = await server.current?.getPrimaryService(
          "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
        );
        
        console.log("service: ", service);
        const characteristic = await service.getCharacteristic(
          "6e400002-b5a3-f393-e0a9-e50e24dcca9e"
        );
        
        // Subscribe to notifications from TX characteristic
        const notifyCharacteristic = (await service.getCharacteristic(
          "6e400003-b5a3-f393-e0a9-e50e24dcca9e"
        )) as unknown as NotifiableCharacteristic;
        
        const handleNotification = (event: Event) => {
          try {
            const value = (event.target as unknown as NotifiableCharacteristic)
              .value as DataView;
            let str = "";
            for (let i = 0; i < value.byteLength; i++) {
              str += String.fromCharCode(value.getUint8(i));
            }
            // Notifications may stream; split by newlines
            str
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean)
              .forEach((line) => {
                try {
                  const msg = JSON.parse(line);
                  if (msg?.type === "sensors") {
                      Object.entries(msg.analog).forEach(([pinStr, val]) => {
                          window.dispatchEvent(
                            new CustomEvent("sensorData", {
                              detail: {
                                sensor: "analog",
                                value: val,
                                pin: Number(pinStr),
                              },
                            })
                          );
                      });
                      if (msg.ultrasound) {
                        window.dispatchEvent(
                          new CustomEvent("sensorData", {
                            detail: {
                              sensor: "ultrasound",
                              value: msg.ultrasound,
                            },
                          })
                        );
                      }
                    }
                  } catch {
                    console.log("BLE raw:", line);
                  }
                });
          } catch (e) {
            console.error("Notification parse error", e);
          }
        };
        await notifyCharacteristic.startNotifications();
        notifyCharacteristic.addEventListener(
          "characteristicvaluechanged",
          handleNotification
        );
        notifyCharacteristicRef.current = notifyCharacteristic;

        writeCharacteristicRef.current = characteristic;
        setConnectionStatus("connected");
        setIsConnected(true);
        setTryingToConnect(false);
        
        // Clear the timeout since connection was successful
        if (bleConnectionTimeout) {
          clearTimeout(bleConnectionTimeout);
          setBleConnectionTimeout(null);
        }
        
        try {
          window.dispatchEvent(
            new CustomEvent("bleConnection", { detail: { connected: true } })
          );
        } catch {}
      }
    } catch (error) {
      console.error("Connection failed:", error);
      
      // Clear the timeout since connection failed
      if (bleConnectionTimeout) {
        clearTimeout(bleConnectionTimeout);
        setBleConnectionTimeout(null);
      }
      
      // Check if user cancelled the device selection or no device found
      if (error instanceof Error && (error.name === "NotFoundError" || error.name === "NotAllowedError")) {
        console.log("Bluetooth connection canceled by user or no device found");
        setConnectionStatus("disconnected");
        setIsConnected(false);
        setTryingToConnect(false);
        
        // Show troubleshooting modal after a short delay
        setTimeout(() => {
          setShowBLETroubleshootingModal(true);
        }, 500);
        
        return; // Don't retry on user cancellation
      }
      
      // Only retry for other types of errors if still trying to connect
      setConnectionStatus("disconnected");
      setIsConnected(false);
      if (tryingToConnect) {
        setTimeout(async () => {
          setTryingToConnect(false);
          await connectBluetooth();
        }, 2000);
      }
    }
  };

  return connectBluetooth;
};
