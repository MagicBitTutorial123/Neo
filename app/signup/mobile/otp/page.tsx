"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import NextButton from "@/components/NextButton";


export default function SignupOtp() {
  const router = useRouter();
  // Get registration data from UserContext for state persistence
  //const { updateRegistrationData } = useUser();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  /**
   * Navigate back to the mobile number step
   */
  const handleBack = () => {
    router.push("/signup/mobile");
  };

 const verifyOTP = async () => {
  const otpString = otp.join("");
  const phone = localStorage.getItem("fullPhone");

  if (!phone) {
    alert("Phone number not found. Please go back and try again.");
    router.push("/signup/mobile");
    return;
  }

  if (otpString.length !== 6 || !/^\d{6}$/.test(otpString)) {
    alert("Please enter a valid 6-digit OTP");
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:5000/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone, otp: otpString }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OTP verification failed:", data.message);
      alert(data.message || "OTP verification failed");
      return;
    }

    console.log("✅ OTP verified successfully");
    alert("OTP verified successfully!");
    router.push("/signup/name");
  } catch (error) {
    console.error("❌ OTP verification failed:", error);
    alert("Something went wrong. Please try again.");
  }
};


  /**
   * Handle OTP input changes with validation
   * Only allows single digit numbers
   */
  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return; // Only allow single digit numbers
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  /**
   * Handle keyboard navigation for OTP inputs
   */
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const isOtpComplete = otp.every((digit) => digit.length === 1);

  return (
    <div className="w-screen h-screen bg-[#F8F9FC] flex items-center justify-center overflow-hidden">
      {/* Chevron left button on far left, vertically centered */}
      <button
        onClick={handleBack}
        className="w-[96px] h-[96px] flex items-center justify-center rounded-full group focus:outline-none absolute left-0 top-1/2 -translate-y-1/2 z-20"
        style={{ minWidth: 96, minHeight: 96 }}
        aria-label="Back to mobile step"
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
          <div className="flex flex-col items-center mb-2">
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
            className="mb-6 flex items-center w-full justify-center"
            style={{ minHeight: 60 }}
          >
            <h1
              className="text-3xl md:text-4xl font-extrabold text-[#222E3A] text-center font-poppins leading-tight"
              style={{ letterSpacing: "0px", width: "100%" }}
            >
              Enter the 6-digit code sent to your mobile
            </h1>
          </div>
          <form
            className="flex flex-col gap-4 w-full max-w-[400px] items-center"
            onSubmit={(e) => {
              e.preventDefault(); /* handle OTP submit here */
            }}
          >
            <div className="flex items-center justify-center w-full gap-4 mb-4">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={inputRefs[idx]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="w-16 h-16 text-3xl text-center text-black font-bold border border-gray-300 rounded-lg bg-white focus:border-blue-400 focus:outline-none transition-all"
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                />
              ))}
            </div>
            <NextButton
              disabled={!isOtpComplete}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                if (!isOtpComplete) return;
                verifyOTP(); 
              }}
            >
              Next
            </NextButton>

            {/* Resend OTP button */}
            <button
              type="button"
              onClick={() => {
                // Navigate back to mobile page to resend OTP
                router.push("/signup/mobile");
              }}
              className="text-[#00AEEF] text-sm font-medium hover:underline focus:outline-none"
            >
              Didnt receive the code? Resend
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
//name age email password re enterpassword 