import { ScheduleSet, FriendSchedule } from '../types/schedule';

export const COLOR_PALETTES = [
  '#4f46e5', // Indigo (School)
  '#2563eb', // Blue (Work)
  '#059669', // Emerald (Gym)
  '#d97706', // Amber (Study)
  '#7c3aed', // Purple (Personal)
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#e11d48', // Rose
];

export const INITIAL_SCHEDULE_SET: ScheduleSet = {
  id: 'set-bsit-3a',
  name: '1st Semester 2026-2027',
  semester: '1st Semester',
  academicYear: '2026-2027',
  studentName: 'Josh Ramos',
  studentId: '2023-10492',
  course: 'BS Information Technology (BSIT 3-A)',
  isDefault: true,
  createdAt: new Date().toISOString(),
  items: [
    {
      id: 'class-1',
      code: 'IT 311',
      name: 'Advanced Web Development & Frameworks',
      category: 'School',
      section: 'BSIT 3-A',
      instructor: 'Engr. R. Morales',
      room: 'IT-LAB 2',
      days: ['M', 'W'],
      startTime: '07:30',
      endTime: '09:00',
      color: '#4f46e5',
      units: 3,
      notes: 'Bring laptop for React & Node.js hands-on labs.',
    },
    {
      id: 'class-2',
      code: 'IT 312',
      name: 'Mobile Application Development',
      category: 'School',
      section: 'BSIT 3-A',
      instructor: 'Prof. M. Santos',
      room: 'COM-LAB 4',
      days: ['M', 'W'],
      startTime: '09:00',
      endTime: '10:30',
      color: '#06b6d4',
      units: 3,
      notes: 'React Native & Flutter project milestones.',
    },
    {
      id: 'class-3',
      code: 'IT 313',
      name: 'Cloud Computing & Database Administration',
      category: 'School',
      section: 'BSIT 3-A',
      instructor: 'Dr. C. Villanueva',
      room: 'TECH-302',
      days: ['M', 'W'],
      startTime: '13:30',
      endTime: '15:00',
      color: '#2563eb',
      units: 3,
      notes: 'Supabase & PostgreSQL server architecture.',
    },
    {
      id: 'class-gym-1',
      code: 'GYM WORKOUT',
      name: 'Strength Training & Cardio',
      category: 'Gym',
      room: 'Campus Fitness Center',
      days: ['M', 'W', 'F'],
      startTime: '17:30',
      endTime: '19:00',
      color: '#059669',
      notes: 'Leg day + 20m high-intensity interval cardio.',
    },
    {
      id: 'class-4',
      code: 'IT 314',
      name: 'Information Assurance & Security 1',
      category: 'School',
      section: 'BSIT 3-A',
      instructor: 'Prof. J. Dela Cruz',
      room: 'LEC-204',
      days: ['T', 'TH'],
      startTime: '08:00',
      endTime: '10:00',
      color: '#7c3aed',
      units: 3,
      notes: 'Cryptography & network security protocols.',
    },
    {
      id: 'class-5',
      code: 'IT 315',
      name: 'Integrative Programming & Technologies',
      category: 'School',
      section: 'BSIT 3-A',
      instructor: 'Engr. D. Aquino',
      room: 'IT-LAB 1',
      days: ['T', 'TH'],
      startTime: '14:00',
      endTime: '17:00',
      color: '#d97706',
      units: 3,
      notes: '3-hour lab block. Capstone system integration.',
    },
    {
      id: 'class-work-1',
      code: 'WORK SHIFT',
      name: 'Freelance Frontend Dev Shift',
      category: 'Work',
      room: 'Remote / Home Office',
      days: ['T', 'TH'],
      startTime: '18:00',
      endTime: '20:30',
      color: '#2563eb',
      notes: 'Client dashboard bug fixes & feature development.',
    },
    {
      id: 'class-6',
      code: 'GE 108',
      name: 'Ethics & Emerging Technologies in IT',
      category: 'School',
      section: 'BSIT 3-A',
      instructor: 'Prof. K. Bautista',
      room: 'AVR 1',
      days: ['F'],
      startTime: '09:00',
      endTime: '12:00',
      color: '#ec4899',
      units: 3,
      notes: 'AI ethics case study reporting.',
    },
    {
      id: 'class-study-1',
      code: 'LIBRARY STUDY',
      name: 'Capstone Research & Review',
      category: 'Study',
      room: 'University Library 3F',
      days: ['F'],
      startTime: '14:00',
      endTime: '16:30',
      color: '#d97706',
      notes: 'Literature review & sprint planning.',
    },
  ],
};

