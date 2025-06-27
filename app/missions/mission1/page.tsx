"use client";
import SideNavbar from "@/components/SideNavbar";
import LetsGoButton from "@/components/LetsGoButton";
import Image from "next/image";

export default function Mission1Page() {
  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <SideNavbar />
      <main className="flex-1 flex flex-col items-center justify-center relative px-8">
        {/* Top Row: Title and Time */}
        <div className="w-full flex flex-row items-start justify-between mt-12 mb-4 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#222E3A]">
            Mission 01
          </h1>
          <div className="flex items-center gap-2 text-lg font-poppins text-[#222E3A]">
            <Image src="/gala_clock.png" alt="Clock" width={32} height={32} />
            <span>
              Time Allocated: <span className="font-bold">15 mins</span>
            </span>
          </div>
        </div>
        {/* Center Image */}
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
          <Image
            src="/MissionIntroImage-1.png"
            alt="Assemble the robot"
            width={240}
            height={120}
            className="mb-4"
          />
          <div className="text-2xl md:text-3xl font-extrabold text-[#222E3A] mb-2 mt-2 text-center">
            Assemble the robot
          </div>
          <div className="text-center text-[#888] text-base md:text-lg mb-8 max-w-2xl">
            Some instructions for the mission.
            <br />
            Lorem ipsum dolor sit amet consectetur. Sit morbi lectus odio amet.
            Morbi arcu quis tortor lectus pharetra massa ut tellus. Aliquam a
            ultricies tristique massa mus nisi ac leo. Sed rutrum pulvinar risus
            dapibus tristique nulla elit adipiscing.
          </div>
          <div className="flex justify-center w-full">
            <div className="flex justify-center w-full">
              <LetsGoButton
                style={{
                  width: 340,
                  minWidth: 340,
                  height: 60,
                  minHeight: 60,
                  fontSize: 22,
                  justifyContent: "center",
                }}
              >
                START
              </LetsGoButton>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
