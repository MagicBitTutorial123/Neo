"use client";
import React from "react";
import { CheckCircle, Clock, Star } from "lucide-react";

interface Mission {
  id: string | number;
  title: string;
  missionDescription?: string;
  steps?: Array<{
    title: string;
    description?: string;
    blocks?: Array<{ name: string }>;
    tryThis?: string;
    whyItWorks?: string;
  }>;
}

interface SummaryOfLearningsProps {
  completedMissions: Mission[];
  currentProgress: number;
}

export default function SummaryOfLearnings({ completedMissions, currentProgress }: SummaryOfLearningsProps) {
  // Generate learning summary based on completed missions
  const generateLearningSummary = (mission: Mission) => {
    const skills: string[] = [];
    const concepts: string[] = [];

    if (mission.steps) {
      mission.steps.forEach(step => {
        if (step.blocks) {
          step.blocks.forEach(block => {
            if (block.name.includes("Move robot")) {
              skills.push("Robot Movement Control");
              concepts.push("Motor Control");
            }
            if (block.name.includes("Turn robot")) {
              skills.push("Directional Control");
              concepts.push("Differential Drive");
            }
            if (block.name.includes("speed")) {
              skills.push("Speed Management");
              concepts.push("Power Control");
            }
            if (block.name.includes("key pressed")) {
              skills.push("Input Handling");
              concepts.push("Event-Driven Programming");
            }
            if (step.whyItWorks) {
              concepts.push("Mechanical Principles");
            }
          });
        }
      });
    }

    // Add mission-specific skills
    if (mission.title.toLowerCase().includes("assemble")) {
      skills.push("Robot Assembly");
      concepts.push("Mechanical Engineering");
    }
    if (mission.title.toLowerCase().includes("connect")) {
      skills.push("Electrical Connections");
      concepts.push("Circuit Design");
    }
    if (mission.title.toLowerCase().includes("program")) {
      skills.push("Block Programming");
      concepts.push("Visual Programming");
    }

    return {
      skills: [...new Set(skills)],
      concepts: [...new Set(concepts)],
      keyTakeaway: mission.missionDescription || "Completed mission successfully!"
    };
  };

  if (completedMissions.length === 0) {
    return (
      <div className="text-center py-8">
        <Star className="w-12 h-12 text-[#E5EAF1] mx-auto mb-4" />
        <p className="text-[#6B7280]">Complete your first mission to see your learning summary!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="bg-gradient-to-r from-[#F0F9FF] to-[#E0F2FE] rounded-xl p-4">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle className="w-5 h-5 text-[#00AEEF]" />
          <h3 className="font-semibold text-[#222E3A]">Learning Progress</h3>
        </div>
        <p className="text-sm text-[#6B7280]">
          You&apos;ve completed {completedMissions.length} mission{completedMissions.length !== 1 ? 's' : ''} and learned valuable skills!
        </p>
      </div>

      {/* Recent Mission Summary */}
      {completedMissions.slice(-1).map((mission) => {
        const summary = generateLearningSummary(mission);
        return (
          <div key={mission.id} className="border border-[#E0E6ED] rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold text-[#222E3A]">Mission {mission.id}: {mission.title}</h4>
              <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                <Clock className="w-3 h-3" />
                <span>Completed</span>
              </div>
            </div>
            
            <p className="text-sm text-[#6B7280] mb-4">{summary.keyTakeaway}</p>
            
            {/* Skills Learned */}
            <div className="mb-3">
              <h5 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Skills Learned</h5>
              <div className="flex flex-wrap gap-2">
                {summary.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-[#F0F9FF] text-[#00AEEF] text-xs rounded-full font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Concepts Understood */}
            <div>
              <h5 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Concepts Understood</h5>
              <div className="flex flex-wrap gap-2">
                {summary.concepts.map((concept, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-[#FFF6E6] text-[#FF9C32] text-xs rounded-full font-medium"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {/* Learning Streak */}
      <div className="bg-gradient-to-r from-[#FFF6E6] to-[#FFE4CC] rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Star className="w-5 h-5 text-[#FF9C32]" />
          <div>
            <h3 className="font-semibold text-[#222E3A]">Learning Streak</h3>
            <p className="text-sm text-[#6B7280]">
              {currentProgress > 0 ? `Great job! You're on mission ${currentProgress + 1}` : "Ready to start your learning journey!"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
