"use client";
import { useUser } from "@/context/UserContext";
import { missions } from "@/data/missions";
import SideNavbar from "@/components/SideNavbar";
import Image from "next/image";
import Link from "next/link";
import LetsGoButton from "@/components/LetsGoButton";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import MissionProgressBar from "@/components/MissionProgressBar";
import StepperMissionProgressBar from "@/components/StepperMissionProgressBar";

export default function MissionsPage() {
  const { userData } = useUser();
  const completed = userData?.missionProgress ?? 0;
  const missionList = Object.values(missions);
  // Show the current mission as selected in the breadcrumb
  const selectedMissionIdx = completed;
  const selectedMission = missionList[selectedMissionIdx] || missionList[0];

  return (
    <div className="flex min-h-screen bg-white">
      <main className="flex-1 flex flex-col px-12 pr-8 py-8">
        {/* Breadcrumb */}
        <div className="text-2xl font-extrabold text-[#222E3A] mb-6 flex items-center gap-2">
          <span className="text-[#222E3A]">Missions</span>
          <span className="text-[#222E3A]">&gt;</span>
          <span className="text-[#00AEEF]">
            Mission {String(selectedMission.id).padStart(2, "0")}
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
        <StepperMissionProgressBar
          missionList={missionList}
          completed={completed}
        />
      </main>
    </div>
  );
}
