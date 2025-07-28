interface MissionState {
  missionId: string;
  currentStep: number;
  showHeader: boolean;
  forceHideIntro: boolean;
  showCountdown: boolean;
  isRunning: boolean;
  fromNo: boolean;
  completedMCQSteps: number[];
  timestamp: number;
}

const MISSION_STATE_KEY = 'mission_state';

export class MissionStatePersistence {
  static saveMissionState(state: MissionState): void {
    try {
      localStorage.setItem(MISSION_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save mission state:', error);
    }
  }

  static loadMissionState(): MissionState | null {
    try {
      const stored = localStorage.getItem(MISSION_STATE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load mission state:', error);
    }
    return null;
  }

  static clearMissionState(): void {
    try {
      localStorage.removeItem(MISSION_STATE_KEY);
    } catch (error) {
      console.error('Failed to clear mission state:', error);
    }
  }

  static getMissionState(missionId: string): MissionState | null {
    const state = this.loadMissionState();
    
    // Only return state if it's for the same mission and not too old (within 24 hours)
    if (state && state.missionId === missionId) {
      const hoursSinceLastUpdate = (Date.now() - state.timestamp) / (1000 * 60 * 60);
      if (hoursSinceLastUpdate < 24) {
        return state;
      }
    }
    
    return null;
  }

  static updateMissionState(
    missionId: string,
    updates: Partial<Omit<MissionState, 'missionId' | 'timestamp'>>
  ): void {
    const currentState = this.loadMissionState();
    const newState: MissionState = {
      missionId,
      currentStep: updates.currentStep ?? currentState?.currentStep ?? 0,
      showHeader: updates.showHeader ?? currentState?.showHeader ?? false,
      forceHideIntro: updates.forceHideIntro ?? currentState?.forceHideIntro ?? false,
      showCountdown: updates.showCountdown ?? currentState?.showCountdown ?? false,
      isRunning: updates.isRunning ?? currentState?.isRunning ?? false,
      fromNo: updates.fromNo ?? currentState?.fromNo ?? false,
      completedMCQSteps: updates.completedMCQSteps ?? currentState?.completedMCQSteps ?? [],
      timestamp: Date.now(),
    };
    
    this.saveMissionState(newState);
  }

  static shouldResumeMission(missionId: string): boolean {
    const state = this.getMissionState(missionId);
    return state !== null && state.showHeader && !state.showCountdown;
  }
} 