"use client";

import React, { use, useEffect, useMemo, useState } from "react";
import SideNavbar from "@/components/SideNavbar";
import StatusHeaderBar from "@/components/StatusHeaderBar";
import { useSidebar } from "@/context/SidebarContext";
import { getMissionMeta, getMissionJsonPublic } from "@/utils/queries";
import {
  normalizeMissionFromJson,
  NormalizedMission,
} from "@/utils/normalizeMission";
import StandardMissionLayout from "@/components/StandardMissionLayout";
import BlocklySplitLayout from "@/components/BlocklySplitLayout";

/**
 * This version obeys React Rules of Hooks:
 *  - All hooks are called unconditionally at the top.
 *  - params is a Promise in Next 15; unwrap with React.use().
 *  - No hooks inside conditionals/try/catch/returns.
 *  - Conditional layout rendering is done by returning different child components.
 */
export default function MissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ Unwrap params once, at top-level
  const resolved = use(params);
  const missionId = (resolved?.id || "").toString();

  // ✅ All hooks at top-level (never inside if/try/catch)
  const { sidebarCollapsed } = useSidebar();

  const [loading, setLoading] = useState<boolean>(true);
  const [mission, setMission] = useState<NormalizedMission | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHeader, setShowHeader] = useState<boolean>(false);
  const [showMCQ, setShowMCQ] = useState<boolean>(false);
  const [mcqStepIndex, setMcqStepIndex] = useState<number>(0);

  // ✅ Single effect to fetch data; no hooks inside try/catch
  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setError(null);
        setLoading(true);

        // 1) Fetch mission meta
        const meta = await getMissionMeta(missionId);
        if (!meta) {
          throw new Error(`Mission ${missionId} not found`);
        }

        // 2) Fetch mission JSON from Storage
        const json = await getMissionJsonPublic(
          meta.json_bucket,
          meta.object_path
        );

        // 3) Normalize (resolves steps[].text/image, layout, intro, etc.)
        const normalized = normalizeMissionFromJson(meta, json);

        if (!alive) return;
        setMission(normalized);
        
      } 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      catch (e: any) {
        console.error("[MissionDetails] fetch error:", e);
        if (!alive) return;
        setError(e?.message || "Failed to load mission");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [missionId]);

  // State change handlers
  const handleStateChange = (state: {
    showIntro: boolean;
    showCountdown: boolean;
  }) => {
    // Show header when we're in mission content (not intro or countdown)
    const shouldShowHeader = !state.showIntro && !state.showCountdown;
    console.log("🎯 MissionPage: State change received:", state);
    console.log("🎯 MissionPage: Should show header:", shouldShowHeader);
    setShowHeader(shouldShowHeader);
  };

  const handleMCQChange = (show: boolean, stepIndex: number) => {
    setShowMCQ(show);
    setMcqStepIndex(stepIndex);
    console.log(
      `MCQ ${show ? "show" : "hide"} for step ${stepIndex} (display step ${
        stepIndex + 1
      })`
    );
  };

  const handleMCQAnswer = (selectedAnswer: number) => {
    console.log(
      `MCQ answer selected: ${selectedAnswer} for step ${mcqStepIndex} (display step ${
        mcqStepIndex + 1
      })`
    );
    setShowMCQ(false);
  };

  // Debug header state
  useEffect(() => {
    console.log("🎯 MissionPage: showHeader changed to:", showHeader);
    console.log("🎯 MissionPage: mission exists:", !!mission);
    if (mission) {
      console.log("🎯 MissionPage: mission.id:", mission.id);
      console.log("🎯 MissionPage: mission.title:", mission.title);
    }
  }, [showHeader, mission]);

  // Initialize header state when mission loads
  useEffect(() => {
    if (mission && !loading) {
      console.log("🎯 MissionPage: Mission loaded, initializing header state");
      setShowHeader(false); // Start with header hidden to allow intro/countdown
    }
  }, [mission, loading]);

  // ✅ derive layout AFTER hooks
  const layout = mission?.layout || "StandardMissionLayout";
  console.log("🎯 MissionPage: Using layout:", layout);
  console.log("🎯 MissionPage: Mission data:", mission);

  // ✅ Render only; no hooks here
  return (
    <div className="flex min-h-screen bg-white">
      <SideNavbar />
      <main
        className="flex-1 flex flex-col overflow-hidden"
        style={{ marginLeft: sidebarCollapsed ? "80px" : "260px" }}
      >
        {/* Loading / Error */}
        {loading && (
          <div className="flex-1 flex items-center justify-center text-sm text-[#222E3A]">
            Loading mission…
          </div>
        )}

        {!loading && error && (
          <div className="flex-1 flex items-center justify-center text-red-600">
            {error}
          </div>
        )}

        {/* Ready */}
        {!loading && !error && mission && (
          <>
            {layout === "BlocklySplitLayout" ? (
              <BlocklySplitLayout
                mission={mission}
                onStateChange={handleStateChange}
                onMCQChange={handleMCQChange}
                onMCQAnswer={handleMCQAnswer}
                showHeader={showHeader}
              />
            ) : (
              <StandardMissionLayout
                mission={mission}
                onStateChange={handleStateChange}
                showHeader={showHeader}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
