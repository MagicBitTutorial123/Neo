import axios from "axios";

/**
 * Complete a mission using the dedicated endpoint
 */
export const completeMission = async (firebaseUid: string, missionId: number) => {
  try {
    const response = await axios.post("http://localhost:5000/api/auth/missions/complete", {
      uid: firebaseUid,
      missionId: missionId,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to complete mission:", error);
    throw error;
  }
};

/**
 * Update user state in the backend
 * Used for mission completion, onboarding status changes, etc.
 */
export const updateUserState = async (
  userId: string,
  updates: {
    isNewUser?: boolean;
    hasCompletedMission2?: boolean;
    missionProgress?: number;
  }
) => {
  try {
    const response = await axios.patch(
      `http://localhost:5000/api/auth/user/${userId}`,
      updates
    );
    return response.data;
  } catch (error) {
    console.error("Failed to update user state:", error);
    throw error;
  }
};

/**
 * Mark mission 1 as completed
 */
export const completeMission1 = async (firebaseUid: string) => {
  return completeMission(firebaseUid, 1);
};

/**
 * Mark mission 2 as completed
 * This will update the user state and show the default home
 */
export const completeMission2 = async (firebaseUid: string) => {
  return completeMission(firebaseUid, 2);
};

/**
 * Mark user as no longer new (after completing onboarding)
 */
export const completeOnboarding = async (userId: string) => {
  return updateUserState(userId, {
    isNewUser: false,
  });
}; 