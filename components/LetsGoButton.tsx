"use client";
import React from "react";

interface LetsGoButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  style?: React.CSSProperties;
  children?: React.ReactNode;
  locked?: boolean;
}

export default function LetsGoButton({
  style = {},
  children = "Let's Go",
  className = "",
  locked = false,
  ...props
}: LetsGoButtonProps) {
  return (
    <div className="relative group inline-block">
      <button
        className={`flex items-center justify-center rounded-full text-2xl font-bold font-poppins ${
          locked
            ? "bg-[#333] text-white opacity-90 cursor-not-allowed"
            : "text-white bg-[#F28B20] hover:bg-[#F76B1C]"
        } shadow-md transition-all duration-300 ease-in-out focus:outline-none relative overflow-visible letsgo-btn ${className}`}
        style={{
          minWidth: style?.width || 200,
          minHeight: style?.height || 56,
          fontSize: style?.fontSize || 20,
          ...style,
          opacity: props.disabled || locked ? 0.9 : 1,
          cursor: props.disabled || locked ? "not-allowed" : "pointer",
          border: "none",
          transition:
            "width 0.3s cubic-bezier(0.77,0,0.175,1), background 0.3s, color 0.3s",
        }}
        disabled={props.disabled || locked}
        {...props}
      >
        <span className="z-10 flex items-center justify-center w-full">
          {children}
        </span>
      </button>
      {/* Animated triangle/arrow for START button only */}
      {!locked && !props.disabled && (
        <span
          className="letsgo-arrow absolute top-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out"
          style={{ right: "-40px" }}
          data-triangle
        >
          <svg
            width="42.74"
            height="42.74"
            viewBox="0 0 32 32"
            fill="#F28B20"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-all duration-300 ease-in-out"
          >
            <polygon points="28,8 12,16 28,24" />
          </svg>
        </span>
      )}
      {/* Hover animation for triangle */}
      {!locked && !props.disabled && (
        <style jsx>{`
          .group:hover [data-triangle] {
            right: 32px !important;
          }
          .group:hover [data-triangle] svg {
            fill: white !important;
            transform: rotate(180deg);
          }
          .letsgo-btn {
            background: #f28b20;
          }
          .letsgo-btn:hover {
            background: #f76b1c !important;
            min-width: 210px !important;
            width: 102% !important;
          }
        `}</style>
      )}
    </div>
  );
}
