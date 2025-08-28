"use client";
import React, { useRef, useEffect, useState } from "react";
import "blockly/javascript";
import "@/components/Blockly/customblocks/magicbitblocks";
import "@/components/Blockly/customblocks/keyboardBlocks";
import SideNavbar from "@/components/SideNavbar";
import BlocklyComponent from "@/components/Blockly/BlocklyComponent";
import * as Blockly from "blockly/core";
import "blockly/blocks";
import * as En from "blockly/msg/en";
import { usbUpload } from "@/utils/usbUpload";
import { bluetoothUpload } from "@/utils/bluetoothUpload";
import Header from "@/components/StatusHeaderBar";
import { keyboardSendBLE } from "@/utils/keyboardPress";
import FirmwareInstallModal from "@/components/FirmwareInstallModal";
import { checkIfMicroPythonNeeded } from "@/utils/firmwareInstaller";

// Simple type declarations
interface BluetoothGATT {
  connected: boolean;
  connect: () => Promise<BluetoothGATTServer>;
  disconnect: () => void;
}

interface BluetoothGATTServer {
  connected: boolean;
  getPrimaryService: (serviceId: string) => Promise<BluetoothGATTService>;
}

type BleControlPayload = {
  mode: string;
  pin?: number;
  pins?: number[];
  trig?: number;
  echo?: number;
  active?: boolean;
};

interface BluetoothGATTService {
  getCharacteristic: (
    characteristicId: string
  ) => Promise<BluetoothRemoteGATTCharacteristic>;
}

interface BluetoothRemoteGATTCharacteristic {
  writeValue: (value: BufferSource) => Promise<void>;
}

interface NotifiableCharacteristic extends BluetoothRemoteGATTCharacteristic {
  startNotifications: () => Promise<NotifiableCharacteristic | void>;
  addEventListener: (
    type: "characteristicvaluechanged",
    listener: (ev: Event) => void
  ) => void;
  value?: DataView;
}

interface BluetoothDevice {
  gatt?: BluetoothGATT;
  addEventListener: (event: string, callback: () => void) => void;
}

Blockly.setLocale(En);

