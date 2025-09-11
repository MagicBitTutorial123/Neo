"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
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
import { hasKeyboardBlocks } from "@/utils/keyboardBlockDetector";
import FirmwareInstallModal from "@/components/FirmwareInstallModal";
import { checkIfMicroPythonNeeded } from "@/utils/firmwareInstaller";
import AIChatbot from "@/components/AI/chatbot";
import "@/components/AI/chatbot.css";
import { useUser } from "@/context/UserContext";

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
  // User context for personalization
  const { userData } = useUser();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blocklyRef = useRef<{
    getCurrentCode: () => string;
    workspaceRef: React.RefObject<any>;
  } | null>(null);
  const [generatedCode, setGeneratedCode] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [connectionType, setConnectionType] = useState<
    "bluetooth" | "serial" | "none"
  >("bluetooth");
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [dashboardActive, setDashboardActive] = useState(false);
  const [tryingToConnect, setTryingToConnect] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState<"ldr" | "ultrasound">(
    "ldr"
  );

  const [showFirmwareModal, setShowFirmwareModal] = useState(false);
  const [hasKeyboardBlocksPresent, setHasKeyboardBlocksPresent] =
    useState(false);
  const [showConnectionTypePopup, setShowConnectionTypePopup] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [showUsbInstructions, setShowUsbInstructions] = useState(false);
  const [showUsbPortSelection, setShowUsbPortSelection] = useState(false);
  const [showBluetoothInstructions, setShowBluetoothInstructions] =
    useState(false);
  const [showBluetoothDeviceSelection, setShowBluetoothDeviceSelection] =
    useState(false);
  const [selectedBluetoothDevice, setSelectedBluetoothDevice] = useState<
    string | null
  >(null);
  const [selectedUsbPort, setSelectedUsbPort] = useState<string | null>(null);

  // Dashboard widget state
  const [widgets, setWidgets] = useState<
    Array<{ id: string; type: string; props: Record<string, unknown> }>
  >([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [latestAnalogByPin, setLatestAnalogByPin] = useState<{
    [key: number]: number;
  }>({});
  const [latestDigitalByPin, setLatestDigitalByPin] = useState<{
    [key: number]: number;
  }>({});
  const [widgetData, setWidgetData] = useState<{
    [key: string]: { value?: number; history?: number[] };
  }>({});
  const [sensorHistory, setSensorHistory] = useState<{
    [key: string]: number[];
  }>({});

  const portRef = useRef<unknown>(null);
  const bluetoothDeviceRef = useRef<BluetoothDevice | null>(null);
  const writeCharacteristicRef =
    useRef<BluetoothRemoteGATTCharacteristic | null>(null);
  const notifyCharacteristicRef = useRef<NotifiableCharacteristic | null>(null);
  const server = useRef<BluetoothGATTServer | null>(null);
  const keyStateRef = useRef<{ [key: string]: boolean }>({});

  // BLE connection stability improvements
  const bleCommandQueue = useRef<Array<{ command: string; retries: number }>>(
    []
  );
  const isProcessingQueue = useRef(false);
  const lastCommandTime = useRef(0);
  const connectionHealthCheck = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;
  const commandRateLimit = 50; // Minimum ms between commands
  const healthCheckInterval = 5000; // Check connection health every 5 seconds

  // const watchedPinsRef = useRef<Set<number>>(new Set());

  // Function to check for keyboard blocks and update state
  const checkForKeyboardBlocks = useCallback(() => {
    if (blocklyRef.current?.workspaceRef?.current) {
      const hasBlocks = hasKeyboardBlocks(
        blocklyRef.current.workspaceRef.current
      );
      setHasKeyboardBlocksPresent(hasBlocks);
    }
  }, []);

  // BLE command queue processing - MUST be defined before use
  const processBleCommandQueue = useCallback(async () => {
    if (isProcessingQueue.current || bleCommandQueue.current.length === 0) {
      return;
    }

    isProcessingQueue.current = true;

    while (bleCommandQueue.current.length > 0) {
      const now = Date.now();
      const timeSinceLastCommand = now - lastCommandTime.current;

      // Rate limiting: ensure minimum time between commands
      if (timeSinceLastCommand < commandRateLimit) {
        await new Promise((resolve) =>
          setTimeout(resolve, commandRateLimit - timeSinceLastCommand)
        );
      }

      const commandItem = bleCommandQueue.current.shift();
      if (!commandItem) continue;

      try {
        // Check connection health before sending
        if (
          connectionStatus !== "connected" ||
          !writeCharacteristicRef.current
        ) {
          continue;
        }

        await keyboardSendBLE(
          commandItem.command,
          writeCharacteristicRef.current
        );
        lastCommandTime.current = Date.now();
      } catch (error) {
        console.error(
          "Failed to send BLE command:",
          commandItem.command,
          error
        );

        // Retry logic
        if (commandItem.retries > 0) {
          commandItem.retries--;
          bleCommandQueue.current.unshift(commandItem);

          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, 100));
        } else {
          console.error(
            "Command failed after all retries:",
            commandItem.command
          );
          // If command fails completely, check connection health
          setConnectionStatus("disconnected");
          setIsConnected(false);
        }
      }
    }

    isProcessingQueue.current = false;
  }, [connectionStatus]);

  // BLE command queuing and rate limiting system
  const queueBleCommand = useCallback(
    async (command: string, maxRetries: number = 2) => {
      bleCommandQueue.current.push({ command, retries: maxRetries });

      if (!isProcessingQueue.current) {
        processBleCommandQueue();
      }
    },
    [processBleCommandQueue]
  );

  // Show welcome popup only on first visit (not on refresh)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSeenWelcome = localStorage.getItem("playground-welcome-seen");
      if (!hasSeenWelcome) {
        setShowWelcomePopup(true);
        localStorage.setItem("playground-welcome-seen", "true");
      }
    }
  }, []);

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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const port = portRef.current as any;
          if (port && (port.readable || port.writable)) {
            port.close().catch(console.error);
          }
        } catch (error) {}
      }
    };
  }, []);

  useEffect(() => {
    // Only add event listeners if keyboard blocks are present
    if (!hasKeyboardBlocksPresent) {
      return;
    }

    const handleKeyDown = async (e: KeyboardEvent) => {
      const keyMap: Record<string, string> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };

      let action = keyMap[e.key];

      // If not an arrow key, check if it's a custom key
      if (!action) {
        let customKey = e.key.toLowerCase();

        // Handle special keys
        if (customKey === " ") {
          customKey = "space";
        } else if (customKey === "enter") {
          customKey = "enter";
        } else if (customKey === "shift") {
          customKey = "shift";
        } else if (customKey === "control") {
          customKey = "ctrl";
        } else if (customKey === "alt") {
          customKey = "alt";
        } else if (customKey.length === 1) {
          // Single character keys (a-z, 0-9, etc.)
          action = customKey;
        } else {
          // For other keys, make safe for function names
          action = customKey.replace(/[^a-zA-Z0-9]/g, "_");
        }

        if (customKey !== e.key.toLowerCase() || customKey.length === 1) {
          action = customKey;
        }
      }

      // Prevent key repeat - only send if key is not already pressed
      if (action) {
        if (keyStateRef.current[action]) {
          return; // Key is already pressed, ignore this event
        }

        // Mark key as pressed
        keyStateRef.current[action] = true;
      }

      // Only proceed if connected
      if (connectionStatus !== "connected") {
        return;
      }

      if (action) {
        // Queue the command instead of sending directly
        bleCommandQueue.current.push({ command: action, retries: 2 });

        // Process queue if not already processing
        if (!isProcessingQueue.current) {
          processBleCommandQueue();
        }
      }
    };

    const handleKeyUp = async (e: KeyboardEvent) => {
      const keyMap: Record<string, string> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };

      let action = keyMap[e.key];

      // If not an arrow key, check if it's a custom key
      if (!action) {
        let customKey = e.key.toLowerCase();

        // Handle special keys
        if (customKey === " ") {
          customKey = "space";
        } else if (customKey === "enter") {
          customKey = "enter";
        } else if (customKey === "shift") {
          customKey = "shift";
        } else if (customKey === "control") {
          customKey = "ctrl";
        } else if (customKey === "alt") {
          customKey = "alt";
        } else if (customKey.length === 1) {
          // Single character keys (a-z, 0-9, etc.)
          action = customKey;
        } else {
          // For other keys, make safe for function names
          action = customKey.replace(/[^a-zA-Z0-9]/g, "_");
        }

        if (customKey !== e.key.toLowerCase() || customKey.length === 1) {
          action = customKey;
        }
      }

      if (action) {
        // Mark key as released for key repeat prevention
        keyStateRef.current[action] = false;

        // Only proceed if connected
        if (connectionStatus !== "connected") {
          return;
        }

        // Queue stop_all command instead of sending directly
        bleCommandQueue.current.push({ command: "stop_all", retries: 2 });

        // Process queue if not already processing
        if (!isProcessingQueue.current) {
          processBleCommandQueue();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [connectionStatus, hasKeyboardBlocksPresent]);

  // Simple Bluetooth connection
  const connectBluetooth = useCallback(async () => {
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
        const device = bluetoothDeviceRef.current;
        if (!device || !device.gatt) {
          throw new Error("No GATT available on device");
        }

        server.current = await device.gatt.connect();
        const service = await server.current?.getPrimaryService(
          "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
        );

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
                } catch {}
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
      if (
        error instanceof Error &&
        (error.name === "NotFoundError" || error.name === "NotAllowedError")
      ) {
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
  }, [tryingToConnect]);

  const clearWorkspace = () => {
    const workspace = Blockly.getMainWorkspace();
    if (workspace) {
      workspace.clear();
      setGeneratedCode(""); // Clear the generated code state too, if desired
    }
  };

  // Simple upload code
  const uploadCode = async () => {
    // Prefer code from the active tab inside BlocklyComponent (edited Python when on Code tab)
    const codeFromChild = blocklyRef.current?.getCurrentCode?.();
    const codeToUpload = codeFromChild ?? generatedCode;
    if (!codeToUpload) return;
    setIsUploading(true);
    try {
      if (connectionType === "bluetooth") {
        if (!isConnected) await connectBluetooth();
        await bluetoothUpload(codeToUpload, writeCharacteristicRef.current);
      } else {
        await usbUpload(codeToUpload, portRef);
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const navSerial = (
              navigator as unknown as {
                serial: { requestPort: () => Promise<any> };
              }
            ).serial;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let port = (portRef.current as any) || null;

            // Request port selection if needed
            if (!port || !port.readable || !port.writable) {
              port = await navSerial.requestPort();
              await port.open({ baudRate: 115200 });

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const port = portRef.current as any;
          if (port && (port.readable || port.writable)) {
            await port.close();
          }
        } catch (error) {}
      }
      portRef.current = null;

      setIsConnected(false);
      setConnectionStatus("disconnected");
    }
  };

  const sendBleControl = useCallback(async (payload: BleControlPayload) => {
    try {
      if (!writeCharacteristicRef.current) return;
      const text = JSON.stringify(payload) + "\n";
      const encoder = new TextEncoder();
      await writeCharacteristicRef.current.writeValue(encoder.encode(text));
    } catch (e) {
      console.error("BLE control send failed", e);
    }
  }, []);

  const onConnectionTypeChange = (type: "bluetooth" | "serial" | "none") => {
    if (isConnected) onConnectToggle(false);
    setConnectionType(type);
    if (type === "none") {
      setConnectionStatus("disconnected");
      setIsConnected(false);
    }
  };

  useEffect(() => {
    async function connect() {
      if (tryingToConnect) {
        await connectBluetooth();
      }
    }
    connect();
  }, [connectBluetooth, tryingToConnect]);

  // Check for keyboard blocks when workspace changes
  useEffect(() => {
    // Check for keyboard blocks initially and set up an interval to check until workspace is ready
    const checkInterval = setInterval(() => {
      if (blocklyRef.current?.workspaceRef?.current) {
        checkForKeyboardBlocks();
        clearInterval(checkInterval);
      }
    }, 100);

    return () => clearInterval(checkInterval);
  }, [checkForKeyboardBlocks]);

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

  // Handle sensor data for dashboard widgets
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<{
        sensor: string;
        value: number;
        pin?: number;
      }>;
      const detail = customEvent?.detail || {};
      const sensor = detail.sensor;
      const value = detail.value;
      const pin = detail.pin;

      // Handle analog sensor data
      if (sensor === "analog" && pin !== undefined) {
        setLatestAnalogByPin((prev) => ({ ...prev, [pin]: value }));

        setSensorHistory((prev) => {
          const newHistory = { ...prev };
          if (!newHistory[`pin_${pin}`]) {
            newHistory[`pin_${pin}`] = [];
          }
          const existing = newHistory[`pin_${pin}`];
          const next = [...existing, Number(value)].slice(-60); // Keep last 60 readings
          newHistory[`pin_${pin}`] = next;
          return newHistory;
        });

        // Update widget data for graphs
        setWidgetData((prev) => ({
          ...prev,
          [`pin_${pin}`]: {
            value: value,
            history: sensorHistory[`pin_${pin}`] || [],
          },
        }));
      }

      // Handle ultrasound sensor data
      if (sensor === "ultrasound") {
        setWidgetData((prev) => {
          const currentHistory = prev.ultrasound?.history;
          const historyArray = Array.isArray(currentHistory)
            ? currentHistory
            : [];
          return {
            ...prev,
            ultrasound: {
              value: value,
              history: [...historyArray, value].slice(-60),
            },
          };
        });
      }
    };

    window.addEventListener("sensorData", handler as EventListener);
    return () =>
      window.removeEventListener("sensorData", handler as EventListener);
  }, [sensorHistory]);

  // Widget utility functions
  const removeWidget = (id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
  };

  const updateWidgetProps = (id: string, prop: string, value: unknown) => {
    setWidgets((prev) =>
      prev.map((widget) =>
        widget.id === id
          ? { ...widget, props: { ...widget.props, [prop]: value } }
          : widget
      )
    );
  };

  return (
    <>
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
                title="Neo Playground"
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
                onPowerUp={() => setShowConnectionTypePopup(true)}
              />

              {dashboardActive ? (
                <div className="flex-1 overflow-auto p-6 bg-[#F7FAFC]">
                  <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => setShowAddMenu(true)}
                        className="px-3 py-1.5 rounded-md bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-sm font-medium text-[#222E3A]"
                      >
                        + Add widget
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {widgets.map((widget) => {
                        // Analog Widget
                        if (widget.type === "analog") {
                          const pin = widget.props.pin as number;
                          const widgetInfo = widgetData[`pin_${pin}`];
                          const value =
                            (widgetInfo?.value as number) ??
                            (latestAnalogByPin[pin] as number) ??
                            0;

                          return (
                            <div
                              key={widget.id}
                              className="bg-white border border-gray-100 rounded-2xl shadow-md p-5"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="text-sm font-medium text-[#222E3A] opacity-80">
                                  Analog
                                </div>
                                <div className="flex items-center gap-2">
                                  <select
                                    value={pin}
                                    onChange={(e) =>
                                      updateWidgetProps(
                                        widget.id,
                                        "pin",
                                        parseInt(e.target.value)
                                      )
                                    }
                                    className="text-xs text-black border border-gray-200 rounded px-2 py-1"
                                  >
                                    {[
                                      0, 2, 4, 5, 12, 13, 14, 15, 16, 17, 18,
                                      19, 21, 22, 23, 25, 26, 27, 32, 33, 34,
                                      35, 36, 39,
                                    ].map((pinNum) => (
                                      <option key={pinNum} value={pinNum}>
                                        Pin {pinNum}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => removeWidget(widget.id)}
                                    aria-label="Remove widget"
                                    className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50 text-gray-500"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                              <div className="text-2xl font-bold text-[#222E3A]">
                                {isConnected ? value : "—"}
                              </div>
                            </div>
                          );
                        }

                        // Graph Widget
                        if (widget.type === "graph") {
                          const pin = (widget.props.pin as number) || 32;
                          const widgetInfo = widgetData[`pin_${pin}`];
                          const series =
                            (widgetInfo?.history as number[]) || [];
                          const currentValue = widgetInfo?.value as number;

                          return (
                            <div
                              key={widget.id}
                              className="bg-white border border-gray-100 rounded-2xl shadow-md p-5 sm:col-span-1 lg:col-span-2"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="text-sm font-medium text-[#222E3A] opacity-80">
                                  Analog Graph
                                </div>
                                <div className="flex items-center gap-2">
                                  <select
                                    value={pin}
                                    onChange={(e) => {
                                      const nextPin = parseInt(
                                        e.target.value,
                                        10
                                      );
                                      updateWidgetProps(
                                        widget.id,
                                        "pin",
                                        nextPin
                                      );
                                      setWidgetData((prev) => ({
                                        ...prev,
                                        [`pin_${nextPin}`]: {
                                          ...prev[`pin_${nextPin}`],
                                          history: [],
                                        },
                                      }));
                                    }}
                                    className="px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white text-[#222E3A] text-sm hover:bg-gray-50 focus:outline-none shadow-sm"
                                  >
                                    {[
                                      0, 2, 4, 5, 12, 13, 14, 15, 16, 17, 18,
                                      19, 21, 22, 23, 25, 26, 27, 32, 33, 34,
                                      35, 36, 39,
                                    ].map((pinNum) => (
                                      <option key={pinNum} value={pinNum}>
                                        Pin {pinNum}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => removeWidget(widget.id)}
                                    aria-label="Remove widget"
                                    className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50 text-gray-500"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>

                              {/* Simple SVG Graph */}
                              <div className="w-full h-48 bg-gray-50 rounded-lg p-4">
                                {series.length > 0 ? (
                                  <svg
                                    width="100%"
                                    height="100%"
                                    viewBox="0 0 400 200"
                                  >
                                    <g>
                                      {/* Grid lines */}
                                      {[0, 50, 100, 150, 200].map((y) => (
                                        <line
                                          key={y}
                                          x1="0"
                                          y1={y}
                                          x2="400"
                                          y2={y}
                                          stroke="#E5E7EB"
                                          strokeWidth="1"
                                          strokeDasharray="2,2"
                                        />
                                      ))}
                                      {/* Data line */}
                                      <path
                                        d={series
                                          .map(
                                            (value: number, index: number) => {
                                              const x =
                                                (index / (series.length - 1)) *
                                                400;
                                              const y =
                                                200 - (value / 4095) * 200;
                                              return `${
                                                index === 0 ? "M" : "L"
                                              } ${x} ${y}`;
                                            }
                                          )
                                          .join(" ")}
                                        fill="none"
                                        stroke="#2563EB"
                                        strokeWidth="2"
                                      />
                                    </g>
                                  </svg>
                                ) : (
                                  <div className="flex items-center justify-center h-full text-gray-400">
                                    No data yet
                                  </div>
                                )}
                              </div>
                              <div className="mt-2 text-xs text-gray-500">
                                {isConnected
                                  ? `Latest: ${
                                      currentValue != null
                                        ? Math.round(currentValue)
                                        : "—"
                                    }`
                                  : "—"}
                              </div>
                            </div>
                          );
                        }

                        return null;
                      })}
                    </div>

                    {/* Add Widget Menu */}
                    {showAddMenu && (
                      <div
                        className="fixed inset-0 z-30 flex items-center justify-center"
                        onClick={() => setShowAddMenu(false)}
                      >
                        <div className="absolute inset-0 bg-black/20" />
                        <div
                          className="relative w-[320px] rounded-xl shadow-2xl overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="bg-white px-4 py-3 border-b border-gray-200 text-[#222E3A] text-sm font-semibold">
                            Add a widget
                          </div>
                          <div className="bg-white p-3">
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => {
                                  setWidgets((prev) => [
                                    ...prev,
                                    {
                                      id: `${Date.now()}-analog`,
                                      type: "analog",
                                      props: { pin: 36 },
                                    },
                                  ]);
                                  setShowAddMenu(false);
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 shadow-sm text-sm text-left hover:bg-gray-50 text-[#222E3A]"
                              >
                                Analog
                              </button>
                              <button
                                onClick={() => {
                                  setWidgets((prev) => [
                                    ...prev,
                                    {
                                      id: `${Date.now()}-graph`,
                                      type: "graph",
                                      props: { pin: 32 },
                                    },
                                  ]);
                                  setShowAddMenu(false);
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 shadow-sm text-sm text-left hover:bg-gray-50 text-[#222E3A]"
                              >
                                Graph
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  {/* Blockly Component */}
                  <div className="flex-1 pt-16">
                    <BlocklyComponent
                      ref={blocklyRef}
                      generatedCode={generatedCode}
                      setGeneratedCode={setGeneratedCode}
                      onWorkspaceChange={checkForKeyboardBlocks}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <FirmwareInstallModal
          open={showFirmwareModal}
          onClose={() => setShowFirmwareModal(false)}
          portRef={portRef}
        />
        <AIChatbot
          workspaceRef={blocklyRef.current?.workspaceRef}
          onClose={() => {}}
          username={userData?.name || "there"}
        />

        {/* 1. WELCOME POPUP */}
        {showWelcomePopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden border-2 border-blue-300">
              <div className="bg-gray-100 px-4 py-3 flex items-center justify-between border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <h3 className="text-sm font-medium text-gray-700">
                  Power Up Robot
                </h3>
                <button
                  onClick={() => setShowWelcomePopup(false)}
                  className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded transition-colors"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="p-6 text-center">
                <div className="w-20 h-20 mx-auto mb-4 relative">
                  <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl">🤖</span>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Power Up Robot!
                </h2>
                <p className="text-gray-600 mb-6 text-sm">
                  Welcome to the playground! Click the Power Up button to select
                  your connection type.
                </p>

                <button
                  onClick={() => {
                    setShowWelcomePopup(false);
                    setShowConnectionTypePopup(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00AEEF] to-[#0078D4] text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium text-base mb-3"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  Power Up Now
                </button>

                <button
                  onClick={() => {
                    setShowWelcomePopup(false);
                  }}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium hover:bg-gray-100 rounded"
                >
                  Skip for now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. CONNECTION TYPE SELECTION POPUP */}
        {showConnectionTypePopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border-2 border-blue-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-[#00AEEF] to-[#0078D4] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                  >
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-[#222E3A] mb-2">
                  Power Up
                </h2>
                <p className="text-gray-600">Choose your connection type</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    onConnectionTypeChange("bluetooth");
                    setShowConnectionTypePopup(false);
                    setShowBluetoothInstructions(true);
                    // Mark welcome as seen when user selects connection
                    localStorage.setItem("playground-welcome-seen", "true");
                  }}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                    connectionType === "bluetooth"
                      ? "border-[#00AEEF] bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        connectionType === "bluetooth"
                          ? "bg-[#00AEEF]"
                          : "bg-gray-100"
                      }`}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={
                          connectionType === "bluetooth" ? "white" : "#666"
                        }
                        strokeWidth="2"
                      >
                        <path d="M6.5 6.5l11 11L12 23l-1-1-1-1 6-6-6-6 1-1 1-1 5.5 5.5z" />
                        <path d="M17.5 6.5l-11 11L12 1l1 1 1 1-6 6 6 6-1 1-1 1-5.5-5.5z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-[#222E3A]">
                        Bluetooth
                      </div>
                      <div className="text-sm text-gray-600">
                        Wireless connection
                      </div>
                    </div>
                    {connectionType === "bluetooth" && (
                      <div className="ml-auto">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#00AEEF"
                          strokeWidth="2"
                        >
                          <polyline points="20,6 9,17 4,12" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => {
                    onConnectionTypeChange("serial");
                    setShowConnectionTypePopup(false);
                    setShowUsbInstructions(true);
                    // Mark welcome as seen when user selects connection
                    localStorage.setItem("playground-welcome-seen", "true");
                  }}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                    connectionType === "serial"
                      ? "border-[#00AEEF] bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        connectionType === "serial"
                          ? "bg-[#00AEEF]"
                          : "bg-gray-100"
                      }`}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={connectionType === "serial" ? "white" : "#666"}
                        strokeWidth="2"
                      >
                        <rect
                          x="2"
                          y="3"
                          width="20"
                          height="14"
                          rx="2"
                          ry="2"
                        />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-[#222E3A]">USB</div>
                      <div className="text-sm text-gray-600">
                        Wired connection
                      </div>
                    </div>
                    {connectionType === "serial" && (
                      <div className="ml-auto">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#00AEEF"
                          strokeWidth="2"
                        >
                          <polyline points="20,6 9,17 4,12" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowConnectionTypePopup(false);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowConnectionTypePopup(false);
                  }}
                  className="flex-1 px-4 py-2 bg-[#00AEEF] text-white rounded-lg hover:bg-[#0078D4] transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
        {/* 3. USB INSTRUCTIONS POPUP */}
        {showUsbInstructions && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-lg shadow-2xl max-w-lg w-full mx-4 overflow-hidden border-2 border-blue-300">
              <div className="bg-gray-100 px-4 py-3 flex items-center justify-between border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <h3 className="text-sm font-medium text-gray-700">
                  USB Connection Setup
                </h3>
                <button
                  onClick={() => {
                    setShowUsbInstructions(false);
                  }}
                  className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded transition-colors"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="p-6 text-center">
                <div className="w-32 h-24 mx-auto mb-4 relative bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-8 bg-gray-400 rounded flex items-center justify-center mb-2">
                      <div className="w-12 h-4 bg-gray-600 rounded"></div>
                    </div>
                    <div className="text-xs text-gray-600 font-medium">
                      USB Cable
                    </div>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Connect via USB Cable
                </h2>
                <div className="space-y-3 text-left mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <p className="text-gray-700">
                      Connect the USB cable to your Neo device
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <p className="text-gray-700">
                      Connect the other end to your computer&apos;s USB port
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <p className="text-gray-700">
                      Turn ON the power switch on your Neo device
                    </p>
                  </div>
                </div>

                <div className="w-24 h-24 mx-auto mb-4 relative bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-2 shadow-md">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-green-600">
                          ON
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 font-medium">
                      Neo Switch
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowUsbInstructions(false);
                    setShowUsbPortSelection(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00AEEF] to-[#0078D4] text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium text-base"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. USB PORT SELECTION POPUP */}
        {showUsbPortSelection && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-lg shadow-2xl max-w-2xl w-full mx-4 overflow-hidden border-2 border-blue-300">
              <div className="bg-gray-100 px-4 py-3 flex items-center justify-between border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <h3 className="text-sm font-medium text-gray-700">
                  Select USB Serial Port
                </h3>
                <button
                  onClick={() => {
                    setShowUsbPortSelection(false);
                  }}
                  className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded transition-colors"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="p-4">
                <div className="text-center mb-4">
                  <div className="w-16 h-12 mx-auto mb-3 relative bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-8 bg-gray-300 rounded flex items-center justify-center mb-1">
                        <div className="w-8 h-4 bg-gray-500 rounded flex items-center justify-center">
                          <div className="w-6 h-2 bg-gray-700 rounded"></div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        USB Port
                      </div>
                    </div>
                  </div>
                  <h2 className="text-lg font-bold text-gray-800 mb-2">
                    Select USB Serial Port
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Choose the correct USB serial port for your Neo device.
                  </p>
                </div>

                <div className="mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="text-sm text-gray-500 mb-2">
                      Available Ports:
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-white rounded border hover:bg-blue-50 transition-colors">
                        <span className="text-sm text-gray-700">
                          COM3 - USB Serial Device
                        </span>
                        <button
                          onClick={() => {
                            setSelectedUsbPort("COM3 - USB Serial Device");
                            setShowUsbPortSelection(false);
                            setDashboardActive(false);
                          }}
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        >
                          Select
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white rounded border hover:bg-blue-50 transition-colors">
                        <span className="text-sm text-gray-700">
                          COM5 - Arduino Uno
                        </span>
                        <button
                          onClick={() => {
                            setSelectedUsbPort("COM5 - Arduino Uno");
                            setShowUsbPortSelection(false);
                            setDashboardActive(false);
                          }}
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        >
                          Select
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-100 rounded border">
                        <span className="text-sm text-gray-400">
                          No ports detected
                        </span>
                        <span className="text-xs text-gray-400">-</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-left">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      !
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800 mb-1">
                        Can&apos;t see any ports?
                      </h4>
                      <ul className="text-xs text-yellow-700 space-y-0.5">
                        <li>• Check your drivers in your computer</li>
                        <li>• Make sure USB cable is properly connected</li>
                        <li>• Try a different USB port</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => {
                      setShowUsbPortSelection(false);
                      setDashboardActive(false);
                    }}
                    className="w-full px-6 py-3 bg-gradient-to-r from-[#00AEEF] to-[#0078D4] text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium text-base"
                  >
                    Go to Playground
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. BLUETOOTH INSTRUCTIONS POPUP */}
        {showBluetoothInstructions && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-lg shadow-2xl max-w-lg w-full mx-4 overflow-hidden border-2 border-blue-300">
              <div className="bg-gray-100 px-4 py-3 flex items-center justify-between border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <h3 className="text-sm font-medium text-gray-700">
                  Bluetooth Connection Setup
                </h3>
                <button
                  onClick={() => {
                    setShowBluetoothInstructions(false);
                  }}
                  className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded transition-colors"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="p-6 text-center">
                {/* Battery Image */}
                <div className="w-32 h-24 mx-auto mb-4 relative bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-12 bg-gray-300 rounded-lg flex items-center justify-center mb-2 shadow-md">
                      <div className="w-12 h-8 bg-gray-500 rounded flex items-center justify-center">
                        <div className="w-8 h-6 bg-green-400 rounded flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            100%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 font-medium">
                      Battery Power
                    </div>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Power Device via Battery
                </h2>
                <div className="space-y-3 text-left mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <p className="text-gray-700">
                      Ensure your Neo device has sufficient battery power
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <p className="text-gray-700">
                      Turn ON the power switch on your Neo device
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <p className="text-gray-700">
                      Wait for the device to boot up completely
                    </p>
                  </div>
                </div>

                {/* Neo Switch ON Animation */}
                <div className="w-24 h-24 mx-auto mb-4 relative bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-2 shadow-md animate-pulse">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-green-600">
                          ON
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 font-medium">
                      Neo Switch
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowBluetoothInstructions(false);
                    setShowBluetoothDeviceSelection(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00AEEF] to-[#0078D4] text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium text-base"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. BLUETOOTH DEVICE SELECTION POPUP */}
        {showBluetoothDeviceSelection && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-lg shadow-2xl max-w-2xl w-full mx-4 overflow-hidden border-2 border-blue-300">
              <div className="bg-gray-100 px-4 py-3 flex items-center justify-between border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <h3 className="text-sm font-medium text-gray-700">
                  Select Bluetooth Device
                </h3>
                <button
                  onClick={() => {
                    setShowBluetoothDeviceSelection(false);
                  }}
                  className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded transition-colors"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="p-4">
                <div className="text-center mb-4">
                  <div className="w-16 h-12 mx-auto mb-3 relative bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-1 shadow-md">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                        >
                          <path d="M6.5 6.5l11 11L12 23l-1-1-1-1 6-6-6-6 1-1 1-1 5.5 5.5z" />
                          <path d="M17.5 6.5l-11 11L12 1l1 1 1 1-6 6 6 6-1 1-1 1-5.5-5.5z" />
                        </svg>
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        Bluetooth
                      </div>
                    </div>
                  </div>
                  <h2 className="text-lg font-bold text-gray-800 mb-2">
                    Select Bluetooth Device
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Choose your Neo device from the available Bluetooth devices.
                  </p>
                </div>

                <div className="mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="text-sm text-gray-500 mb-2">
                      Available Devices:
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-white rounded border hover:bg-blue-50 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M6.5 6.5l11 11L12 23l-1-1-1-1 6-6-6-6 1-1 1-1 5.5 5.5z" />
                              <path d="M17.5 6.5l-11 11L12 1l1 1 1 1-6 6 6 6-1 1-1 1-5.5-5.5z" />
                            </svg>
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-medium text-gray-700">
                              Neo-Device-001
                            </div>
                            <div className="text-xs text-gray-500">
                              Signal: Strong
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedBluetoothDevice("Neo-Device-001");
                            setShowBluetoothDeviceSelection(false);
                            setDashboardActive(false);
                          }}
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        >
                          Select
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white rounded border hover:bg-blue-50 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M6.5 6.5l11 11L12 23l-1-1-1-1 6-6-6-6 1-1 1-1 5.5 5.5z" />
                              <path d="M17.5 6.5l-11 11L12 1l1 1 1 1-6 6 6 6-1 1-1 1-5.5-5.5z" />
                            </svg>
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-medium text-gray-700">
                              Neo-Device-002
                            </div>
                            <div className="text-xs text-gray-500">
                              Signal: Medium
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedBluetoothDevice("Neo-Device-002");
                            setShowBluetoothDeviceSelection(false);
                            setDashboardActive(false);
                          }}
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        >
                          Select
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-100 rounded border">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M6.5 6.5l11 11L12 23l-1-1-1-1 6-6-6-6 1-1 1-1 5.5 5.5z" />
                              <path d="M17.5 6.5l-11 11L12 1l1 1 1 1-6 6 6 6-1 1-1 1-5.5-5.5z" />
                            </svg>
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-medium text-gray-400">
                              No devices found
                            </div>
                            <div className="text-xs text-gray-400">
                              Make sure device is powered on
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">-</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-left">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      !
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800 mb-1">
                        Can&apos;t see your device?
                      </h4>
                      <ul className="text-xs text-yellow-700 space-y-0.5">
                        <li>• Make sure your Neo device is powered on</li>
                        <li>
                          • Check that Bluetooth is enabled on your computer
                        </li>
                        <li>• Try refreshing the device list</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => {
                      setShowBluetoothDeviceSelection(false);
                      setDashboardActive(false);
                    }}
                    className="w-full px-6 py-3 bg-gradient-to-r from-[#00AEEF] to-[#0078D4] text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium text-base"
                  >
                    Go to Playground
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
