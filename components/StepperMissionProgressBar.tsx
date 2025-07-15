import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LetsGoButton from "@/components/LetsGoButton";
import { FaLock } from "react-icons/fa";

interface Mission {
  id: string | number;
  title: string;
  missionPageImage?: string;
  missionDescription?: string;
  intro?: {
    timeAllocated: string;
  };
}

interface StepperMissionProgressBarProps {
  missionList: Mission[];
  completed: number;
  selectedMissionIdx?: number;
  setSelectedMissionIdx?: (idx: number) => void;
}

const THUMBNAIL_WIDTH = 160; // px
const VISIBLE_COUNT = 7;
const DOT_SIZE = 20; // px (w-5)
const LINE_HEIGHT = 4; // px

// Helper to ensure image src is always valid for Next.js Image
function getSafeImageSrc(src: string | undefined) {
  if (!src || typeof src !== "string" || src.trim() === "")
    return "/mission-dummy.png";
  if (src.startsWith("/") || src.startsWith("http")) return src;
  return "/" + src;
}

const StepperMissionProgressBar: React.FC<StepperMissionProgressBarProps> = ({
  missionList,
  completed,
  selectedMissionIdx: controlledSelectedMissionIdx,
  setSelectedMissionIdx: controlledSetSelectedMissionIdx,
}) => {
  const [startIdx, setStartIdx] = useState(0);
  // Remove: const [internalSelectedMissionIdx, setInternalSelectedMissionIdx] = useState(completed);
  // Instead, initialize with 0 (or a prop if provided), and do not update on carousel slide
  const [internalSelectedMissionIdx, setInternalSelectedMissionIdx] = useState(
    controlledSelectedMissionIdx !== undefined
      ? controlledSelectedMissionIdx
      : 0
  );
  const selectedMissionIdx =
    controlledSelectedMissionIdx ?? internalSelectedMissionIdx;
  const setSelectedMissionIdx =
    controlledSetSelectedMissionIdx ?? setInternalSelectedMissionIdx;
  const router = useRouter();
  const maxStart = Math.max(0, missionList.length - VISIBLE_COUNT);
  const selectedMission = missionList[selectedMissionIdx] || missionList[0];

  const handlePrev = () => setStartIdx((idx) => Math.max(0, idx - 1));
  const handleNext = () => {
    // Only slide if the last visible mission is not the last mission
    if (startIdx + VISIBLE_COUNT < missionList.length) {
      setStartIdx((idx) => idx + 1);
    }
  };

  // For visible missions
  const visibleMissions = missionList.slice(
    startIdx,
    Math.min(startIdx + VISIBLE_COUNT, missionList.length)
  );
  // Calculate dynamic line positions for the stepper
  // Each dot center: left = idx * (THUMBNAIL_WIDTH + 32) + THUMBNAIL_WIDTH/2
  const dotCenters = visibleMissions.map(
    (_, idx) => idx * (THUMBNAIL_WIDTH + 32) + THUMBNAIL_WIDTH / 2
  );
  // Find the last completed dot in the visible range
  const firstDotCenter = dotCenters[0];
  // Find the last completed dot index in the visible range
  const lastCompletedVisibleIdx = visibleMissions.findLastIndex(
    (_, idx) => startIdx + idx < completed
  );
  const lastDotCenter = dotCenters[dotCenters.length - 1];
  const lastCompletedDotCenter =
    lastCompletedVisibleIdx >= 0
      ? dotCenters[lastCompletedVisibleIdx]
      : firstDotCenter;

  // For the full line
  const fullLineWidth = (missionList.length - 1) * (THUMBNAIL_WIDTH + 32);
  const completedIdx = completed - 1;
  const orangeLineWidth =
    completedIdx >= 0
      ? completedIdx * (THUMBNAIL_WIDTH + 32) + DOT_SIZE / 2
      : 0;
  const greyLineLeft = orangeLineWidth;
  const greyLineWidth = fullLineWidth + DOT_SIZE / 2 - orangeLineWidth;

  // Only update selectedMissionIdx when a thumbnail is clicked
  // When rendering, compute isSelected as (globalIdx === selectedMissionIdx) even if selected is out of view
  // Do NOT change selectedMissionIdx on startIdx change
  // If the selected mission is not in visibleMissions, it simply won't be highlighted in the visible row

  return (
    <div
      className="w-full flex flex-col items-center select-none"
      style={{ userSelect: "none" }}
    >
      {/* Mission Details Top Content */}
      <div className="w-full flex flex-row gap-8 mb-8">
        {/* Description Card */}
        <div className="flex-1 bg-[#F8F9FC] rounded-2xl p-10 shadow border border-[#E0E6ED] flex flex-col min-h-[320px] max-h-[320px] justify-between">
          <div className="flex flex-col flex-1 justify-between h-full">
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="text-2xl text-black font-bold mb-4">
                {selectedMission.title}
              </div>
              <div
                className="text-[#585A6C] text-base mb-12"
                style={{ minHeight: 60 }}
              >
                {selectedMission.missionDescription}
              </div>
            </div>
            <div className="flex justify-center items-end pt-2 mb-0">
              <LetsGoButton
                locked={selectedMissionIdx > completed}
                disabled={selectedMissionIdx > completed}
                style={{
                  minWidth: 200,
                  width: 200,
                  fontSize: 22,
                  height: 60,
                  minHeight: 60,
                  justifyContent: "center",
                }}
                onClick={
                  selectedMissionIdx > completed
                    ? undefined
                    : () => router.push(`/missions/${selectedMission.id}`)
                }
              >
                {selectedMissionIdx > completed ? (
                  <span className="flex items-center justify-center w-full">
                    LOCKED{" "}
                    <span className="ml-3 text-2xl">
                      <FaLock />
                    </span>
                  </span>
                ) : (
                  "START"
                )}
              </LetsGoButton>
            </div>
          </div>
        </div>
        {/* Mission Card */}
        <div className="w-[370px] bg-[#F8F9FC] rounded-2xl shadow border border-[#E0E6ED] flex flex-col items-end min-h-[320px] max-h-[320px] overflow-hidden p-0 mr-0">
          {/* Mission Image - flush with top/edges, rounded top corners */}
          <div className="w-[370px] h-[260px] rounded-t-2xl overflow-hidden">
            <Image
              src={getSafeImageSrc((selectedMission as any).missionPageImage)}
              alt={selectedMission.title}
              width={370}
              height={260}
              className="object-cover w-full h-full"
              style={{ objectFit: "cover" }}
            />
          </div>
          {/* Card Content */}
          <div className="flex flex-row w-full items-center justify-between gap-2 p-6">
            <div className="flex flex-col items-start gap-2">
              {/* Difficulty */}
              <div className="flex items-center gap-2 bg-[#222E3A] rounded-full px-3 py-1 self-start">
                <span className="text-white text-xs font-semibold">
                  Difficulty
                </span>
                {["#7ED957", "#B6F178", "#FFE156", "#FFB037", "#F45B69"].map(
                  (color, i) => (
                    <svg
                      key={`diffhex-${i}`}
                      width="16"
                      height="16"
                      viewBox="0 0 20 20"
                      className="inline-block"
                    >
                      <polygon
                        points="10,2 18,7 18,17 10,22 2,17 2,7"
                        fill={color}
                      />
                    </svg>
                  )
                )}
              </div>
              {/* Time */}
              <div className="flex items-center gap-2 bg-[#222E3A] rounded-full px-3 py-1 self-start">
                <Image
                  src="/missionPageCardClock-icon.png"
                  alt="clock"
                  width={18}
                  height={18}
                />
                <span className="text-white text-xs font-medium">
                  {selectedMission.intro?.timeAllocated}
                </span>
              </div>
            </div>
            {/* XP */}
            <div className="text-3xl font-extrabold text-[#222E3A] self-center">
              110<span className="text-base font-bold">XP</span>
            </div>
          </div>
        </div>
      </div>
      {/* Carousel Row */}
      <div
        className="relative flex items-center justify-center w-full bg-[#F8F9FC] rounded-2xl border border-[#E0E6ED] shadow p-4 mt-2 overflow-hidden"
        style={{ width: "100%", maxWidth: "100%" }}
      >
        {/* Blue overlays for all unselected thumbnails, rendered absolutely at the carousel row level */}
        {visibleMissions.map((mission, idx) => {
          if (!mission) return null; // Only render overlays for real missions
          const globalIdx = startIdx + idx;
          const isSelected = globalIdx === selectedMissionIdx;
          if (isSelected) return null;
          const GAP = 32;
          const overlayStart =
            idx === 0
              ? 32 // left margin
              : 32 + idx * (THUMBNAIL_WIDTH + GAP) - GAP / 16;
          const overlayEnd =
            idx === visibleMissions.length - 1
              ? 32 + (idx + 1) * (THUMBNAIL_WIDTH + GAP) - GAP // right margin
              : 32 + (idx + 1) * (THUMBNAIL_WIDTH + GAP) - GAP / 16;
          const left = overlayStart;
          const width = overlayEnd - overlayStart;
          return (
            <div
              key={`overlay-${mission.id}`}
              className="absolute"
              style={{
                left,
                width,
                top: 0,
                bottom: 0,
                background: "rgba(0,174,239,0.18)",
                zIndex: 5,
                pointerEvents: "none",
                borderRadius: "16px 16px 0 0",
              }}
            />
          );
        })}
        {/* Left Arrow */}
        <button
          onClick={handlePrev}
          disabled={startIdx === 0}
          className="absolute left-0 z-10 bg-white rounded-full shadow p-1 flex items-center justify-center disabled:opacity-30"
          style={{
            width: 32,
            height: 32,
            top: "50%",
            transform: "translateY(-50%)",
          }}
          aria-label="Previous"
        >
          <svg width="20" height="20" viewBox="0 0 20 20">
            <path
              d="M13 16l-5-6 5-6"
              stroke="#222E3A"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {/* Thumbnails Row with dots and line behind */}
        <div
          className="overflow-hidden"
          style={{
            width: visibleMissions.length * THUMBNAIL_WIDTH,
            margin: "0 32px",
            position: "relative",
          }}
        >
          {/* Orange completed line (dynamic, stepper style) */}
          <div
            style={{
              position: "absolute",
              left: firstDotCenter,
              top: 160 + DOT_SIZE / 2 - LINE_HEIGHT / 2 + 8,
              width: Math.max(0, lastCompletedDotCenter - firstDotCenter),
              height: LINE_HEIGHT,
              background: "#FFB037",
              zIndex: 1,
              borderRadius: 2,
              transition: "width 0.3s, left 0.3s",
            }}
          />
          {/* Grey remaining line (dynamic, stepper style) */}
          <div
            style={{
              position: "absolute",
              left: lastCompletedDotCenter,
              top: 160 + DOT_SIZE / 2 - LINE_HEIGHT / 2 + 8,
              width: Math.max(0, lastDotCenter - lastCompletedDotCenter),
              height: LINE_HEIGHT,
              background: "#E0E6ED",
              zIndex: 0,
              borderRadius: 2,
              transition: "width 0.3s, left 0.3s",
            }}
          />
          <div
            className="flex transition-transform duration-300 gap-8"
            style={{
              width:
                visibleMissions.length * THUMBNAIL_WIDTH +
                (visibleMissions.length - 1) * 32,
              transform: `translateX(0px)`,
            }}
          >
            {visibleMissions.map((mission, idx) => {
              const globalIdx = startIdx + idx;
              const isLocked = globalIdx > completed;
              const isSelected = globalIdx === selectedMissionIdx;
              return (
                <div
                  key={mission.id}
                  className={`flex flex-col items-center cursor-pointer group relative`}
                  style={{ width: THUMBNAIL_WIDTH }}
                  onClick={() => setSelectedMissionIdx(globalIdx)}
                >
                  <div
                    className={`relative overflow-hidden w-full h-[160px] rounded-2xl mb-2 border border-[#E0E6ED] bg-white transition-transform duration-200
                      ${isSelected ? "shadow-xl z-10" : ""}
                    `}
                  >
                    {/* Mission image always in the background */}
                    <img
                      src={getSafeImageSrc((mission as any).missionPageImage)}
                      alt={mission.title}
                      width={160}
                      height={160}
                      className="object-cover w-full h-full"
                      style={{
                        objectFit: "cover",
                        position: "absolute",
                        inset: 0,
                        zIndex: 0,
                        pointerEvents: "none",
                      }}
                    />
                    {/* Black overlay and lock icon for locked thumbnails (always present if locked) */}
                    {isLocked && (
                      <>
                        <div
                          className="absolute inset-0"
                          style={{
                            background: "rgba(0,0,0,0.7)",
                            zIndex: 1,
                            pointerEvents: "none",
                          }}
                        />
                        <span
                          className="absolute text-3xl text-white left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                          style={{ zIndex: 2, pointerEvents: "none" }}
                        >
                          <svg
                            width="32"
                            height="32"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <rect
                              x="5"
                              y="11"
                              width="14"
                              height="10"
                              rx="2"
                              stroke="white"
                              strokeWidth="2"
                            />
                            <path
                              d="M17 11V7a5 5 0 00-10 0v4"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </>
                    )}
                  </div>
                  {/* Dot below thumbnail, centered */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 mt-4 ${
                      globalIdx < completed
                        ? "bg-[#FFB037] border-[#FFB037]"
                        : "bg-[#E0E6ED] border-[#E0E6ED]"
                    }`}
                    style={{
                      margin: "0 auto",
                      position: "relative",
                      zIndex: 2,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
        {/* Right Arrow */}
        <button
          onClick={handleNext}
          disabled={startIdx + VISIBLE_COUNT >= missionList.length}
          className="absolute right-0 z-10 bg-white rounded-full shadow p-1 flex items-center justify-center disabled:opacity-30"
          style={{
            width: 32,
            height: 32,
            top: "50%",
            transform: "translateY(-50%)",
          }}
          aria-label="Next"
        >
          <svg width="20" height="20" viewBox="0 0 20 20">
            <path
              d="M7 4l5 6-5 6"
              stroke="#222E3A"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default StepperMissionProgressBar;
