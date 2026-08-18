import React from 'react';
import { Coffee, ArrowRight, Clock } from 'lucide-react';
import { VacantPeriod } from '../../types/schedule';
import { format12Hour } from '../../hooks/useVacantPeriods';

interface VacantCardProps {
  vacant: VacantPeriod;
  topOffset: number;       // in px
  height: number;          // in px
  onSelectVacant?: (vacant: VacantPeriod) => void;
}

export const VacantCard: React.FC<VacantCardProps> = ({
  vacant,
  topOffset,
  height,
  onSelectVacant,
}) => {
  return (
    <div
      style={{
        top: `${topOffset}px`,
        height: `${Math.max(height - 2, 22)}px`,
      }}
      onClick={() => onSelectVacant?.(vacant)}
      className="absolute left-1 right-1 rounded-md p-1.5 flex items-center justify-between transition-all duration-150 border border-dashed border-amber-300/90 bg-amber-50/50 hover:bg-amber-100/60 hover:border-amber-400 cursor-pointer group select-none z-10 overflow-hidden"
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <Coffee className="w-3 h-3 text-amber-600 shrink-0" />
        <span className="text-[10px] font-mono font-medium text-amber-900 truncate">
          {vacant.durationFormatted} Break
        </span>
      </div>

      <div className="flex items-center gap-1 text-[10px] font-mono text-amber-700/80 shrink-0">
        <span className="hidden sm:inline">
          {format12Hour(vacant.startTime)} – {format12Hour(vacant.endTime)}
        </span>
        <span className="text-amber-800 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
          <span>Plan</span>
          <ArrowRight className="w-2.5 h-2.5" />
        </span>
      </div>
    </div>
  );
};
