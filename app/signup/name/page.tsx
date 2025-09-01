"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import NextButton from "@/components/NextButton";
import { useUser } from "@/context/UserContext";

/**
 * Name signup page component
 *
 * CHANGES MADE:
 * - Integrated with UserContext for state management
 * - Pre-fills name from context if available
 * - Updates UserContext instead of using localStorage directly
 * - Added proper form validation and disabled state for Next button
 * - Maintains consistent styling with other signup pages
 */
export default function SignupName() {
  const router = useRouter();
  // Get registration data from UserContext for state persistence
  const { registrationData, updateRegistrationData } = useUser();
  // Initialize name state with existing data from context or empty string
  const [name, setName] = useState(registrationData.name || "");
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Navigate back to the previous step
   */
  const handleBack = () => {
    // Check if this is a Google OAuth user
    const isGoogleOAuth = localStorage.getItem("isGoogleOAuth") === "true";
    
    if (isGoogleOAuth) {
      // For Google OAuth users, go back to signup main page
      router.push("/signup");
    } else {
      // For regular signup flow, go back to phone step
      localStorage.removeItem("phoneVerified");
      localStorage.removeItem("otpSkipped");
      router.push("/signup/phone");
    }
  };

  // Handle Google OAuth users and add navigation guard
  useEffect(() => {
    // Check if this is a Google OAuth user from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const isGoogleOAuth = urlParams.get("oauth") === "google";
    const googleEmail = urlParams.get("email");
    const googleName = urlParams.get("name");
    
    if (isGoogleOAuth && googleName && !name) {
      console.log("🔍 Pre-filling name for Google OAuth user:", googleName);
      setName(googleName);
      updateRegistrationData({ name: googleName });
      
      // Store Google OAuth data in localStorage for the rest of the flow
      localStorage.setItem("isGoogleOAuth", "true");
      localStorage.setItem("googleOAuthName", googleName);
      localStorage.setItem("signupEmail", googleEmail || "");
      localStorage.setItem("userEmail", googleEmail || "");
      
      // Clean up URL parameters
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("oauth");
      newUrl.searchParams.delete("email");
      newUrl.searchParams.delete("name");
      window.history.replaceState({}, "", newUrl.toString());
      
      return; // Skip the email/phone validation for Google OAuth users
    }
    
    // For regular signup flow, check email and phone requirements
    const email = localStorage.getItem("userEmail") || localStorage.getItem("signupEmail");
    const phone = localStorage.getItem("fullPhone");
    
    if (!email || !email.trim()) {
      alert("Please complete the email step first");
      router.push("/signup/email");
      return;
    }
    
    if (!phone || !phone.trim()) {
      alert("Please complete the phone verification step first");
      router.push("/signup/phone");
      return;
    }
    
    // Check if OTP verification was completed or skipped
    const phoneVerified = localStorage.getItem("phoneVerified");
    const otpSkipped = localStorage.getItem("otpSkipped");
    if (!phoneVerified || (phoneVerified !== "true" && !otpSkipped)) {
      alert("Please complete phone verification (OTP) or skip to continue");
      router.push("/signup/phone");
      return;
    }
  }, [router, name, updateRegistrationData]);

  /**
   * Handle name input changes with validation
   * Only allows letters and spaces
   */
  const handleChange = (value: string) => {
    // Only allow letters and spaces
    if (/^[a-zA-Z ]*$/.test(value)) {
      setName(value);
    }
  };

  /**
   * Handle form submission and navigation to age step
   *
   * CHANGES:
   * - Added name validation before proceeding
   * - Updates UserContext with name data
   * - Navigates to age selection page
   */
  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Save name to UserContext for persistence across signup flow
    updateRegistrationData({ name: name.trim() });
    localStorage.setItem("name", name.trim());
    // Navigate to age selection page
    router.push("/signup/age");
  };

  return (
    <div className="w-screen h-screen bg-[#F8F9FC] flex items-center justify-center overflow-hidden">
      {/* Chevron left button on far left, vertically centered */}
      <button
        onClick={handleBack}
        className="w-[96px] h-[96px] flex items-center justify-center rounded-full group focus:outline-none absolute left-0 top-1/2 -translate-y-1/2 z-20"
        style={{ minWidth: 96, minHeight: 96 }}
        aria-label="Back to phone step"
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
          src="/BuddyNeo-expanded.svg"
          alt="BuddyNeo Logo"
          width={320}
          height={60}
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </div>
      <div className="w-full h-full max-w-full max-h-full bg-[#F8F9FC] flex items-center justify-center relative p-8">
        {/* Centered overlay content */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-full max-w-[600px] px-4 z-10">
          <div className="flex flex-col items-center mb-2">
            <Image
              src="/User.png"
              alt="Person Icon"
              width={220}
              height={220}
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
              Your name
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
              type="text"
              placeholder="Type here"
              className="w-full bg-white rounded-full shadow-sm px-6 py-4 text-lg text-center font-poppins border-none outline-none text-black placeholder:text-gray-400 mb-4"
              value={name}
              onChange={(e) => handleChange(e.target.value)}
              style={{ height: 56, maxWidth: 400 }}
              maxLength={32}
            />
            <NextButton disabled={!name.trim()} onClick={handleNext}>
              Next
            </NextButton>
          </form>
        </div>
      </div>
    </div>
  );
}
