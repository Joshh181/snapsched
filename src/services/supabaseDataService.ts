import { supabase } from './supabaseClient';
import { ScheduleSet, ClassItem, CategoryItem, FriendSchedule, DEFAULT_CATEGORIES } from '../types/schedule';
import { storageService } from './storageService';

// ─── PROFILES ────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  student_name: string;
  student_id: string;
  course: string;
  avatar_url: string;
}

export async function fetchProfile(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !data) return null;
  return data as UserProfile;
}

export async function updateProfile(updates: Partial<Omit<UserProfile, 'id'>>): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  return !error;
}

// ─── SCHEDULE SETS ───────────────────────────────────────────

export async function fetchScheduleSets(): Promise<ScheduleSet[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: sets, error: setsError } = await supabase
    .from('schedule_sets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (setsError || !sets) return [];

  // Fetch all classes for this user
  const { data: allClasses, error: classesError } = await supabase
    .from('classes')
    .select('*')
    .eq('user_id', user.id);

  const classRows = classesError ? [] : (allClasses || []);

  return sets.map((s: any) => ({
    id: s.id,
    name: s.name,
    semester: s.semester || '',
    academicYear: s.academic_year || '',
    studentName: '', // loaded from profile
    studentId: '',
    course: '',
    isDefault: s.is_default || false,
    createdAt: s.created_at || new Date().toISOString(),
    items: classRows
      .filter((c: any) => c.schedule_set_id === s.id)
      .map(mapClassRowToItem),
  }));
}

export async function createScheduleSet(
  set: Pick<ScheduleSet, 'id' | 'name' | 'semester' | 'academicYear' | 'isDefault'>
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase.from('schedule_sets').insert({
    id: set.id,
    user_id: user.id,
    name: set.name,
    semester: set.semester,
    academic_year: set.academicYear,
    is_default: set.isDefault,
  });

  return !error;
}

export async function updateScheduleSet(
  id: string,
  updates: Partial<Pick<ScheduleSet, 'name' | 'semester' | 'academicYear' | 'isDefault'>>
): Promise<boolean> {
  const payload: any = { updated_at: new Date().toISOString() };
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.semester !== undefined) payload.semester = updates.semester;
  if (updates.academicYear !== undefined) payload.academic_year = updates.academicYear;
  if (updates.isDefault !== undefined) payload.is_default = updates.isDefault;

  const { error } = await supabase
    .from('schedule_sets')
    .update(payload)
    .eq('id', id);

  return !error;
}

export async function deleteScheduleSet(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('schedule_sets')
    .delete()
    .eq('id', id);
  return !error;
}

// ─── CLASSES ─────────────────────────────────────────────────

function mapClassRowToItem(row: any): ClassItem {
  return {
    id: row.id,
    code: row.code || '',
    name: row.name || '',
    category: row.category || 'School',
    section: row.section || '',
    instructor: row.instructor || '',
    room: row.room || '',
    days: row.days || [],
    startTime: row.start_time || '07:00',
    endTime: row.end_time || '08:00',
    color: row.color || '#4f46e5',
    units: row.units || 0,
    notes: row.notes || '',
    scheduleId: row.schedule_set_id || '',
  };
}

export async function createClass(scheduleSetId: string, item: ClassItem): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase.from('classes').insert({
    id: item.id,
    schedule_set_id: scheduleSetId,
    user_id: user.id,
    code: item.code,
    name: item.name,
    category: item.category || 'School',
    section: item.section || '',
    instructor: item.instructor || '',
    room: item.room,
    days: item.days,
    start_time: item.startTime,
    end_time: item.endTime,
    color: item.color,
    units: item.units || 0,
    notes: item.notes || '',
  });

  return !error;
}

export async function updateClass(id: string, updates: Partial<ClassItem>): Promise<boolean> {
  const payload: any = { updated_at: new Date().toISOString() };
  if (updates.code !== undefined) payload.code = updates.code;
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.section !== undefined) payload.section = updates.section;
  if (updates.instructor !== undefined) payload.instructor = updates.instructor;
  if (updates.room !== undefined) payload.room = updates.room;
  if (updates.days !== undefined) payload.days = updates.days;
  if (updates.startTime !== undefined) payload.start_time = updates.startTime;
  if (updates.endTime !== undefined) payload.end_time = updates.endTime;
  if (updates.color !== undefined) payload.color = updates.color;
  if (updates.units !== undefined) payload.units = updates.units;
  if (updates.notes !== undefined) payload.notes = updates.notes;

  const { error } = await supabase.from('classes').update(payload).eq('id', id);
  return !error;
}

export async function deleteClass(id: string): Promise<boolean> {
  const { error } = await supabase.from('classes').delete().eq('id', id);
  return !error;
}

export async function deleteMultipleClasses(ids: string[]): Promise<boolean> {
  const { error } = await supabase.from('classes').delete().in('id', ids);
  return !error;
}

