import React from "react";

export default function MissionProgressBar({
  missionLabel,
  xpPoints,
  progressPercent,
}: {
  missionLabel: string;
  xpPoints: number;
  progressPercent: number;
}) {
  return (
    <div className="w-full flex flex-col items-center mb-2">
      <div className="w-full flex flex-row items-center justify-between mb-2">
        <span className="text-lg font-bold text-[#00AEEF]">{missionLabel}</span>
        <span className="text-lg font-bold text-[#00AEEF]">{xpPoints} XP</span>
      </div>
      <div className="w-full h-3 rounded-full bg-[#E5EAF1] flex overflow-hidden">
        <div
          className="bg-[#00AEEF] h-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
    </div>
  );
}
