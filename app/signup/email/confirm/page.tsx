"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function EmailConfirm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [userConfirmed, setUserConfirmed] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("signupEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    }
    // Always check user confirmation regardless of stored email
    checkUserConfirmation();
  }, [router]);

  const checkUserConfirmation = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        // This is expected when user hasn't confirmed email yet
        console.log("User not confirmed yet:", error.message);
        return;
      }

      if (user && user.email_confirmed_at) {
        setUserConfirmed(true);
      }
    } catch (err) {
      // This is expected when there's no session
      console.log("No active session yet");
    }
  };

  const handleResendEmail = async () => {
    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/signup/email/confirmed`,
        },
      });

      if (error) {
        alert("Error resending email: " + error.message);
      } else {
        alert("Confirmation email resent! Please check your inbox.");
      }
    } catch (err) {
      alert("An unexpected error occurred");
    } finally {
      setResendLoading(false);
    }
  };

  const handleCheckEmail = async () => {
    setLoading(true);
    
    try {
      // Check if user is confirmed
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log(user, error);
      if (error) {
        // This is expected when user hasn't confirmed email yet
        alert("Please check your email and click the confirmation link before proceeding.");
        return;
      }

      if (user && user.email_confirmed_at) {
        // User is confirmed, check if profile exists and redirect to home
        setUserConfirmed(true);
        
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (existingProfile) {
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
          
          console.log('✅ Email confirmed and profile exists, redirecting to home');
          router.push("/home?newUser=true");
        } else {
          // Profile doesn't exist yet, but user is confirmed - redirect to home anyway
          localStorage.removeItem("signupEmail");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("fullPhone");
          localStorage.removeItem("name");
          localStorage.removeItem("age");
          localStorage.removeItem("password");
          localStorage.removeItem("userPassword");
          localStorage.removeItem("currentOTP");
          localStorage.removeItem("otpSkipped");
          
          console.log('✅ Email confirmed, redirecting to home');
          router.push("/home?newUser=true");
        }
      } else {
        alert("Please check your email and click the confirmation link before proceeding.");
      }
    } catch (err) {
      alert("Please check your email and click the confirmation link before proceeding.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkipConfirmation = () => {
    // For development/testing, allow skipping email confirmation
    // In production, you might want to remove this
    alert("Note: In production, email confirmation should be required.");
    router.push("/signup/phone");
  };

  return (
    <div className="w-screen h-screen bg-[#F8F9FC] flex items-center justify-center overflow-hidden">
      {/* Back button */}
      <button
        onClick={() => router.push("/signup/email/confirmed")}
        className="w-[96px] h-[96px] flex items-center justify-center rounded-full transition-transform duration-300 ease-out hover:scale-110 group focus:outline-none absolute left-0 top-1/2 -translate-y-1/2 z-20"
        style={{ minWidth: 96, minHeight: 96 }}
        aria-label="Back to confirmed page"
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-colors duration-300 ease-out group-hover:stroke-[#000000] stroke-[#222E3A]"
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

      <div className="w-full h-full max-w-full max-h-full bg-[#F8F9FC] flex items-center justify-center relative p-8">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-full max-w-[600px] px-4 z-10">
          <div className="flex flex-col items-center mb-8">
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

          <div className="mb-8 flex items-center w-full justify-center" style={{ minHeight: 60 }}>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#222E3A] text-center font-poppins leading-tight">
              {userConfirmed ? "Email Verified!" : "Check your email"}
            </h1>
          </div>

          <div className="text-center mb-8">
            {userConfirmed ? (
              <>
                <p className="text-lg text-gray-600 mb-4">
                  Great! Your email has been verified:
                </p>
                <p className="text-xl font-semibold text-[#222E3A] mb-6">
                  {email}
                </p>
                <p className="text-gray-600">
                  You're ready to continue with your account setup!
                </p>
              </>
            ) : (
              <>
                <p className="text-lg text-gray-600 mb-4">
                  We've sent a confirmation link to:
                </p>
                <p className="text-xl font-semibold text-[#222E3A] mb-6">
                  {email}
                </p>
                <p className="text-gray-600">
                  Click the link in your email to verify your account and continue.
                </p>
              </>
            )}
          </div>

          <div className="flex flex-col gap-4 w-full max-w-[400px]">
            <button
              onClick={userConfirmed ? () => router.push("/home?newUser=true") : handleCheckEmail}
              disabled={loading}
              className="w-full rounded-full py-3 text-lg font-bold font-poppins bg-[#F28B20] hover:bg-[#FF5900] text-white transition-colors disabled:opacity-50"
            >
              {loading ? "Checking..." : userConfirmed ? "Continue to Home" : "I've confirmed my email"}
            </button>

            <button
              onClick={handleResendEmail}
              disabled={resendLoading}
              className="w-full rounded-full py-3 text-lg font-bold font-poppins bg-white border-2 border-gray-300 text-[#222E3A] hover:bg-gray-50 transition-colors"
            >
              {resendLoading ? "Resending..." : "Resend confirmation email"}
            </button>

            {/* Development only - remove in production */}
            <button
              onClick={handleSkipConfirmation}
              className="w-full rounded-full py-3 text-lg font-bold font-poppins bg-gray-200 border-2 border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Skip for Development
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Didn't receive the email? Check your spam folder or try resending.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
