import { supabase } from "@/lib/supabaseClient";

export type MissionMeta = {
  mission_uid: string;
  order_no: number;
  title?: string | null;
  description?: string | null;
  json_bucket: string;       // missions-json
  object_path: string;       // 1.json
  assets_bucket?: string | null;  // missions-assets
  assets_prefix?: string | null;  // M01/
};

function explainError(where: string, err: any) {
  try {
    if (err instanceof Error) {
      console.error(`${where} error:`, err.message || err);
    } else {
      console.error(`${where} error:`, JSON.stringify(err));
    }
  } catch {
    console.error(`${where} error:`, err);
  }
}

export async function getAllMissionsMeta(): Promise<MissionMeta[]> {
  try {
    const { data, error } = await supabase
      .from("missions")
      .select("mission_uid, order_no, title, description, json_bucket, object_path, assets_bucket, assets_prefix")
      .order("order_no", { ascending: true });
    
    if (error) throw error;
    
    const rows = (data ?? []) as MissionMeta[];
    console.debug("[getAllMissionsMeta] rows:", rows.length);
    return rows;
  } catch (e) {
    explainError("getAllMissionsMeta", e);
    return [];
  }
}

export async function getMissionMeta(uid: string): Promise<MissionMeta | null> {
  try {
    const { data, error } = await supabase
      .from("missions")
      .select("mission_uid, order_no, title, description, json_bucket, object_path, assets_bucket, assets_prefix")
      .eq("mission_uid", uid)
      .maybeSingle();
    
    if (error) throw error;
    return (data as MissionMeta) ?? null;
  } catch (e) {
    explainError("getMissionMeta", e);
    return null;
  }
}

export function publicUrl(bucket: string, path: string) {
  const clean = path.replace(/^\/+/, "");
  const { data } = supabase.storage.from(bucket).getPublicUrl(clean);
  return data.publicUrl;
}

export async function getMissionJsonPublic(bucket: string, path: string) {
  try {
    console.log(`🎯 [getMissionJsonPublic] Attempting to fetch from bucket: "${bucket}", path: "${path}"`);
    const clean = path.replace(/^\/+/, "");
    const url = publicUrl(bucket, clean);
    console.debug("[getMissionJsonPublic] fetching:", url);
    
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      throw new Error(`JSON fetch failed ${res.status}: ${msg || res.statusText}`);
    }
    
    return await res.json();
  } catch (e) {
    explainError("getMissionJsonPublic", e);
    throw e;
  }
}

/** ---------- USER DASHBOARD QUERIES (unchanged) ---------- **/
export async function getUserData(userId: string) {
  const { data, error } = await supabase
    .from('user_data')
    .select('current_mission, xp, k_level, total_time_spent')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateUserXP(userId: string, missionId: string, xpToAdd: number) {
  try {
    console.log(`🎯 [updateUserXP] User ${userId} attempting to complete mission ${missionId}`);
    
    // Check if mission already completed
    const alreadyCompleted = await isMissionAlreadyCompleted(userId, missionId);
    if (alreadyCompleted) {
      console.log(`🎯 [updateUserXP] Mission ${missionId} already completed, ignoring duplicate completion`);
      return { 
        success: false, 
        message: `Mission ${missionId} already completed`,
        xpAdded: 0,
        missionProgress: 0
      };
    }
    
    // Mark mission as completed (this is now just logging)
    await markMissionAsCompleted(userId, missionId);
    console.log(`🎯 [updateUserXP] Mission ${missionId} marked as completed`);
    
    // First, try to get the current user data
    let currentData;
    try {
      currentData = await getUserProgress(userId);
    } catch (error) {
      // If user doesn't exist, create a new record
      console.log("User not found in user_data table, creating new record...");
      const { data: newUser, error: createError } = await supabase
        .from('user_data')
        .insert({
          id: userId,
          current_mission: 0,
          xp: 0,
          total_time_spent: 0,
          k_level: 0
        })
        .select()
        .single();
      
      if (createError) {
        console.error("Error creating user record:", createError);
        throw createError;
      }
      
      currentData = newUser;
    }

    if (!currentData) {
      throw new Error("Failed to get or create user data");
    }

    // Calculate new values
    const newXP = (currentData.xp || 0) + xpToAdd;
    const missionNumber = parseInt(missionId);
    const currentMission = currentData.current_mission || 0;
    
    // Validate mission completion order - only allow completing the next mission in sequence
    if (missionNumber !== (currentMission + 1)) {
      console.warn(`🎯 [updateUserXP] Mission ${missionId} is not the next mission in sequence (current: ${currentMission}, attempting: ${missionNumber})`);
      return { 
        success: false, 
        message: `Mission ${missionId} is not the next mission in sequence`,
        xpAdded: 0,
        missionProgress: currentMission
      };
    }
    
    // Update current_mission to the mission that was just completed
    let newCurrentMission = missionNumber;
    
    console.log(`🎯 [updateUserXP] Mission ${missionId} completed. Updating current_mission from ${currentMission} to ${newCurrentMission}`);

    console.log(`Updating user ${userId}: XP ${currentData.xp || 0} + ${xpToAdd} = ${newXP}, Mission ${currentMission} → ${newCurrentMission}`);

    // Update the user data
    const { data, error } = await supabase
      .from('user_data')
      .update({ 
        xp: newXP,
        current_mission: newCurrentMission
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error("Supabase update error:", error);
      throw error;
    }
    
    console.log("Successfully updated user XP:", data);
    return { 
      success: true, 
      message: `Mission ${missionId} completed successfully`,
      xpAdded: xpToAdd,
      missionProgress: newCurrentMission
    };
  } catch (e) {
    console.error("Error in updateUserXP:", e);
    throw e;
  }
}

export async function getUserProgress(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('current_mission, xp, k_level, total_time_spent')
      .eq('id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // User not found - return null instead of throwing
        return null;
      }
      throw error;
    }
    
    return data;
  } catch (e) {
    console.error("Error in getUserProgress:", e);
    return null;
  }
}

