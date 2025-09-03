import Image from "next/image";
import React, { useState, useEffect } from "react";
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
  totalPoints?: number;
  isUnlocked?: boolean;
}

interface StepperMissionProgressBarProps {
  missionList: Mission[];
  completed: number;
  selectedMissionIdx?: number;
  setSelectedMissionIdx?: (idx: number) => void;
}

// Dynamic values based on screen size
const getVisibleCount = () => {
  if (typeof window === "undefined") return 7;
  if (window.innerWidth < 640) return 2; // sm
  if (window.innerWidth < 768) return 3; // md
  if (window.innerWidth < 1024) return 5; // lg
  return 7; // xl and above
};

const getThumbnailWidth = () => {
  if (typeof window === "undefined") return 160;
  if (window.innerWidth < 640) return 120; // sm
  if (window.innerWidth < 768) return 140; // md
  return 160; // lg and above
};

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
  const [internalSelectedMissionIdx, setInternalSelectedMissionIdx] = useState(
    controlledSelectedMissionIdx !== undefined
      ? controlledSelectedMissionIdx
      : 0
  );
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  // Use default values for SSR, then update on client
  const [visibleCount, setVisibleCount] = useState(7);
  const [thumbnailWidth, setThumbnailWidth] = useState(160);
  const [isClient, setIsClient] = useState(false);

  const selectedMissionIdx =
    controlledSelectedMissionIdx ?? internalSelectedMissionIdx;
  const setSelectedMissionIdx =
    controlledSetSelectedMissionIdx ?? setInternalSelectedMissionIdx;
  const router = useRouter();
  const maxStart = Math.max(0, missionList.length - visibleCount);
  const selectedMission = missionList[selectedMissionIdx] ||
    missionList[0] || {
      id: "01",
      title: "Loading...",
      missionPageImage: "/mission-dummy.png",
      missionDescription: "Loading mission data...",
      intro: { timeAllocated: "15 mins" },
      totalPoints: 0,
      isUnlocked: true,
    };

  // Update responsive values on window resize and after mount
  useEffect(() => {
    setIsClient(true);
    setVisibleCount(getVisibleCount());
    setThumbnailWidth(getThumbnailWidth());

    const handleResize = () => {
      setVisibleCount(getVisibleCount());
      setThumbnailWidth(getThumbnailWidth());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePrev = () => setStartIdx((idx) => Math.max(0, idx - 1));
  const handleNext = () => {
    // Only slide if the last visible mission is not the last mission
    if (startIdx + visibleCount < missionList.length) {
      setStartIdx((idx) => idx + 1);
    }
  };

  // For visible missions
  const visibleMissions = missionList.slice(
    startIdx,
    Math.min(startIdx + visibleCount, missionList.length)
  );
  // Calculate dynamic line positions for the stepper
  // Each dot center: left = idx * (thumbnailWidth + 32) + thumbnailWidth/2
  const dotCenters = visibleMissions.map(
    (_, idx) => idx * (thumbnailWidth + 32) + thumbnailWidth / 2
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
  const fullLineWidth = (missionList.length - 1) * (thumbnailWidth + 32);
  const completedIdx = completed - 1;
  const orangeLineWidth =
    completedIdx >= 0 ? completedIdx * (thumbnailWidth + 32) + DOT_SIZE / 2 : 0;
  const greyLineLeft = orangeLineWidth;
  const greyLineWidth = fullLineWidth + DOT_SIZE / 2 - orangeLineWidth;

  // Only update selectedMissionIdx when a thumbnail is clicked
  // When rendering, compute isSelected as (globalIdx === selectedMissionIdx) even if selected is out of view
  // Do NOT change selectedMissionIdx on startIdx change
  // If the selected mission is not in visibleMissions, it simply won't be highlighted in the visible row

  // Don't render responsive elements until client has mounted to prevent hydration mismatch
  if (!isClient) {
    return (
      <div
        className="w-full flex flex-col items-center select-none overflow-visible max-w-full"
        style={{ userSelect: "none", maxWidth: "100vw" }}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Mission Details Top Content */}
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6 lg:mb-8 overflow-visible">
            {/* Description Card */}
            <div className="flex-1 bg-[#F8F9FC] rounded-2xl p-4 sm:p-6 lg:p-10 shadow border border-[#E0E6ED] flex flex-col min-h-[280px] sm:min-h-[320px] max-h-[280px] sm:max-h-[320px] justify-between overflow-hidden max-w-full">
              <div className="flex flex-col flex-1 justify-between h-full overflow-hidden max-w-full">
                <div className="flex-1 overflow-y-auto min-h-0 max-h-[200px] scrollbar-hide">
                  <div className="text-lg sm:text-xl lg:text-2xl text-black font-semibold mb-3 sm:mb-4">
                    {selectedMission.title}
                  </div>
                  <div
                    className="text-[#585A6C] text-sm sm:text-base mb-8 sm:mb-12"
                    style={{ minHeight: 60 }}
                  >
                    {selectedMission.missionDescription}
                  </div>
                </div>
                <div style={{ overflow: "visible" }}>
                  <div
                    className="flex justify-center items-end pt-2 mb-0"
                    style={{ overflow: "visible" }}
                  >
                    <LetsGoButton
                      locked={!selectedMission.isUnlocked}
                      disabled={!selectedMission.isUnlocked}
                      style={{
                        minWidth: 180,
                        width: 200,
                        fontSize: 18,
                        height: 50,
                        minHeight: 50,
                        justifyContent: "center",
                      }}
                      className="sm:min-w-[200px] sm:w-[240px] sm:text-[22px] sm:h-[60px] sm:min-h-[60px]"
                      onClick={
                        !selectedMission.isUnlocked
                          ? undefined
                          : () => router.push(`/missions/${selectedMission.id}`)
                      }
                    >
                      {!selectedMission.isUnlocked ? (
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
            </div>
            {/* Mission Card */}
            <div className="w-full sm:w-[370px] bg-[#F8F9FC] rounded-2xl shadow border border-[#E0E6ED] flex flex-col items-end min-h-[280px] sm:min-h-[320px] max-h-[280px] sm:max-h-[320px] overflow-hidden p-0 mr-0 max-w-full">
              {/* Mission Image - flush with top/edges, rounded top corners */}
              <div className="w-full sm:w-[370px] h-[200px] sm:h-[260px] rounded-t-2xl overflow-hidden max-w-full">
                <Image
                  src={getSafeImageSrc(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (selectedMission as any).missionPageImage
                  )}
                  alt={selectedMission.title}
                  width={370}
                  height={260}
                  className="object-cover w-full h-full"
                  style={{ objectFit: "cover" }}
                />
              </div>
              {/* Card Content */}
              <div className="flex flex-col sm:flex-row w-full items-start sm:items-center justify-between gap-2 p-3 sm:p-6 max-w-full">
                <div className="flex flex-col items-start gap-2 max-w-full">
                  {/* Difficulty */}
                  <div className="flex items-center gap-1 sm:gap-2 bg-[#222E3A] rounded-full px-2 sm:px-3 py-1 self-start">
                    <span className="text-white text-xs font-semibold">
                      Difficulty
                    </span>
                    {[
                      "#7ED957",
                      "#B6F178",
                      "#FFE156",
                      "#FFB037",
                      "#F45B69",
                    ].map((color, i) => (
                      <svg
                        key={`diffhex-${i}`}
                        width="14"
                        height="14"
                        viewBox="0 0 20 20"
                        className="inline-block sm:w-4 sm:h-4"
                      >
                        <polygon
                          points="10,2 18,7 18,17 10,22 2,17 2,7"
                          fill={color}
                        />
                      </svg>
                    ))}
                  </div>
                  {/* Time */}
                  <div className="flex items-center gap-1 sm:gap-2 bg-[#222E3A] rounded-full px-2 sm:px-3 py-1 self-start">
                    <Image
                      src="/missionCardClock.png"
                      alt="clock"
                      width={16}
                      height={16}
                      className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
                    />
                    <span className="text-white text-xs font-medium">
                      {selectedMission.intro?.timeAllocated}
                    </span>
                  </div>
                </div>
                {/* XP */}
                <div className="text-2xl sm:text-3xl font-extrabold text-[#222E3A] self-center">
                  {selectedMission.totalPoints || 0}
                  <span className="text-sm sm:text-base font-bold"> XP</span>
                </div>
              </div>
            </div>
          </div>
          {/* Carousel Row - Always render with default values */}
          <div
            className="relative bg-[#F8F9FC] rounded-2xl border border-[#E0E6ED] shadow p-2 sm:p-4 mt-2 pt-4 sm:pt-7"
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
                      width: 0,
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
                      left: 0,
                      top: 6,
                      width: "100%",
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
                  {missionList.slice(0, 7).map((mission, idx) => {
                    const globalIdx = idx;
                    const isLocked = !mission.isUnlocked;
                    const isSelected = globalIdx === selectedMissionIdx;
                    return (
                      <div
                        key={mission.id}
                        className="flex flex-col items-center cursor-pointer group relative"
                        style={{ width: 160 }}
                        onClick={() => {
                          if (!isLocked) {
                            setSelectedMissionIdx(globalIdx);
                          }
                        }}
                      >
                        <div className="relative w-full h-[160px] rounded-2xl mb-2 border border-[#E0E6ED] hover:border-[#E0E6ED] bg-white transition-transform duration-200 focus:outline-none focus:ring-0">
                          {/* Mission image always in the background */}
                          <Image
                            src={getSafeImageSrc(
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              (mission as any).missionPageImage
                            )}
                            alt={mission.title}
                            width={160}
                            height={160}
                            unoptimized
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
                          {/* Black overlay and lock icon for locked thumbnails */}
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
                            parseInt(mission.id.toString()) <= completed
                              ? "bg-[#FFB037] border-[#FFB037]"
                              : "bg-[#D9D9D9] border-[#D9D9D9]"
                          }`}
                          style={{
                            margin: "0 auto",
                            position: "relative",
                            top: "18px",
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
              disabled={startIdx + 7 >= missionList.length}
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
      </div>
    );
  }

  // Add safety check for empty missionList
  if (missionList.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-lg font-semibold text-[#222E3A] mb-2">
            Loading missions...
          </div>
          <div className="text-sm text-gray-500">
            Please wait while we fetch your missions.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full flex flex-col items-center select-none overflow-visible max-w-full"
      style={{ userSelect: "none", maxWidth: "100vw" }}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Mission Details Top Content */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6 lg:mb-8 overflow-visible">
          {/* Description Card */}
          <div className="flex-1 bg-[#F8F9FC] rounded-2xl p-4 sm:p-6 lg:p-10 shadow border border-[#E0E6ED] flex flex-col min-h-[280px] sm:min-h-[320px] max-h-[280px] sm:max-h-[320px] justify-between overflow-hidden max-w-full">
            <div className="flex flex-col flex-1 justify-between h-full overflow-hidden max-w-full">
              <div className="flex-1 overflow-y-auto min-h-0 max-h-[200px] scrollbar-hide">
                <div className="text-lg sm:text-xl lg:text-2xl text-black font-semibold mb-3 sm:mb-4">
                  {selectedMission.title}
                </div>
                <div
                  className="text-[#585A6C] text-sm sm:text-base mb-8 sm:mb-12"
                  style={{ minHeight: 60 }}
                >
                  {selectedMission.missionDescription}
                </div>
              </div>
              <div style={{ overflow: "visible" }}>
                <div
                  className="flex justify-center items-end pt-2 mb-0"
                  style={{ overflow: "visible" }}
                >
                  <LetsGoButton
                    locked={!selectedMission.isUnlocked}
                    disabled={!selectedMission.isUnlocked}
                    style={{
                      minWidth: 180,
                      width: 200,
                      fontSize: 18,
                      height: 50,
                      minHeight: 50,
                      justifyContent: "center",
                    }}
                    className="sm:min-w-[200px] sm:w-[240px] sm:text-[22px] sm:h-[60px] sm:min-h-[60px]"
                    onClick={
                      !selectedMission.isUnlocked
                        ? undefined
                        : () => router.push(`/missions/${selectedMission.id}`)
                    }
                  >
                    {!selectedMission.isUnlocked ? (
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
          </div>
          {/* Mission Card */}
          <div className="w-full sm:w-[370px] bg-[#F8F9FC] rounded-2xl shadow border border-[#E0E6ED] flex flex-col items-end min-h-[280px] sm:min-h-[320px] max-h-[280px] sm:max-h-[320px] overflow-hidden p-0 mr-0 max-w-full">
            {/* Mission Image - flush with top/edges, rounded top corners */}
            <div className="w-full sm:w-[370px] h-[200px] sm:h-[260px] rounded-t-2xl overflow-hidden max-w-full">
              <Image
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                src={getSafeImageSrc((selectedMission as any).missionPageImage)}
                alt={selectedMission.title}
                width={370}
                height={260}
                className="object-cover w-full h-full"
                style={{ objectFit: "cover" }}
              />
            </div>
            {/* Card Content */}
            <div className="flex flex-col sm:flex-row w-full items-start sm:items-center justify-between gap-2 p-3 sm:p-6 max-w-full">
              <div className="flex flex-col items-start gap-2 max-w-full">
                {/* Difficulty */}
                <div className="flex items-center gap-1 sm:gap-2 bg-[#222E3A] rounded-full px-2 sm:px-3 py-1 self-start">
                  <span className="text-white text-xs font-semibold">
                    Difficulty
                  </span>
                  {["#7ED957", "#B6F178", "#FFE156", "#FFB037", "#F45B69"].map(
                    (color, i) => (
                      <svg
                        key={`diffhex-${i}`}
                        width="14"
                        height="14"
                        viewBox="0 0 20 20"
                        className="inline-block sm:w-4 sm:h-4"
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
                <div className="flex items-center gap-1 sm:gap-2 bg-[#222E3A] rounded-full px-2 sm:px-3 py-1 self-start">
                  <Image
                    src="/missionCardClock.png"
                    alt="clock"
                    width={16}
                    height={16}
                    className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
                  />
                  <span className="text-white text-xs font-medium">
                    {selectedMission.intro?.timeAllocated}
                  </span>
                </div>
              </div>
              {/* XP */}
              <div className="text-2xl sm:text-3xl font-extrabold text-[#222E3A] self-center">
                {selectedMission.totalPoints || 0}
                <span className="text-sm sm:text-base font-bold"> XP</span>
              </div>
            </div>
          </div>
        </div>
        {/* Carousel Row */}
        <div
          className="relative bg-[#F8F9FC] rounded-2xl border border-[#E0E6ED] shadow p-2 sm:p-4 mt-2 pt-4 sm:pt-7"
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
                  const isLocked = !mission.isUnlocked;
                  const isSelected = globalIdx === selectedMissionIdx;
                  const isHovered = hoveredIdx === globalIdx;
                  return (
                    <div
                      key={mission.id}
                      className="flex flex-col items-center cursor-pointer group relative"
                      style={{ width: thumbnailWidth }}
                      onClick={() => setSelectedMissionIdx(globalIdx)}
                      onMouseEnter={() => setHoveredIdx(globalIdx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    >
                      <div className="relative w-full h-[160px] rounded-2xl mb-2 border border-[#E0E6ED] hover:border-[#E0E6ED] bg-white transition-transform duration-200 focus:outline-none focus:ring-0">
                        {/* Mission image always in the background */}
                        <Image
                          src={getSafeImageSrc(
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (mission as any).missionPageImage
                          )}
                          alt={mission.title}
                          width={thumbnailWidth}
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
                                height: "240px",
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
                          parseInt(mission.id.toString()) <= completed
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
            disabled={startIdx + visibleCount >= missionList.length}
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
