"use client";
import { useUser } from "@/context/UserContext";
import { missions } from "@/data/missions";
import React, { useState, useEffect } from "react";
import SideNavbar from "@/components/SideNavbar";
import { useSidebar } from "@/context/SidebarContext";
import BasicAuthGuard from "@/components/BasicAuthGuard";
import WeeklyUsageGraph from "@/components/Progress/WeeklyUsageGraph";
import SummaryOfLearnings from "@/components/Progress/SummaryOfLearnings";
import MissionListView from "@/components/Progress/MissionListView";

export default function ProgressPage() {
  const { userData } = useUser();
  const { sidebarCollapsed } = useSidebar();
  const [selectedMission, setSelectedMission] = useState<number | null>(null);

  // Mock weekly usage data - in a real app, this would come from the database
  const weeklyUsageData = [
    { day: "Mon", minutes: 45, missions: 2 },
    { day: "Tue", minutes: 30, missions: 1 },
    { day: "Wed", minutes: 60, missions: 3 },
    { day: "Thu", minutes: 25, missions: 1 },
    { day: "Fri", minutes: 75, missions: 4 },
    { day: "Sat", minutes: 90, missions: 5 },
    { day: "Sun", minutes: 40, missions: 2 },
  ];

  // Get completed missions
  const completedMissions = userData?.missionProgress ? 
    Object.values(missions).slice(0, userData.missionProgress + 1) : [];

  // Get current mission progress
  const currentMissionProgress = userData?.missionProgress ?? 0;

  return (
    <BasicAuthGuard>
      <div className="flex min-h-screen min-w-screen h-screen w-screen bg-white overflow-hidden max-w-screen max-h-screen">
        <SideNavbar />
        <main
          className="flex-1 flex flex-col overflow-hidden max-w-screen max-h-screen h-screen w-full p-0 m-0 transition-all duration-300 ease-in-out"
          style={{
            marginLeft: sidebarCollapsed ? "80px" : "260px",
          }}
        >
          {/* Header */}
          <div className="text-2xl font-extrabold text-[#222E3A] mb-8 flex items-center gap-2 px-8 pt-8">
            <span className="text-[#222E3A]">Progress Dashboard</span>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto px-8 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-8">
                {/* Weekly Usage Bar Graph */}
                <div className="bg-white rounded-2xl border border-[#E0E6ED] p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-[#222E3A] mb-4">Weekly Usage</h2>
                  <WeeklyUsageGraph data={weeklyUsageData} />
                </div>

                {/* Summary of Learnings */}
                <div className="bg-white rounded-2xl border border-[#E0E6ED] p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-[#222E3A] mb-4">Summary of Learnings</h2>
                  <SummaryOfLearnings 
                    completedMissions={completedMissions}
                    currentProgress={currentMissionProgress}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Mission List View */}
                <div className="bg-white rounded-2xl border border-[#E0E6ED] p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-[#222E3A] mb-4">Mission Progress</h2>
                  <MissionListView 
                    missions={Object.values(missions)}
                    completedCount={currentMissionProgress}
                    onMissionSelect={setSelectedMission}
                    selectedMission={selectedMission}
                  />
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-2xl border border-[#E0E6ED] p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-[#222E3A] mb-4">Quick Stats</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#00AEEF]">
                        {currentMissionProgress + 1}
                      </div>
                      <div className="text-sm text-[#6B7280]">Current Mission</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#00AEEF]">
                        {userData?.xp || 0}
                      </div>
                      <div className="text-sm text-[#6B7280]">Total XP</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#00AEEF]">
                        {completedMissions.length}
                      </div>
                      <div className="text-sm text-[#6B7280]">Missions Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#00AEEF]">
                        {Math.round(((currentMissionProgress + 1) / Object.keys(missions).length) * 100)}%
                      </div>
                      <div className="text-sm text-[#6B7280]">Overall Progress</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </BasicAuthGuard>
  );
}
