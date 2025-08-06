"use client";
import { useUser } from "@/context/UserContext";
import { missions } from "@/data/missions";
import Image from "next/image";
import Link from "next/link";
import LetsGoButton from "@/components/LetsGoButton";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import MissionProgressBar from "@/components/MissionProgressBar";
import StepperMissionProgressBar from "@/components/StepperMissionProgressBar";
import SideNavbar from "@/components/SideNavbar";

export default function MissionsPage() {
  const { userData } = useUser();
  const completed = userData?.missionProgress ?? 2; // change later to 0 using 2 for testing
  const missionList = Object.values(missions);
  // Track the selected mission index for both the stepper and the breadcrumb
  const [selectedMissionIdx, setSelectedMissionIdx] = useState(completed);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen min-w-screen h-screen w-screen bg-white overflow-hidden max-w-screen max-h-screen">
      <SideNavbar onCollapse={setSidebarCollapsed} />
      <main
        className="flex-1 flex flex-col overflow-hidden max-w-screen max-h-screen h-screen w-full p-0 m-0 transition-all duration-300 ease-in-out"
        style={{
          marginLeft: sidebarCollapsed ? "80px" : "260px",
        }}
      >
        {/* Breadcrumb */}
        <div className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#222E3A] mb-4 sm:mb-6 flex items-center gap-1 sm:gap-2 px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-8">
          <span className="text-[#222E3A]">Missions</span>
          <span className="text-[#222E3A]">&gt;</span>
          <span className="text-[#00AEEF]">
            Mission {String(selectedMissionIdx + 1)}
          </span>
        </div>
        {/* Mission Progress Bar */}
        <div className="fixed top-8 right-8 z-50 w-[320px]">
          <MissionProgressBar
            missionLabel={`Mission ${String(
              (userData?.missionProgress ?? 0) + 1
            ).padStart(2, "0")}`}
            xpPoints={userData?.xp ?? 0}
            progressPercent={
              ((userData?.missionProgress ?? 0) / (missionList.length - 1)) *
              100
            }
          />
        </div>
        {/* Stepper Progress Bar with Mission Details */}
        <div className="flex-1 flex flex-col overflow-hidden max-w-full max-h-full">
          <StepperMissionProgressBar
            missionList={missionList}
            completed={completed}
            selectedMissionIdx={selectedMissionIdx}
            setSelectedMissionIdx={setSelectedMissionIdx}
          />
        </div>
      </main>
    </div>
  );
}
