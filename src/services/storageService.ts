import { ScheduleSet, FriendSchedule, CategoryItem, DEFAULT_CATEGORIES } from '../types/schedule';
import { INITIAL_SCHEDULE_SET, SAMPLE_FRIEND_SCHEDULES } from '../data/sampleSchedules';

const STORAGE_KEYS = {
  ACTIVE_SCHEDULE: 'snapsched_active_schedule_v2',
  ALL_SETS: 'snapsched_all_sets_v2',
  GEMINI_API_KEY: 'snapsched_gemini_api_key',
  FRIENDS: 'snapsched_friends_v2',
  CATEGORIES: 'snapsched_categories',
  THEME_MODE: 'snapsched_theme_mode',
  USER_PROFILE: 'snapsched_user_profile',
};

// Clear legacy fake mock data keys from prior versions
try {
  localStorage.removeItem('snapsched_active_schedule');
  localStorage.removeItem('snapsched_all_sets');
  localStorage.removeItem('snapsched_friends');
} catch (e) {
  // ignore
}

export const storageService = {
  // Active Schedule
  getActiveSchedule(): ScheduleSet {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_SCHEDULE);
      if (data) {
        const parsed = JSON.parse(data);
        // Filter out any legacy sample items if present
        if (parsed.items) {
          parsed.items = parsed.items.filter(
            (item: any) => !['class-1', 'class-2', 'class-3', 'class-4', 'class-5', 'class-6', 'class-work-1', 'class-study-1'].includes(item.id)
          );
        }
        return parsed;
      }
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

  // Categories
  getCategories(): CategoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to read categories from localStorage', e);
    }
    return DEFAULT_CATEGORIES;
  },

  saveCategories(categories: CategoryItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories', e);
    }
  },

  addCategory(name: string, color: string): CategoryItem {
    const categories = this.getCategories();
    const newCat: CategoryItem = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      color,
    };
    const updated = [...categories, newCat];
    this.saveCategories(updated);
    return newCat;
  },

  deleteCategory(id: string): void {
    const categories = this.getCategories();
    const updated = categories.filter((c) => c.id !== id);
    this.saveCategories(updated.length > 0 ? updated : DEFAULT_CATEGORIES);
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
    this.saveCategories(DEFAULT_CATEGORIES);
    return INITIAL_SCHEDULE_SET;
  }
};
