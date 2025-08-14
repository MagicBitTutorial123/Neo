// app/signup/email/forgetPassword/page.tsx
"use client";

import React, { useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ForgotPasswordPage() {
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
      const res = await fetch("http://127.0.0.1:5000/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setMessage(data?.message || "If your email exists, a reset link has been sent.");
        setEmail("");
      } else {
        setError(data?.message || "Something went wrong.");
      }
    } catch {
      setError("Failed to send reset link. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F6F8FC] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-white rounded-2xl w-[160px] h-[56px] flex items-center justify-center shadow-sm">
            <Image src="/side-logo.png" alt="BuddyNeo" width={140} height={28} priority />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-[#EEF2F7] p-6 md:p-8"
        >
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F172A]">Forgot your password?</h1>
          <p className="text-sm text-[#6B7280] mt-1">Enter your email and we’ll send you a reset link.</p>

          {message && (
            <div role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 text-sm">
              {message}
            </div>
          )}
          {error && (
            <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <label htmlFor="email" className="block mt-6 mb-2 text-sm font-medium text-[#0F172A]">
            Email address
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 pr-11 outline-none focus:ring-2 focus:ring-[#B9ECFB] focus:border-[#00AEEF] text-[#0F172A] placeholder-[#9CA3AF] transition"
            />
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" stroke="#9CA3AF" strokeWidth="1.5" />
              <path d="m21 7-9 6L3 7" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`mt-6 w-full rounded-2xl py-3 font-semibold text-white shadow-sm transition ${
              loading ? "bg-[#9DDFF1]" : "bg-[#00AEEF] hover:brightness-110 active:brightness-95"
            }`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Link href="localhost:3000/" className="text-[#00AEEF] hover:underline underline-offset-2">
              Back to Sign in
            </Link>
            <Link href="/signup" className="text-[#0F172A]/70 hover:text-[#0F172A] transition">
              Create an account
            </Link>
          </div>

          <p className="mt-6 text-xs text-[#6B7280]">
            Didn’t receive the email? Check your spam folder or try again in a few minutes.
          </p>
        </form>
      </div>
    </main>
  );
}
