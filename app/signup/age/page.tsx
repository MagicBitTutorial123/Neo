"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import NextButton from "@/components/NextButton";
import { useUser } from "@/context/UserContext";


function validateAge(age: string) {
  const n = Number(age);
  return /^\d{1,3}$/.test(age) && n >= 1 && n <= 120;
}


export default function SignupAge() {
  const router = useRouter();
  // Get registration data from UserContext for state persistence
  const { registrationData, updateRegistrationData } = useUser();
  // Initialize age state with existing data from context or empty string
  const [age, setAge] = useState(
    registrationData.age ? String(registrationData.age) : ""
  );
  const inputRef = useRef<HTMLInputElement>(null);

  
  const handleBack = () => {
    router.push("/signup/name");
  };

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!validateAge(age)) return;

    // Save age to UserContext for persistence across signup flow
    updateRegistrationData({ age: Number(age) });
    // Navigate to email input page
    localStorage.setItem("age", age);
    router.push("/signup/email");
  };

  return (
    <div className="w-screen h-screen bg-[#F8F9FC] flex items-center justify-center overflow-hidden">
      {/* Chevron left button on far left, vertically centered */}
      <button
        onClick={handleBack}
        className="w-[96px] h-[96px] flex items-center justify-center rounded-full group focus:outline-none absolute left-0 top-1/2 -translate-y-1/2 z-20"
        style={{ minWidth: 96, minHeight: 96 }}
        aria-label="Back to name step"
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
              src="/Calendar.png"
              alt="Calendar Icon"
              width={180}
              height={180}
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
              Your age
            </h1>
          </div>
          <form
            className="flex flex-col gap-4 w-full max-w-[400px] items-center"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <input
              ref={inputRef}
              type="number"
              placeholder="Type your age"
              className="w-full bg-white rounded-full shadow-sm px-6 py-4 text-center font-poppins border-none outline-none text-[#222E3A] text-lg placeholder:text-gray-400 mb-4"
              value={age}
              onChange={(e) => {
                // Only allow numbers
                const val = e.target.value.replace(/[^0-9]/g, "");
                setAge(val);
              }}
              style={{ height: 56, maxWidth: 400 }}
              maxLength={3}
              min={1}
              max={120}
              inputMode="numeric"
            />
            <NextButton disabled={!validateAge(age)} onClick={handleNext}>
              Next
            </NextButton>
          </form>
        </div>
      </div>
    </div>
  );
}
