"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import NextButton from "@/components/NextButton";
import { useUser } from "@/context/UserContext";

const avatars = [
  "/Avatar01.png",
  "/Avatar02.png",
  "/Avatar03.png",
  "/Avatar04.png",
  "/Avatar05.png",
];

export default function SignupAvatar() {
  const router = useRouter();
  const { registrationData, updateRegistrationData } = useUser();
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);


  //DISPLAY NAME
  const [displayName, setDisplayName] = useState(registrationData.name || "");
  useEffect(() => {
    if (!displayName) {
      const saved = typeof window !== "undefined" ? localStorage.getItem("name") : null;
      if (saved) setDisplayName(saved);
    }
  }, [displayName]);
  const handleBack = () => {
    router.push("/signup/email/setPassword");
  };

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (selected === null) return;

    updateRegistrationData({ avatar: avatars[selected] });
    router.push("/home");
  };

  return (
    <div className="w-screen h-screen bg-[#F8F9FC] flex items-center justify-center overflow-hidden">
      {/* Chevron left button on far left, vertically centered */}
      <button
        onClick={handleBack}
        className="w-[96px] h-[96px] flex items-center justify-center rounded-full group focus:outline-none absolute left-0 top-1/2 -translate-y-1/2 z-20"
        style={{ minWidth: 96, minHeight: 96 }}
        aria-label="Back to age step"
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
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-full max-w-[700px] px-4 z-10">
          <div className="flex flex-col items-center mb-2">
            <div className="rounded-full border-4 border-[#E0E0E0] bg-[#EDEAF6] w-40 h-40 flex items-center justify-center mb-2 overflow-hidden shadow-xl">
              {selected !== null ? (
                <Image
                  src={avatars[selected]}
                  alt="Selected Avatar"
                  width={180}
                  height={180}
                  style={{ borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <svg
                  width="100"
                  height="100"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="50"
                    cy="36"
                    r="20"
                    stroke="#AAA"
                    strokeWidth="4"
                  />
                  <path
                    d="M20 80c0-13.255 13.431-24 30-24s30 10.745 30 24"
                    stroke="#AAA"
                    strokeWidth="4"
                  />
                </svg>
              )}
            </div>
            <div className="text-2xl font-bold text-[#888] mb-2">{displayName||"Name"}</div>
          </div>
          <div className="mb-4 mt-2 text-2xl md:text-3xl font-extrabold text-[#222E3A] text-center font-poppins">
            Select your avatar
          </div>
          <div className="flex flex-row items-center justify-center gap-6 mb-8">
            {avatars.map((src, idx) => (
              <button
                key={src}
                type="button"
                className={`rounded-full p-2 transition-all border-4 ${
                  selected === idx
                    ? "border-[#00AEEF] bg-[#FFFBEA]"
                    : "border-transparent bg-[#FFFBEA]"
                } focus:outline-none`}
                style={{
                  width: 110,
                  height: 110,
                  transform: hovered === idx ? "scale(1.50)" : "scale(1)",
                  transition: "transform 0.15s",
                }}
                onClick={() => setSelected(idx)}
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered(null)}
                tabIndex={0}
                aria-label={`Select avatar ${idx + 1}`}
              >
                <Image
                  src={src}
                  alt={`Avatar ${idx + 1}`}
                  width={90}
                  height={90}
                  style={{ borderRadius: "50%" }}
                />
              </button>
            ))}
          </div>
          <NextButton disabled={selected === null} onClick={handleNext}>
            Confirm
          </NextButton>
        </div>
      </div>
    </div>
  );
}