export const SAMPLE_FRIEND_SCHEDULES: FriendSchedule[] = [
  {
    id: 'friend-1',
    name: 'Samantha Cruz',
    avatarColor: '#ec4899',
    course: 'BSIT 3-A (Blockmate)',
    schedule: {
      id: 'set-sam',
      name: '1st Sem 2026-2027',
      semester: '1st Semester',
      academicYear: '2026-2027',
      isDefault: false,
      createdAt: new Date().toISOString(),
      items: [
        {
          id: 's-1',
          code: 'IT 311',
          name: 'Advanced Web Development',
          category: 'School',
          room: 'IT-LAB 2',
          days: ['M', 'W'],
          startTime: '07:30',
          endTime: '09:00',
          color: '#4f46e5',
          units: 3,
        },
        {
          id: 's-2',
          code: 'IT 312',
          name: 'Mobile Application Dev',
          category: 'School',
          room: 'COM-LAB 4',
          days: ['M', 'W'],
          startTime: '09:00',
          endTime: '10:30',
          color: '#06b6d4',
          units: 3,
        },
        {
          id: 's-3',
          code: 'GE 108',
          name: 'Ethics in IT',
          category: 'School',
          room: 'AVR 1',
          days: ['M', 'W'],
          startTime: '15:00',
          endTime: '16:30',
          color: '#ec4899',
          units: 3,
        },
        {
          id: 's-4',
          code: 'IT 314',
          name: 'Info Assurance & Security',
          category: 'School',
          room: 'LEC-204',
          days: ['T', 'TH'],
          startTime: '08:00',
          endTime: '10:00',
          color: '#7c3aed',
          units: 3,
        },
      ],
    },
  },
  {
    id: 'friend-2',
    name: 'Marcus Vance',
    avatarColor: '#059669',
    course: 'BSCS 3-B',
    schedule: {
      id: 'set-marcus',
      name: '1st Sem 2026-2027',
      semester: '1st Semester',
      academicYear: '2026-2027',
      isDefault: false,
      createdAt: new Date().toISOString(),
      items: [
        {
          id: 'm-1',
          code: 'CS 321',
          name: 'Automata Theory & Computability',
          category: 'School',
          room: 'CL-201',
          days: ['M', 'W'],
          startTime: '10:30',
          endTime: '12:00',
          color: '#2563eb',
          units: 3,
        },
        {
          id: 'm-2',
          code: 'CS 322',
          name: 'Software Engineering 1',
          category: 'School',
          room: 'CL-305',
          days: ['T', 'TH'],
          startTime: '10:00',
          endTime: '12:00',
          color: '#059669',
          units: 3,
        },
        {
          id: 'm-3',
          code: 'CS 323',
          name: 'Algorithms Analysis',
          category: 'School',
          room: 'LEC-102',
          days: ['F'],
          startTime: '08:00',
          endTime: '11:00',
          color: '#d97706',
          units: 3,
        },
      ],
    },
  },
];

export const PRELOADED_SAMPLE_CORS = [
  {
    id: 'sample-bsit',
    title: 'BSIT 3rd Year 1st Sem COR',
    subtitle: '6 subjects · 18 units · MW/TTH schedule',
    sampleText: `UNIVERSITY OF SCIENCE AND TECHNOLOGY
CERTIFICATE OF REGISTRATION (COR)
STUDENT NAME: Josh Ramos
DEGREE PROGRAM: BS Information Technology (BSIT 3-A)
ACADEMIC YEAR: 2026-2027 | SEMESTER: 1st Semester

COURSE CODE    DESCRIPTION                                UNITS    DAYS    TIME                    ROOM
IT 311         Advanced Web Development & Frameworks      3.0      MW      07:30AM-09:00AM         IT-LAB 2
IT 312         Mobile Application Development             3.0      MW      09:00AM-10:30AM         COM-LAB 4
IT 313         Cloud Computing & Database Administration  3.0      MW      01:30PM-03:00PM         TECH-302
IT 314         Information Assurance & Security 1         3.0      TTH     08:00AM-10:00AM         LEC-204
IT 315         Integrative Programming & Technologies     3.0      TTH     02:00PM-05:00PM         IT-LAB 1
GE 108         Ethics & Emerging Technologies in IT       3.0      F       09:00AM-12:00PM         AVR 1

TOTAL ENROLLED UNITS: 18.0 UNITS
STATUS: OFFICIALLY ENROLLED
DATE PRINTED: 2026-08-15`,
  },
  {
    id: 'sample-bscs',
    title: 'BSCS 2nd Year Irregular Load',
    subtitle: '5 subjects · 15 units · Morning/Afternoon blocks',
    sampleText: `COLLEGE OF COMPUTER STUDIES
STUDY LOAD FORM - AY 2026-2027 1ST SEMESTER

CODE        SUBJECT TITLE                              UNITS   DAY     TIME                    ROOM
CS 211      Data Structures and Algorithms             3.0     MW      08:00AM-10:00AM         CL-201
MATH 21     Discrete Mathematics 2                     3.0     MW      10:30AM-12:00PM         MATH-302
CS 212      Object-Oriented Programming (Java)         3.0     TTH     01:00PM-03:30PM         IT-LAB 3
GE 105      Purposive Communication                    3.0     TTH     04:00PM-05:30PM         AVR 2
PE 103      Physical Activities & Fitness              2.0     SAT     08:00AM-10:00AM         GYMNASIUM`,
  },
];
