"use client";
import Image from "next/image";

export default function Notification({
  avatar,
  name,
  message,
  onClose,
}: {
  avatar: string;
  name: string;
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="absolute top-6 left-6 flex items-center bg-white/70 rounded-2xl shadow px-4 py-2 gap-3 z-10 min-w-[180px] max-w-xs relative">
      <Image
        src={avatar}
        alt="Avatar"
        width={40}
        height={40}
        className="rounded-full border border-gray-200"
      />
      <div className="flex flex-col">
        <span className="font-bold text-black text-sm leading-tight">
          {name}
        </span>
        <span className="text-gray-700 text-sm leading-tight">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-black focus:outline-none p-1 bg-transparent border-none"
        aria-label="Close notification"
        style={{ lineHeight: 1, fontSize: 18 }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line
            x1="4"
            y1="4"
            x2="12"
            y2="12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="12"
            y1="4"
            x2="4"
            y2="12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
