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
}

const THUMBNAIL_WIDTH = 112; // px
const VISIBLE_COUNT = 6;
const DOT_SIZE = 20; // px (w-5)
const LINE_HEIGHT = 4; // px

const StepperMissionProgressBar: React.FC<StepperMissionProgressBarProps> = ({
  missionList,
  completed,
}) => {
  const [startIdx, setStartIdx] = useState(0);
  const [selectedMissionIdx, setSelectedMissionIdx] = useState(completed);
  const router = useRouter();
  const maxStart = Math.max(0, missionList.length - VISIBLE_COUNT);
  const selectedMission = missionList[selectedMissionIdx] || missionList[0];

  const handlePrev = () => setStartIdx((idx) => Math.max(0, idx - 1));
  const handleNext = () => setStartIdx((idx) => Math.min(maxStart, idx + 1));

  // For visible missions
  const visibleMissions = missionList.slice(startIdx, startIdx + VISIBLE_COUNT);

  // For the full line
  const fullLineWidth = (missionList.length - 1) * THUMBNAIL_WIDTH;
  const completedIdx = Math.max(0, Math.min(completed, missionList.length - 1));
  const orangeLineWidth = completedIdx * THUMBNAIL_WIDTH + DOT_SIZE / 2;
  const greyLineLeft = orangeLineWidth;
  const greyLineWidth = fullLineWidth + DOT_SIZE / 2 - orangeLineWidth;

  return (
    <div
      className="w-full flex flex-col items-center select-none"
      style={{ userSelect: "none" }}
    >
      {/* Mission Details Top Content */}
      <div className="w-full flex flex-row gap-8 mb-8">
        {/* Description Card */}
        <div className="flex-1 bg-[#F8F9FC] rounded-2xl p-10 shadow border border-[#E0E6ED] flex flex-col justify-between min-h-[320px]">
          <div>
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
          <div className="flex justify-center w-full">
            {selectedMissionIdx > completed ? (
              <button
                disabled
                className="flex items-center justify-center bg-[#333] text-white text-xl font-bold rounded-full px-12 py-3 mt-2 opacity-90 cursor-not-allowed"
                style={{
                  minWidth: 200,
                  width: 240,
                  fontSize: 24,
                  height: 60,
                  minHeight: 60,
                }}
              >
                LOCKED
                <span className="ml-3 text-2xl">
                  <FaLock />
                </span>
              </button>
            ) : (
              <LetsGoButton
                style={{
                  minWidth: 200,
                  width: 200,
                  fontSize: 22,
                  height: 60,
                  minHeight: 60,
                  justifyContent: "center",
                }}
                onClick={() => router.push(`/missions/${selectedMission.id}`)}
              >
                START
              </LetsGoButton>
            )}
          </div>
        </div>
        {/* Mission Card */}
        <div className="w-[370px] bg-[#F8F9FC] rounded-2xl shadow border border-[#E0E6ED] flex flex-col items-end min-h-[320px] overflow-hidden p-0 mr-0">
          {/* Mission Image - flush with top/edges, rounded top corners */}
          {typeof (selectedMission as any).missionPageImage === "string" &&
            (selectedMission as any).missionPageImage.trim() !== "" && (
              <Image
                src={(selectedMission as any).missionPageImage}
                alt={selectedMission.title}
                width={370}
                height={260}
                className="object-cover w-full h-[260px] rounded-t-2xl"
                style={{ objectFit: "cover" }}
              />
            )}
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
        className="relative flex items-center justify-center w-full"
        style={{ width: "100%", maxWidth: "100%" }}
      >
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
            width: VISIBLE_COUNT * THUMBNAIL_WIDTH,
            margin: "0 32px",
            position: "relative",
          }}
        >
          {/* Orange completed line */}
          <div
            style={{
              position: "absolute",
              left: DOT_SIZE / 2,
              top: 112 + DOT_SIZE / 2 - LINE_HEIGHT / 2 + 8,
              width: orangeLineWidth,
              height: LINE_HEIGHT,
              background: "#FFB037",
              zIndex: 1,
              borderRadius: 2,
              transition: "width 0.3s",
            }}
          />
          {/* Grey remaining line */}
          <div
            style={{
              position: "absolute",
              left: greyLineLeft,
              top: 112 + DOT_SIZE / 2 - LINE_HEIGHT / 2 + 8,
              width: greyLineWidth,
              height: LINE_HEIGHT,
              background: "#E0E6ED",
              zIndex: 0,
              borderRadius: 2,
              transition: "width 0.3s",
            }}
          />
          <div
            className="flex transition-transform duration-300"
            style={{
              width: missionList.length * THUMBNAIL_WIDTH,
              transform: `translateX(-${startIdx * THUMBNAIL_WIDTH}px)`,
            }}
          >
            {visibleMissions.map((mission, idx) => {
              const globalIdx = startIdx + idx;
              return (
                <div
                  key={mission.id}
                  className="flex flex-col items-center cursor-pointer"
                  style={{ width: THUMBNAIL_WIDTH }}
                  onClick={() => setSelectedMissionIdx(globalIdx)}
                >
                  <div
                    className={`rounded-2xl flex items-center justify-center mb-2 relative overflow-hidden w-full h-[112px] ${
                      globalIdx > completed ? "opacity-60" : ""
                    } ${
                      globalIdx === selectedMissionIdx
                        ? "ring-4 ring-[#00AEEF]"
                        : ""
                    }`}
                    style={{ background: "#fff", border: "1px solid #E0E6ED" }}
                  >
                    {typeof (mission as any).missionPageImage === "string" &&
                    (mission as any).missionPageImage.trim() !== "" ? (
                      <img
                        src={(mission as any).missionPageImage}
                        alt={mission.title}
                        width={112}
                        height={112}
                        className={`object-cover rounded-2xl w-full h-[112px]${
                          globalIdx > completed ? " grayscale" : ""
                        }`.replace(
                          "object-covergrayscale",
                          "object-cover grayscale"
                        )}
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <img
                        src={(mission as any).missionPageImage}
                        alt="Dummy Mission"
                        width={112}
                        height={112}
                        className={`object-cover rounded-2xl w-full h-[112px]${
                          globalIdx > completed ? " grayscale" : ""
                        }`.replace(
                          "object-covergrayscale",
                          "object-cover grayscale"
                        )}
                        style={{ objectFit: "cover" }}
                      />
                    )}
                    {globalIdx > completed && (
                      <span className="absolute text-3xl text-[#BDC8D5] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
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
                            stroke="#BDC8D5"
                            strokeWidth="2"
                          />
                          <path
                            d="M17 11V7a5 5 0 00-10 0v4"
                            stroke="#BDC8D5"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    )}
                  </div>
                  {/* Dot below thumbnail, centered */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 mt-2 ${
                      globalIdx <= completed
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
          disabled={startIdx === maxStart}
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
