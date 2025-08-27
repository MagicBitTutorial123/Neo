"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import NextButton from "@/components/NextButton";

export default function SignupSetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Add navigation guard to ensure user has completed previous steps
  useEffect(() => {
    const email = localStorage.getItem("userEmail") || localStorage.getItem("signupEmail");
    const phone = localStorage.getItem("fullPhone");
    const name = localStorage.getItem("name");
    const age = localStorage.getItem("age");
    
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
    
    if (!name || !name.trim()) {
      alert("Please complete the name step first");
      router.push("/signup/name");
      return;
    }
    
    if (!age || !age.trim()) {
      alert("Please complete the age step first");
      router.push("/signup/age");
      return;
    }
  }, [router]);

  const handleNext = () => {
    if (!password || !confirmPassword) {
      alert("Please enter both password and confirm password");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }

    // Store password in localStorage
    localStorage.setItem("password", password);
    localStorage.setItem("userPassword", password);

    setLoading(true);
    // Navigate to avatar page
    router.push("/signup/avatar");
  };

  const handleBack = () => {
    // Clear phone verification flag when going back
    localStorage.removeItem("phoneVerified");
    localStorage.removeItem("otpSkipped");
    router.push("/signup/age");
  };

  return (
    <div className="w-screen h-screen bg-[#F8F9FC] flex items-center justify-center overflow-hidden">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="w-[96px] h-[96px] flex items-center justify-center rounded-full group focus:outline-none absolute left-0 top-1/2 -translate-y-1/2 z-20"
        style={{ minWidth: 96, minHeight: 96 }}
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

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center w-full max-w-[500px] px-4">
        {/* Lock Icon */}
        <div className="mb-6">
          <Image
            src="/power-icon.png"
            alt="Lock Icon"
            width={200}
            height={200}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
            }}
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-[#222E3A] text-center font-poppins mb-4">
          Set your password
        </h1>

        {/* Description */}
        <p className="text-gray-600 text-center mb-6">
          Create a strong password for your account
        </p>

        {/* Password Form */}
        <form className="flex flex-col gap-4 w-full max-w-[400px] items-center" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
          {/* Password Input */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 text-lg border-2 text-black border-gray-300 rounded-lg focus:border-blue-400 focus:outline-none transition-all pr-12"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
          </div>

          {/* Confirm Password Input */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 text-black py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-400 focus:outline-none transition-all pr-12"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {/* Next Button */}
          <NextButton
            disabled={!password || !confirmPassword || password !== confirmPassword || password.length < 8 || loading}
            onClick={handleNext}
            className="w-full text-lg font-bold"
          >
            {loading ? "Continuing..." : "Continue"}
          </NextButton>
        </form>
      </div>
    </div>
  );
}
