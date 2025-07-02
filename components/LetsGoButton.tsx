"use client";
import React from "react";

export default function LetsGoButton({
  children = "Let's Go",
  onClick,
  disabled = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
}) {
  return (
    <div className="relative group" style={{ width: 361, height: 77.5 }}>
      <button
        className="w-full h-full flex items-center justify-center rounded-full text-2xl font-bold font-poppins text-white bg-[#F28B20] shadow-md transition-all duration-300 ease-in-out focus:outline-none hover:bg-[#F76B1C] relative overflow-visible letsgo-btn"
        style={{
          minWidth: 361,
          minHeight: 77.5,
          opacity: disabled ? 0.7 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
          transition:
            "width 0.3s cubic-bezier(0.77,0,0.175,1), background 0.3s, color 0.3s",
        }}
        onClick={onClick}
        disabled={disabled}
        {...props}
      >
        <span>{children}</span>
        {/* Animated triangle */}
        <span
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out"
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
      </button>
      <style jsx>{`
        .group:hover [data-triangle] {
          right: 32px !important;
        }
        .group:hover [data-triangle] svg {
          fill: white !important;
          transform: rotate(180deg);
        }
        .letsgo-btn:hover {
          min-width: 390px !important;
          width: 105% !important;
        }
      `}</style>
    </div>
  );
}
