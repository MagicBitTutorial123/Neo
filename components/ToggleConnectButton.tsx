import React, { useState, useRef, useEffect } from "react";

interface ToggleConnectButtonProps {
  isConnected: boolean;
  onToggle: (connected: boolean) => void;
  connectionStatus: string;
  setConnectionStatus: React.Dispatch<string>;
  onConnectionTypeChange?: (type: "bluetooth" | "serial") => void;
  connectionType: "bluetooth" | "serial";
}

export default function ToggleConnectButton({
  onToggle,
  onConnectionTypeChange,
  connectionStatus,
  connectionType,
}: ToggleConnectButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    // Only add event listener when dropdown is open
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showDropdown]);

  const handleConnectionTypeClick = () => {
    if (connectionStatus === "disconnected") {
      setShowDropdown(!showDropdown);
    }
  };

  const handleConnectionTypeSelect = (type: "bluetooth" | "serial") => {
    setShowDropdown(false);
    onConnectionTypeChange?.(type);
  };

  const handleConnectClick = () => {
    if (connectionStatus === "connected") {
      onToggle(false);
    } else if (connectionStatus === "disconnected") {
      onToggle(true);
    }
  };

  // Prevent event bubbling when clicking on dropdown
  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  let pillColor = "";
  let iconBg = "";
  let iconSrc = "";
  let pillText = "";
  let textColor = "";

  if (connectionStatus === "connected") {
    pillColor = "bg-[#00EF34] border-[#00EF34]";
    iconBg = "bg-[#00EF34] border-[#00EF34]";
    iconSrc = "/connected-icon.png";
    pillText = "Connected";
    textColor = "text-black";
  } else if (connectionStatus === "disconnected") {
    pillColor = "bg-[#FF4D4F] border-[#FF4D4F]";
    iconBg = "bg-transparent border-[#FF4D4F]";
    pillText = "Disconnected";
    textColor = "text-white";
  } else {
    pillColor = "bg-[#FF9C32] border-[#FF9C32]";
    iconBg = "bg-[#FF9C32] border-[#FF9C32]";
    iconSrc = "/connecting.gif";
    pillText =
      connectionStatus === "connecting" ? "Connecting..." : "Disconnecting...";
    textColor = "text-black";
  }

  return (
    <div className="flex items-center gap-2 relative" ref={dropdownRef}>
      {/* Icon circle */}
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors cursor-pointer border-2 ${iconBg}`}
        onClick={handleConnectionTypeClick}
        title={pillText}
      >
        {connectionStatus === "connected" ? (
          <img src={iconSrc} alt={pillText} className="w-5 h-5" />
        ) : connectionStatus === "disconnected" ? (
          connectionType === "bluetooth" ? (
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M7 12l-2-2-2 2 2 2 2-2zm10.71-4.29L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z" />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M15 7v4h1v2h-3V5h2l-3-4-3 4h2v8H8v-2.07c.7-.37 1.2-1.08 1.2-1.93 0-1.21-.99-2.2-2.2-2.2S4.8 7.79 4.8 9c0 .85.5 1.56 1.2 1.93V13c0 1.11.89 2 2 2h3v3.05c-.71.37-1.2 1.1-1.2 1.95 0 1.22.99 2.2 2.2 2.2s2.2-.98 2.2-2.2c0-.85-.49-1.58-1.2-1.95V15h3c1.11 0 2-.89 2-2V9h-1V7z" />
            </svg>
          )
        ) : (
          <img src={iconSrc} alt={pillText} className="w-5 h-5" />
        )}
      </div>
      {/* Status pill */}
      <button
        onClick={handleConnectClick}
        className={`px-4 py-1 rounded-full font-medium text-base focus:outline-none transition-colors border-2 shadow-sm ${pillColor} ${textColor}`}
        style={{ minWidth: 100 }}
        disabled={
          connectionStatus === "connecting" ||
          connectionStatus === "disconnecting"
        }
      >
        {pillText}
      </button>

      {/* Dropdown Menu */}
      {showDropdown && connectionStatus === "disconnected" && (
        <div
          className="absolute top-full right-0 xl:left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#E0E6ED] z-50 overflow-hidden opacity-92"
          onClick={handleDropdownClick}
        >
          <div className="py-1">
            {/* Connection Type Options */}
            <div className="px-3 py-2 text-xs font-medium text-[#222E3A] uppercase tracking-wide">
              Select Connection Type
            </div>
            <button
              onClick={() => handleConnectionTypeSelect("bluetooth")}
              className="w-full text-left px-3 py-2 text-sm text-[#222E3A] hover:bg-[#d5efff] transition-colors"
            >
              <div className="flex items-center gap-2">
                <img src="/bluetooth.png" alt="Bluetooth" className="w-4 h-4" />
                Bluetooth
              </div>
            </button>
            <button
              onClick={() => handleConnectionTypeSelect("serial")}
              className="w-full text-left px-3 py-2 text-sm text-[#222E3A] hover:bg-[#d5efff] transition-colors"
            >
              <div className="flex items-center gap-2">
                <img src="/usb-port.png" alt="Serial" className="w-4 h-4" />
                Serial
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
