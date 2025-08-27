"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import NotificationWrapper from "@/components/NotificationWrapper";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);


  const handleGoogleLogin = async () => {
  setError(null);
  setLoading(true);
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/home`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });
  if (error) setError(error.message);
  setLoading(false);
};


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

            <form className="space-y-6" onSubmit={handleLogin}>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer"
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
            className="text-blue-600 hover:underline text-sm font-medium focus:outline-none cursor-pointer"
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

          <button
              className="w-full rounded-full cursor-pointer py-3 mt-6 text-lg font-bold font-poppins bg-[#F28B20] hover:bg-[#FF5900] text-white transition-colors flex items-center justify-center gap-3"
              aria-label="Sign in with Google"
              type="button"
              onClick={handleGoogleLogin}
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
              <span>Sign in with Google</span>
            </button>


          <div className="text-center mt-6">
            <span className="text-gray-400 text-sm">
              Dont have an account?{" "}
            </span>
            <button
              onClick={() => router.push("/signup")}
              className="text-black font-bold text-sm hover:underline cursor-pointer"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}