import React from 'react';
import {
  Clock,
  Plus,
  Menu,
  Sparkles,
  Calendar as CalendarIcon,
  BookOpen,
} from 'lucide-react';
import { ScheduleSet } from '../../types/schedule';

interface HeaderProps {
  schedule: ScheduleSet;
  onOpenAddModal: () => void;
  onToggleSidebar: () => void;
  currentStatus: {
    type: 'class' | 'break' | 'upcoming' | 'free';
    title: string;
    details: string;
    endsIn?: string;
    startsIn?: string;
  };
  currentTime: Date;
}

export const Header: React.FC<HeaderProps> = ({
  schedule,
  onOpenAddModal,
  onToggleSidebar,
  currentStatus,
  currentTime,
}) => {
  const studentName = schedule.studentName || 'Josh';
  const initial = studentName.charAt(0).toUpperCase() || 'J';

  const hour = currentTime.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const getStatusConfig = () => {
    switch (currentStatus.type) {
      case 'class':
        return {
          dotColor: '#4f46e5',
          bg: '#eef2ff',
          border: '#c7d2fe',
          text: '#4338ca',
          label: 'In Class',
          timeBg: '#e0e7ff',
          timeColor: '#3730a3',
          timeText: currentStatus.endsIn ? `${currentStatus.endsIn} left` : '',
          pulse: true,
        };
      case 'break':
        return {
          dotColor: '#d97706',
          bg: '#fffbeb',
          border: '#fde68a',
          text: '#92400e',
          label: 'Free Time',
          timeBg: '#fef3c7',
          timeColor: '#92400e',
          timeText: currentStatus.endsIn ? `${currentStatus.endsIn} left` : '',
          pulse: false,
        };
      case 'upcoming':
        return {
          dotColor: '#059669',
          bg: '#ecfdf5',
          border: '#a7f3d0',
          text: '#065f46',
          label: 'Next',
          timeBg: '#d1fae5',
          timeColor: '#065f46',
          timeText: currentStatus.startsIn ? `in ${currentStatus.startsIn}` : '',
          pulse: false,
        };
      default:
        return {
          dotColor: '#6366f1',
          bg: '#f8faff',
          border: '#e0e7ff',
          text: '#4b5563',
          label: 'Day Status',
          timeBg: '#f1f5f9',
          timeColor: '#475569',
          timeText: '',
          pulse: false,
        };
    }
  };

  const status = getStatusConfig();

  return (
    <header className="px-3 py-3 md:px-6 md:py-4 flex flex-col gap-3 select-none">
      {/* Mobile Top Nav: Logo on the left, Menu button on the right */}
      <div className="flex items-center justify-between w-full lg:hidden">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            }}
          >
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-[15px] tracking-tight text-slate-900">
              SnapSched
            </div>
          </div>
        </div>

        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl bg-white shadow-xs border border-white/80 hover:bg-slate-50 transition-colors text-slate-600"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Main Row: Greeting on Left & Actions/Status on Right */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Clean Greeting & Subtitle */}
        <div className="min-w-0">
          <h1 className="text-[22px] md:text-[24px] font-bold tracking-tight text-slate-900">
            {greeting}
          </h1>
          <p className="text-[13px] text-slate-500 font-medium truncate mt-0.5">
            Here's your day at a glance.
          </p>
        </div>

      {/* Right: Floating Status Pill + Time Badge + Add Class Action */}
      <div className="flex items-center gap-2.5 flex-wrap md:flex-nowrap shrink-0">
        {/* Live Status Pill */}
        <div
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl text-[13px] font-medium shadow-xs"
          style={{
            background: status.bg,
            border: `1px solid ${status.border}`,
            color: status.text,
          }}
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${status.pulse ? 'animate-pulse' : ''}`}
            style={{ backgroundColor: status.dotColor }}
          />
          <span className="truncate max-w-[200px]">
            {currentStatus.details}
          </span>
          {status.timeText && (
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-lg shrink-0 tabular-nums hidden sm:inline"
              style={{ background: status.timeBg, color: status.timeColor }}
            >
              {status.timeText}
            </span>
          )}
        </div>

        {/* Live Clock Badge */}
        <div
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl text-[13px] font-medium text-slate-600 bg-white/80 shadow-xs border border-white/80"
        >
          <Clock className="w-3.5 h-3.5 text-indigo-500" />
          <span className="font-semibold text-slate-800 tabular-nums">{formattedTime}</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500">{formattedDate}</span>
        </div>

        {/* Add Class Action Pill */}
        <button
          onClick={onOpenAddModal}
          className="px-4 py-2 rounded-2xl font-semibold text-[13px] text-white flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Class</span>
        </button>
      </div>
    </div>
  </header>
);
};
