"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import LetsGoButton from "@/components/LetsGoButton";
import { supabase } from "@/lib/supabaseClient";

export default function SignupMain() {
  const router = useRouter();
  const { clearRegistrationData } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   clearRegistrationData();
  // }, []);

  const handleNext = () => {
    // Navigate to email page instead of mobile
    setTimeout(() => router.push("/signup/email"), 300);
    console.log("Navigating to email page");
  };

  const handleGoogleSignup = async () => {
    setError(null);
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      
      if (error) {
        setError(error.message);
        setLoading(false);
      }
      // Don't set loading to false here as user will be redirected
    } catch (err) {
      setError("An error occurred during Google signup");
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-[#F8F9FC] flex items-center justify-center overflow-hidden">
      {/* Chevron left button on far left, vertically centered */}
      <button
        onClick={() => router.push("/")}
        className="w-[96px] h-[96px] flex items-center justify-center rounded-full transition-transform duration-300 ease-out hover:scale-110 group focus:outline-none absolute left-0 top-1/2 -translate-y-1/2 z-20"
        style={{ minWidth: 96, minHeight: 96 }}
        aria-label="Back to login"
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
      <div className="w-full h-full max-w-full max-h-full bg-[#F8F9FC] flex items-center justify-between relative p-8 ml-40">
        {/* Left content */}
        <div className="flex flex-col justify-center h-full w-1/2 pl-12 max-w-full">
          {/* Logo */}
          <div className="mb-8 mt-8 -ml-40 flex justify-start">
            <Image
              src="/BuddyNeo-expanded.svg"
              alt="BuddyNeo Logo"
              width={320}
              height={60}
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </div>
          {/* Heading and button group left-aligned, shifted toward center */}
          <div className="flex flex-col justify-center items-start flex-1 ml-24">
            <div
              className="mb-12 flex items-center w-full"
              style={{ maxWidth: 600, minHeight: 100 }}
            >
              <h1
                className="text-3xl md:text-4xl font-extrabold text-[#222E3A] text-left font-poppins leading-tight"
                style={{ letterSpacing: "0px", width: "100%" }}
              >
                High five, human! Time to
                <br />
                teach some bolts how to dance.
              </h1>
            </div>
            {/* Navigation and buttons */}
            <div className="flex flex-col items-start gap-4 mt-8">
              <LetsGoButton
                style={{
                  width: 300,
                  height: 65,
                  fontSize: 20,
                }}
                onClick={handleNext}
              >
                Let s Go
              </LetsGoButton>
              
              {/* Google OAuth Button */}
              <button
                className="w-[300px] h-[65px] rounded-full cursor-pointer text-lg font-bold font-poppins bg-white hover:bg-gray-50 text-gray-700 transition-colors flex items-center justify-center gap-3 border border-gray-300 shadow-sm"
                aria-label="Sign up with Google"
                type="button"
                onClick={handleGoogleSignup}
                disabled={loading}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <g>
                    <path d="M36.545 20.233c0-1.36-.122-2.36-.388-3.393H20.204v6.16h9.32c-.188 1.52-1.2 3.8-3.45 5.34l-.032.21 5.012 3.89.348.034c3.19-2.94 5.033-7.27 5.033-12.24z" fill="#4285F4" />
                    <path d="M20.204 37c4.56 0 8.39-1.5 11.187-4.09l-5.33-4.14c-1.44 1.02-3.38 1.74-5.857 1.74-4.48 0-8.28-2.94-9.64-7.01l-.198.017-5.22 4.06-.068.19C7.66 33.36 13.48 37 20.204 37z" fill="#34A853" />
                    <path d="M10.564 23.5c-.36-1.02-.57-2.12-.57-3.24 0-1.12 .21-2.22 .55-3.24l-.01-.217-5.29-4.13-.173 .08A16.77 16.77 0 003.204 20.26c0 2.7 .66 5.25 1.82 7.49l5.74-4.25z" fill="#FBBC05" />
                    <path d="M20.204 11.96c3.17 0 5.31 1.36 6.53 2.5l4.77-4.65C28.58 6.97 24.76 5 20.204 5c-6.72 0-12.54 3.64-15.27 8.97l5.87 4.55c1.36-4.07 5.16-7.01 9.64-7.01z" fill="#EB4335" />
                  </g>
                </svg>
                <span>{loading ? "Signing up..." : "Sign up with Google"}</span>
              </button>
              
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>
          </div>
        </div>
        {/* Robot image at bottom right, larger and lower */}
        <div
          className="absolute bottom-0 flex items-end justify-end"
          style={{
            width: "min(60vw, 1400px)",
            height: "min(90vh, 1400px)",
            bottom: "-60px",
            right: "-200px",
          }}
        >
          <Image
            src="/aww-robot.png"
            alt="Robot"
            width={1400}
            height={1400}
            style={{
              transform: "rotate(346.58deg)",
              maxWidth: "100%",
              maxHeight: "100%",
            }}
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
