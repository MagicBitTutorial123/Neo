"use client";
import React, { useState } from "react";

interface LetsGoButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  style?: React.CSSProperties;
  children?: React.ReactNode;
  locked?: boolean;
}

// Helper to get base width from style prop
const getBaseWidth = (style: React.CSSProperties | undefined) => {
  if (typeof style?.width === "number") return style.width;
  if (typeof style?.width === "string") {
    const match = style.width.match(/\d+/);
    return match ? parseInt(match[0], 10) : 200;
  }
  return 200;
};

export default function LetsGoButton({
  style = {},
  children = "Let's Go",
  className = "",
  locked = false,
  ...props
}: LetsGoButtonProps) {
  const [hovered, setHovered] = useState(false);
  const baseWidth = getBaseWidth(style);
  const baseHeight = style?.height || 56;
  const baseFontSize = style?.fontSize || 20;

  // Remove width/minWidth from button style to prevent override
  const { width, minWidth, ...restStyle } = style;

  return (
    <div
      className="relative inline-block"
      style={{
        width: baseWidth,
        minWidth: baseWidth,
        height: baseHeight,
        overflow: "visible",
        verticalAlign: "middle",
      }}
    >
      <button
        className={`flex items-center justify-center rounded-full text-2xl font-medium transition-all duration-300 ease-in-out focus:outline-none relative overflow-visible letsgo-btn ${
          locked
            ? "bg-[#333] text-white opacity-90 cursor-not-allowed"
            : "text-white bg-[#F28B20] hover:bg-[#F76B1C]"
        } shadow-md ${className}`}
        style={{
          ...restStyle,
          width: "100%",
          height: baseHeight,
          fontSize: baseFontSize,
          opacity: props.disabled || locked ? 0.9 : 1,
          cursor: props.disabled || locked ? "not-allowed" : "pointer",
          border: "none",
          transform: hovered ? "scaleX(1.12)" : "scaleX(1)",
          transition:
            "transform 0.3s cubic-bezier(0.77,0,0.175,1), background 0.3s, color 0.3s",
        }}
        disabled={props.disabled || locked}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        {...props}
      >
        <span className="z-10 flex items-center justify-center w-full">
          {locked &&
          typeof children === "string" &&
          children.toUpperCase() === "LOCKED" ? (
            <>
              LOCKED
              <span
                className="ml-3 text-2xl"
                style={{ display: "flex", alignItems: "center" }}
              >
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                  <rect
                    x="5"
                    y="11"
                    width="14"
                    height="10"
                    rx="2"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <path
                    d="M17 11V7a5 5 0 00-10 0v4"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </>
          ) : (
            children
          )}
        </span>
        {/* Animated triangle/arrow for START button only */}
        {!locked && !props.disabled && (
          <span
            className="letsgo-arrow absolute top-1/2 -translate-y-1/2"
            style={{
              right: hovered ? 32 : -40,
              transition: "right 0.3s cubic-bezier(0.4,0,0.2,1)",
              zIndex: 20,
            }}
            data-triangle
          >
            <svg
              width="42.74"
              height="42.74"
              viewBox="0 0 32 32"
              fill={hovered ? "#fff" : "#F28B20"}
              style={{
                transform: hovered ? "rotate(180deg)" : "none",
                transition: "fill 0.3s, transform 0.3s",
              }}
            >
              <polygon points="28,8 12,16 28,24" />
            </svg>
          </span>
        )}
      </button>
    </div>
  );
}
