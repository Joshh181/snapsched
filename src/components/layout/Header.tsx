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
import { useAuth } from '../../contexts/AuthContext';

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
  const { user } = useAuth();
  const rawName =
    schedule.studentName?.trim() ||
    user?.user_metadata?.full_name?.trim() ||
    user?.user_metadata?.name?.trim() ||
    (user?.email ? user.email.split('@')[0] : '') ||
    'Josh';

  // Extract first name for a natural friendly greeting
  const firstName = rawName.split(' ')[0] || rawName;
  const initial = (firstName.charAt(0) || 'J').toUpperCase();

  const hour = currentTime.getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const fullGreeting = firstName ? `${timeGreeting}, ${firstName}` : timeGreeting;

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
      {/* Top Greeting Row: Sidebar button + Greeting on Left, Logo only on Right */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: Sidebar Toggle Button + Greeting */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl bg-white shadow-xs border border-white/80 hover:bg-slate-50 transition-colors text-slate-600 active:scale-95 transition-transform shrink-0"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-[20px] md:text-[24px] font-bold tracking-tight text-slate-900 leading-tight">
              {fullGreeting}
            </h1>
            <p className="text-[12px] md:text-[13px] text-slate-500 font-medium truncate mt-0.5">
              Here's your day at a glance.
            </p>
          </div>
        </div>

        {/* Right (Mobile): Logo only */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0 lg:hidden"
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
          }}
          title="SnapSched"
        >
          <BookOpen className="w-4.5 h-4.5" />
        </div>

        {/* Right (Desktop): Status Pill + Clock + Add Class */}
        <div className="hidden lg:flex items-center gap-2.5 shrink-0">
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
                className="text-[11px] font-semibold px-2 py-0.5 rounded-lg shrink-0 tabular-nums"
                style={{ background: status.timeBg, color: status.timeColor }}
              >
                {status.timeText}
              </span>
            )}
          </div>

          {/* Live Clock Badge */}
          <div
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl text-[13px] font-medium text-slate-600 bg-white/80 shadow-xs border border-white/80"
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

      {/* Mobile Sub-row: Live Status Banner + Add Class Button */}
      <div className="flex items-center justify-between gap-2.5 lg:hidden">
        {/* Live Status Pill */}
        <div
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl text-[12px] sm:text-[13px] font-medium shadow-xs min-w-0 flex-1 sm:flex-initial"
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
          <span className="truncate">
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

        {/* Live Clock Badge (visible on sm screen) */}
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl text-[12px] font-medium text-slate-600 bg-white/80 shadow-xs border border-white/80"
        >
          <Clock className="w-3.5 h-3.5 text-indigo-500" />
          <span className="font-semibold text-slate-800 tabular-nums">{formattedTime}</span>
        </div>

        {/* Add Class Action Pill */}
        <button
          onClick={onOpenAddModal}
          className="px-3.5 py-2 rounded-2xl font-semibold text-[12px] sm:text-[13px] text-white flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md active:scale-95 shrink-0"
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Class</span>
        </button>
      </div>
    </header>
);
};
