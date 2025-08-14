"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import NextButton from "@/components/NextButton";
//import { useUser } from "@/context/UserContext";

function validatePassword(password: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/.test(password);
}

export default function SignupSetPassword() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [touched, setTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const isValid = validatePassword(password);
  const isMatch = password === password2 && password.length > 0;
  
  let errorMsg = "";
  if (touched && !isValid && password.length > 0) {
    errorMsg =
      "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.";
  } else if (touched && password2.length > 0 && !isMatch) {
    errorMsg = "Passwords do not match.";
  }

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
  setTouched(true);

  if (!isValid || !isMatch) return;

  const phone = localStorage.getItem("fullPhone");
  const name = localStorage.getItem("name");
  const age = localStorage.getItem("age");
  const email = localStorage.getItem("email");
  console.log("Password (typed):", password);
 
  if (!phone || !name || !age || !email || !password) {
    alert("All fields are required");
    return;
  }

  localStorage.setItem("password", password); // ✅ Store for consistency

  try {
    console.log("Sending registration data:", {
    phone,
    name,
    age,
    email,
    password,
     });
    const res = await fetch("http://127.0.0.1:5000/complete-registration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, name, age, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Registration failed");
      return;
    }

    //  Clean up
    localStorage.removeItem("fullPhone");
    localStorage.removeItem("name");
    localStorage.removeItem("age");
    localStorage.removeItem("email");
    localStorage.removeItem("password");
    

    alert(" User registered successfully!");
    router.push("/signup/avatar");
  } catch (error) {
    console.error("Registration error:", error);
    alert("Something went wrong. Please try again.");
  }
};

  return (
    <div className="w-screen h-screen bg-[#F8F9FC] flex items-center justify-center overflow-hidden">
      <button
        onClick={() => router.push("/signup/email")}
        className="w-[96px] h-[96px] flex items-center justify-center rounded-full group focus:outline-none absolute left-0 top-1/2 -translate-y-1/2 z-20"
        style={{ minWidth: 96, minHeight: 96 }}
        aria-label="Back to Email step"
      >
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:stroke-[#222E3A] stroke-[#222E3A]" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="30 12 18 24 30 36" />
        </svg>
      </button>
      <div className="absolute ml-12 mt-8 top-8 left-8 z-30">
        <Image
          src="/BuddyNeo-expanded.svg"
          alt="BuddyNeo Logo"
          width={320}
          height={60}
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </div>
      <div className="w-full h-full max-w-full max-h-full bg-[#F8F9FC] flex items-center justify-center relative p-8">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-full max-w-[600px] px-4 z-10">
          <div className="mb-6 flex items-center w-full justify-center mt-16" style={{ minHeight: 60 }}>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#222E3A] text-center font-poppins leading-tight" style={{ letterSpacing: "0px", width: "100%" }}>
              Set your password
            </h1>
          </div>
          <form className="flex flex-col gap-4 w-full max-w-[400px] items-center">
            <div className="flex items-center justify-center w-full gap-4 mb-2 relative">
              <input
                type={showPassword ? "text" : "password"}
                inputMode="text"
                maxLength={32}
                className="w-full bg-white rounded-full shadow-sm px-6 py-4 text-lg text-center font-poppins border-none outline-none text-black placeholder:text-gray-400 mb-4"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched(true)}
                autoComplete="new-password"
                placeholder={"Password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : ""}
              </button>
            </div>
            <div className="w-full flex flex-col items-center mb-2">
              <label className="text-sm text-gray-500 mb-1">Re-enter your password</label>
              <div className="flex items-center justify-center w-full gap-4 relative">
                <input
                  type={showPassword2 ? "text" : "password"}
                  inputMode="text"
                  maxLength={32}
                  className="w-full bg-white rounded-full shadow-sm px-6 py-4 text-lg text-center font-poppins border-none outline-none text-black placeholder:text-gray-400 mb-4"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  onBlur={() => setTouched(true)}
                  autoComplete="new-password"
                  placeholder={"Password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword2((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword2 ? "Hide password" : "Show password"}
                >
                  {showPassword2 ? "👁️" : "🙈"}
                </button>
              </div>
            </div>
            {errorMsg && <div className="text-red-500 text-sm font-semibold mb-2 text-center w-full">{errorMsg}</div>}
            <NextButton disabled={!isValid || !isMatch} onClick={handleSubmit}>
              Confirm
            </NextButton>
          </form>
        </div>
      </div>
    </div>
  );
}
