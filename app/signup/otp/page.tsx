"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import NextButton from "@/components/NextButton";

export default function SignupOtp() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  
  // Auto-fill OTP from localStorage for development
  useEffect(() => {
    const currentOTP = localStorage.getItem("currentOTP");
    if (currentOTP && currentOTP.length === 6) {
      const otpArray = currentOTP.split("");
      setOtp(otpArray);
      console.log("🔐 Auto-filled OTP from localStorage:", currentOTP);
    }
  }, []);
  
  // Add navigation guard to ensure user has completed previous steps
  useEffect(() => {
    const email = localStorage.getItem("userEmail") || localStorage.getItem("signupEmail");
    const phone = localStorage.getItem("fullPhone");
    const currentOTP = localStorage.getItem("currentOTP");
    
    if (!email || !email.trim()) {
      alert("Please complete the email step first");
      router.push("/signup/email");
      return;
    }
    
    if (!phone || !phone.trim()) {
      alert("Please complete the phone step first");
      router.push("/signup/phone");
      return;
    }
    
    if (!currentOTP) {
      alert("Please send an OTP first from the phone step");
      router.push("/signup/phone");
      return;
    }
  }, [router]);
  
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Countdown timer for resend button
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    } else {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  /**
   * Navigate back to the phone number step
   */
  const handleBack = () => {
    router.push("/signup/phone");
  };

  /**
   * Send OTP via email and WhatsApp
   */
  const sendOTP = async () => {
    const email = localStorage.getItem("userEmail");
    const phone = localStorage.getItem("fullPhone");
    
    if (!email || !phone) {
      alert("Email or phone number not found. Please go back and try again.");
      return;
    }

    setResendLoading(true);
    
    try {
      console.log("📱 Resending OTP to:", phone);
      console.log("📧 Resending OTP to email:", email);
      
      // Call the actual API endpoint
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }
      
      // Show success message with OTP (for development only)
      const otpMessage = data.otp 
        ? `✅ OTP resent successfully!\n\n🔐 Your new OTP code is: ${data.otp}`
        : "✅ OTP resent successfully!";
      
      alert(otpMessage);
      
      console.log("📱 New OTP sent successfully");
      
      // Disable resend for 60 seconds
      setResendDisabled(true);
      setResendCountdown(60);
     
    } catch (error) {
      console.error("Failed to send OTP:", error);
      alert("Failed to send OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  /**
   * Verify OTP
   */
  const verifyOTP = async () => {
    const otpString = otp.join("");
    
    if (otpString.length !== 6 || !/^\d{6}$/.test(otpString)) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    
    try {
      const email = localStorage.getItem("userEmail");
      const phone = localStorage.getItem("fullPhone");
      
      if (!email || !phone) {
        alert("Email or phone number not found. Please go back and try again.");
        return;
      }
      
      // Call the actual OTP verification API
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          phone,
          otp: otpString 
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'OTP verification failed');
      }
      
      console.log("✅ OTP verified successfully:", otpString);
      alert("OTP verified successfully!");
      
      // Set phone verification flag
      localStorage.setItem("phoneVerified", "true");
      
      // Navigate to name step
      router.push("/signup/name");
    } catch (error) {
      console.error("❌ OTP verification failed:", error);
      alert(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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
      {/* Back button */}
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
                 {/* Phone Icon */}
         <div className="mb-6">
           <Image
             src="/call_end.png"
             alt="Phone Icon"
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
          Verify your phone
        </h1>

        {/* Description */}
        <p className="text-gray-600 text-center mb-6">
        We&apos;ve sent a 6-digit code to your phone and email
        </p>

        {/* OTP Form */}
        <form className="flex flex-col gap-4 w-full max-w-[400px] items-center">
          {/* OTP Input Fields */}
          <div className="flex items-center justify-center w-full gap-3 mb-6">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                                 className={`w-14 h-14 text-2xl text-center text-black font-bold border-2 rounded-lg bg-white focus:outline-none transition-all ${
                   digit ? 'border-orange-500 bg-orange-50' : 'border-gray-300 focus:border-blue-400'
                 }`}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                placeholder="0"
              />
            ))}
          </div>

                     {/* Action Buttons */}
           <div className="w-full space-y-3">
             {/* Verify and Resend on same level */}
             <div className="flex gap-3">
                               <NextButton
                  disabled={!isOtpComplete || loading}
                  onClick={verifyOTP}
                  className="flex-1 text-lg font-bold !text-lg"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </NextButton>

                <button
                  type="button"
                  onClick={sendOTP}
                  disabled={resendDisabled || resendLoading}
                  className={`flex-1 rounded-full py-3 text-lg font-bold font-poppins ${
                    resendDisabled
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[#00AEEF] hover:bg-[#0098D4] text-white"
                  }`}
                >
                  {resendLoading 
                    ? "Sending..." 
                    : resendDisabled 
                      ? `Resend in ${resendCountdown}s` 
                      : "Resend OTP"
                  }
                </button>
             </div>

                           {/* OTP verification gives users choice */}
              <div className="flex justify-center">
                <p className="text-sm text-gray-500">
                  Verify OTP or skip to continue
                </p>
              </div>
           </div>

            {/* Skip OTP button - gives users choice */}
            <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={() => {
                  // Set phone verification flag when skipping
                  localStorage.setItem("phoneVerified", "true");
                  localStorage.setItem("otpSkipped", "true");
                  console.log("📱 User chose to skip OTP verification");
                  alert("OTP verification skipped. Continuing to next step.");
                  router.push("/signup/name");
                }}
                className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-gray-500 hover:text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <span>Skip OTP & Continue</span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-gray-400"
                >
                  <path
                    d="M5 12H19M19 12L12 5M19 12L12 19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">
              Didn&apos;t receive the code? Check your phone and email
            </p>
          </div>
        </form>
      </div>
    </div>
  );
} 