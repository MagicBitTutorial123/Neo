"use client";
import React, { useEffect, useRef } from "react";
import "blockly/javascript";
import "@/components/Blockly/customblocks/magicbitblocks";
import "@/components/Blockly/customblocks/keyboardBlocks";
import SideNavbar from "@/components/SideNavbar";
import StatusHeaderBar from "@/components/StatusHeaderBar";
import BlocklyComponent from "@/components/Blockly/BlocklyComponent";
import * as Blockly from "blockly/core";
import "blockly/blocks";
import * as En from "blockly/msg/en";
import { usbUpload } from "@/utils/usbUpload";
import { keyboardSendBLE } from "@/utils/keyboardPress";
import { bluetoothUpload } from "@/utils/bluetoothUpload";
import { useState } from "react";

Blockly.setLocale(En);

export default function Playground() {
  const [generatedCode, setGeneratedCode] = useState("");
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const portRef = useRef(null);
  const bluetoothDeviceRef = useRef(null);
  const txChar = useRef(null);
  const serviceUUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
  const txCharUUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";

  // Bluetooth connection
  const connectBluetooth = async (maxRetries = 10, isUserInitiated = false) => {
    if (isConnected) return; // already connected or connecting

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Try to reconnect if we have a device reference
        if (bluetoothDeviceRef.current) {
          const server = await bluetoothDeviceRef.current.gatt.connect();
          const service = await server.getPrimaryService(serviceUUID);
          txChar.current = await service.getCharacteristic(txCharUUID);
          setIsConnected(true);

          bluetoothDeviceRef.current.addEventListener(
            "gattserverdisconnected",
            () => {
              console.log("Bluetooth disconnected, reconnecting...");
              setIsConnected(false);
              connectBluetooth();
            }
          );
          return;
        }

        // Only request new device if user initiated or we have no device
        if (isUserInitiated || !bluetoothDeviceRef.current) {
          bluetoothDeviceRef.current = await navigator.bluetooth.requestDevice({
            filters: [{ name: "ESP32-BLE" }],
            optionalServices: [serviceUUID],
          });

          const server = await bluetoothDeviceRef.current.gatt.connect();
          const service = await server.getPrimaryService(serviceUUID);
          txChar.current = await service.getCharacteristic(txCharUUID);
          setIsConnected(true);

          bluetoothDeviceRef.current.addEventListener(
            "gattserverdisconnected",
            () => {
              console.log("Bluetooth disconnected, reconnecting...");
              setIsConnected(false);
              connectBluetooth();
            }
          );
          return;
        }

        throw new Error("No device available for reconnection");
      } catch (error) {
        console.error(`Connection attempt ${attempt} failed:`, error);
        if (attempt === maxRetries) {
          setIsConnected(false);
        }
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }
  };

  // connect ble when bluetooth is enabled
  useEffect(() => {
    if (bluetoothEnabled) {
      if (bluetoothDeviceRef.current) {
        connectBluetooth();
      }
    }
  }, [bluetoothEnabled]);

  // Upload code based on current mode
  const uploadCode = async () => {
    if (!generatedCode) return;
    try {
      if (bluetoothEnabled) {
        if (!isConnected) {
          await connectBluetooth();
        }
        await bluetoothUpload(generatedCode, txChar.current);
      } else {
        await usbUpload(generatedCode, portRef);
        if (!isConnected) {
          setIsConnected(true);
        }
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const onConnectToggle = () => {
    if (bluetoothEnabled) {
      connectBluetooth();
    } else {
      usbUpload(generatedCode, portRef);
    }
  };

  return (
    <div className="app-wrapper">
      <div>
        <div className="h-screen bg-white flex flex-row w-screen">
          <SideNavbar />
          <div className="flex flex-col w-full h-full">
            <StatusHeaderBar
              missionNumber={2}
              title={"test"}
              timeAllocated={"1"}
              liveUsers={17}
              isPlayground={true}
              onRun={uploadCode}
              isConnected={isConnected}
              // setIsConnected={setIsConnected}
              onConnectToggle={onConnectToggle}
              // onErase={clearWorkspace}
            />

            <BlocklyComponent
              generatedCode={generatedCode}
              setGeneratedCode={setGeneratedCode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
