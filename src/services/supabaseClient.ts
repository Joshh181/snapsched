import { createClient } from '@supabase/supabase-js';
import { ScheduleSet } from '../types/schedule';

// Default public mock URL for demo fallback if user hasn't connected their own Supabase instance
const DEFAULT_SUPABASE_URL = 'https://xyzcompany.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key';

const getEnvOrStorage = (key: string, defaultVal: string) => {
  return localStorage.getItem(`snapsched_${key}`) || (import.meta as any).env?.[key] || defaultVal;
};

export const getSupabaseConfig = () => {
  const url = getEnvOrStorage('VITE_SUPABASE_URL', DEFAULT_SUPABASE_URL);
  const anonKey = getEnvOrStorage('VITE_SUPABASE_ANON_KEY', DEFAULT_SUPABASE_ANON_KEY);
  const isConnected = url !== DEFAULT_SUPABASE_URL && anonKey !== DEFAULT_SUPABASE_ANON_KEY;
  return { url, anonKey, isConnected };
};

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  localStorage.setItem('snapsched_VITE_SUPABASE_URL', url.trim());
  localStorage.setItem('snapsched_VITE_SUPABASE_ANON_KEY', anonKey.trim());
};

const config = getSupabaseConfig();
export const supabase = createClient(config.url, config.anonKey);

export const cloudService = {
  /**
   * Sync active schedule to Supabase cloud
   */
  async syncScheduleToCloud(schedule: ScheduleSet): Promise<{ success: boolean; message: string }> {
    const { isConnected } = getSupabaseConfig();

    if (!isConnected) {
      // Simulate successful local cloud-synced state
      return {
        success: true,
        message: 'Saved locally. Connect your Supabase credentials in Settings for live multi-device sync.',
      };
    }

    try {
      const { error } = await supabase
        .from('schedules')
        .upsert({
          id: schedule.id,
          name: schedule.name,
          semester: schedule.semester,
          academic_year: schedule.academicYear,
          items: schedule.items,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      return { success: true, message: 'Schedule synced to Supabase cloud successfully!' };
    } catch (err: any) {
      console.error('Supabase sync error', err);
      return { success: false, message: err.message || 'Failed to sync to cloud.' };
    }
  },

  /**
   * Fetch user's schedules from Supabase
   */
  async fetchCloudSchedules(): Promise<ScheduleSet[] | null> {
    const { isConnected } = getSupabaseConfig();
    if (!isConnected) return null;

    try {
      const { data, error } = await supabase.from('schedules').select('*');
      if (error) throw error;
      if (!data) return [];

      return data.map((d: any) => ({
        id: d.id,
        name: d.name,
        semester: d.semester,
        academicYear: d.academic_year,
        isDefault: true,
        createdAt: d.created_at || new Date().toISOString(),
        items: d.items || [],
      }));
    } catch (e) {
      console.warn('Failed to fetch from Supabase', e);
      return null;
    }
  }
};