export async function deleteClassesByCategory(scheduleSetId: string, categoryName: string): Promise<boolean> {
  const { error } = await supabase
    .from('classes')
    .delete()
    .eq('schedule_set_id', scheduleSetId)
    .ilike('category', categoryName);
  return !error;
}

export async function deleteAllClasses(scheduleSetId: string): Promise<boolean> {
  const { error } = await supabase
    .from('classes')
    .delete()
    .eq('schedule_set_id', scheduleSetId);
  return !error;
}

// ─── CATEGORIES ──────────────────────────────────────────────

export async function fetchCategories(): Promise<CategoryItem[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return DEFAULT_CATEGORIES;

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error || !data || data.length === 0) return DEFAULT_CATEGORIES;

  return data.map((c: any) => ({
    id: c.id,
    name: c.name,
    color: c.color,
    isDefault: c.is_default || false,
  }));
}

export async function createCategory(cat: CategoryItem): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase.from('categories').insert({
    id: cat.id,
    user_id: user.id,
    name: cat.name,
    color: cat.color,
    is_default: cat.isDefault || false,
  });

  return !error;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  return !error;
}

// ─── FRIENDS ─────────────────────────────────────────────────

export async function fetchFriends(): Promise<FriendSchedule[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('friends')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error || !data) return [];

  return data.map((f: any) => ({
    id: f.id,
    name: f.name,
    avatarColor: f.avatar_color || '#6366f1',
    course: f.course || '',
    schedule: f.schedule_data || { id: '', name: '', semester: '', academicYear: '', isDefault: false, createdAt: '', items: [] },
  }));
}

export async function saveFriend(friend: FriendSchedule): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase.from('friends').upsert({
    id: friend.id,
    user_id: user.id,
    name: friend.name,
    avatar_color: friend.avatarColor,
    course: friend.course,
    schedule_data: friend.schedule,
  });

  return !error;
}

export async function deleteFriend(id: string): Promise<boolean> {
  const { error } = await supabase.from('friends').delete().eq('id', id);
  return !error;
}

// ─── MIGRATION (localStorage → Supabase) ────────────────────

export async function migrateFromLocalStorage(): Promise<{ migrated: boolean; message: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { migrated: false, message: 'Not authenticated.' };

  // Check if user already has data in the cloud
  const { data: existingSets } = await supabase
    .from('schedule_sets')
    .select('id')
    .eq('user_id', user.id)
    .limit(1);

  if (existingSets && existingSets.length > 0) {
    return { migrated: false, message: 'Cloud data already exists. Skipping migration.' };
  }

  // Get localStorage data
  const localSets = storageService.getAllScheduleSets();
  const localCategories = storageService.getCategories();
  const localFriends = storageService.getFriends();

  if (localSets.length === 0) {
    return { migrated: false, message: 'No local data to migrate.' };
  }

  try {
    // Migrate schedule sets
    for (const set of localSets) {
      await supabase.from('schedule_sets').insert({
        id: set.id,
        user_id: user.id,
        name: set.name,
        semester: set.semester,
        academic_year: set.academicYear,
        is_default: set.isDefault,
        created_at: set.createdAt || new Date().toISOString(),
      });

      // Migrate classes in this set
      for (const item of set.items) {
        await supabase.from('classes').insert({
          id: item.id,
          schedule_set_id: set.id,
          user_id: user.id,
          code: item.code,
          name: item.name,
          category: item.category || 'School',
          section: item.section || '',
          instructor: item.instructor || '',
          room: item.room,
          days: item.days,
          start_time: item.startTime,
          end_time: item.endTime,
          color: item.color,
          units: item.units || 0,
          notes: item.notes || '',
        });
      }
    }

    // Migrate categories (skip defaults)
    for (const cat of localCategories) {
      await supabase.from('categories').insert({
        id: cat.id,
        user_id: user.id,
        name: cat.name,
        color: cat.color,
        is_default: cat.isDefault || false,
      });
    }

    // Migrate friends
    for (const friend of localFriends) {
      await supabase.from('friends').insert({
        id: friend.id,
        user_id: user.id,
        name: friend.name,
        avatar_color: friend.avatarColor,
        course: friend.course,
        schedule_data: friend.schedule,
      });
    }

    // Migrate profile info
    const activeSchedule = storageService.getActiveSchedule();
    if (activeSchedule.studentName || activeSchedule.course) {
      await updateProfile({
        student_name: activeSchedule.studentName || '',
        course: activeSchedule.course || '',
        student_id: activeSchedule.studentId || '',
      });
    }

    return { migrated: true, message: `Migrated ${localSets.length} schedule(s) to cloud successfully!` };
  } catch (err: any) {
    console.error('Migration error:', err);
    return { migrated: false, message: err.message || 'Migration failed.' };
  }
}
