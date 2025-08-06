"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import NextButton from "@/components/NextButton";
import axios from "axios";
import { useUser } from "@/context/UserContext";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebase";

export default function SignupSetMpin() {
  const router = useRouter();
  // Get registration data from UserContext for state persistence
  const {
    registrationData,
    updateRegistrationData,
    clearRegistrationData,
    setUserData,
  } = useUser();
  // Initialize MPIN states with existing data from context or empty arrays
  const [mpin, setMpin] = useState(["", "", "", ""]);
  const [mpin2, setMpin2] = useState(["", "", "", ""]);
  const [showMpin, setShowMpin] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const inputRefs2 = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  /**
   * Navigate back to the avatar selection step
   */
  const handleBack = () => {
    router.push("/signup/avatar");
  };

  /**
   * Save MPIN and complete signup process
   *
   * CHANGES:
   * - Added MPIN validation before proceeding
   * - Updates UserContext with MPIN data
   * - Sends complete registration data to backend
   * - Clears registration data after successful signup
   * - Navigates to home page
   */
  const saveMpin = async () => {
    const mpinStr = mpin.join(""); // "1234"
    updateRegistrationData({ mpin: mpinStr });

    let firebaseUser = null;

    try {
      const cleanRegistrationData = Object.fromEntries(
        Object.entries(registrationData).filter(
          ([_, value]) => value !== undefined && value !== null && value !== ""
        )
      ) as Record<string, string>;

      let firebaseUid = cleanRegistrationData.uid;

      // If email and password are provided, create Firebase user
      if (cleanRegistrationData.email && cleanRegistrationData.password) {
        try {
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            cleanRegistrationData.email,
            cleanRegistrationData.password
          );
          firebaseUser = userCredential.user;
          firebaseUid = firebaseUser.uid;
          console.log("Firebase user created:", firebaseUid);
        } catch (firebaseErr: any) {
          console.error("Firebase user creation failed:", firebaseErr);
          if (firebaseErr.code === "auth/email-already-in-use") {
            alert(
              "An account with this email already exists. Please use a different email or try logging in."
            );
            return;
          }
          // Continue with signup even if Firebase fails (for mobile-only users)
        }
      }

      // Send complete registration data to backend
      const response = await axios.post(
        "http://localhost:5000/api/auth/signup",
        {
          ...cleanRegistrationData,
          mpin: mpinStr,
          uid: firebaseUid,
        }
      );

      setUserData({
        ...response.data,
        isNewUser: true,
        hasCompletedMission2: false,
        missionProgress: 0,
      });

      clearRegistrationData();
      router.push("/home?newUser=true");
    } catch (err: any) {
      console.error("Signup failed:", err);

      // If Firebase user was created but backend failed, delete Firebase user
      if (firebaseUser) {
        try {
          await firebaseUser.delete();
          console.log("Firebase user deleted due to backend failure.");
        } catch (deleteErr) {
          console.error(
            "Failed to delete Firebase user after backend failure:",
            deleteErr
          );
        }
      }

      if (err.response?.status === 409) {
        alert(
          `Signup failed: ${err.response.data.details || "User already exists"}`
        );
      } else if (err.response?.data?.details) {
        alert(`Signup failed: ${err.response.data.details}`);
      } else if (err.response?.status === 500) {
        alert("Server error. Please try again later.");
      } else if (err.code === "ECONNREFUSED") {
        alert(
          "Cannot connect to server. Please check if the backend is running."
        );
      } else {
        alert("Something went wrong. Please try again.");
      }
    }
  };

  /**
   * Handle MPIN input changes with validation
   * Only allows single digit numbers
   */
  const handleChange = (index: number, value: string, which: 1 | 2) => {
    if (!/^[0-9]?$/.test(value)) return; // Only allow single digit numbers
    if (which === 1) {
      const newMpin = [...mpin];
      newMpin[index] = value;
      setMpin(newMpin);
      if (value && index < 3) {
        inputRefs[index + 1].current?.focus();
      }
    } else {
      const newMpin2 = [...mpin2];
      newMpin2[index] = value;
      setMpin2(newMpin2);
      if (value && index < 3) {
        inputRefs2[index + 1].current?.focus();
      }
    }
  };

  /**
   * Handle keyboard navigation for MPIN inputs
   */
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
    which: 1 | 2
  ) => {
    if (e.key === "Backspace") {
      if (which === 1 && !mpin[index] && index > 0) {
        inputRefs[index - 1].current?.focus();
      }
      if (which === 2 && !mpin2[index] && index > 0) {
        inputRefs2[index - 1].current?.focus();
      }
    }
  };

  const isMpinComplete = mpin.every((digit) => digit.length === 1);
  const isMpin2Complete = mpin2.every((digit) => digit.length === 1);
  const mpinMatch =
    isMpinComplete && isMpin2Complete && mpin.join("") === mpin2.join("");

  return (
    <div className="w-screen h-screen bg-[#F8F9FC] flex items-center justify-center overflow-hidden">
      {/* Chevron left button on far left, vertically centered */}
      <button
        onClick={handleBack}
        className="w-[96px] h-[96px] flex items-center justify-center rounded-full group focus:outline-none absolute left-0 top-1/2 -translate-y-1/2 z-20"
        style={{ minWidth: 96, minHeight: 96 }}
        aria-label="Back to avatar step"
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="group-hover:stroke-[#222E3A] stroke-[#222E3A]"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="30 12 18 24 30 36" />
        </svg>
      </button>
      {/* Logo in top left */}
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
        {/* Centered overlay content */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-full max-w-[600px] px-4 z-10">
          {/* <div className="flex flex-col items-center mb-2">
            <Image
              src="/call_end.png"
              alt="Call End Icon"
              width={236}
              height={236}
              style={{
                transform: "rotate(360deg)",
                maxWidth: "100%",
                maxHeight: "100%",
              }}
            />
          </div> */}
          <div
            className="mb-6 flex items-center w-full justify-center"
            style={{ minHeight: 60 }}
          >
            <h1
              className="text-3xl md:text-4xl font-extrabold text-[#222E3A] text-center font-poppins leading-tight mt-8"
              style={{ letterSpacing: "0px", width: "100%" }}
            >
              Set your 4-digit MPIN
            </h1>
          </div>
          <h3 className="font-bold text-lg text-center text-[#F28B20] mb-4 mt-4">
            This 4-digit code will be used for quick and secure login in the
            future. Make sure it's something you can remember, but not easy to
            guess.
          </h3>
          <form
            className="flex flex-col gap-4 w-full max-w-[400px] items-center"
            onSubmit={(e) => {
              e.preventDefault();
              /* handle MPIN submit here */
            }}
          >
            {/* First MPIN row */}
            <div className="flex items-center justify-center w-full gap-4 mb-2 relative">
              {mpin.map((digit, idx) => (
                <input
                  key={idx}
                  ref={inputRefs[idx]}
                  type={showMpin ? "text" : "password"}
                  inputMode="numeric"
                  maxLength={1}
                  className="w-16 h-16 text-3xl text-center text-black font-bold border border-gray-300 rounded-lg bg-white focus:border-blue-400 focus:outline-none transition-all"
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value, 1)}
                  onKeyDown={(e) => handleKeyDown(idx, e, 1)}
                  autoComplete="off"
                  placeholder={"•"}
                />
              ))}
              {/* Eye icon toggle */}
              <button
                type="button"
                onClick={() => setShowMpin((v) => !v)}
                className="absolute right-[-48px] top-1/2 -translate-y-1/2 p-2 focus:outline-none"
                tabIndex={-1}
                aria-label={showMpin ? "Hide MPIN" : "Show MPIN"}
              >
                {showMpin ? (
                  <svg
                    width="28"
                    height="28"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  <svg
                    width="28"
                    height="28"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.223-3.592m3.64-2.687A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.965 9.965 0 01-4.293 5.411M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3l18 18"
                    />
                  </svg>
                )}
              </button>
            </div>
            {/* Label and second MPIN row (re-enter) */}
            <div className="w-full flex flex-col items-center mb-2">
              <label className="text-sm text-gray-500 mb-1">
                Re-enter your MPIN
              </label>
              <div className="flex items-center justify-center w-full gap-4">
                {mpin2.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={inputRefs2[idx]}
                    type={showMpin ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={1}
                    className="w-16 h-16 text-3xl text-center text-black font-bold border border-gray-300 rounded-lg bg-white focus:border-blue-400 focus:outline-none transition-all"
                    value={digit}
                    onChange={(e) => handleChange(idx, e.target.value, 2)}
                    onKeyDown={(e) => handleKeyDown(idx, e, 2)}
                    autoComplete="off"
                    placeholder={"•"}
                  />
                ))}
              </div>
            </div>
            {/* Error message if not matching */}
            {isMpinComplete && isMpin2Complete && !mpinMatch && (
              <div className="text-red-500 text-sm font-semibold mb-1">
                MPINs do not match. Please re-enter.
              </div>
            )}
            <NextButton
              disabled={!mpinMatch}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                if (!mpinMatch) return;
                saveMpin();

                // handle MPIN submit here
              }}
            >
              Confirm
            </NextButton>
          </form>
        </div>
      </div>
    </div>
  );
}
