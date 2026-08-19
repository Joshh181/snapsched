import { ScheduleSet, FriendSchedule } from '../types/schedule';

export const COLOR_PALETTES = [
  '#4f46e5', // Indigo (School)
  '#2563eb', // Blue (Work)
  '#059669', // Emerald (Project/Activity)
  '#d97706', // Amber (Study)
  '#7c3aed', // Purple (Personal)
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#e11d48', // Rose
];

export const INITIAL_SCHEDULE_SET: ScheduleSet = {
  id: 'set-default',
  name: '1st Semester 2026-2027',
  semester: '1st Semester',
  academicYear: '2026-2027',
  studentName: '',
  studentId: '',
  course: '',
  isDefault: true,
  createdAt: new Date().toISOString(),
  items: [],
};

export const SAMPLE_FRIEND_SCHEDULES: FriendSchedule[] = [];

export const PRELOADED_SAMPLE_CORS: { id: string; title: string; subtitle: string; sampleText: string }[] = [];
