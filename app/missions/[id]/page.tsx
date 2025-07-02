"use client";
import { useParams } from "next/navigation";
import { missions } from "@/data/missions";
import { missionLayoutMap } from "@/data/missionLayoutMap";
import StandardMissionLayout from "@/components/StandardMissionLayout";
// import BlocklySplitLayout from "@/components/BlocklySplitLayout";

const validMissionIds = ["1", "2"] as const;
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
      return <StandardMissionLayout mission={mission} />;
    // case "blocklySplitLayout":
    //   return <BlocklySplitLayout mission={mission} />;
    default:
      return <div>Unknown layout</div>;
  }
}
