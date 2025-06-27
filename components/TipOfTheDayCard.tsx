import React, { useState } from "react";
import Image from "next/image";

const tips = [
  {
    text: "Lorem ipsum dolor sit amet consectetur.",
    image: "/file.svg", // Use a placeholder image
  },
  // Add more tips if needed
];

function getTodayTip() {
  // For now, always return the first tip. Later, you can rotate by date.
  return tips[0];
}

export default function TipOfTheDayCard() {
  const [expanded, setExpanded] = useState(false);
  const tip = getTodayTip();

  return (
    <div
      className={`rounded-2xl shadow bg-white transition-all duration-300 ${
        expanded ? "bg-[#E5E5E5]" : "bg-white"
      } p-4 w-full max-w-full min-w-[320px]`}
      style={{ minHeight: expanded ? 120 : 64, cursor: "pointer" }}
      onClick={() => setExpanded((e) => !e)}
    >
      <div className="flex flex-row items-center justify-between">
        <span className="flex items-center gap-3">
          <span className="w-10 h-10 flex items-center justify-center rounded-full shadow-lg bg-[#FF9C32] transition-all duration-300">
            <Image
              src="/tip-of-the-day-icon.png"
              alt="Tip"
              width={22}
              height={22}
            />
          </span>
          <span className="text-lg font-bold text-[#222E3A]">
            Tip of the day
          </span>
        </span>
        <span className="pr-2">
          {expanded ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 15l6-6 6 6"
                stroke="#222E3A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 9l6 6 6-6"
                stroke="#222E3A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </div>
      {expanded && (
        <div className="flex flex-row items-center gap-4 mt-6 ml-2">
          <span className="w-16 h-16 flex items-center justify-center rounded-lg bg-[#D9D9D9]">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect x="6" y="10" width="24" height="16" rx="3" fill="#BDBDBD" />
              <circle cx="13" cy="16" r="2" fill="#E0E0E0" />
              <path
                d="M10 24l5-6 4 5 5-7 6 8"
                stroke="#E0E0E0"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="text-base text-[#222E3A] font-normal">
            {tip.text}
          </span>
        </div>
      )}
    </div>
  );
}
