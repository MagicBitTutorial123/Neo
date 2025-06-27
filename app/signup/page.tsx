"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupMain() {
  const router = useRouter();
  const handleBack = () => {
    // Animate, then navigate
    setTimeout(() => router.push("/"), 300);
  };
  return (
    <div className="w-screen h-screen bg-[#F8F9FC] flex items-center justify-center  overflow-hidden">
      {/* Chevron left button on far left, vertically centered */}
      <button
        onClick={handleBack}
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
              src="/side-logo.png"
              alt="BuddyNeo Logo"
              width={400}
              height={75}
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
            {/* Navigation and button */}
            <div className="flex items-center gap-8 mt-8">
              {/* Let's Go button with animated triangle (single SVG) */}
              <div
                className="relative group"
                style={{ width: 361, height: 77.5 }}
              >
                <button
                  className="w-full h-full flex items-center justify-center rounded-full text-2xl font-bold font-poppins text-white bg-[#F28B20] shadow-md transition-all duration-300 ease-in-out focus:outline-none hover:bg-[#F76B1C] relative overflow-visible"
                  style={{ minWidth: 361, minHeight: 77.5 }}
                  onClick={() => {
                    setTimeout(() => router.push("/signup/mobile"), 300);
                  }}
                >
                  <span>Let's Go</span>
                  {/* Animated triangle */}
                  <span
                    className="absolute top-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out"
                    style={{ right: "-40px" }}
                    data-triangle
                  >
                    <svg
                      width="42.74"
                      height="42.74"
                      viewBox="0 0 32 32"
                      fill="#F28B20"
                      xmlns="http://www.w3.org/2000/svg"
                      className="transition-all duration-300 ease-in-out"
                    >
                      <polygon points="28,8 12,16 28,24" />
                    </svg>
                  </span>
                </button>
                <style jsx>{`
                  .group:hover [data-triangle] {
                    right: 32px !important;
                  }
                  .group:hover [data-triangle] svg {
                    fill: white !important;
                    transform: rotate(180deg);
                  }
                `}</style>
              </div>
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
