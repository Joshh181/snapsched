import { ScheduleSet, FriendSchedule } from '../types/schedule';

export const COLOR_PALETTES = [
  '#6366f1', // Electric Indigo
  '#3b82f6', // Bright Blue
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#f97316', // Orange
  '#14b8a6', // Teal
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
      section: 'BSIT 3-A',
      instructor: 'Engr. R. Morales',
      room: 'IT-LAB 2',
      days: ['M', 'W'],
      startTime: '07:30',
      endTime: '09:00',
      color: '#6366f1',
      units: 3,
      notes: 'Bring laptop for React & Node.js hands-on labs.',
    },
    {
      id: 'class-2',
      code: 'IT 312',
      name: 'Mobile Application Development',
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
      section: 'BSIT 3-A',
      instructor: 'Dr. C. Villanueva',
      room: 'TECH-302',
      days: ['M', 'W'],
      startTime: '13:30',
      endTime: '15:00',
      color: '#10b981',
      units: 3,
      notes: 'Supabase & PostgreSQL server architecture.',
    },
    {
      id: 'class-4',
      code: 'IT 314',
      name: 'Information Assurance & Security 1',
      section: 'BSIT 3-A',
      instructor: 'Prof. J. Dela Cruz',
      room: 'LEC-204',
      days: ['T', 'TH'],
      startTime: '08:00',
      endTime: '10:00',
      color: '#8b5cf6',
      units: 3,
      notes: 'Cryptography & network security protocols.',
    },
    {
      id: 'class-5',
      code: 'IT 315',
      name: 'Integrative Programming & Technologies',
      section: 'BSIT 3-A',
      instructor: 'Engr. D. Aquino',
      room: 'IT-LAB 1',
      days: ['T', 'TH'],
      startTime: '14:00',
      endTime: '17:00',
      color: '#f59e0b',
      units: 3,
      notes: '3-hour lab block. Capstone system integration.',
    },
    {
      id: 'class-6',
      code: 'GE 108',
      name: 'Ethics & Emerging Technologies in IT',
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
          room: 'IT-LAB 2',
          days: ['M', 'W'],
          startTime: '07:30',
          endTime: '09:00',
          color: '#6366f1',
          units: 3,
        },
        {
          id: 's-2',
          code: 'IT 312',
          name: 'Mobile Application Dev',
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
          name: 'Information Assurance',
          room: 'LEC-204',
          days: ['T', 'TH'],
          startTime: '08:00',
          endTime: '10:00',
          color: '#8b5cf6',
          units: 3,
        },
      ],
    },
  },
  {
    id: 'friend-2',
    name: 'Mark Gabriel',
    avatarColor: '#10b981',
    course: 'BSCS 3-B',
    schedule: {
      id: 'set-mark',
      name: '1st Sem 2026-2027',
      semester: '1st Semester',
      academicYear: '2026-2027',
      isDefault: false,
      createdAt: new Date().toISOString(),
      items: [
        {
          id: 'm-1',
          code: 'CS 301',
          name: 'Automata & Language Theory',
          room: 'CL 401',
          days: ['M', 'W'],
          startTime: '09:00',
          endTime: '11:00',
          color: '#10b981',
          units: 3,
        },
        {
          id: 'm-2',
          code: 'CS 302',
          name: 'Software Engineering 1',
          room: 'LAB 5',
          days: ['T', 'TH'],
          startTime: '10:00',
          endTime: '12:00',
          color: '#3b82f6',
          units: 3,
        },
        {
          id: 'm-3',
          code: 'CS 303',
          name: 'Artificial Intelligence & Neural Nets',
          room: 'AI-LAB',
          days: ['T', 'TH'],
          startTime: '15:00',
          endTime: '17:00',
          color: '#8b5cf6',
          units: 3,
        },
      ],
    },
  },
];

export const PRELOADED_SAMPLE_CORS = [
  {
    id: 'cor-bsit',
    title: 'University Registration Slip (BSIT 3rd Year)',
    subtitle: '6 subjects • 18 units • Official Enrollment Slip',
    type: 'Certificate of Registration (COR)',
    sampleText: `
COLLEGE OF INFORMATION AND COMMUNICATIONS TECHNOLOGY
CERTIFICATE OF REGISTRATION — 1ST SEMESTER 2026-2027
STUDENT: RAMOS, JOSHUA D. | ID: 2023-10492 | DEGREE: BSIT 3-A

CODE       DESCRIPTION                               UNITS  DAY   TIME              ROOM
-----------------------------------------------------------------------------------------
IT 311     Advanced Web Development & Frameworks      3.0   MW    07:30AM-09:00AM   IT-LAB 2
IT 312     Mobile Application Development             3.0   MW    09:00AM-10:30AM   COM-LAB 4
IT 313     Cloud Computing & DB Administration        3.0   MW    01:30PM-03:00PM   TECH-302
IT 314     Information Assurance & Security 1         3.0   TTH   08:00AM-10:00AM   LEC-204
IT 315     Integrative Programming & Technologies     3.0   TTH   02:00PM-05:00PM   IT-LAB 1
GE 108     Ethics & Emerging Technologies in IT       3.0   F     09:00AM-12:00PM   AVR 1
-----------------------------------------------------------------------------------------
TOTAL UNITS: 18.0 | STATUS: REGULAR ENROLLED
`,
  },
  {
    id: 'cor-bscs',
    title: 'Computer Science Enrollment Assessment',
    subtitle: '5 subjects • 15 units • Pure Major Course Load',
    type: 'Course Assessment Form',
    sampleText: `
DEPARTMENT OF COMPUTER SCIENCE
OFFICIAL STUDY LOAD — 1ST SEMESTER 2026-2027
STUDENT: MENDOZA, ALYSSA P. | ID: 2023-88312 | DEGREE: BSCS 3-B

CODE       DESCRIPTION                               UNITS  DAY   TIME              ROOM
-----------------------------------------------------------------------------------------
CS 311     Design and Analysis of Algorithms          3.0   MWF   08:00AM-09:00AM   CS-201
CS 312     Automata Theory and Formal Languages       3.0   MWF   10:00AM-11:00AM   CS-202
CS 313     Operating Systems Architecture             3.0   TTH   09:00AM-10:30AM   SYS-LAB
CS 314     Artificial Intelligence & Expert Systems   3.0   TTH   01:00PM-02:30PM   AI-LAB
GE 105     Purposive Communication                    3.0   F     01:00PM-04:00PM   LEC-105
-----------------------------------------------------------------------------------------
TOTAL UNITS: 15.0 | STATUS: OFFICIALLY ENROLLED
`,
  },
];
