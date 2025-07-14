"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NotificationWrapper from "@/components/NotificationWrapper";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import axios from "axios";

export default function Home() {
  const router = useRouter();
  const [tab, setTab] = useState<"email" | "mobile">("email");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [countryCode, setCountryCode] = useState("+94");
  const [mobile, setMobile] = useState("");
  const [mpin, setMpin] = useState(""); // Always empty string

  // Optionally, ensure it resets on mount
  useEffect(() => {
    setMpin("");
  }, []);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // First try to authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Then get user data from backend
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { uid: firebaseUser.uid }
      );
      const userData = response.data;
      localStorage.setItem("userData", JSON.stringify(userData));

      if (userData.missionProgress >= 2) {
        router.push("/home");
      } else {
        router.push("/home?newUser=true");
      }
    } catch (err: any) {
      console.error("Login error:", err);

      // Handle specific Firebase errors
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email. Please sign up first.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else if (err.response?.status === 404) {
        setError("Account not found in our system. Please sign up first.");
      } else {
        setError("Login failed. Please check your credentials and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMobileLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const fullPhone = countryCode + mobile;
      const response = await axios.post(
        "http://localhost:5000/api/auth/mpin-login",
        {
          mobile: fullPhone,
          mpin,
        }
      );
      const userData = response.data;
      localStorage.setItem("userData", JSON.stringify(userData));

      if (userData.missionProgress >= 2) {
        router.push("/home");
      } else {
        router.push("/home?newUser=true");
      }
    } catch (err: any) {
      console.error("Mobile login error:", err);

      // Handle specific backend errors
      if (err.response?.status === 404) {
        setError(
          "No account found with this phone number. Please sign up first."
        );
      } else if (err.response?.status === 401) {
        setError("Incorrect MPIN. Please try again.");
      } else if (err.response?.status === 503) {
        setError("Server is not available. Please try again later.");
      } else if (err.code === "ECONNREFUSED") {
        setError(
          "Cannot connect to server. Please check if the backend is running."
        );
      } else {
        setError(
          err.response?.data?.message || "Login failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

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
              onClick={() => setTab("mobile")}
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
            <form className="space-y-4" onSubmit={handleEmailLogin}>
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
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                className="w-full bg-[#F28B20] text-white rounded-full py-3 text-lg font-bold font-poppins mt-2"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleMobileLogin}>
              <div className="flex gap-2">
                <label
                  htmlFor="login-country"
                  className="block text-sm font-medium text-gray-700 mb-1 w-2/5"
                >
                  Country
                </label>
                <label
                  htmlFor="login-mobile"
                  className="block text-sm font-medium text-gray-700 mb-1 w-3/5 "
                >
                  Mobile number
                </label>
              </div>
              <div className="flex gap-2">
                <select
                  id="login-country"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-2/5 rounded-full px-4 py-3 text-black bg-white shadow-sm placeholder:text-[#808080] placeholder:text-sm"
                >
                  <option value="+94">+94</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                </select>
                <input
                  id="login-mobile"
                  type="tel"
                  placeholder="Mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-3/5 rounded-full px-6 py-3 text-black bg-white shadow-sm placeholder:text-[#808080] placeholder:text-sm"
                  autoComplete="tel"
                />
              </div>
              <label
                htmlFor="login-mpin"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                MPIN
              </label>
              <input
                id="login-mpin"
                type="password"
                placeholder="Enter your MPIN"
                value={mpin}
                onChange={(e) => setMpin(e.target.value)}
                className="w-full rounded-full px-6 py-3 bg-white shadow-sm placeholder:text-[#808080] placeholder:text-sm"
                autoComplete="current-password"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                className="w-full bg-[#F28B20] text-white rounded-full py-3 text-lg font-bold font-poppins mt-2"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          )}

          <div className="text-center mt-6">
            <span className="text-gray-400 text-sm">
              Don't have an account?{" "}
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
