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

const THUMBNAIL_WIDTH = 160; // px (was 160)
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
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
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
      className="w-full flex flex-col items-center select-none overflow-hidden max-w-full"
      style={{ userSelect: "none", maxWidth: "100vw" }}
    >
      <div className="w-full max-w-7xl mx-auto px-8">
        {/* Mission Details Top Content */}
        <div className="flex flex-row gap-8 mb-8 overflow-hidden">
          {/* Description Card */}
          <div className="flex-1 bg-[#F8F9FC] rounded-2xl p-10 shadow border border-[#E0E6ED] flex flex-col min-h-[320px] max-h-[320px] justify-between overflow-hidden max-w-full">
            <div className="flex flex-col flex-1 justify-between h-full overflow-hidden max-w-full">
              <div className="flex-1 overflow-y-auto min-h-0 max-h-[200px] scrollbar-hide">
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
                      LOCKED
                      <span
                        className="ml-3 text-2xl"
                        style={{ display: "flex", alignItems: "center" }}
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
                    </span>
                  ) : (
                    "START"
                  )}
                </LetsGoButton>
              </div>
            </div>
          </div>
          {/* Mission Card */}
          <div className="w-[370px] bg-[#F8F9FC] rounded-2xl shadow border border-[#E0E6ED] flex flex-col items-end min-h-[320px] max-h-[320px] overflow-hidden p-0 mr-0 max-w-full">
            {/* Mission Image - flush with top/edges, rounded top corners */}
            <div className="w-[370px] h-[260px] rounded-t-2xl overflow-hidden max-w-full">
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
            <div className="flex flex-row w-full items-center justify-between gap-2 p-6 max-w-full">
              <div className="flex flex-col items-start gap-2 max-w-full">
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
          className="relative bg-[#F8F9FC] rounded-2xl border border-[#E0E6ED] shadow p-4 mt-2 pt-7"
          style={{ overflow: "visible" }}
        >
          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            disabled={startIdx === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full shadow p-1 flex items-center justify-center disabled:opacity-30 z-50"
            style={{ width: 32, height: 32 }}
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
          {/* Thumbnails and stepper lines in overflow-x-hidden flex-1 */}
          <div className="overflow-visible flex-1">
            <div className="relative" style={{ height: 200 }}>
              {/* Stepper lines (behind dots) - aligned with dots */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  width: "100%",
                  height: 20,
                  top: 188,
                  overflow: "hidden",
                  pointerEvents: "none",
                  zIndex: 5,
                }}
              >
                {/* Orange completed line */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 6,
                    width:
                      lastCompletedVisibleIdx >= 0
                        ? dotCenters[lastCompletedVisibleIdx]
                        : 0,
                    height: 4,
                    background: "#FFB037",
                    borderRadius: 2,
                    transition: "width 0.3s, left 0.3s",
                    zIndex: 6,
                  }}
                />
                {/* Grey remaining line */}
                <div
                  style={{
                    position: "absolute",
                    left:
                      lastCompletedVisibleIdx >= 0
                        ? dotCenters[lastCompletedVisibleIdx]
                        : 0,
                    top: 6,
                    width:
                      dotCenters[dotCenters.length - 1] -
                      (lastCompletedVisibleIdx >= 0
                        ? dotCenters[lastCompletedVisibleIdx]
                        : 0),
                    height: 4,
                    background: "#D9D9D9",
                    borderRadius: 2,
                    transition: "width 0.3s, left 0.3s",
                    zIndex: 5,
                  }}
                />
              </div>
              {/* Thumbnails Row (relative, above overlay) */}
              <div
                className="flex gap-4 transition-transform duration-300 justify-start relative z-20"
                style={{ transform: `translateX(0px)` }}
              >
                {visibleMissions.map((mission, idx) => {
                  const globalIdx = startIdx + idx;
                  const isLocked = globalIdx > completed;
                  const isSelected = globalIdx === selectedMissionIdx;
                  const isHovered = hoveredIdx === globalIdx;
                  return (
                    <div
                      key={mission.id}
                      className="flex flex-col items-center cursor-pointer group relative"
                      style={{ width: THUMBNAIL_WIDTH }}
                      onClick={() => setSelectedMissionIdx(globalIdx)}
                      onMouseEnter={() => setHoveredIdx(globalIdx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    >
                      <div className="relative w-full h-[160px] rounded-2xl mb-2 border border-[#E0E6ED] hover:border-[#E0E6ED] bg-white transition-transform duration-200 focus:outline-none focus:ring-0">
                        {/* Mission image always in the background */}
                        <img
                          src={getSafeImageSrc(
                            (mission as any).missionPageImage
                          )}
                          alt={mission.title}
                          width={THUMBNAIL_WIDTH}
                          height={160}
                          className="object-cover w-full h-full"
                          style={{
                            objectFit: "cover",
                            position: "absolute",
                            borderRadius: "16px",
                            inset: 0,
                            zIndex: 0,
                            pointerEvents: "none",
                          }}
                        />
                        {/* Blue overlay for unselected, not selected thumbnails */}
                        {!isSelected && (
                          <>
                            {/* Blue overlay with fade-out on hover (adjusted top and width) */}
                            <div
                              className="absolute bg-[#00AEEF]/20 z-10 pointer-events-none transition-opacity duration-200"
                              style={{
                                left: "-9px",
                                right: "-9px",
                                top: "-24px",
                                height: "250px",
                                borderRadius: "24px 24px 0 0",
                                opacity: isHovered ? 0 : 1,
                              }}
                            />
                            {/* Orange outline on hover (adjusted top and width) */}
                            {isHovered && (
                              <div
                                className="absolute z-20 pointer-events-none transition-opacity duration-200"
                                style={{
                                  left: "-9px",
                                  right: "-9px",
                                  top: "-24px",
                                  height: "240px",
                                  border: "2px solid #F28B20",
                                  borderRadius: "24px 24px 0 0",
                                  opacity: 1,
                                }}
                              />
                            )}
                          </>
                        )}
                        {/* Orange outline overlay and triangle for hover */}
                        {!isSelected && (
                          <svg
                            width={24}
                            height={20}
                            viewBox="0 0 24 20"
                            className="triangle-pointer-anim"
                            style={{
                              position: "absolute",
                              left: "50%",
                              top: isHovered ? -28 : -48,
                              opacity: isHovered ? 1 : 0,
                              transform: "translateX(-50%) rotate(180deg)",
                              transition:
                                "top 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s cubic-bezier(0.4,0,0.2,1)",
                              zIndex: 30,
                              pointerEvents: "none",
                            }}
                          >
                            <polygon points="0,20 12,0 24,20" fill="#F28B20" />
                          </svg>
                        )}
                        {/* Black overlay and lock icon for locked thumbnails (always present if locked) */}
                        {isLocked && (
                          <>
                            <div
                              className="absolute inset-0"
                              style={{
                                borderRadius: "16px",
                                background: "rgba(0,0,0,0.7)",
                                zIndex: 40,
                                pointerEvents: "none",
                              }}
                            />
                            <span
                              className="absolute text-3xl text-white left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                              style={{ zIndex: 41, pointerEvents: "none" }}
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
                      {/* Dot below thumbnail, centered on stepper line */}
                      <div
                        className={`w-5 h-5 rounded-full border-2" ${
                          globalIdx < completed
                            ? "bg-[#FFB037] border-[#FFB037]"
                            : "bg-[#D9D9D9] border-[#D9D9D9]"
                        }`}
                        style={{
                          margin: "0 auto",
                          position: "relative",
                          top: "18px", // 160px (thumbnail) + 28px = 188px (line)
                          zIndex: 2,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Right Arrow */}
          <button
            onClick={handleNext}
            disabled={startIdx + VISIBLE_COUNT >= missionList.length}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full shadow p-1 flex items-center justify-center disabled:opacity-30 z-50"
            style={{ width: 32, height: 32 }}
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
      {/* Triangle animation style (for SSR safety) */}
      <style>{`
        .triangle-pointer-anim {
          will-change: opacity, transform;
        }
      `}</style>
    </div>
  );
};

export default StepperMissionProgressBar;
