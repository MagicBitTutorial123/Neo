"use client";
import React, { useState } from "react";

export default function NextButton({
  onClick,
  disabled,
  children = "Next",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="submit"
      className="mt-8 flex items-center justify-center font-bold font-poppins text-white shadow-md focus:outline-none"
      style={{
        width: 361,
        height: 77.5,
        borderRadius: 35,
        background: disabled ? "#808080" : hovered ? "#0A6CFF" : "#00AEEF",
        fontSize: 24,
        transform: hovered && !disabled ? "scale(1.06)" : "scale(1)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.7 : 1,
        transition: "background 0.3s, transform 0.3s",
      }}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => !disabled && setHovered(true)}
      onBlur={() => setHovered(false)}
      {...props}
    >
      {children}
    </button>
  );
}
