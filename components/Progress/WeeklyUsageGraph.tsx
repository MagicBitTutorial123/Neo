"use client";
import React from "react";

interface WeeklyUsageData {
  day: string;
  minutes: number;
  missions: number;
}

interface WeeklyUsageGraphProps {
  data: WeeklyUsageData[];
}

export default function WeeklyUsageGraph({ data }: WeeklyUsageGraphProps) {
  const maxMinutes = Math.max(...data.map(d => d.minutes));
  const maxMissions = Math.max(...data.map(d => d.missions));

  return (
    <div className="space-y-4">
      {/* Usage Minutes Chart */}
      <div>
        <h3 className="text-sm font-semibold text-[#6B7280] mb-3">Time Spent (minutes)</h3>
        <div className="flex items-end justify-between gap-2 h-32">
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="relative w-full">
                <div
                  className="bg-gradient-to-t from-[#00AEEF] to-[#22AEEF] rounded-t-lg transition-all duration-300 hover:opacity-80"
                  style={{
                    height: `${(item.minutes / maxMinutes) * 100}%`,
                    minHeight: '8px'
                  }}
                />
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-[#6B7280] font-medium">
                  {item.minutes}m
                </div>
              </div>
              <div className="text-xs text-[#6B7280] mt-2 font-medium">
                {item.day}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Missions Completed Chart */}
      <div>
        <h3 className="text-sm font-semibold text-[#6B7280] mb-3">Missions Completed</h3>
        <div className="flex items-end justify-between gap-2 h-24">
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="relative w-full">
                <div
                  className="bg-gradient-to-t from-[#FF9C32] to-[#FFB366] rounded-t-lg transition-all duration-300 hover:opacity-80"
                  style={{
                    height: `${(item.missions / maxMissions) * 100}%`,
                    minHeight: '6px'
                  }}
                />
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-[#6B7280] font-medium">
                  {item.missions}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#00AEEF] rounded"></div>
          <span className="text-xs text-[#6B7280]">Time (minutes)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#FF9C32] rounded"></div>
          <span className="text-xs text-[#6B7280]">Missions</span>
        </div>
      </div>
    </div>
  );
}
