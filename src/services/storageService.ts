import { ScheduleSet, FriendSchedule } from '../types/schedule';
import { INITIAL_SCHEDULE_SET, SAMPLE_FRIEND_SCHEDULES } from '../data/sampleSchedules';

const STORAGE_KEYS = {
  ACTIVE_SCHEDULE: 'snapsched_active_schedule',
  ALL_SETS: 'snapsched_all_sets',
  GEMINI_API_KEY: 'snapsched_gemini_api_key',
  FRIENDS: 'snapsched_friends',
  THEME_MODE: 'snapsched_theme_mode',
  USER_PROFILE: 'snapsched_user_profile',
};

export const storageService = {
  // Active Schedule
  getActiveSchedule(): ScheduleSet {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_SCHEDULE);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to read schedule from localStorage', e);
    }
    this.saveActiveSchedule(INITIAL_SCHEDULE_SET);
    return INITIAL_SCHEDULE_SET;
  },

  saveActiveSchedule(schedule: ScheduleSet): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SCHEDULE, JSON.stringify(schedule));
      // Also update in all sets list
      const allSets = this.getAllScheduleSets();
      const index = allSets.findIndex(s => s.id === schedule.id);
      if (index >= 0) {
        allSets[index] = schedule;
      } else {
        allSets.push(schedule);
      }
      this.saveAllScheduleSets(allSets);
    } catch (e) {
      console.error('Failed to save active schedule', e);
    }
  },

  // All Schedule Sets (Semesters)
  getAllScheduleSets(): ScheduleSet[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALL_SETS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to read schedule sets', e);
    }
    return [INITIAL_SCHEDULE_SET];
  },

  saveAllScheduleSets(sets: ScheduleSet[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ALL_SETS, JSON.stringify(sets));
    } catch (e) {
      console.error('Failed to save schedule sets', e);
    }
  },

  // Gemini API Key
  getGeminiApiKey(): string {
    return localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY) || '';
  },

  saveGeminiApiKey(key: string): void {
    localStorage.setItem(STORAGE_KEYS.GEMINI_API_KEY, key.trim());
  },

  // Friends & Overlays
  getFriends(): FriendSchedule[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FRIENDS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to read friends', e);
    }
    return SAMPLE_FRIEND_SCHEDULES;
  },

  saveFriends(friends: FriendSchedule[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(friends));
    } catch (e) {
      console.error('Failed to save friends', e);
    }
  },

  // Reset to default sample
  resetToSample(): ScheduleSet {
    this.saveActiveSchedule(INITIAL_SCHEDULE_SET);
    this.saveFriends(SAMPLE_FRIEND_SCHEDULES);
    return INITIAL_SCHEDULE_SET;
  }
};