export default function Playground() {
  const [generatedCode, setGeneratedCode] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [connectionType, setConnectionType] = useState<"bluetooth" | "serial">(
    "bluetooth"
  );
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [dashboardActive, setDashboardActive] = useState(false);
  const [tryingToConnect, setTryingToConnect] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState<"ldr" | "ultrasound">(
    "ldr"
  );
  

  const [showFirmwareModal, setShowFirmwareModal] = useState(false);

  const portRef = useRef<unknown>(null);
  const bluetoothDeviceRef = useRef<BluetoothDevice | null>(null);
  const writeCharacteristicRef =
    useRef<BluetoothRemoteGATTCharacteristic | null>(null);
  const notifyCharacteristicRef = useRef<NotifiableCharacteristic | null>(null);
  const server = useRef<BluetoothGATTServer | null>(null);
  // const watchedPinsRef = useRef<Set<number>>(new Set());

  // Simple cleanup
  useEffect(() => {
    return () => {
      // Cleanup Bluetooth
      if (bluetoothDeviceRef.current?.gatt?.connected) {
        bluetoothDeviceRef.current.gatt.disconnect();
      }
      
      // Cleanup Serial port
      if (portRef.current) {
        try {
          const port = portRef.current as any;
          if (port && (port.readable || port.writable)) {
            port.close().catch(console.error);
          }
        } catch (error) {
          console.log("Error closing serial port on cleanup:", error);
        }
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      const keyMap: Record<string, string> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };

      const action = keyMap[e.key]; // ... existing code ...

      // Update the connection handling to detect cancellations
      // const connectBluetooth = async () => {
      //   try {
      //     setConnectionStatus("connecting");
      //     // Request device
      //     if (!bluetoothDeviceRef.current) {
      //       const navBle = (
      //         navigator as unknown as {
      //           bluetooth: {
      //             requestDevice: (options: {
      //               filters: Array<{ name: string }>;
      //               optionalServices: string[];
      //             }) => Promise<BluetoothDevice>;
      //           };
      //         }
      //       ).bluetooth;

      //       try {
      //         bluetoothDeviceRef.current = await navBle.requestDevice({
      //           filters: [{ name: "Neo" }],
      //           optionalServices: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"],
      //         });
      //       } catch (error) {
      //         // Handle user cancellation
      //         if (
      //           error.name === "NotFoundError" ||
      //           error.name === "NotAllowedError"
      //         ) {
      //           console.log("Bluetooth connection canceled by user");
      //           setConnectionStatus("disconnected");
      //           setIsConnected(false);
      //           // Dispatch cancellation event
      //           try {
      //             window.dispatchEvent(new CustomEvent("connectionCanceled"));
      //           } catch {}
      //           return;
      //         }
      //         throw error;
      //       }

      //       // Handle disconnection
      //       bluetoothDeviceRef.current.addEventListener(
      //         "gattserverdisconnected",
      //         async () => {
      //           setIsConnected(false);
      //           setConnectionStatus("disconnected");
      //           try {
      //             window.dispatchEvent(
      //               new CustomEvent("bleConnection", {
      //                 detail: { connected: false },
      //               })
      //             );
      //           } catch {}
      //         }
      //       );
      //     }

      //     // ... rest of existing connection logic ...
      //   } catch (error) {
      //     console.error("Connection failed:", error);

      //     // Handle specific cancellation errors
      //     if (
      //       error.name === "NotFoundError" ||
      //       error.name === "NotAllowedError"
      //     ) {
      //       console.log("Bluetooth connection canceled by user");
      //       setConnectionStatus("disconnected");
      //       setIsConnected(false);
      //       // Dispatch cancellation event
      //       try {
      //         window.dispatchEvent(new CustomEvent("connectionCanceled"));
      //       } catch {}
      //       return;
      //     }

      //     if (tryingToConnect) {
      //       setTimeout(async () => {
      //         setTryingToConnect(false);
      //         await connectBluetooth();
      //       }, 2000);
      //     }
      //   }
      // };

     
      if (action) {
        try {
          await keyboardSendBLE(action, writeCharacteristicRef.current);
        } catch (error) {
          console.error("Failed to send key:", error);
          setConnectionStatus("disconnected");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [connectionStatus]);

  // Simple Bluetooth connection
  const connectBluetooth = async () => {
    try {
      setConnectionStatus("connecting");
      // Request device
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
                  if (msg?.type === "analog_sensors") {
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
        try {
          window.dispatchEvent(
            new CustomEvent("bleConnection", { detail: { connected: true } })
          );
        } catch {}
      }
    } catch (error) {
      console.error("Connection failed:", error);
      
      // Check if user cancelled the device selection
      if (error instanceof Error && (error.name === "NotFoundError" || error.name === "NotAllowedError")) {
        console.log("Bluetooth connection canceled by user");
        setConnectionStatus("disconnected");
        setIsConnected(false);
        setTryingToConnect(false); // Stop trying to connect
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

  const clearWorkspace = () => {
    console.log("test");
    const workspace = Blockly.getMainWorkspace();
    if (workspace) {
      workspace.clear();
      setGeneratedCode(""); // Clear the generated code state too, if desired
    }
  };

  // Simple upload code
  const uploadCode = async () => {
    if (!generatedCode) return;
    setIsUploading(true);
    try {
      if (connectionType === "bluetooth") {
        if (!isConnected) await connectBluetooth();
        await bluetoothUpload(generatedCode, writeCharacteristicRef.current);
      } else {
        await usbUpload(generatedCode, portRef);
        setIsConnected(true);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert(
        `Upload failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsUploading(false);
    }
  };

  const onConnectToggle = async (connected: boolean) => {
    if (connected) {
      try {
        if (connectionType === "bluetooth") {
          setTryingToConnect(true);
        } else {
          // Serial connection - show connecting status first
          setConnectionStatus("connecting");
          setIsConnected(false);
          
          try {
            const navSerial = (navigator as unknown as { serial: { requestPort: () => Promise<any> } }).serial;
            let port = (portRef.current as any) || null;
            
            // Request port selection if needed
            if (!port || !port.readable || !port.writable) {
              port = await navSerial.requestPort();
              await port.open({ baudRate: 115200 });
              (portRef as any).current = port;
            }
            
            // Only set connected after successful port opening
            setIsConnected(true);
            setConnectionStatus("connected");
            
            // Check for MicroPython and prompt installer if missing
            const needs = await checkIfMicroPythonNeeded(port, undefined);
            if (needs) setShowFirmwareModal(true);
            
          } catch (error) {
            console.error("Serial connection failed:", error);
            setConnectionStatus("disconnected");
            setIsConnected(false);
            throw error; // Re-throw to be caught by outer catch
          }
        }
      } catch {
        setConnectionStatus("disconnected");
        setIsConnected(false);
      }
    } else {
      setConnectionStatus("disconnecting");
      
      // Handle Bluetooth disconnection
      if (bluetoothDeviceRef.current?.gatt?.connected) {
        bluetoothDeviceRef.current.gatt.disconnect();
      }
      bluetoothDeviceRef.current = null;
      writeCharacteristicRef.current = null;
      notifyCharacteristicRef.current = null;
      
      // Handle Serial port disconnection
      if (portRef.current) {
        try {
          const port = portRef.current as any;
          if (port && (port.readable || port.writable)) {
            await port.close();
          }
        } catch (error) {
          console.log("Error closing serial port:", error);
        }
      }
      portRef.current = null;
      
      setIsConnected(false);
      setConnectionStatus("disconnected");
    }
  };

  const sendBleControl = async (payload: BleControlPayload) => {
    try {
      if (!writeCharacteristicRef.current) return;
      const text = JSON.stringify(payload) + "\n";
      const encoder = new TextEncoder();
      await writeCharacteristicRef.current.writeValue(encoder.encode(text));
    } catch (e) {
      console.error("BLE control send failed", e);
    }
  };

  const onConnectionTypeChange = (type: "bluetooth" | "serial") => {
    if (isConnected) onConnectToggle(false);
    setConnectionType(type);
  };

  useEffect(() => {
    async function connect() {
      if (tryingToConnect) {
        await connectBluetooth();
      }
    }
    connect();
  }, [tryingToConnect]);

  // // Listen for batch pin requests and forward to firmware (optional future multi-stream)
  useEffect(() => {
    const handler = (e: CustomEvent<{ pins: number[] }>) => {
      const pins = e?.detail?.pins || [];
      // Tell firmware to stream multiple pins when supported; fall back handled by firmware
      sendBleControl({ mode: "set_adc_pins", pins });
    };
    const listener: (evt: Event) => void = (evt) =>
      handler(evt as CustomEvent<{ pins: number[] }>);
    window.addEventListener("setAdcPins", listener);
    return () => window.removeEventListener("setAdcPins", listener);
  }, [sendBleControl]);

  return (
    <div className="app-wrapper">
      <div>
        <div className="h-screen bg-white flex flex-row w-screen">
          <SideNavbar
            onDashboardClick={() => setDashboardActive((v) => !v)}
            dashboardActive={dashboardActive}
          />
          <div className="flex flex-col w-full h-full">
            <Header
              missionNumber={0}
              title="Playground"
              liveUsers={17}
              isPlayground={true}
              onRun={uploadCode}
              timeAllocated="100"
              isConnected={isConnected}
              setIsConnected={setIsConnected}
              onConnectToggle={onConnectToggle}
              connectionStatus={connectionStatus}
              setConnectionStatus={setConnectionStatus}
              onErase={clearWorkspace}
              onConnectionTypeChange={onConnectionTypeChange}
              connectionType={connectionType}
              isUploading={isUploading}
            />

            {dashboardActive ? (
              <div className="flex-1 overflow-auto p-6 bg-[#F7FAFC]">
                <div className="max-w-4xl mx-auto">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#222E3A] mb-2">
                      Sensor
                    </label>
                    <select
                      value={selectedSensor}
                      onChange={(e) =>
                        setSelectedSensor(
                          e.target.value as "ldr" | "ultrasound"
                        )
                      }
                      className="w-56 px-3 py-2 border rounded-lg bg-white text-[#222E3A]"
                    >
                      <option value="ldr">LDR</option>
                      <option value="ultrasound">Ultrasound</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white border rounded-xl shadow-sm p-5">
                      <div className="text-sm text-gray-500 mb-1">
                        Current value
                      </div>
                     
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <BlocklyComponent
                generatedCode={generatedCode}
                setGeneratedCode={setGeneratedCode}
              />
            )}
          </div>
        </div>
      </div>
      <FirmwareInstallModal 
        open={showFirmwareModal} 
        onClose={() => setShowFirmwareModal(false)} 
        portRef={portRef}
      />
    </div>
  );
}
