"use client";

import React, { useEffect, useState, useCallback } from "react";
import SideNavbar from "@/components/SideNavbar";
import MissionProgressBar from "@/components/MissionProgressBar";
import StepperMissionProgressBar from "@/components/StepperMissionProgressBar";
import { useSidebar } from "@/context/SidebarContext";
import {
  getAllMissionsMeta,
  getMissionJsonPublic,
  isMissionUnlocked,
} from "@/utils/queries";
import { useUser } from "@/context/UserContext";
import { getUserProgress } from "@/utils/queries";

// ✅ Load missions & normalize JSON (title/description/time/steps/images)
import {
  normalizeMissionFromJson,
  NormalizedMission,
} from "@/utils/normalizeMission";

type MissionCard = NormalizedMission & { isUnlocked: boolean };

export default function MissionsPage() {
  const { sidebarCollapsed } = useSidebar();
  const [missionList, setMissionList] = useState<MissionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const { userData, updateUserData } = useUser();
  const [selectedMissionIdx, setSelectedMissionIdx] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Use real user data for progress bar
  const xpPoints = userData?.xp || 0;
  const currentMission = userData?.missionProgress || 0;
  const nextLabel = `Mission ${String(currentMission + 1).padStart(2, "0")}`;

  // Function to refresh missions with current user data
  const refreshMissions = useCallback(async () => {
    if (!userData?._id) return;

    try {
      console.log("🎯 [Missions] Manual refresh triggered");
      const metas = await getAllMissionsMeta();

      if (metas.length > 0) {
        // Check unlock status for each mission with current user data
        const missionsWithUnlockStatus = await Promise.all(
          metas.map(async (m) => {
            const isUnlocked = await isMissionUnlocked(
              userData._id!,
              m.mission_uid
            );
            console.log(
              `🎯 [Missions] Manual refresh - Mission ${m.mission_uid} unlock status:`,
              isUnlocked
            );
            return { ...m, isUnlocked };
          })
        );

        // Update existing mission list with new unlock status
        setMissionList((prevMissions) => {
          const updatedMissions = prevMissions.map((mission) => {
            const meta = missionsWithUnlockStatus.find(
              (m) => m.mission_uid === mission.id
            );
            return {
              ...mission,
              isUnlocked: meta?.isUnlocked || false,
            };
          });

          console.log(
            "🎯 [Missions] Manual refresh - Updated mission list:",
            updatedMissions.map((m) => ({
              id: m.id,
              title: m.title,
              isUnlocked: m.isUnlocked,
            }))
          );
          return updatedMissions;
        });
      }
    } catch (error) {
      console.error("🎯 [Missions] Manual refresh failed:", error);
    }
  }, [userData?._id]);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        setLoading(true);
        console.log("🎯 [Missions] Fetching missions with user data:", {
          userId: userData?._id,
          currentMission: userData?.missionProgress,
          xp: userData?.xp,
          refreshTrigger,
        });

        const metas = await getAllMissionsMeta();

        if (metas.length === 0) {
          console.warn("[Missions] No mission metadata found");
          setMissionList([]);
          return;
        }

        // Check unlock status for each mission
        const missionsWithUnlockStatus = await Promise.all(
          metas.map(async (m) => {
            const isUnlocked = userData?._id
              ? await isMissionUnlocked(userData._id, m.mission_uid)
              : parseInt(m.mission_uid) === 1; // Only mission 1 unlocked for non-authenticated users
            console.log(
              `🎯 [Missions] Mission ${m.mission_uid} unlock status:`,
              isUnlocked
            );
            return { ...m, isUnlocked };
          })
        );

        const settled = await Promise.allSettled(
          missionsWithUnlockStatus.map(async (m) => {
            console.log(
              `🎯 [Missions] Fetching JSON for mission ${m.mission_uid}:`,
              {
                json_bucket: m.json_bucket,
                object_path: m.object_path,
              }
            );
            const j = await getMissionJsonPublic(m.json_bucket, m.object_path);
            const norm = normalizeMissionFromJson(m, j);
            return {
              ...norm,
              id: m.mission_uid,
              order_no: m.order_no,
              isUnlocked: m.isUnlocked,
            } as MissionCard;
          })
        );

        const full: MissionCard[] = [];
        settled.forEach((r, i) => {
          const m = missionsWithUnlockStatus[i];
          if (r.status === "fulfilled") {
            full.push({ ...r.value, isUnlocked: m.isUnlocked });
          } else {
            console.warn(
              "[Missions] JSON missing/failed for",
              m.mission_uid,
              r.reason
            );
            full.push({
              id: m.mission_uid,
              title: m.title || `Mission ${m.mission_uid}`,
              missionPageImage: `/mission${m.mission_uid}-missionPageImage.png`,
              missionDescription:
                m.description || `Mission ${m.mission_uid} (coming soon)`,
              layout: "StandardMissionLayout" as const,
              intro: { timeAllocated: "15 mins", image: undefined },
              steps: [],
              overlays: [],
              order_no: m.order_no,
              totalPoints: 0,
              isUnlocked: m.isUnlocked,
            });
          }
        });

        console.log(
          "🎯 [Missions] Final mission list with unlock status:",
          full.map((m) => ({
            id: m.id,
            title: m.title,
            isUnlocked: m.isUnlocked,
          }))
        );
        setMissionList(full);
      } catch (error) {
        console.error("[Missions] Fetch error:", error);
        setMissionList([
          {
            id: "01",
            title: "Intro Mission 1",
            missionPageImage: "/mission-dummy.png",
            missionDescription: "Fallback (check bucket/object_path)",
            layout: "StandardMissionLayout" as const,
            intro: { timeAllocated: "15 mins", image: undefined },
            steps: [],
            overlays: [],
            order_no: 1,
            totalPoints: 0,
            isUnlocked: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, [userData?._id, userData?.missionProgress, userData?.xp, refreshTrigger]);

  // Listen for mission completion events to refresh user data
  useEffect(() => {
    const handleMissionCompleted = async (event: CustomEvent) => {
      console.log(
        "🎯 [Missions] Mission completed event received:",
        event.detail
      );

      if (userData?._id) {
        try {
          // Refresh user data from database
          const freshUserData = await getUserProgress(userData._id);
          if (freshUserData) {
            console.log("🎯 [Missions] Refreshing user data:", freshUserData);
            updateUserData({
              xp: freshUserData.xp || 0,
              missionProgress: freshUserData.current_mission || 0,
              hasCompletedMission2: (freshUserData.current_mission || 0) >= 2,
            });

            // Trigger a refresh of missions with a small delay to ensure user data is updated
            console.log("🎯 [Missions] Triggering mission list refresh");
            setTimeout(() => {
              refreshMissions();
            }, 100);
          }
        } catch (error) {
          console.error("🎯 [Missions] Failed to refresh user data:", error);
        }
      }
    };

    window.addEventListener(
      "missionCompleted",
      handleMissionCompleted as unknown as EventListener
    );

    return () => {
      window.removeEventListener(
        "missionCompleted",
        handleMissionCompleted as unknown as EventListener
      );
    };
  }, [userData?._id, updateUserData]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-white">
        <SideNavbar />
        <main
          className="flex-1 flex items-center justify-center"
          style={{ marginLeft: sidebarCollapsed ? "80px" : "260px" }}
        >
          <div className="text-[#222E3A]">Loading missions…</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white overflow-hidden">
      <SideNavbar />
      <main
        className="flex-1 flex flex-col overflow-hidden"
        style={{ marginLeft: sidebarCollapsed ? "80px" : "260px" }}
      >
        {/* Breadcrumb */}
        <div className="text-2xl font-extrabold text-[#222E3A] mb-8 flex items-center gap-2 px-8 pt-8">
          <span className="text-[#222E3A]">Missions</span>
          <span className="text-[#222E3A]">&gt;</span>
          <span className="text-[#00AEEF]">
            Mission {String((selectedMissionIdx ?? 0) + 1)}
          </span>
        </div>

        {/* Progress */}
        <div className="fixed top-8 right-8 z-50 w-[320px]">
          <MissionProgressBar
            missionLabel={nextLabel}
            xpPoints={xpPoints}
            progressPercent={
              missionList.length > 1
                ? (currentMission / (missionList.length - 1)) * 100
                : 0
            }
          />
        </div>

        {/* Stepper */}
        <div className="flex-1 flex flex-col overflow-hidden max-w-full max-h-full mt-6">
          <StepperMissionProgressBar
            missionList={missionList}
            completed={currentMission}
            selectedMissionIdx={selectedMissionIdx}
            setSelectedMissionIdx={setSelectedMissionIdx}
          />
        </div>
      </main>
    </div>
  );
}
