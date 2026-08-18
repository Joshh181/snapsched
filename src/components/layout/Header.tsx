import React from 'react';
import { 
  Clock, 
  Plus 
} from 'lucide-react';
import { ScheduleSet } from '../../types/schedule';

interface HeaderProps {
  schedule: ScheduleSet;
  onOpenAddModal: () => void;
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

  const getStatusBadge = () => {
    switch (currentStatus.type) {
      case 'class':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="font-semibold">In Class:</span>
            <span className="text-zinc-800 truncate max-w-[150px]">{currentStatus.details}</span>
            {currentStatus.endsIn && (
              <span className="font-mono text-[10px] text-blue-800 bg-blue-100/80 px-1 rounded">
                {currentStatus.endsIn} left
              </span>
            )}
          </div>
        );
      case 'break':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span className="font-semibold">Break:</span>
            <span className="text-zinc-800 truncate max-w-[150px]">{currentStatus.details}</span>
            {currentStatus.endsIn && (
              <span className="font-mono text-[10px] text-amber-800 bg-amber-100/80 px-1 rounded">
                {currentStatus.endsIn} left
              </span>
            )}
          </div>
        );
      case 'upcoming':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="font-semibold">Next:</span>
            <span className="text-zinc-800 truncate max-w-[150px]">{currentStatus.details}</span>
            {currentStatus.startsIn && (
              <span className="font-mono text-[10px] text-emerald-800 bg-emerald-100/80 px-1 rounded">
                in {currentStatus.startsIn}
              </span>
            )}
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
            <span>{currentStatus.details}</span>
          </div>
        );
    }
  };

  return (
    <header className="h-11 bg-white/95 border-b border-zinc-200/90 px-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-20 select-none shadow-2xs">
      {/* Left: Real-time Status Badge */}
      <div className="flex items-center gap-3">
        {getStatusBadge()}
      </div>

      {/* Right: Clock & Add Class Button */}
      <div className="flex items-center gap-2">
        {/* Live Clock */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-600 font-mono bg-zinc-50 px-2.5 py-1 rounded-md border border-zinc-200">
          <Clock className="w-3 h-3 text-zinc-400" />
          <span className="hidden sm:inline">{formattedDate}</span>
          <span className="hidden sm:inline text-zinc-300">•</span>
          <span className="font-semibold text-zinc-800">{formattedTime}</span>
        </div>

        {/* Add Class Button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1 px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Class</span>
        </button>
      </div>
    </header>
  );
};