export async function isMissionUnlocked(userId: string, missionId: string): Promise<boolean> {
  try {
    const userData = await getUserProgress(userId);
    const missionNumber = parseInt(missionId);
    
    // If user has no data, they're a new user - only mission 1 is unlocked
    if (!userData) {
      return missionNumber === 1;
    }
    
    const currentMission = userData?.current_mission || 0;
    
    // Mission 1 is always unlocked
    if (missionNumber === 1) {
      return true;
    }
    
    // A mission is unlocked if:
    // 1. It's the next mission after the current one (currentMission + 1)
    // 2. OR it's a mission that has already been completed (missionNumber <= currentMission)
    // This allows users to replay completed missions for practice
    return missionNumber <= (currentMission + 1);
  } catch (e) {
    console.error("Error checking mission unlock status:", e);
    // Default to only mission 1 unlocked if there's an error
    return parseInt(missionId) === 1;
  }
}

export async function getUserBadges(userId: string) {
  const { data, error } = await supabase
    .from('v_user_badges')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });
  
  if (error) throw error;
  return (data ?? []).map(row => ({
    src: row.resource_name ?? '/badge-placeholder.png',
    alt: row.badge_name,
    earned: true
  }));
}

export async function getNextMissionLabel(currentMission: number) {
  const next = (currentMission ?? 0) + 1;
  const { data, error } = await supabase
    .from('missions')
    .select('mission_uid, title')
    .eq('mission_uid', next.toString().padStart(2, '0'))
    .maybeSingle();
  
  if (error) throw error;
  return data ? `Mission ${data.mission_uid}` : `Mission ${next.toString().padStart(2, '0')}`;
}

export async function isMissionAlreadyCompleted(userId: string, missionId: string): Promise<boolean> {
  try {
    const userData = await getUserProgress(userId);
    if (!userData) {
      return false; // New user, no missions completed
    }
    
    const missionNumber = parseInt(missionId);
    const currentMission = userData.current_mission || 0;
    
    // A mission is completed if its number is less than or equal to current_mission
    // This means if current_mission = 2, then missions 1 and 2 are completed
    return missionNumber <= currentMission;
  } catch (e) {
    console.error("Error checking mission completion status:", e);
    return false; // Default to not completed if there's an error
  }
}

export async function markMissionAsCompleted(userId: string, missionId: string): Promise<void> {
  try {
    console.log(`🎯 [markMissionAsCompleted] Marking mission ${missionId} as completed for user ${userId}`);
    
    // This function is now just a placeholder since we handle completion in updateUserXP
    // The actual database update happens when we update current_mission
    console.log(`Mission ${missionId} marked as completed for user ${userId}`);
  } catch (e) {
    console.error("Error marking mission as completed:", e);
    // Don't throw error - just log it and continue
  }
}

export async function getCompletedMissionsCount(userId: string): Promise<number> {
  try {
    const userData = await getUserProgress(userId);
    if (!userData) {
      return 0; // New user, no missions completed
    }
    
    // Return the current_mission number as the count of completed missions
    return userData.current_mission || 0;
  } catch (e) {
    console.error("Error getting completed missions count:", e);
    return 0;
  }
}
