import React from 'react';
import { Coffee, ArrowRight } from 'lucide-react';
import { VacantPeriod } from '../../types/schedule';
import { format12Hour } from '../../hooks/useVacantPeriods';

interface VacantCardProps {
  vacant: VacantPeriod;
  topOffset: number;
  height: number;
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
        background: 'var(--status-warning-bg)',
        border: '1px dashed var(--status-warning-border)',
        borderRadius: 'var(--radius-md)',
      }}
      onClick={() => onSelectVacant?.(vacant)}
      className="absolute left-1 right-1 p-1.5 flex items-center justify-between transition-all group cursor-pointer select-none z-10 overflow-hidden hover:border-solid"
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#fef3c7';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--status-warning-bg)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <Coffee className="w-3 h-3 shrink-0" style={{ color: 'var(--status-warning)' }} />
        <span className="text-[10px] font-medium truncate" style={{ color: '#92400e' }}>
          {vacant.durationFormatted} free
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <span className="hidden sm:inline text-[10px] tabular-nums" style={{ color: '#b45309' }}>
          {format12Hour(vacant.startTime)} – {format12Hour(vacant.endTime)}
        </span>
        <span
          className="font-semibold text-[10px] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
          style={{ color: '#92400e' }}
        >
          Plan
          <ArrowRight className="w-2.5 h-2.5" />
        </span>
      </div>
    </div>
  );
};
