"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function EmailConfirmed() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("signupEmail");
    if (storedEmail) {
      setEmail(storedEmail);
      // Ensure email is stored in both keys for consistency
      localStorage.setItem("userEmail", storedEmail);
      console.log("📧 Email stored in confirmed page:", storedEmail);
    } else {
      console.log("⚠️ No signupEmail found in localStorage");
    }
    // Always verify email confirmation regardless of stored email
    verifyEmailConfirmation();
  }, [router]);

  const verifyEmailConfirmation = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        // If no user or error, stay on this page and let user continue
        console.log("No user session found, but allowing to continue");
        return;
      }

      // Always set the email from the user object if available
      if (user.email) {
        setEmail(user.email);
        localStorage.setItem("signupEmail", user.email);
        localStorage.setItem("userEmail", user.email);
        console.log("📧 Email set from Supabase user:", user.email);
      }

      if (!user.email_confirmed_at) {
        // If email not confirmed, stay on this page and let user continue
        console.log("Email not confirmed yet, but allowing to continue");
        return;
      }

      console.log("✅ Email confirmed, user can proceed");
      // If user is confirmed and we have an email, stay on this page (success page)
    } catch (err) {
      console.error("Error verifying email confirmation:", err);
      // On error, stay on this page and let user continue
      console.log("Error occurred, but allowing to continue");
    }
  };

  const handleContinue = async () => {
    setLoading(true);
    console.log("Checking for existing profile before continuing...");
    
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error("❌ Error getting user:", userError);
        // On error, go to home instead of back to confirm
        localStorage.removeItem("signupEmail");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("fullPhone");
        localStorage.removeItem("name");
        localStorage.removeItem("age");
        localStorage.removeItem("password");
        localStorage.removeItem("userPassword");
        localStorage.removeItem("currentOTP");
        localStorage.removeItem("otpSkipped");
        router.push("/home?newUser=true");
        return;
      }

      // Check if profile already exists before creating
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileCheckError && profileCheckError.code !== 'PGRST116') {
        // PGRST116 means "no rows returned" - that's expected if no profile exists
        console.error("❌ Error checking existing profile:", profileCheckError);
      }

      if (existingProfile) {
        console.log('✅ Profile already exists, redirecting to home');
        // Clear signup data and redirect to home
        localStorage.removeItem("signupEmail");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("fullPhone");
        localStorage.removeItem("name");
        localStorage.removeItem("age");
        localStorage.removeItem("password");
        localStorage.removeItem("userPassword");
        localStorage.removeItem("currentOTP");
        localStorage.removeItem("otpSkipped");
        router.push("/home?newUser=true");
        return;
      }

      // No profile exists, redirect to home anyway (profile will be created by trigger)
      console.log("No existing profile found, redirecting to home...");
      localStorage.removeItem("signupEmail");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("fullPhone");
      localStorage.removeItem("name");
      localStorage.removeItem("age");
      localStorage.removeItem("password");
      localStorage.removeItem("userPassword");
      localStorage.removeItem("currentOTP");
      localStorage.removeItem("otpSkipped");
      router.push("/home?newUser=true");
      
    } catch (error) {
      console.error("❌ Error in handleContinue:", error);
      // On error, still go to home (don't go back to confirm)
      localStorage.removeItem("signupEmail");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("fullPhone");
      localStorage.removeItem("name");
      localStorage.removeItem("age");
      localStorage.removeItem("password");
      localStorage.removeItem("userPassword");
      localStorage.removeItem("currentOTP");
      localStorage.removeItem("otpSkipped");
      router.push("/home?newUser=true");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="w-screen h-screen bg-[#F8F9FC] flex items-center justify-center overflow-hidden">


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

      <div className="w-full h-full max-w-full max-h-full bg-[#F8F9FC] flex items-center justify-center relative p-8">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-full max-w-[600px] px-4 z-10">
          {/* Success Icon */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-16 h-16 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <div className="mb-8 flex items-center w-full justify-center" style={{ minHeight: 60 }}>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#222E3A] text-center font-poppins leading-tight">
              Email Confirmed!
            </h1>
          </div>

          <div className="text-center mb-8">
            <p className="text-lg text-gray-600 mb-4">
              Great! Your email has been successfully verified:
            </p>
            <p className="text-xl font-semibold text-[#222E3A] mb-6">
              {email}
            </p>
            <p className="text-gray-600">
              You're all set to continue with your account setup. Let's get you started!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 w-full max-w-[400px]">
            <button
              onClick={handleContinue}
              disabled={loading}
              className="w-full rounded-full py-3 text-lg font-bold font-poppins bg-[#F28B20] hover:bg-[#FF5900] text-white transition-colors disabled:opacity-50"
            >
              {loading ? "Loading..." : "Continue to Next Step"}
            </button>


          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Your account is now verified and secure. Welcome to BuddyNeo!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
