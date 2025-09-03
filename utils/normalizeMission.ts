import { supabase } from "@/lib/supabaseClient";
import { MissionMeta } from "@/utils/queries";

export type NormalizedStep = {
  title?: string;
  text?: string;        // unified for instruction/description
  note?: string;
  image?: string;
  points?: number;
  mcq?: any;
  blocks?: any;
  tryThis?: any;
  whyItWorks?: any;
};

export type NormalizedMission = {
  id: string;               // "01"
  title: string;
  missionDescription: string;
  layout: "StandardMissionLayout" | "BlocklySplitLayout";
  missionPageImage?: string;
  intro: {
    timeAllocated: string;
    image?: string;
  };
  steps: NormalizedStep[];
  overlays: any[];
  order_no?: number;
  totalPoints: number;      // Total points from all steps
};

/** Build a storage public URL under: <bucket>/<prefix>/images/<file> */
function storagePublicUrl(
  bucket?: string | null,
  prefix?: string | null,
  file?: string | null
): string | undefined {
  if (!bucket || !prefix || !file) return undefined;
  const safePrefix = prefix.endsWith("/") ? prefix : `${prefix}/`;
  const path = `${safePrefix}images/${file}`;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl;
}

function isHttp(u?: string) {
  return !!u && /^https?:\/\//i.test(u);
}

function resolveMissionImage(raw?: string, meta?: MissionMeta): string | undefined {
  if (!raw) return undefined;
  if (isHttp(raw)) return raw;           // already absolute
  if (raw.startsWith("/")) return raw;   // public/ asset
  // treat as filename inside assets/images
  return storagePublicUrl(meta?.assets_bucket, meta?.assets_prefix, raw);
}

/** UID rule: 1–2 standard, >=3 blockly unless JSON overrides */
function pickLayoutByUid(uid: string): "StandardMissionLayout" | "BlocklySplitLayout" {
  // Extract numeric part from mission ID (e.g., "M3" -> 3, "01" -> 1)
  const n = parseInt(uid.replace(/\D/g, '')) || 0;
  if (n >= 3) return "BlocklySplitLayout";
  return "StandardMissionLayout";
}

/** Normalize our JSON structure into the UI-facing type. */
export function normalizeMissionFromJson(meta: MissionMeta, json: any): NormalizedMission {
  const {
    mission_uid,
    title: metaTitle,
    description: metaDesc,
    order_no,
  } = meta;

  console.log(`🎯 [normalizeMission] Mission ${mission_uid} JSON data:`, {
    jsonTitle: json?.title,
    jsonMissionTitle: json?.mission_title,
    jsonName: json?.name,
    jsonDescription: json?.description,
    jsonMissionDescription: json?.mission_description,
    jsonSummary: json?.summary,
    jsonIntroText: json?.intro_text,
    metaTitle,
    metaDesc
  });

  const layout: "StandardMissionLayout" | "BlocklySplitLayout" =
    json?.layout === "BlocklySplitLayout" || json?.layout === "StandardMissionLayout"
      ? json.layout
      : pickLayoutByUid(mission_uid);

  const steps: NormalizedStep[] = Array.isArray(json?.steps)
    ? json.steps.map((s: any, idx: number) => ({
        title: s?.title ?? `Step ${idx + 1}`,
        text: s?.instruction ?? s?.description ?? "",
        note: s?.note ?? "",
        image: resolveMissionImage(s?.image, meta),
        points: s?.points,
        mcq: s?.mcq,
        blocks: s?.blocks,
        tryThis: s?.tryThis,
        whyItWorks: s?.whyItWorks,
      }))
    : [];

  const timeAllocated = json?.mission_time
    ? `${Math.max(1, Math.round((json.mission_time || 0) / 60))} mins`
    : (json?.intro?.timeAllocated || "15 mins");

  const totalPoints = steps.reduce((sum, step) => sum + (step.points || 0), 0);

  return {
    id: mission_uid,
    layout,
    title: json?.title ?? json?.mission_title ?? json?.name ?? metaTitle ?? `Mission ${mission_uid}`,
    missionDescription: json?.description ?? json?.mission_description ?? json?.summary ?? json?.intro_text ?? metaDesc ?? `Mission ${mission_uid}`,
    missionPageImage: resolveMissionImage(
      json?.missionPageImage ?? json?.mission_page_image ?? json?.cover_image ?? "missions_page_image.png",
      meta
    ),
    intro: {
      timeAllocated,
      image: resolveMissionImage(json?.intro?.image, meta),
    },
    steps,
    overlays: Array.isArray(json?.overlays) ? json.overlays : [],
    order_no,
    totalPoints,
  };
}
