"use client";
import { useUser } from "@/context/UserContext";
import React, { useState, useEffect } from "react";
import SideNavbar from "@/components/SideNavbar";
import { useSidebar } from "@/context/SidebarContext";
import BasicAuthGuard from "@/components/BasicAuthGuard";
import WeeklyUsageGraph from "@/components/Progress/WeeklyUsageGraph";
import SummaryOfLearnings from "@/components/Progress/SummaryOfLearnings";
import MissionListView from "@/components/Progress/MissionListView";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getAllMissionsMeta, getMissionJsonPublic } from "@/utils/queries";
import {
  normalizeMissionFromJson,
  NormalizedMission,
} from "@/utils/normalizeMission";

export default function ProgressPage() {
  const { userData } = useUser();
  const { sidebarCollapsed } = useSidebar();
  const [selectedMission, setSelectedMission] = useState<number | null>(null);
  const [showAllMissions, setShowAllMissions] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: "ai",
      message: `Hi ${userData?.name || "there"}! 👋 How can I help you today?`,
      timestamp: new Date(),
    },
  ]);

  // Mission data state
  const [missions, setMissions] = useState<NormalizedMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch missions dynamically from Supabase
  useEffect(() => {
    const fetchMissions = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("🎯 [ProgressPage] Fetching missions from Supabase...");

        // Get all mission metadata
        const missionsMeta = await getAllMissionsMeta();
        console.log("🎯 [ProgressPage] Fetched missions meta:", missionsMeta);

        if (missionsMeta.length === 0) {
          console.warn("🎯 [ProgressPage] No missions found in database");
          setError("No missions available");
          return;
        }

        // Fetch JSON data for each mission and normalize
        const missionsData: NormalizedMission[] = [];

        for (const meta of missionsMeta) {
          try {
            console.log(
              `🎯 [ProgressPage] Fetching JSON for mission ${meta.mission_uid}...`
            );
            const jsonData = await getMissionJsonPublic(
              meta.json_bucket,
              meta.object_path
            );
            console.log(
              `🎯 [ProgressPage] JSON data for ${meta.mission_uid}:`,
              jsonData
            );

            const normalizedMission = normalizeMissionFromJson(meta, jsonData);
            missionsData.push(normalizedMission);
          } catch (missionError) {
            console.error(
              `🎯 [ProgressPage] Error fetching mission ${meta.mission_uid}:`,
              missionError
            );
            // Continue with other missions even if one fails
          }
        }

        // Sort missions by order_no
        missionsData.sort((a, b) => (a.order_no || 0) - (b.order_no || 0));

        console.log("🎯 [ProgressPage] Normalized missions:", missionsData);
        setMissions(missionsData);
      } catch (err) {
        console.error("🎯 [ProgressPage] Error fetching missions:", err);
        setError("Failed to load missions");
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, []);

  // Mock weekly usage data - in a real app, this would come from the database
  const weeklyUsageData = [
    { day: "Mon", minutes: 45, missions: 2 },
    { day: "Tue", minutes: 30, missions: 1 },
    { day: "Wed", minutes: 60, missions: 3 },
    { day: "Thu", minutes: 25, missions: 1 },
    { day: "Fri", minutes: 75, missions: 4 },
    { day: "Sat", minutes: 90, missions: 5 },
    { day: "Sun", minutes: 40, missions: 2 },
  ];

  // Get completed missions
  const completedMissions = userData?.missionProgress
    ? missions.slice(0, userData.missionProgress + 1)
    : [];

  // Get current mission progress
  const currentMissionProgress = userData?.missionProgress ?? 0;

  // Badges data
  const badges = [
    {
      id: 1,
      name: "FIRST SPARK",
      src: "/badge1.png",
      alt: "Badge1",
      earned: true,
      description: "Complete your first mission",
    },
    {
      id: 2,
      name: "CIRCUIT MASTER",
      src: "/badge2.png",
      alt: "Badge2",
      earned: true,
      description: "Master circuit building",
    },
    {
      id: 3,
      name: "BATTLE READY",
      src: "/badge3.png",
      alt: "Badge3",
      earned: false,
      description: "Complete 5 missions",
    },
    {
      id: 4,
      name: "INNOVATOR",
      src: "/badge4.png",
      alt: "Badge4",
      earned: false,
      description: "Create your first project",
    },
    {
      id: 5,
      name: "CODING WIZARD",
      src: "/badge5.png",
      alt: "Badge5",
      earned: false,
      description: "Complete 10 missions",
    },
    {
      id: 6,
      name: "ROBOT BUILDER",
      src: "/badge6.png",
      alt: "Badge6",
      earned: false,
      description: "Build your first robot",
    },
  ];

  // Calculate XP level
  const totalXP = userData?.xp || 0;
  const currentLevel = Math.floor(totalXP / 100) + 1;
  const xpToNextLevel = 100 - (totalXP % 100);
  const levelProgress = ((totalXP % 100) / 100) * 100;

  // Chat functions
  const sendMessage = () => {
    if (!chatMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: "user",
      message: chatMessage,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatMessage("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: "ai",
        message: getAIResponse(chatMessage),
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const getAIResponse = (message: string) => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("mission") || lowerMessage.includes("complete")) {
      return "I can help you with missions! What specific mission are you working on?";
    } else if (
      lowerMessage.includes("badge") ||
      lowerMessage.includes("earn")
    ) {
      return "You can earn badges by completing missions and achieving milestones. Check your progress to see available badges!";
    } else if (
      lowerMessage.includes("circuit") ||
      lowerMessage.includes("building")
    ) {
      return "Circuit building is fun! Start with basic connections and gradually work on more complex circuits. Need help with a specific circuit?";
    } else if (
      lowerMessage.includes("help") ||
      lowerMessage.includes("assist")
    ) {
      return "I'm here to help! I can assist with missions, explain concepts, track your progress, and answer questions about coding and robotics.";
    } else {
      return "That's interesting! I'm here to help with your coding journey. Feel free to ask about missions, badges, or any technical questions!";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  // Show loading state
  if (loading) {
    return (
      <BasicAuthGuard>
        <div className="flex min-h-screen bg-[#F8F9FC]">
          <SideNavbar />
          <main
            className="flex-1 flex flex-col transition-all duration-300 ease-in-out"
            style={{ marginLeft: "0px" }}
          >
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00AEEF] mx-auto mb-4"></div>
                <p className="text-lg text-[#222E3A]">Loading progress...</p>
              </div>
            </div>
          </main>
        </div>
      </BasicAuthGuard>
    );
  }

  // Show error state
  if (error) {
    return (
      <BasicAuthGuard>
        <div className="flex min-h-screen bg-[#F8F9FC]">
          <SideNavbar />
          <main
            className="flex-1 flex flex-col transition-all duration-300 ease-in-out"
            style={{ marginLeft: "0px" }}
          >
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-lg text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-[#00AEEF] text-white rounded-lg hover:bg-[#0098D4] transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </main>
        </div>
      </BasicAuthGuard>
    );
  }

  return (
    <BasicAuthGuard>
      <div className="flex min-h-screen bg-[#F8F9FC]">
        <SideNavbar />
        <main
          className="flex-1 flex flex-col transition-all duration-300 ease-in-out"
          style={{
            marginLeft: sidebarCollapsed ? "80px" : "260px",
          }}
        >
          {/* Top Badge Card */}
          <div className="p-8">
            <div className="max-w-sm mx-auto">
              <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                <div className="w-24 h-24 mx-auto mb-4 relative">
                  <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-3xl font-bold text-white">1</span>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-teal-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    157 SPARK
                  </div>
                </div>
                <div className="text-sm font-medium text-[#222E3A]">
                  #TopBadge
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Original Dashboard */}
          <div className="flex-1 overflow-y-auto px-8 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-8">
                {/* Weekly Usage Bar Graph */}
                <div className="bg-white rounded-2xl border border-[#E0E6ED] p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-[#222E3A] mb-4">
                    Weekly Usage
                  </h2>
                  <WeeklyUsageGraph data={weeklyUsageData} />
                </div>

                {/* Summary of Learnings */}
                <div className="bg-white rounded-2xl border border-[#E0E6ED] p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-[#222E3A] mb-4">
                    Summary of Learnings
                  </h2>
                  <SummaryOfLearnings
                    completedMissions={completedMissions}
                    currentProgress={currentMissionProgress}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Mission List View with Expand */}
                <div className="bg-white rounded-2xl border border-[#E0E6ED] p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-[#222E3A]">
                      Mission Progress
                    </h2>
                    <button
                      onClick={() => setShowAllMissions(!showAllMissions)}
                      className="text-[#00AEEF] hover:text-[#0078D4] text-sm font-medium flex items-center gap-1"
                    >
                      {showAllMissions ? "Show Less" : "Show All"}
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          showAllMissions ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>

                  <MissionListView
                    missions={showAllMissions ? missions : missions.slice(0, 3)}
                    completedCount={currentMissionProgress}
                    onMissionSelect={setSelectedMission}
                    selectedMission={selectedMission}
                  />

                  {!showAllMissions && missions.length > 3 && (
                    <div className="text-center mt-4 text-sm text-[#6B7280]">
                      +{missions.length - 3} more missions
                    </div>
                  )}
                </div>

                {/* Quick Stats with XP Level */}
                <div className="bg-white rounded-2xl border border-[#E0E6ED] p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-[#222E3A] mb-4">
                    Quick Stats
                  </h2>

                  {/* XP Level Progress */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-[#00AEEF] to-[#0078D4] rounded-lg text-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">
                        Level {currentLevel}
                      </span>
                      <span className="text-sm opacity-90">{totalXP} XP</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className="bg-white h-2 rounded-full transition-all duration-500"
                        style={{ width: `${levelProgress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs mt-1 opacity-90">
                      {xpToNextLevel} XP to Level {currentLevel + 1}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#00AEEF]">
                        {currentMissionProgress + 1}
                      </div>
                      <div className="text-sm text-[#6B7280]">
                        Current Mission
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#00AEEF]">
                        {userData?.xp || 0}
                      </div>
                      <div className="text-sm text-[#6B7280]">Total XP</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#00AEEF]">
                        {completedMissions.length}
                      </div>
                      <div className="text-sm text-[#6B7280]">
                        Missions Completed
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#00AEEF]">
                        {missions.length > 0
                          ? Math.round(
                              ((currentMissionProgress + 1) / missions.length) *
                                100
                            )
                          : 0}
                        %
                      </div>
                      <div className="text-sm text-[#6B7280]">
                        Overall Progress
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Expandable Chatbot */}
        <div className="fixed bottom-8 right-8 z-40">
          {/* Chat Button */}
          <button
            onClick={() => setShowChatbot(!showChatbot)}
            className="w-16 h-16 bg-[#00AEEF] text-white rounded-full shadow-lg hover:bg-[#0078D4] transition-all duration-300 flex items-center justify-center"
          >
            <svg
              className={`w-6 h-6 transition-transform duration-300 ${
                showChatbot ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </button>

          {/* Expandable Chat Interface */}
          <AnimatePresence>
            {showChatbot && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-xl border border-gray-200 w-80 h-[500px] flex flex-col"
              >
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#00AEEF] rounded-full flex items-center justify-center">
                      <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#222E3A] text-sm">
                        AI Assistant
                      </h3>
                      <p className="text-xs text-green-500">Online</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowChatbot(false)}
                    className="text-gray-500 hover:text-gray-700 p-1"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2 ${
                        msg.type === "user" ? "justify-end" : ""
                      }`}
                    >
                      {msg.type === "ai" && (
                        <div className="w-6 h-6 bg-[#00AEEF] rounded-full flex items-center justify-center flex-shrink-0">
                          <div className="w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                          </div>
                        </div>
                      )}
                      <div
                        className={`rounded-2xl p-3 max-w-[80%] ${
                          msg.type === "user"
                            ? "bg-[#00AEEF] text-white rounded-tr-sm"
                            : "bg-[#F8F9FC] text-[#222E3A] rounded-tl-sm"
                        }`}
                      >
                        <p className="text-xs">{msg.message}</p>
                      </div>
                      {msg.type === "user" && (
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-gray-600">
                            {userData?.name?.charAt(0) || "U"}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Quick Action Buttons - Only show if no messages sent yet */}
                  {chatMessages.length === 1 && (
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setChatMessage("How do I complete Mission 2?");
                          setTimeout(() => sendMessage(), 100);
                        }}
                        className="w-full text-left p-2 bg-[#00AEEF] text-white rounded-lg hover:bg-[#0078D4] transition-colors text-xs"
                      >
                        How do I complete Mission 2?
                      </button>
                      <button
                        onClick={() => {
                          setChatMessage("What badges can I earn?");
                          setTimeout(() => sendMessage(), 100);
                        }}
                        className="w-full text-left p-2 bg-[#FF9C32] text-white rounded-lg hover:bg-[#E8891A] transition-colors text-xs"
                      >
                        What badges can I earn?
                      </button>
                      <button
                        onClick={() => {
                          setChatMessage("Explain circuit building");
                          setTimeout(() => sendMessage(), 100);
                        }}
                        className="w-full text-left p-2 bg-[#222E3A] text-white rounded-lg hover:bg-[#1A1F2A] transition-colors text-xs"
                      >
                        Explain circuit building
                      </button>
                    </div>
                  )}
                </div>

                {/* Typing Bar */}
                <div className="p-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent text-xs text-black"
                      />
                      <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#00AEEF] transition-colors">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                          />
                        </svg>
                      </button>
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!chatMessage.trim()}
                      className="w-8 h-8 bg-[#00AEEF] text-white rounded-full hover:bg-[#0078D4] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </BasicAuthGuard>
  );
}
