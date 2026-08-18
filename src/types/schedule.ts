export type DayAbbreviation = 'M' | 'T' | 'W' | 'TH' | 'F' | 'S';

export interface DayInfo {
  key: DayAbbreviation;
  full: string;
  short: string;
}

export const DAYS_OF_WEEK: DayInfo[] = [
  { key: 'M', full: 'Monday', short: 'Mon' },
  { key: 'T', full: 'Tuesday', short: 'Tue' },
  { key: 'W', full: 'Wednesday', short: 'Wed' },
  { key: 'TH', full: 'Thursday', short: 'Thu' },
  { key: 'F', full: 'Friday', short: 'Fri' },
  { key: 'S', full: 'Saturday', short: 'Sat' },
];

export interface CategoryItem {
  id: string;
  name: string;
  color: string;
  isDefault?: boolean;
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'cat-school', name: 'School', color: '#4f46e5', isDefault: true },
  { id: 'cat-work', name: 'Work', color: '#2563eb', isDefault: true },
  { id: 'cat-gym', name: 'Gym', color: '#059669', isDefault: true },
  { id: 'cat-study', name: 'Study', color: '#d97706', isDefault: true },
  { id: 'cat-personal', name: 'Personal', color: '#7c3aed', isDefault: true },
];

export interface ClassItem {
  id: string;
  code: string;               // e.g., "IT 311" or "WORK SHIFT" or "GYM LEG DAY"
  name: string;               // e.g., "Web Systems & Technologies 2"
  category?: string;          // e.g., "School", "Gym", "Work", "Study", "Personal"
  section?: string;           // e.g., "BSIT 3-A"
  instructor?: string;        // e.g., "Prof. R. Santos"
  room: string;               // e.g., "CL 304" / "IT-LAB 2"
  days: DayAbbreviation[];    // e.g., ["M", "W", "F"] or ["T", "TH"]
  startTime: string;          // "07:30" (24h format HH:mm)
  endTime: string;            // "09:00" (24h format HH:mm)
  color: string;              // HEX color
  units?: number;             // e.g., 3
  notes?: string;
  scheduleId?: string;
}

export interface VacantPeriod {
  id: string;
  day: DayAbbreviation;
  dayFull: string;
  startTime: string;          // "12:00"
  endTime: string;            // "17:00"
  durationMinutes: number;    // 300
  durationFormatted: string;  // "5 hrs" / "1 hr 30 mins"
  previousClassName: string;
  nextClassName: string;
  nextClassRoom: string;
  nextClassStartTime: string;
  isToday: boolean;
}

export interface ScheduleSet {
  id: string;
  name: string;               // e.g., "1st Semester 2026-2027"
  semester: string;           // e.g., "1st Semester"
  academicYear: string;       // e.g., "2026-2027"
  studentName?: string;
  studentId?: string;
  course?: string;
  isDefault: boolean;
  createdAt: string;
  items: ClassItem[];
}

export interface OcrParsedClass {
  id: string;
  code: string;
  name: string;
  category?: string;
  section: string;
  units: number;
  days: DayAbbreviation[];
  startTime: string;
  endTime: string;
  room: string;
  instructor?: string;
  confidence: number;
  selected: boolean;
}

export interface FriendSchedule {
  id: string;
  name: string;
  avatarColor: string;
  course: string;
  schedule: ScheduleSet;
}

export interface OverlapFreeSlot {
  id: string;
  day: DayAbbreviation;
  dayFull: string;
  startTime: string;
  endTime: string;
  durationFormatted: string;
  participants: string[];
}
