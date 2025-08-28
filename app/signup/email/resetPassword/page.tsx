"use client";

import React, { useState, FormEvent, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { APP_BASE_URL } from "@/lib/env";
import Image from "next/image";
import Link from "next/link";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is authenticated (they should be after clicking the reset link)
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("You need to be authenticated to reset your password. Please use the reset link from your email.");
      }
    };
    
    checkAuth();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Use Supabase auth to update the user's password
      const { error } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (error) {
        setError(error.message || "Failed to reset password.");
      } else {
        setMessage(`Password updated successfully! Redirecting to ${APP_BASE_URL}...`);
        setPassword("");
        setConfirm("");
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push(APP_BASE_URL);
        }, 2000);
      }
    } catch (err) {
      setError("Something went wrong. Please try again later.");
      console.error("Reset password error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-screen h-screen bg-[#F8F9FC] flex items-center justify-center overflow-hidden">
      <button
        onClick={() => router.push(APP_BASE_URL)}
        className="w-[96px] h-[96px] flex items-center justify-center rounded-full group focus:outline-none absolute left-0 top-1/2 -translate-y-1/2 z-20"
        style={{ minWidth: 96, minHeight: 96 }}
        aria-label={`Back to ${APP_BASE_URL}`}
      >
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none"
             xmlns="http://www.w3.org/2000/svg"
             className="group-hover:stroke-[#222E3A] stroke-[#222E3A]"
             strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="30 12 18 24 30 36" />
        </svg>
      </button>

      <div className="absolute ml-12 mt-8 top-8 left-8 z-30">
        <Image src="/side-logo.png" alt="BuddyNeo Logo" width={400} height={75}
               style={{ maxWidth: "100%", height: "auto" }} />
      </div>

      <div className="w-full h-full max-w-full max-h-full bg-[#F8F9FC] flex items-center justify-center relative p-8">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-full max-w-[600px] px-4 z-10">
          <div className="mb-6 flex items-center w-full justify-center mt-16" style={{ minHeight: 60 }}>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#222E3A] text-center font-poppins leading-tight">
              Reset Your Password
            </h1>
          </div>

          <p className="text-lg text-[#6B7280] text-center mb-8 max-w-[400px]">
            Enter your new password below.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-[400px] items-center">
            {message && (
              <div role="status" className="w-full rounded-full border border-emerald-200 bg-emerald-50 px-6 py-4 text-emerald-800 text-center text-sm">
                {message}
              </div>
            )}
            {error && (
              <div role="alert" className="w-full rounded-full border border-red-200 bg-red-50 px-6 py-4 text-red-700 text-center text-sm">
                {error}
              </div>
            )}

            {/* New Password */}
            <div className="w-full flex flex-col items-center mb-2">
              <label className="text-sm text-gray-500 mb-1">New Password</label>
              <div className="flex items-center justify-center w-full gap-4 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  disabled={loading}
                  className="w-full bg-white rounded-full shadow-sm px-6 py-4 text-lg text-center font-poppins border-none outline-none text-black placeholder:text-gray-400 mb-4 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-2 focus:outline-none hover:bg-gray-100 rounded-full transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="w-full flex flex-col items-center mb-2">
              <label className="text-sm text-gray-500 mb-1">Confirm Password</label>
              <div className="flex items-center justify-center w-full gap-4 relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Confirm new password"
                  disabled={loading}
                  className="w-full bg-white rounded-full shadow-sm px-6 py-4 text-lg text-center font-poppins border-none outline-none text-black placeholder:text-gray-400 mb-4 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-2 focus:outline-none hover:bg-gray-100 rounded-full transition-colors"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#00AEEF] hover:bg-[#0098D6] active:bg-[#0080B8] disabled:bg-[#9DDFF1] text-white rounded-full py-4 px-8 text-lg font-semibold shadow-sm transition-colors duration-200 ${
                loading ? "cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>

            <div className="mt-4 flex items-center justify-center text-sm">
              <Link href={APP_BASE_URL} className="text-[#00AEEF] hover:underline underline-offset-2">
                Back to Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
