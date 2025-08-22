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

interface BluetoothGATTService {
  getCharacteristic: (characteristicId: string) => Promise<BluetoothRemoteGATTCharacteristic>;
}

interface BluetoothRemoteGATTCharacteristic {
  writeValue: (value: BufferSource) => Promise<void>;
}

interface BluetoothDevice {
  gatt?: BluetoothGATT;
  addEventListener: (event: string, callback: () => void) => void;
}

declare global {
  interface Navigator {
    bluetooth: {
      requestDevice: (options: { filters: Array<{ name: string }>; optionalServices: string[] }) => Promise<BluetoothDevice>;
    };
  }
}
import { useSidebar } from "@/context/SidebarContext";

Blockly.setLocale(En);

export default function Playground() {
  const { sidebarCollapsed } = useSidebar();
  const [generatedCode, setGeneratedCode] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [connectionType, setConnectionType] = useState<"bluetooth" | "serial">(
    "bluetooth"
  );
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [dashboardActive, setDashboardActive] = useState(false);
  const [tryingToConnect, setTryingToConnect] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const portRef = useRef<any>(null);
  const bluetoothDeviceRef = useRef<BluetoothDevice | null>(null);
  const writeCharacteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
  const server = useRef<BluetoothGATTServer | null>(null);

  // Simple cleanup
  useEffect(() => {
    return () => {
      if (bluetoothDeviceRef.current?.gatt?.connected) {
        bluetoothDeviceRef.current.gatt.disconnect();
      }
    };
  }, []);


  useEffect(() => {
    const handleKeyDown = async (e) => {
      const keyMap = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };

      const action = keyMap[e.key];
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
        bluetoothDeviceRef.current = await navigator.bluetooth.requestDevice({
          filters: [{ name: "Neo" }],
          optionalServices: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"],
        });

        // Handle disconnection
        bluetoothDeviceRef.current.addEventListener(
          "gattserverdisconnected",
          async () => {
            setIsConnected(false);
            setConnectionStatus("disconnected");    
          }
        );
      }

      if (!server.current?.connected) {
        console.log("Connecting to server");
        server.current = await bluetoothDeviceRef.current.gatt!.connect();
        console.log(server.current)
        const service = await server.current?.getPrimaryService(
          "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
        );
        console.log("service: ",service)
        const characteristic = await service.getCharacteristic(
          "6e400002-b5a3-f393-e0a9-e50e24dcca9e"
        );

        writeCharacteristicRef.current = characteristic;
        setConnectionStatus("connected");
        setIsConnected(true);
        setTryingToConnect(false);
      }
    } catch (error) {
      console.error("Connection failed:", error);
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
          setIsConnected(true);
          setConnectionStatus("connected");
        }
      } catch {
        setConnectionStatus("disconnected");
        setIsConnected(false);
      }
    } else {
      setConnectionStatus("disconnecting");
      if (bluetoothDeviceRef.current?.gatt?.connected) {
        bluetoothDeviceRef.current.gatt.disconnect();
      }
      bluetoothDeviceRef.current = null;
      writeCharacteristicRef.current = null;
      portRef.current = null;
      setIsConnected(false);
      setConnectionStatus("disconnected");
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

            <div
              className="flex flex-col w-full h-full transition-all duration-300 ease-in-out"
              style={{
                marginLeft: sidebarCollapsed ? "80px" : "260px",
              }}
            >
              <BlocklyComponent
                generatedCode={generatedCode}
                setGeneratedCode={setGeneratedCode}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
