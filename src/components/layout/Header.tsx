import React from 'react';
import {
  Clock,
  Plus,
  Menu,
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
  schedule: _schedule,
  onOpenAddModal,
  onToggleSidebar,
  currentStatus,
  currentTime,
}) => {
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
          dotColor: 'var(--brand-600)',
          bg: 'var(--brand-50)',
          border: 'var(--brand-200)',
          text: 'var(--brand-700)',
          label: 'In Class',
          timeBg: 'var(--brand-100)',
          timeColor: 'var(--brand-800)',
          timeText: currentStatus.endsIn ? `${currentStatus.endsIn} left` : '',
          pulse: true,
        };
      case 'break':
        return {
          dotColor: 'var(--status-warning)',
          bg: 'var(--status-warning-bg)',
          border: 'var(--status-warning-border)',
          text: '#92400e',
          label: 'Free Time',
          timeBg: '#fef3c7',
          timeColor: '#92400e',
          timeText: currentStatus.endsIn ? `${currentStatus.endsIn} left` : '',
          pulse: false,
        };
      case 'upcoming':
        return {
          dotColor: 'var(--status-success)',
          bg: 'var(--status-success-bg)',
          border: 'var(--status-success-border)',
          text: '#065f46',
          label: 'Next',
          timeBg: '#d1fae5',
          timeColor: '#065f46',
          timeText: currentStatus.startsIn ? `in ${currentStatus.startsIn}` : '',
          pulse: false,
        };
      default:
        return {
          dotColor: 'var(--text-muted)',
          bg: 'var(--surface-secondary)',
          border: 'var(--border-default)',
          text: 'var(--text-secondary)',
          label: '',
          timeBg: 'var(--surface-tertiary)',
          timeColor: 'var(--text-secondary)',
          timeText: '',
          pulse: false,
        };
    }
  };

  const status = getStatusConfig();

  return (
    <header
      className="h-14 px-4 flex items-center justify-between sticky top-0 select-none"
      style={{
        background: 'var(--surface-primary)',
        borderBottom: '1px solid var(--border-default)',
        zIndex: 'var(--z-header)',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      {/* Left: Mobile menu + Status */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Mobile hamburger */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Open navigation"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Status badge */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] max-w-full min-w-0"
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
          {status.label && (
            <span className="font-semibold shrink-0">{status.label}:</span>
          )}
          <span className="truncate" style={{ color: 'var(--text-primary)' }}>
            {currentStatus.details}
          </span>
          {status.timeText && (
            <span
              className="text-[11px] font-medium px-1.5 py-0.5 rounded-md shrink-0 tabular-nums hidden sm:inline"
              style={{ background: status.timeBg, color: status.timeColor }}
            >
              {status.timeText}
            </span>
          )}
        </div>
      </div>

      {/* Right: Clock + Add */}
      <div className="flex items-center gap-2 shrink-0 ml-3">
        {/* Clock */}
        <div
          className="hidden sm:flex items-center gap-2 text-[13px] px-3 py-1.5 rounded-lg"
          style={{
            background: 'var(--surface-secondary)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
          }}
        >
          <Clock className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          <span className="hidden md:inline">{formattedDate}</span>
          <span className="hidden md:inline" style={{ color: 'var(--border-strong)' }}>·</span>
          <span className="font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {formattedTime}
          </span>
        </div>

        {/* Add Class */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-white font-medium text-[13px] transition-colors hover:opacity-90"
          style={{
            background: 'var(--brand-600)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Class</span>
        </button>
      </div>
    </header>
  );
};
