import React, { useState } from "react";

interface ToggleConnectButtonProps {
  isConnected: boolean;
  onToggle: () => void;
}

export default function ToggleConnectButton({
  isConnected,
  onToggle,
}: ToggleConnectButtonProps) {
  const [status, setStatus] = useState<
    "connected" | "disconnected" | "connecting" | "disconnecting"
  >(isConnected ? "connected" : "disconnected");

  React.useEffect(() => {
    setStatus(isConnected ? "connected" : "disconnected");
  }, [isConnected]);

  const handleClick = () => {
    if (status === "connected") {
      setStatus("disconnecting");
      setTimeout(() => {
        setStatus("disconnected");
        onToggle();
      }, 1000);
    } else if (status === "disconnected") {
      setStatus("connecting");
      setTimeout(() => {
        setStatus("connected");
        onToggle();
      }, 1000);
    }
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
    <div className="flex items-center gap-2">
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
    </div>
  );
}
