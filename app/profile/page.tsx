"use client";
import { useState } from "react";
import SideNavbar from "@/components/SideNavbar";
import Image from "next/image";
import { useUser } from "@/context/UserContext";

export default function ProfilePage() {
  const { registrationData, userData } = useUser();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Use context data or fallback to registrationData or defaults
  const userAvatar = userData?.avatar || registrationData.avatar || "/User.png";
  const userName = userData?.name || registrationData.name || "User";
  const currentMission = userData?.missionProgress || 1;

  // Dummy data for XP and badges (replace with real data when available)
  const xp = 120;
  const topBadge = {
    image: "/badge1.png",
    label: "BATTE READY",
    tag: "#TopBadge",
  };
  const badges = [
    { image: "/badge1.png", name: "1st Spark", earned: true },
    { image: "/badge2.png", name: "Circuit Master", earned: true },
    { image: "/badge3.png", name: "Beginner", earned: false },
    { image: "/badge4.png", name: "Beginner", earned: false },
    { image: "/badge6.png", name: "Beginner", earned: false },
    { image: "/badge6.png", name: "Beginner", earned: false },
    { image: "/badge6.png", name: "Beginner", earned: false },
    { image: "/badge6.png", name: "Beginner", earned: false },
  ];

  // Playground is active if mission 2 is completed
  const playgroundActive = (userData?.missionProgress ?? 0) >= 2;

  // Loading state if userData is not loaded
  if (!userData) {
    return (
      <div className="flex min-h-screen bg-[#F8F9FC] items-center justify-center">
        <div className="text-xl text-gray-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white overflow-x-hidden">
      <SideNavbar
        avatar={userAvatar}
        name={userName}
        playgroundActive={true} //{playgroundActive}
        onCollapse={setSidebarCollapsed}
      />
      <main
        className="flex-1 flex flex-col items-center px-4 lg:px-8 py-6 lg:py-12 overflow-x-hidden transition-all duration-300 ease-in-out lg:overflow-y-hidden"
        style={{
          marginLeft: sidebarCollapsed ? "80px" : "260px",
        }}
      >
        {/* Profile Card */}
        <div className="w-full max-w-5xl rounded-2xl lg:rounded-3xl bg-[#F7F8FA] border border-[#E0E6ED] flex flex-col lg:flex-row items-center px-6 lg:px-12 py-8 lg:py-10 mb-8 lg:mb-12 shadow-sm">
          <div className="flex flex-col flex-1 gap-2 text-center lg:text-left">
            <div className="text-2xl lg:text-3xl xl:text-4xl font-extrabold text-[#222E3A] mb-2">
              {userData.name}
            </div>
            <div className="text-lg lg:text-xl xl:text-2xl font-extrabold text-[#22AEEF] mb-1">
              Mission {currentMission}
            </div>
            {/* Progress bar */}
            <div className="w-full max-w-xs h-2 rounded-full bg-[#E5EAF1] mb-2 mx-auto lg:mx-0">
              <div
                className="h-full rounded-full bg-[#FF9C32]"
                style={{ width: "60%" }}
              ></div>
            </div>
            <div className="text-sm lg:text-base text-[#22AEEF] font-semibold mt-1">
              {userData.xp} xp
            </div>
          </div>
          {/* Top Badge */}
          <div className="flex flex-col items-center mt-6 lg:mt-0 lg:ml-16">
            <div className="w-24 h-24 lg:w-36 lg:h-36 rounded-full bg-[#FFF6E6] flex items-center justify-center mb-2">
              <Image
                src={topBadge.image}
                alt={topBadge.label}
                width={80}
                height={80}
                className="lg:w-[110px] lg:h-[110px]"
              />
            </div>
            <div className="text-xs lg:text-sm text-[#888] font-semibold">
              {topBadge.tag}
            </div>
          </div>
        </div>
        {/* Badges Section */}
        <div className="w-full max-w-5xl">
          <div className="text-base lg:text-lg font-bold text-[#222E3A] mb-4 lg:mb-6">
            My badges
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-y-8 lg:gap-x-4">
            {badges.map((badge, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span
                  className={`w-20 h-20 flex items-center justify-center rounded-full ${
                    badge.earned ? "bg-white" : "bg-[#F2F2F2]"
                  } border-2 border-[#E0E6ED] mb-2`}
                >
                  <Image
                    src={badge.image}
                    alt={badge.name}
                    width={110}
                    height={110}
                    style={
                      badge.earned
                        ? {}
                        : { filter: "grayscale(1)", opacity: 0.5 }
                    }
                  />
                </span>
                <span
                  className={`text-sm lg:text-base font-semibold text-center ${
                    badge.earned ? "text-[#222E3A]" : "text-[#BDC8D5]"
                  }`}
                >
                  {badge.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
