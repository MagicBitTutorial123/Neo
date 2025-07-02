"use client";
import MissionIntro from "@/components/MissionIntro";
import { useRouter } from "next/navigation";
import SideNavbar from "@/components/SideNavbar";

export default function Mission2IntroPage() {
  const router = useRouter();
  return (
    <div className="flex min-h-screen bg-white">
      <SideNavbar />
      <MissionIntro
        missionNumber={2}
        title="Build the robot's arm"
        timeAllocated="10 mins"
        image="/MissionIntroImage-2.png"
        instructions={
          "Your next mission is to build the robot's arm. Follow the instructions carefully to complete the assembly."
        }
        onMissionStart={() => router.push("/missions/mission2/steps")}
      />
    </div>
  );
}
