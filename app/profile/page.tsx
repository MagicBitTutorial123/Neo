"use client";
import SideNavbar from "@/components/SideNavbar";
import Image from "next/image";

const user = {
  name: "Elon Musk",
  avatar: "/Avatar01.png",
  currentMission: 2,
  xp: 120,
  topBadge: {
    image: "/badge1.png",
    label: "BATTE READY",
    tag: "#TopBadge",
  },
  badges: [
    { image: "/badge1.png", name: "1st Spark", earned: true },
    { image: "/badge2.png", name: "Circuit Master", earned: true },
    { image: "/badge3.png", name: "Beginner", earned: false },
    { image: "/badge4.png", name: "Beginner", earned: false },
    { image: "/badge6.png", name: "Beginner", earned: false },
    { image: "/badge6.png", name: "Beginner", earned: false },
    { image: "/badge6.png", name: "Beginner", earned: false },
    { image: "/badge6.png", name: "Beginner", earned: false },
  ],
};

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <SideNavbar avatar={user.avatar} name={user.name} />
      <main className="flex-1 flex flex-col items-center px-8 py-12">
        {/* Profile Card */}
        <div className="w-full max-w-5xl rounded-3xl bg-[#F7F8FA] border border-[#E0E6ED] flex flex-row items-center px-12 py-10 mb-12 shadow-sm">
          <div className="flex flex-col flex-1 gap-2">
            <div className="text-4xl font-extrabold text-[#222E3A] mb-2">
              {user.name}
            </div>
            <div className="text-2xl font-extrabold text-[#22AEEF] mb-1">
              Mission {user.currentMission}
            </div>
            {/* Progress bar */}
            <div className="w-full max-w-xs h-2 rounded-full bg-[#E5EAF1] mb-2">
              <div
                className="h-full rounded-full bg-[#FF9C32]"
                style={{ width: "60%" }}
              ></div>
            </div>
            <div className="text-base text-[#22AEEF] font-semibold mt-1">{user.xp} xp</div>
          </div>
          {/* Top Badge */}
          <div className="flex flex-col items-center ml-16">
            <div className="w-36 h-36 rounded-full bg-[#FFF6E6] flex items-center justify-center mb-2">
              <Image
                src={user.topBadge.image}
                alt={user.topBadge.label}
                width={110}
                height={110}
              />
            </div>
            <div className="text-sm text-[#888] font-semibold">
              {user.topBadge.tag}
            </div>
          </div>
        </div>
        {/* Badges Section */}
        <div className="w-full max-w-5xl">
          <div className="text-lg font-bold text-[#222E3A] mb-6">My badges</div>
          <div className="grid grid-cols-4 gap-y-8 gap-x-4">
            {user.badges.map((badge, idx) => (
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
                  className={`text-base font-semibold ${
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
