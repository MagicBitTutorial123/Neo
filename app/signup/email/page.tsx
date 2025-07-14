"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import NextButton from "@/components/NextButton";
import { useUser } from "@/context/UserContext";

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignupEmail() {
  const router = useRouter();
  // Get registration data from UserContext for state persistence
  const { registrationData, updateRegistrationData } = useUser();
  // Initialize email state with existing data from context or empty string
  const [email, setEmail] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleBack = () => {
    router.push("/signup/age");
  };

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Validate email format before proceeding
    if (!validateEmail(email)) return;

    // Save email to UserContext for persistence across signup flow
    updateRegistrationData({ email });
    router.push("/signup/email/setPassword");
  };

  return (
    <div className="w-screen h-screen bg-[#F8F9FC] flex items-center justify-center overflow-hidden">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="w-[96px] h-[96px] flex items-center justify-center rounded-full group focus:outline-none absolute left-0 top-1/2 -translate-y-1/2 z-20"
        aria-label="Back to age step"
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

      {/* Logo */}
      <div className="absolute ml-12 mt-8 top-8 left-8 z-30">
        <Image
          src="/side-logo.png"
          alt="BuddyNeo Logo"
          width={400}
          height={75}
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </div>

      {/* Form Container */}
      <div className="w-full h-full max-w-full max-h-full bg-[#F8F9FC] flex items-center justify-center relative p-8">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-full max-w-[600px] px-4 z-10">
          <div className="flex flex-col items-center mb-2">
            <Image
              src="/mark_email_unread.png"
              alt="Email Icon"
              width={200}
              height={200}
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
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#222E3A] text-center font-poppins leading-tight">
              Your e-mail address
            </h1>
          </div>

          {/* Email Input Form */}
          <form className="flex flex-col gap-4 w-full max-w-[400px] items-center">
            <input
              ref={inputRef}
              type="email"
              placeholder="Type your email"
              className="w-full bg-white rounded-full shadow-sm px-6 py-4 text-lg text-center font-poppins border-none outline-none text-black placeholder:text-gray-400 mb-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={64}
              autoComplete="email"
            />

            {/* Next Button - Disabled until valid email is entered */}
            <NextButton disabled={!validateEmail(email)} onClick={handleNext}>
              Next
            </NextButton>
          </form>
        </div>
      </div>
    </div>
  );
}
