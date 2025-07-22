"use client";
import { useParams } from "next/navigation";
import { missions } from "@/data/missions";
import { missionLayoutMap } from "@/data/missionLayoutMap";
import StandardMissionLayout from "@/components/StandardMissionLayout";
import BlocklySplitLayout from "@/components/BlocklySplitLayout";
import SideNavbar from "@/components/SideNavbar";

const validMissionIds = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
] as const;
type MissionId = (typeof validMissionIds)[number];

export default function MissionPage() {
  const params = useParams();
  let id = params.id;
  if (Array.isArray(id)) id = id[0];
  id = String(id);
  if (!validMissionIds.includes(id as MissionId)) {
    return <div>Mission not found</div>;
  }
  const mission = missions[id as MissionId];
  const layoutType = missionLayoutMap[id as MissionId] || "standardIntroLayout";

  switch (layoutType) {
    case "standardIntroLayout":
      return (
        <div className="flex h-screen bg-white">
          <SideNavbar />
          <div className="flex-1 overflow-visible">
            <StandardMissionLayout mission={mission} />
          </div>
        </div>
      );
    case "blocklySplitLayout":
      return (
        <div className="flex h-screen bg-white">
          <SideNavbar />
          <div className="flex-1 overflow-visible">
            <BlocklySplitLayout mission={mission} />
          </div>
        </div>
      );
    default:
      return <div>Unknown layout</div>;
  }
}
