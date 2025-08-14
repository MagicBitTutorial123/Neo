interface TimerState {
  missionId: string;
  startTime: number;
  allocatedTime: number;
  isActive: boolean;
  lastPausedTime?: number;
}

const TIMER_STORAGE_KEY = 'mission_timer_state';

export class TimerPersistence {
  static saveTimerState(state: TimerState): void {
    try {
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save timer state:', error);
    }
  }

  static loadTimerState(): TimerState | null {
    try {
      const stored = localStorage.getItem(TIMER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load timer state:', error);
      return null;
    }
  }

  static clearTimerState(): void {
    try {
      localStorage.removeItem(TIMER_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear timer state:', error);
    }
  }

  static getCurrentTimeLeft(missionId: string, allocatedTime: number): number {
    const state = this.loadTimerState();
    
    if (!state || state.missionId !== missionId) {
      return allocatedTime;
    }

    if (!state.isActive) {
      // Timer is paused, return the time when it was paused
      return state.lastPausedTime || allocatedTime;
    }

    // Timer is active, calculate remaining time
    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    const remaining = Math.max(0, allocatedTime - elapsed);
    
    return remaining;
  }

  static startTimer(missionId: string, allocatedTime: number): void {
    const state: TimerState = {
      missionId,
      startTime: Date.now(),
      allocatedTime,
      isActive: true
    };
    this.saveTimerState(state);
  }

  static pauseTimer(): void {
    const state = this.loadTimerState();
    if (state) {
      const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
      const remaining = Math.max(0, state.allocatedTime - elapsed);
      
      state.isActive = false;
      state.lastPausedTime = remaining;
      this.saveTimerState(state);
    }
  }

  static resumeTimer(): void {
    const state = this.loadTimerState();
    if (state && !state.isActive) {
      state.isActive = true;
      state.startTime = Date.now() - ((state.allocatedTime - (state.lastPausedTime || 0)) * 1000);
      delete state.lastPausedTime;
      this.saveTimerState(state);
    }
  }

  static resetTimer(missionId: string, allocatedTime: number): void {
    this.clearTimerState();
    this.startTimer(missionId, allocatedTime);
  }
} 