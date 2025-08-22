"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import NotificationWrapper from "@/components/NotificationWrapper";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const router = useRouter();
  const [tab, setTab] = useState<"email" | "mobile">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);




// Removed Google OAuth button from this page per requirements
// Email/password login using Supabase Auth 
async function handleLogin(e: React.FormEvent) {
  e.preventDefault();
  setError(null);
  setLoading(true);

  const {  error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  setLoading(false);

  if (error) {
    // e.g. "Invalid login credentials"
    setError(error.message);
    return;
  }
  router.push("/home");
}


  return (
    <div className="flex w-screen h-screen overflow-hidden">
      <div className="relative w-1/2 h-full bg-[#D9D9D9] flex flex-col justify-between">
        <Image
          src="/login-bg-new.png"
          alt="Login background"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
        <NotificationWrapper />
      </div>

      <div className="w-1/2 h-full flex flex-col justify-center items-center bg-[#F8F9FC]">
        <div className="w-full max-w-sm px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#222E3A] text-center mb-6 font-poppins leading-tight">
            Hey Genius, Ready <br /> to Build?
          </h1>

          <div className="flex justify-center gap-8 mb-6 text-base font-semibold font-poppins">
            <button
              className={`pb-1 border-b-2 ${
                tab === "mobile"
                  ? "border-[#F28B20] text-black"
                  : "border-transparent text-gray-400"
              }`}
              disabled
              style={{ cursor: 'not-allowed', opacity: 0.5 }}
            >
              Mobile
            </button>
            <button
              className={`pb-1 border-b-2 ${
                tab === "email"
                  ? "border-[#F28B20] text-black"
                  : "border-transparent text-gray-400"
              }`}
              onClick={() => setTab("email")}
            >
              Email
            </button>
          </div>

          {tab === "email" ? (
            <form className="space-y-4" onSubmit={handleLogin}>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full px-6 py-3 text-black bg-white shadow-sm placeholder:text-[#808080] placeholder:text-sm"
                autoComplete="email"
              />
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-full px-6 py-3 text-black bg-white shadow-sm placeholder:text-[#808080] placeholder:text-sm"
                autoComplete="new-password"
              />
               {/* Forget Password link aligned with inputs */}
            <div className="w-full text-left mt-2">
            <button
            type="button"
            onClick={() => router.push("/signup/email/forgetPassword")}
            className="text-blue-600 hover:underline text-sm font-medium focus:outline-none"
              >
            Forget Password?
            </button>
            </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                className={`w-full rounded-full py-3 text-lg font-bold font-poppins mt-2 transition-colors duration-200 ${
                  loading || !email || !password
                    ? "bg-[#808080] text-white cursor-not-allowed"
                    : "bg-[#F28B20] hover:bg-[#FF5900] text-white"
                }`}
                disabled={loading || !email || !password}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
                    ) : (
            <div className="space-y-4 text-center py-8">
              <div className="text-gray-500 text-lg">
                Mobile sign-in is currently disabled
              </div>
              <div className="text-gray-400 text-sm">
                Please use email sign-in method
              </div>
            </div>
          )}

          

          <div className="text-center mt-6">
            <span className="text-gray-400 text-sm">
              Dont have an account?{" "}
            </span>
            <button
              onClick={() => router.push("/signup")}
              className="text-black font-bold text-sm hover:underline"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}