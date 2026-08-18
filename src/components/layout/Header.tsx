import React from 'react';
import {
  Clock,
  Plus,
  Menu,
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
    <header className="w-full max-w-[1500px] mx-auto px-3.5 pt-3.5 pb-1 md:px-6 md:pt-5 flex flex-col gap-2.5 select-none">
      {/* Top Main Row: Logo on Left | Status & Actions on Right */}
      <div className="flex items-center justify-between gap-3 w-full">
        {/* Left: Hamburger + SnapSched Brand Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          {/* Mobile Hamburger Menu */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-2xl bg-white shadow-xs border border-white/80 hover:bg-slate-50 transition-colors text-slate-600 shrink-0"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* SnapSched Logo on the Left */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-white shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                boxShadow: '0 2px 10px -2px rgba(79, 70, 229, 0.4)',
              }}
            >
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="font-bold text-[16px] sm:text-[18px] tracking-tight text-slate-900 leading-tight">
                SnapSched
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-[140px]">
                {schedule.name || '1st Semester 2026-2027'}
              </p>
            </div>
          </div>

          {/* Vertical divider on desktop */}
          <div className="hidden lg:block w-[1px] h-7 bg-slate-200/80 mx-1" />

          {/* Desktop Greeting */}
          <div className="hidden lg:block min-w-0">
            <h1 className="text-[16px] font-bold tracking-tight text-slate-900">
              {greeting}
            </h1>
            <p className="text-[11px] text-slate-500 font-medium truncate">
              Here's your day at a glance.
            </p>
          </div>
        </div>

        {/* Right: Status Pill + Clock + Add Class Action */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Live Status Pill (hidden on very narrow screens in row 1, shown on row 2 or desktop) */}
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl text-[12px] font-medium shadow-xs"
            style={{
              background: status.bg,
              border: `1px solid ${status.border}`,
              color: status.text,
            }}
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${status.pulse ? 'animate-pulse' : ''}`}
              style={{ backgroundColor: status.dotColor }}
            ></span>
            <span className="truncate max-w-[180px]">
              {currentStatus.details}
            </span>
          </div>

          {/* Live Clock Badge */}
          <div
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl text-[12px] font-medium text-slate-600 bg-white/80 shadow-xs border border-white/80"
          >
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-semibold text-slate-800 tabular-nums">{formattedTime}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">{formattedDate}</span>
          </div>

          {/* Add Class Action Button (Top Right where arrow points!) */}
          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl font-semibold text-[12px] sm:text-[13px] text-white flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Class</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-row: Live status banner for small screens */}
      <div className="flex sm:hidden items-center justify-between gap-2 px-3 py-1.5 rounded-2xl text-[12px] font-medium bg-white/70 border border-white shadow-xs">
        <div className="flex items-center gap-2 truncate">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${status.pulse ? 'animate-pulse' : ''}`}
            style={{ backgroundColor: status.dotColor }}
          />
          <span className="truncate text-slate-700">
            {currentStatus.details}
          </span>
        </div>
        <span className="text-[11px] text-slate-400 shrink-0 font-medium">
          {formattedTime}
        </span>
      </div>
    </header>
  );
};
