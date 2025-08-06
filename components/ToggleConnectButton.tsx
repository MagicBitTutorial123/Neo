import React, { useState, useRef, useEffect } from "react";

interface ToggleConnectButtonProps {
  isConnected: boolean;
  onToggle: () => void;
  onConnectionTypeChange?: (type: "bluetooth" | "serial") => void;
}

export default function ToggleConnectButton({
  isConnected,
  onToggle,
  onConnectionTypeChange,
}: ToggleConnectButtonProps) {
  const [status, setStatus] = useState<
    "connected" | "disconnected" | "connecting" | "disconnecting"
  >(isConnected ? "connected" : "disconnected");
  const [showDropdown, setShowDropdown] = useState(false);
  const [connectionType, setConnectionType] = useState<"bluetooth" | "serial">(
    "bluetooth"
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setStatus(isConnected ? "connected" : "disconnected");
  }, [isConnected]);

  // Close dropdown when clicking outside
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

  const handleClick = () => {
    if (status === "connected") {
      // Disconnect immediately when connected
      setStatus("disconnecting");
      setTimeout(() => {
        setStatus("disconnected");
        onToggle();
      }, 1000);
    } else if (status === "disconnected") {
      // Show dropdown to select connection type
      setShowDropdown(!showDropdown);
    }
  };

  const handleConnectionTypeSelect = (type: "bluetooth" | "serial") => {
    setConnectionType(type);
    setShowDropdown(false);
    onConnectionTypeChange?.(type);
    // Start connecting with selected type
    setStatus("connecting");
    setTimeout(() => {
      setStatus("connected");
      onToggle();
    }, 1000);
  };

  const handleDisconnect = () => {
    setShowDropdown(false);
    setStatus("disconnecting");
    setTimeout(() => {
      setStatus("disconnected");
      onToggle();
    }, 1000);
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

  if (status === "connected") {
    pillColor = "bg-[#00EF34] border-[#00EF34]";
    iconBg = "bg-[#00EF34] border-[#00EF34]";
    iconSrc = "/connected-icon.png";
    pillText = "Connected";
    textColor = "text-black";
  } else if (status === "disconnected") {
    pillColor = "bg-[#FF4D4F] border-[#FF4D4F]";
    iconBg = "bg-[#FF4D4F] border-[#FF4D4F]";
    iconSrc = "/disconnected-icon.png";
    pillText = "Disconnected";
    textColor = "text-white";
  } else {
    pillColor = "bg-[#FF9C32] border-[#FF9C32]";
    iconBg = "bg-[#FF9C32] border-[#FF9C32]";
    iconSrc = "/connecting.gif";
    pillText = status === "connecting" ? "Connecting..." : "Disconnecting...";
    textColor = "text-black";
  }

  return (
    <div className="flex items-center gap-2 relative" ref={dropdownRef}>
      {/* Icon circle */}
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors cursor-pointer border-2 ${iconBg}`}
        onClick={handleClick}
        title={pillText}
      >
        <img src={iconSrc} alt={pillText} className="w-5 h-5" />
      </div>
      {/* Status pill */}
      <button
        onClick={handleClick}
        className={`px-4 py-1 rounded-full font-medium text-base focus:outline-none transition-colors border-2 shadow-sm ${pillColor} ${textColor}`}
        style={{ minWidth: 100 }}
        disabled={status === "connecting" || status === "disconnecting"}
      >
        {pillText}
      </button>

      {/* Dropdown Menu */}
      {showDropdown && status === "disconnected" && (
        <div
          className="absolute top-full left-0 mt-2 w-48 bg-[#d0eafb] rounded-2xl shadow-xl border border-[#E0E6ED] z-50 overflow-hidden opacity-90"
          onClick={handleDropdownClick}
        >
          <div className="py-1">
            {/* Connection Type Options */}
            <div className="px-3 py-2 text-xs font-medium text-[#222E3A] uppercase tracking-wide">
              Select Connection Type
            </div>
            <button
              onClick={() => handleConnectionTypeSelect("bluetooth")}
              className="w-full text-left px-3 py-2 text-sm text-[#222E3A] hover:bg-[#c5deee] transition-colors"
            >
              <div className="flex items-center gap-2">
                <img src="/bluetooth.png" alt="Bluetooth" className="w-4 h-4" />
                Bluetooth
              </div>
            </button>
            <button
              onClick={() => handleConnectionTypeSelect("serial")}
              className="w-full text-left px-3 py-2 text-sm text-[#222E3A] hover:bg-[#c5deee] transition-colors"
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
