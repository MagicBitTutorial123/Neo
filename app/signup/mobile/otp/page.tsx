"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import NextButton from "@/components/NextButton";


const OTP_LEN = 6;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") || "http://127.0.0.1:5000";

export default function SignupOtp() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LEN).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // stable refs
  const ref0 = useRef<HTMLInputElement>(null);
  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);
  const ref3 = useRef<HTMLInputElement>(null);
  const ref4 = useRef<HTMLInputElement>(null);
  const ref5 = useRef<HTMLInputElement>(null);
  const inputRefs = [ref0, ref1, ref2, ref3, ref4, ref5];

  const phone =
    typeof window !== "undefined" ? localStorage.getItem("fullPhone") || "" : "";

  useEffect(() => {
    inputRefs[0]?.current?.focus();
  }, []);

  const handleBack = () => router.push("/signup/mobile");

  const isOtpComplete = otp.every((d) => d.length === 1);

  const setDigit = (idx: number, val: string) => {
    setOtp((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const handleChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    setDigit(idx, val);
    if (val && idx < OTP_LEN - 1) inputRefs[idx + 1].current?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (otp[idx]) {
        setDigit(idx, "");
        return;
      }
      if (idx > 0) {
        inputRefs[idx - 1].current?.focus();
        setDigit(idx - 1, "");
      }
    }
    if (e.key === "ArrowLeft" && idx > 0) inputRefs[idx - 1].current?.focus();
    if (e.key === "ArrowRight" && idx < OTP_LEN - 1) inputRefs[idx + 1].current?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LEN);
    if (!text) return;
    const arr = text.split("");
    const next = Array(OTP_LEN).fill("");
    for (let i = 0; i < OTP_LEN; i++) next[i] = arr[i] ?? "";
    setOtp(next as string[]);
    const last = Math.min(arr.length, OTP_LEN) - 1;
    if (last >= 0) inputRefs[last]?.current?.focus();
  };

  const sendOtp = async () => {
    setErrorMsg(null);
    if (!phone) {
      setErrorMsg("Phone number not found. Please go back and try again.");
      router.push("/signup/mobile");
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data?.message || "Failed to send code.");
        return;
      }
      setOtp(Array(OTP_LEN).fill(""));
      inputRefs[0]?.current?.focus();
      alert("OTP sent.");
    } catch {
      setErrorMsg("Network error while sending OTP.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    // Auto-send when landing on OTP page (or call from previous page)
    void sendOtp();
  }, []);

  const resendOtp = async () => {
    await sendOtp();
  };

  const verifyOTP = async () => {
    setErrorMsg(null);
    if (!phone) {
      setErrorMsg("Phone number not found. Please go back and try again.");
      router.push("/signup/mobile");
      return;
    }
    const code = otp.join("");
    if (!/^\d{6}$/.test(code)) {
      setErrorMsg("Enter a valid 6-digit code.");
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: code }), // ✅ the same E.164 phone
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data?.message || "OTP verification failed.");
        return;
      }
      localStorage.setItem("phoneOtpVerified", "true");
      alert("OTP verified successfully!");
      router.push("/signup/name"); // Continue flow
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-[#F8F9FC] flex items-center justify-center overflow-hidden">
      {/* Back */}
      <button
        onClick={handleBack}
        className="w-[96px] h-[96px] flex items-center justify-center rounded-full group focus:outline-none absolute left-0 top-1/2 -translate-y-1/2 z-20"
        style={{ minWidth: 96, minHeight: 96 }}
        aria-label="Back to mobile step"
      >
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none"
             xmlns="http://www.w3.org/2000/svg"
             className="group-hover:stroke-[#222E3A] stroke-[#222E3A]"
             strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="30 12 18 24 30 36" />
        </svg>
      </button>

      {/* Logo */}
      <div className="absolute ml-12 mt-8 top-8 left-8 z-30">
        <Image
          src="/BuddyNeo-expanded.svg"
          alt="BuddyNeo Logo"
          width={320}
          height={60}
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </div>

      <div className="w-full h-full max-w-full max-h-full bg-[#F8F9FC] flex items-center justify-center relative p-8">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-full max-w-[600px] px-4 z-10">
          <div className="flex flex-col items-center mb-2">
            <Image src="/call_end.png" alt="Call End Icon" width={236} height={236}
                   style={{ transform: "rotate(360deg)", maxWidth: "100%", maxHeight: "100%" }} />
          </div>

          <div className="mb-6 flex items-center w-full justify-center" style={{ minHeight: 60 }}>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#222E3A] text-center font-poppins leading-tight">
              Enter the 6-digit code sent to your mobile
            </h1>
          </div>

          <form
            className="flex flex-col gap-4 w-full max-w-[400px] items-center"
            onSubmit={(e) => { e.preventDefault(); if (isOtpComplete && !submitting) void verifyOTP(); }}
          >
            <div className="flex items-center justify-center w-full gap-4 mb-2">
              {[ref0, ref1, ref2, ref3, ref4, ref5].map((ref, idx) => (
                <input
                  key={idx}
                  ref={ref}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={1}
                  aria-label={`OTP digit ${idx + 1}`}
                  className="w-16 h-16 text-3xl text-center text-black font-bold border border-gray-300 rounded-lg bg-white focus:border-blue-400 focus:outline-none transition-all"
                  value={otp[idx]}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={idx === 0 ? handlePaste : undefined}
                />
              ))}
            </div>

            {errorMsg && (
              <div className="text-red-500 text-sm font-semibold text-center">{errorMsg}</div>
            )}

            <NextButton
              disabled={!isOtpComplete || submitting}
              onClick={(e) => { e.preventDefault(); if (isOtpComplete && !submitting) void verifyOTP(); }}
            >
              {submitting ? "Verifying..." : "Next"}
            </NextButton>

            <button
              type="button"
              onClick={() => void resendOtp()}
              className="text-[#00AEEF] text-sm font-medium hover:underline focus:outline-none mt-2"
            >
              Didn’t receive the code? Resend
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
