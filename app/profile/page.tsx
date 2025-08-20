"use client";
import SideNavbar from "@/components/SideNavbar";
import Image from "next/image";
import { useUser } from "@/context/UserContext";
import { useSidebar } from "@/context/SidebarContext";

export default function ProfilePage() {
  const { registrationData, userData } = useUser();
  const { sidebarCollapsed } = useSidebar();

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
      />
      <main
        className="flex-1 flex flex-col items-center px-4 lg:px-8 py-3 lg:py-6 overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          marginLeft: sidebarCollapsed ? "80px" : "260px",
        }}
      >
        {/* Profile Card - Fixed at top */}
        <div className="w-full max-w-5xl rounded-2xl lg:rounded-3xl bg-[#F7F8FA] border border-[#E0E6ED] flex flex-col lg:flex-row items-center px-4 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-10 mb-6 sm:mb-8 lg:mb-12 shadow-sm flex-shrink-0">
          <div className="flex flex-col flex-1 gap-1.5 sm:gap-2 text-center lg:text-left">
            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#222E3A] mb-1.5 sm:mb-2">
              {userData.name}
            </div>
            <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold text-[#22AEEF] mb-1">
              Mission {currentMission}
            </div>
            {/* Progress bar */}
            <div className="w-full max-w-xs h-1.5 sm:h-2 rounded-full bg-[#E5EAF1] mb-1.5 sm:mb-2 mx-auto lg:mx-0">
              <div
                className="h-full rounded-full bg-[#FF9C32]"
                style={{ width: "60%" }}
              ></div>
            </div>
            <div className="text-xs sm:text-sm md:text-base text-[#22AEEF] font-semibold mt-1">
              {userData.xp} xp
            </div>
          </div>
          {/* Top Badge */}
          <div className="flex flex-col items-center mt-4 sm:mt-6 lg:mt-0 lg:ml-16">
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full bg-[#FFF6E6] flex items-center justify-center mb-1.5 sm:mb-2">
              <Image
                src={topBadge.image}
                alt={topBadge.label}
                width={80}
                height={80}
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28"
              />
            </div>
            <div className="text-xs lg:text-sm text-[#888] font-semibold">
              {topBadge.tag}
            </div>
          </div>
        </div>
        {/* Badges Section - Scrollable */}
        <div className="w-full max-w-5xl flex-1 overflow-y-auto scrollbar-hide">
          <div className="text-sm sm:text-base md:text-lg font-bold text-[#222E3A] mb-3 sm:mb-4 lg:mb-6 sticky top-0 bg-white z-10 py-2">
            My badges
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-y-6 lg:gap-x-3 pb-4">
            {badges.map((badge, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span
                  className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center rounded-full ${
                    badge.earned ? "bg-white" : "bg-[#F2F2F2]"
                  } border-2 border-[#E0E6ED] mb-1.5 sm:mb-2`}
                >
                  <Image
                    src={badge.image}
                    alt={badge.name}
                    width={60}
                    height={60}
                    className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20"
                    style={
                      badge.earned
                        ? {}
                        : { filter: "grayscale(1)", opacity: 0.5 }
                    }
                  />
                </span>
                <span
                  className={`text-xs sm:text-sm md:text-base font-semibold text-center ${
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
