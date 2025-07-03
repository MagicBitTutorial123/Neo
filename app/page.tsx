"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import NotificationWrapper from "@/components/NotificationWrapper";

export default function Home() {
  const [tab, setTab] = useState<"email" | "mobile">("email");

  return (
    <div className="flex w-screen h-screen overflow-hidden">
      {/* Left Panel - no rounded corners, full height */}
      <div className="relative w-1/2 h-full bg-[#D9D9D9] flex flex-col justify-between">
        <div className="absolute inset-0">
          <Image
            src="/login-bg-new.png"
            alt="Login background"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
        {/* Notification badge */}
        <NotificationWrapper />
      </div>
      {/* Right Panel - full height, no scroll, heading in one line */}
      <div className="w-1/2 h-full flex flex-col justify-center items-center bg-[#F8F9FC]">
        <div className="w-full max-w-sm flex flex-col justify-center px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#222E3A] text-center mb-6 font-poppins leading-tight">
            Hey Genius, Ready
            <br />
            to Build?
          </h1>
          {/* Tab switcher */}
          <div className="flex justify-center gap-8 mb-6 text-base font-semibold font-poppins">
            <button
              className={`pb-1 border-b-2 ${
                tab === "mobile"
                  ? "border-[#F28B20] text-black"
                  : "border-transparent text-gray-400"
              } focus:outline-none`}
              onClick={() => setTab("mobile")}
            >
              Mobile
            </button>
            <button
              className={`pb-1 border-b-2 ${
                tab === "email"
                  ? "border-[#F28B20] text-black"
                  : "border-transparent text-gray-400"
              } focus:outline-none`}
              onClick={() => setTab("email")}
            >
              Email
            </button>
          </div>
          {tab === "email" ? (
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-black font-poppins mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your e-mail address"
                  className="w-full rounded-full border-none px-6 py-3 text-black font-poppins bg-[#ffffff] placeholder:text-gray-400 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black font-poppins mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full rounded-full border-none px-6 py-3 text-black font-poppins bg-[#ffffff] placeholder:text-gray-400 shadow-sm"
                />
              </div>
              <div className="flex justify-end items-center">
                <a
                  href="#"
                  className="text-[#00AEEF] text-xs font-semibold font-poppins"
                >
                  Forgot password?
                </a>
              </div>
              <button
                type="submit"
                className="w-full bg-[#888] text-white rounded-full py-3 text-lg font-bold font-poppins cursor-not-allowed mt-2"
                disabled
              >
                Sign in
              </button>
            </form>
          ) : (
            <form className="space-y-4">
              <div className="flex gap-2">
                <div className="flex flex-col w-2/5">
                  <label className="block text-sm font-semibold text-black font-poppins mb-1">
                    Country code
                  </label>
                  <div className="relative">
                    <select className="w-full rounded-full border border-gray-200 px-4 py-3 text-black font-poppins bg-[#ffffff] shadow-sm appearance-none">
                      <option value="+94">+94</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      ▼
                    </span>
                  </div>
                </div>
                <div className="flex flex-col w-3/5">
                  <label className="block text-sm font-semibold text-black font-poppins mb-1">
                    Mobile number
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter your number here"
                    className="w-full rounded-full border-none px-6 py-3 text-black font-poppins bg-[#ffffff] placeholder:text-gray-400 shadow-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-black font-poppins mb-1">
                  Enter your MPIN
                </label>
                <input
                  type="text"
                  placeholder="OTP Code"
                  className="w-full rounded-full border-none px-6 py-3 text-black font-poppins bg-[#ffffff] placeholder:text-gray-400 shadow-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#888] text-white rounded-full py-3 text-lg font-bold font-poppins cursor-not-allowed mt-2"
                disabled
              >
                Sign in
              </button>
            </form>
          )}
          <div className="flex flex-col items-center my-6">
            <span className="text-gray-400 font-lato mb-3 text-sm">
              Or sign in with
            </span>
            <div className="flex gap-6">
              <div className="w-12 h-12 bg-gray-100 rounded-full border border-gray-200 flex items-center justify-center"></div>
              <div className="w-12 h-12 bg-gray-100 rounded-full border border-gray-200 flex items-center justify-center"></div>
            </div>
          </div>
          <div className="text-center mt-6">
            <span className="text-gray-400 font-lato text-sm">
              Don't have an account?{" "}
            </span>
            <Link
              href="/signup"
              className="text-black font-lato font-extrabold text-sm"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
