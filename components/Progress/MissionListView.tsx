"use client";
import React from "react";
import { CheckCircle, Lock, Play, Target } from "lucide-react";

interface Mission {
  id: string | number;
  title: string;
  missionDescription?: string;
  intro?: {
    timeAllocated: string;
  };
  steps?: Array<{
    title: string;
    description?: string;
    blocks?: Array<{ name: string }>;
    tryThis?: string;
    whyItWorks?: string;
  }>;
}

interface MissionListViewProps {
  missions: Mission[];
  completedCount: number;
  onMissionSelect: (missionId: number) => void;
  selectedMission: number | null;
}

export default function MissionListView({ 
  missions, 
  completedCount, 
  onMissionSelect, 
  selectedMission 
}: MissionListViewProps) {
  
  // Generate key learnings for a mission
  const generateKeyLearnings = (mission: Mission): string[] => {
    const learnings: string[] = [];
    
    if (mission.steps) {
      mission.steps.forEach(step => {
        if (step.blocks) {
          step.blocks.forEach(block => {
            if (block.name.includes("Move robot")) {
              learnings.push("Robot movement control");
            }
            if (block.name.includes("Turn robot")) {
              learnings.push("Directional control");
            }
            if (block.name.includes("speed")) {
              learnings.push("Speed management");
            }
            if (block.name.includes("key pressed")) {
              learnings.push("Input handling");
            }
          });
        }
        if (step.whyItWorks) {
          learnings.push("Mechanical principles");
        }
      });
    }

    // Add mission-specific learnings
    if (mission.title.toLowerCase().includes("assemble")) {
      learnings.push("Robot assembly");
    }
    if (mission.title.toLowerCase().includes("connect")) {
      learnings.push("Electrical connections");
    }
    if (mission.title.toLowerCase().includes("program")) {
      learnings.push("Block programming");
    }

    // Remove duplicates and limit to 3 key learnings
    return [...new Set(learnings)].slice(0, 3);
  };

  // Get short description
  const getShortDescription = (mission: Mission): string => {
    if (mission.missionDescription) {
      return mission.missionDescription.length > 100 
        ? mission.missionDescription.substring(0, 100) + "..."
        : mission.missionDescription;
    }
    return "Complete this mission to unlock new skills and knowledge!";
  };

  return (
    <div className="space-y-4">
      {missions.map((mission, index) => {
        const isCompleted = index <= completedCount;
        const isCurrent = index === completedCount;
        const isLocked = index > completedCount;
        const keyLearnings = generateKeyLearnings(mission);
        
        return (
          <div
            key={mission.id}
            className={`border rounded-xl p-4 transition-all duration-200 cursor-pointer ${
              selectedMission === index
                ? 'border-[#00AEEF] bg-[#F0F9FF] shadow-md'
                : isCompleted
                ? 'border-[#E0E6ED] bg-white hover:border-[#00AEEF] hover:bg-[#F8F9FC]'
                : 'border-[#E0E6ED] bg-[#F8F9FC] opacity-60'
            }`}
            onClick={() => onMissionSelect(index)}
          >
            {/* Mission Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-[#10B981] text-white' 
                    : isCurrent 
                    ? 'bg-[#00AEEF] text-white'
                    : 'bg-[#E5EAF1] text-[#6B7280]'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : isCurrent ? (
                    <Play className="w-5 h-5" />
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-[#222E3A]">
                    Mission {mission.id}: {mission.title}
                  </h4>
                  {mission.intro?.timeAllocated && (
                    <div className="flex items-center gap-1 text-xs text-[#6B7280] mt-1">
                      <Target className="w-3 h-3" />
                      <span>{mission.intro.timeAllocated}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Status Badge */}
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                isCompleted
                  ? 'bg-[#D1FAE5] text-[#065F46]'
                  : isCurrent
                  ? 'bg-[#DBEAFE] text-[#1E40AF]'
                  : 'bg-[#F3F4F6] text-[#6B7280]'
              }`}>
                {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Locked'}
              </div>
            </div>

            {/* Mission Description */}
            <p className="text-sm text-[#6B7280] mb-4 leading-relaxed">
              {getShortDescription(mission)}
            </p>

            {/* Key Learnings */}
            <div>
              <h5 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
                Key Learnings
              </h5>
              <div className="flex flex-wrap gap-2">
                {keyLearnings.length > 0 ? (
                  keyLearnings.map((learning, learningIndex) => (
                    <span
                      key={learningIndex}
                      className={`px-2 py-1 text-xs rounded-full font-medium ${
                        isCompleted
                          ? 'bg-[#F0F9FF] text-[#00AEEF]'
                          : 'bg-[#F3F4F6] text-[#9CA3AF]'
                      }`}
                    >
                      {learning}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#9CA3AF] italic">
                    Complete mission to discover learnings
                  </span>
                )}
              </div>
            </div>

            {/* Progress Indicator */}
            {isCurrent && (
              <div className="mt-4 pt-3 border-t border-[#E0E6ED]">
                <div className="flex items-center justify-between text-xs text-[#6B7280] mb-1">
                  <span>Progress</span>
                  <span>In Progress</span>
                </div>
                <div className="w-full bg-[#E5EAF1] rounded-full h-2">
                  <div className="bg-[#00AEEF] h-2 rounded-full w-1/3 transition-all duration-300"></div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
