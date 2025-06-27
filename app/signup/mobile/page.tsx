"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import NextButton from "@/components/NextButton";

export default function SignupMobile() {
  const router = useRouter();
  const [activated, setActivated] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [phone, setPhone] = useState("");
  const handleBack = () => {
    router.push("/signup");
  };
  // Country code/flag dropdown logic
  const countryOptions = [
    { code: "+94", flag: "🇱🇰" },
    { code: "+1", flag: "🇺🇸" },
    { code: "+44", flag: "🇬🇧" },
    { code: "+91", flag: "🇮🇳" },
  ];
  const [selectedCountry, setSelectedCountry] = useState(countryOptions[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  return (
    <div className="w-screen h-screen bg-[#F8F9FC] flex items-center justify-center overflow-hidden">
      {/* Chevron left button on far left, vertically centered */}
      <button
        onClick={handleBack}
        className="w-[96px] h-[96px] flex items-center justify-center rounded-full group focus:outline-none absolute left-0 top-1/2 -translate-y-1/2 z-20"
        style={{ minWidth: 96, minHeight: 96 }}
        aria-label="Back to signup main"
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="group-hover:stroke-[#222E3A] stroke-[#222E3A]"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="30 12 18 24 30 36" />
        </svg>
      </button>
      {/* Logo in top left */}
      <div className="absolute ml-12 mt-8 top-8 left-8 z-30">
        <Image
          src="/side-logo.png"
          alt="BuddyNeo Logo"
          width={400}
          height={75}
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </div>
      <div className="w-full h-full max-w-full max-h-full bg-[#F8F9FC] flex items-center justify-center relative p-8">
        {/* Centered overlay content */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-full max-w-[600px] px-4 z-10">
          <div className="flex flex-col items-center mb-2" >
            <Image
              src="/call_end.png"
              alt="Call End Icon"
              width={236}
              height={236}
              style={{
                transform: "rotate(360deg)",
                maxWidth: "100%",
                maxHeight: "100%",
              }}
            />
          </div>
          <div
            className="mb-12 flex items-center w-full justify-center"
            style={{ minHeight: 100 }}
          >
            <h1
              className="text-3xl md:text-4xl font-extrabold text-[#222E3A] text-center font-poppins leading-tight"
              style={{ letterSpacing: "0px", width: "100%" }}
            >
              Tell us your mobile number
            </h1>
          </div>
          <form
            className="flex flex-col gap-6 w-full max-w-[400px] items-center"
            onSubmit={(e) => {
              e.preventDefault(); /* handle next step here */
            }}
          >
            <div
              className="flex items-center w-full bg-white rounded-full shadow-sm px-4 py-2 relative"
              style={{ height: 64 }}
            >
              {/* Country flag and dropdown */}
              <button
                type="button"
                className="w-10 h-10 rounded-sm bg-[#00AEEF] flex items-center justify-center mr-3 focus:outline-none relative"
                onClick={() => setDropdownOpen((open) => !open)}
                tabIndex={0}
                aria-label="Select country code"
              >
                <span className="text-xl">{selectedCountry.flag}</span>
                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="absolute left-0 top-12 bg-white rounded-lg shadow-lg z-50 min-w-[120px]">
                    {countryOptions.map((opt) => (
                      <button
                        key={opt.code}
                        className="flex items-center w-full px-3 py-2 hover:bg-gray-100 text-left"
                        onClick={() => {
                          setSelectedCountry(opt);
                          setDropdownOpen(false);
                        }}
                      >
                        <span className="mr-2 text-lg">{opt.flag}</span>
                        <span className="font-bold">{opt.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </button>
              {/* Country code and arrow */}
              <div
                className="flex items-center font-bold text-black text-lg mr-2 select-none cursor-pointer"
                onClick={() => setDropdownOpen((open) => !open)}
              >
                {selectedCountry.code}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-1"
                >
                  <path
                    d="M4.5 7.5L9 12L13.5 7.5"
                    stroke="#222E3A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              {/* Divider */}
              <div className="h-8 w-px bg-gray-300 mx-3" />
              {/* Input */}
              <input
                type="tel"
                placeholder="Type here"
                className="flex-1 bg-transparent border-none outline-none text-black font-poppins text-lg placeholder:text-gray-400"
                value={phone}
                onChange={(e) => {
                  // Only allow numbers
                  const numeric = e.target.value.replace(/[^0-9]/g, "");
                  setPhone(numeric);
                }}
                style={{ minWidth: 0 }}
              />
            </div>
            <NextButton
              disabled={!phone}
              onClick={(e) => {
                e.preventDefault();
                if (!phone) return;
                router.push("/signup/mobile/otp");
              }}
            >
              Next
            </NextButton>
          </form>
        </div>
      </div>
    </div>
  );
}
