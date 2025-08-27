"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import NextButton from "@/components/NextButton";
import { supabase } from "@/lib/supabaseClient";

export default function SignupPhone() {
  const router = useRouter();
  const { updateRegistrationData } = useUser();

  const countryOptions = [
    { code: "+94", flag: "🇱🇰" },
    { code: "+1", flag: "🇺🇸" },
    { code: "+44", flag: "🇬🇧" },
    { code: "+91", flag: "🇮🇳" },
  ];

  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(countryOptions[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [manualEmail, setManualEmail] = useState("");

  // Ensure email is available from localStorage
  useEffect(() => {
    const signupEmail = localStorage.getItem("signupEmail");
    const userEmail = localStorage.getItem("userEmail");
    
    // If we have signupEmail but no userEmail, set userEmail
    if (signupEmail && !userEmail) {
      localStorage.setItem("userEmail", signupEmail);
      console.log("📧 Set userEmail from signupEmail:", signupEmail);
    }
    
    // Check registrationData for email
    const registrationData = localStorage.getItem("registrationData");
    if (registrationData) {
      try {
        const parsed = JSON.parse(registrationData);
        if (parsed.email && !signupEmail && !userEmail) {
          localStorage.setItem("signupEmail", parsed.email);
          localStorage.setItem("userEmail", parsed.email);
          console.log("📧 Set email from registration data:", parsed.email);
        }
      } catch (e) {
        console.log("❌ Error parsing registration data in useEffect:", e);
      }
    }
    
    // Debug what's available
    console.log("🔍 Phone page useEffect - Email availability:");
    console.log("signupEmail:", signupEmail);
    console.log("userEmail:", userEmail);
    
    // If still no email, try to get it from Supabase session
    if (!signupEmail && !userEmail) {
      getEmailFromSupabase();
    }
    
    // Show email input if no email found after all attempts
    setTimeout(() => {
      const finalSignupEmail = localStorage.getItem("signupEmail");
      const finalUserEmail = localStorage.getItem("userEmail");
      if (!finalSignupEmail && !finalUserEmail) {
        setShowEmailInput(true);
        console.log("⚠️ No email found, showing manual email input");
      }
    }, 2000); // Wait 2 seconds for async operations to complete
  }, []);
  
  // Add navigation guard to ensure user has completed email step
  useEffect(() => {
    const email = localStorage.getItem("userEmail") || localStorage.getItem("signupEmail");
    
    if (!email || !email.trim()) {
      alert("Please complete the email step first");
      router.push("/signup/email");
      return;
    }
  }, [router]);
  
  const getEmailFromSupabase = async () => {
    try {
      console.log("🔍 Attempting to get email from Supabase session...");
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log("🔍 Supabase response:", { user, error });
      
      if (error) {
        console.log("❌ Supabase error:", error);
        return;
      }
      
      if (user && user.email) {
        localStorage.setItem("signupEmail", user.email);
        localStorage.setItem("userEmail", user.email);
        console.log("📧 Set email from Supabase session:", user.email);
      } else {
        console.log("⚠️ No user or email found in Supabase session");
        console.log("🔍 User object:", user);
      }
    } catch (err) {
      console.log("❌ Error getting email from Supabase:", err);
    }
  };

  const handleBack = () => {
    router.push("/signup/email/confirm");
  };
  
  // Clear phone verification flag when user returns to phone step
  useEffect(() => {
    localStorage.removeItem("phoneVerified");
    localStorage.removeItem("otpSkipped");
  }, []);
  
  const handleNext = async () => {
    if (!phone || phone.length < 7) {
      alert("Please enter a valid phone number");
      return;
    }

    // Fix phone number format: remove leading 0 and combine with country code
    let cleanPhone = phone;
    if (phone.startsWith('0')) {
      cleanPhone = phone.substring(1); // Remove leading 0
    }
    
    const fullPhone = selectedCountry.code + cleanPhone;
    const normalizedPhone = fullPhone.replace(/[+\s-]/g, "");

    console.log("📱 Send OTP - Phone details:", {
      originalPhone: phone,
      cleanPhone,
      countryCode: selectedCountry.code,
      fullPhone,
      normalizedPhone
    });

    // Phone number will be stored later when sending OTP

    // Debug localStorage
    console.log("🔍 Debug localStorage:");
    console.log("signupEmail:", localStorage.getItem("signupEmail"));
    console.log("userEmail:", localStorage.getItem("userEmail"));
    console.log("All localStorage keys:", Object.keys(localStorage));
    
    // Check registrationData
    const registrationData = localStorage.getItem("registrationData");
    if (registrationData) {
      try {
        const parsed = JSON.parse(registrationData);
        console.log("📋 Registration data:", parsed);
        if (parsed.email) {
          console.log("📧 Found email in registration data:", parsed.email);
          // Store email in both keys
          localStorage.setItem("signupEmail", parsed.email);
          localStorage.setItem("userEmail", parsed.email);
        }
      } catch (e) {
        console.log("❌ Error parsing registration data:", e);
      }
    }

    // Send OTP via email and WhatsApp
    try {
      console.log("📱 Sending OTP to:", fullPhone);
      console.log("📱 Clean phone number:", cleanPhone);
      console.log("📱 Country code:", selectedCountry.code);
      console.log("📱 Full phone format:", fullPhone);
      console.log("📱 Phone length:", fullPhone.length);
      let userEmail = localStorage.getItem("userEmail") || localStorage.getItem("signupEmail");
      
      // If no email in localStorage, use manual email input
      if (!userEmail && manualEmail) {
        userEmail = manualEmail;
        // Store the manual email for future use
        localStorage.setItem("signupEmail", manualEmail);
        localStorage.setItem("userEmail", manualEmail);
        console.log("📧 Using manual email input:", manualEmail);
      }
      
      if (!userEmail) {
        alert("Please provide an email address to continue");
        setShowEmailInput(true);
        return;
      }
      
      console.log("📧 Sending OTP to email:", userEmail);
      
      // Store phone number in localStorage before sending OTP
      localStorage.setItem("fullPhone", fullPhone);
      updateRegistrationData({ fullPhone });
      console.log("📱 Phone stored in localStorage:", fullPhone);
      
      // Call the actual API endpoint
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userEmail,
          phone: fullPhone 
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }
      
             // Show success message with OTP (for development only)
       const otpMessage = data.otp 
         ? `✅ OTP sent successfully!\n\n🔐 Your OTP code is: ${data.otp}\n\n📱 Check your phone for WhatsApp message\n📧 Check your email for OTP code\n\nYou can verify OTP or skip to continue.`
         : "✅ OTP sent successfully!\n\n📱 Check your phone for WhatsApp message\n📧 Check your email for OTP code\n\nYou can verify OTP or skip to continue.";
       
       alert(otpMessage);
       
               // Store OTP in localStorage for development debugging
        if (data.otp) {
          localStorage.setItem("currentOTP", data.otp);
          console.log("🔐 OTP stored in localStorage for debugging:", data.otp);
        }
        
        console.log("📱 OTP sent successfully - user can now verify");
       
        // Navigate to OTP verification page
        router.push("/signup/otp");
    } catch (error) {
      console.error("Failed to send OTP:", error);
      alert("Failed to send OTP. Please try again.");
    }
  };

  return (
    <div className="w-screen h-screen bg-[#F8F9FC] flex items-center justify-center overflow-hidden">
      <button
        onClick={handleBack}
        className="w-[96px] h-[96px] flex items-center justify-center rounded-full group focus:outline-none absolute left-0 top-1/2 -translate-y-1/2 z-20"
        aria-label="Back to email confirmation"
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

          <div className="mb-12 flex items-center w-full justify-center" style={{ minHeight: 100 }}>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#222E3A] text-center font-poppins leading-tight">
              What's your phone number?
            </h1>
          </div>

          <form
            className="flex flex-col gap-6 w-full max-w-[400px] items-center"
            onSubmit={(e) => {
              e.preventDefault();
              handleNext();
            }}
          >
            <div
              className="flex items-center w-full bg-white rounded-full shadow-sm px-4 py-2 relative"
              style={{ height: 64 }}
            >
              {/* Country dropdown */}
              <button
                type="button"
                className="w-10 h-10 rounded-sm bg-[#00AEEF] flex items-center justify-center mr-3 focus:outline-none relative"
                onClick={() => setDropdownOpen((open) => !open)}
                tabIndex={0}
                aria-label="Select country code"
              >
                <span className="text-xl">{selectedCountry.flag}</span>
                {dropdownOpen && (
                  <div className="absolute left-0 top-12 bg-white rounded-lg shadow-lg z-50 min-w-[120px]">
                    {countryOptions.map((opt) => (
                      <div
                        key={opt.code}
                        className="flex items-center w-full px-3 py-2 hover:bg-gray-100 text-left cursor-pointer"
                        onClick={() => {
                          setSelectedCountry(opt);
                          setDropdownOpen(false);
                        }}
                      >
                        <span className="mr-2 text-lg">{opt.flag}</span>
                        <span className="font-bold">{opt.code}</span>
                      </div>
                    ))}
                  </div>
                )}
              </button>

              {/* Country code */}
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

              <div className="h-8 w-px bg-gray-300 mx-3" />

              {/* Input */}
              <input
                type="tel"
                placeholder="Type here"
                className="flex-1 bg-transparent border-none outline-none text-black font-poppins text-lg placeholder:text-gray-400"
                value={phone}
                onChange={(e) => {
                  const numeric = e.target.value.replace(/[^0-9]/g, "");
                  setPhone(numeric);
                }}
                style={{ minWidth: 0 }}
              />
            </div>

            {/* Email input fallback */}
            {showEmailInput && (
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address (Required for OTP)
                </label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full bg-white rounded-full shadow-sm px-6 py-4 text-lg text-center font-poppins border-2 border-gray-300 text-black placeholder:text-gray-400 focus:border-[#F28B20] focus:outline-none"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  We need your email to send the verification code
                </p>
              </div>
            )}

            <div className="text-center text-sm text-gray-600 mb-4">
              <p>We'll send you a verification code via WhatsApp and email</p>
              <p className="text-xs mt-1">You can verify OTP or skip to continue</p>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <NextButton type="submit">Send OTP & Continue</NextButton>
              
              {/* Skip OTP button - gives users choice */}
              <button
                type="button"
                onClick={() => {
                  // Store phone number and skip OTP
                  const cleanPhone = phone.startsWith('0') ? phone.substring(1) : phone;
                  const fullPhone = selectedCountry.code + cleanPhone;
                  const normalizedPhone = fullPhone.replace(/[+\s-]/g, "");
                  
                  console.log("📱 Skip OTP - Phone details:", {
                    originalPhone: phone,
                    cleanPhone,
                    countryCode: selectedCountry.code,
                    fullPhone,
                    normalizedPhone
                  });
                  
                  localStorage.setItem("fullPhone", normalizedPhone);
                  updateRegistrationData({ fullPhone: normalizedPhone });
                  
                  // Mark OTP as skipped and set phone verification flag
                  localStorage.setItem("otpSkipped", "true");
                  localStorage.setItem("phoneVerified", "true");
                  
                  console.log("📱 Phone stored, OTP skipped. Going to next step.");
                  router.push("/signup/name");
                }}
                className="w-full rounded-full py-3 text-lg font-bold font-poppins bg-white border-2 border-gray-300 text-[#222E3A] hover:bg-gray-50 transition-colors"
              >
                Skip OTP & Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
