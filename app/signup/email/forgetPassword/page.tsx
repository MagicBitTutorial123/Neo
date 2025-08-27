// app/signup/email/forgetPassword/page.tsx
"use client";

import React, { useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { APP_BASE_URL } from "@/lib/env";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setError("");

    const isEmail = /^\S+@\S+\.\S+$/.test(email);
    if (!isEmail) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      // Use Supabase auth to send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/signup/email/resetPassword`,
      });

      if (error) {
        setError(error.message || "Failed to send reset link.");
      } else {
        setMessage("If your email exists, a reset link has been sent. Please check your email and spam folder.");
        setEmail("");
      }
    } catch (err) {
      setError("Failed to send reset link. Please try again later.");
      console.error("Password reset error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-screen h-screen bg-[#F8F9FC] flex items-center justify-center overflow-hidden">
      <button
        onClick={() => router.push("/signin")}
        className="w-[96px] h-[96px] flex items-center justify-center rounded-full group focus:outline-none absolute left-0 top-1/2 -translate-y-1/2 z-20"
        style={{ minWidth: 96, minHeight: 96 }}
        aria-label="Back to Sign in"
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
              Forgot your password?
            </h1>
          </div>

          <p className="text-lg text-[#6B7280] text-center mb-8 max-w-[400px]">
            Enter your email and we'll send you a reset link.
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

            <div className="w-full flex flex-col items-center mb-2">
              <label className="text-sm text-gray-500 mb-1">Email address</label>
              <div className="flex items-center justify-center w-full gap-4 relative">
                <input
                  type="email"
                  value={email}
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  placeholder="you@example.com"
                  className="w-full bg-white rounded-full shadow-sm px-6 py-4 text-lg text-center font-poppins border-none outline-none text-black placeholder:text-gray-400 mb-4"
                />
                <svg
                  aria-hidden="true"
                  className="absolute right-6 top-1/2 -translate-y-1/2"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" stroke="#9CA3AF" strokeWidth="1.5" />
                  <path d="m21 7-9 6L3 7" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#00AEEF] hover:bg-[#0098D6] active:bg-[#0080B8] disabled:bg-[#9DDFF1] text-white rounded-full py-4 px-8 text-lg font-semibold shadow-sm transition-colors duration-200 ${
                loading ? "cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="mt-4 flex items-center justify-between text-sm w-full max-w-[400px]">
              <Link href={APP_BASE_URL} className="text-[#00AEEF] hover:underline underline-offset-2">
                Back to Sign in
              </Link>
              <Link href="/signup" className="text-[#0F172A]/70 hover:text-[#0F172A] transition">
                Create an account
              </Link>
            </div>

            <p className="mt-6 text-xs text-[#6B7280] text-center max-w-[400px]">
              Didn't receive the email? Check your spam folder or try again in a few minutes.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
