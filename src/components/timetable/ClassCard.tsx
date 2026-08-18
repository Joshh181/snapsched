import React from 'react';
import { Clock, Edit2, Trash2, User } from 'lucide-react';
import { ClassItem } from '../../types/schedule';
import { format12Hour } from '../../hooks/useVacantPeriods';

interface ClassCardProps {
  item: ClassItem;
  topOffset: number;
  height: number;
  onEdit: (item: ClassItem) => void;
  onDelete: (id: string) => void;
  leftPercent?: number;
  widthPercent?: number;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  item,
  topOffset,
  height,
  onEdit,
  onDelete,
  leftPercent,
  widthPercent,
}) => {
  const isCompact = height < 48;
  const showInstructor = height >= 72;
  const isMultiColumn = widthPercent !== undefined && widthPercent < 90;

  const leftStyle = leftPercent !== undefined ? `calc(${leftPercent}% + 2px)` : '4px';
  const widthStyle = widthPercent !== undefined ? `calc(${widthPercent}% - 4px)` : 'calc(100% - 8px)';

  return (
    <div
      style={{
        top: `${topOffset}px`,
        height: `${Math.max(height - 2, 28)}px`,
        left: leftStyle,
        width: widthStyle,
        background: 'var(--surface-primary)',
        border: '1px solid var(--border-default)',
        borderLeftWidth: '2px',
        borderLeftColor: item.color || '#4f46e5',
        boxShadow: 'var(--shadow-xs)',
        borderRadius: 'var(--radius-md)',
      }}
      className="absolute p-1.5 flex flex-col justify-between transition-all group cursor-pointer select-none overflow-hidden hover:overflow-visible"
      onClick={() => onEdit(item)}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--surface-secondary)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.zIndex = '35';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--surface-primary)';
        e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
        e.currentTarget.style.zIndex = '';
      }}
    >
      {/* Subtle tint on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-[0.04] transition-opacity pointer-events-none rounded-md"
        style={{ backgroundColor: item.color || '#4f46e5' }}
      />

      {/* Top: Code + Room + Actions */}
      <div className="relative z-10 flex items-center justify-between gap-1 min-w-0">
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-[11px] font-semibold tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>
            {item.code}
          </span>
          {item.room && !isMultiColumn && (
            <span
              className="text-[10px] px-1 py-0.5 rounded shrink-0"
              style={{
                background: 'var(--surface-secondary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {item.room}
            </span>
          )}
        </div>

        {/* Edit/Delete on hover */}
        <div
          className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity rounded-md p-0.5"
          style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(item); }}
            title="Edit Class"
            className="p-0.5 rounded transition-colors hover:bg-gray-100"
            style={{ color: 'var(--text-muted)' }}
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete ${item.code} - ${item.name}?`)) {
                onDelete(item.id);
              }
            }}
            title="Delete Class"
            className="p-0.5 rounded transition-colors hover:bg-red-50"
            style={{ color: 'var(--text-muted)' }}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Middle: Subject name */}
      {!isCompact && (
        <div className="relative z-10 my-0.5 space-y-0.5">
          <h4 className="font-medium text-[10px] leading-snug line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
            {item.name}
          </h4>
          {item.instructor && showInstructor && !isMultiColumn && (
            <p className="text-[9px] flex items-center gap-0.5 truncate" style={{ color: 'var(--text-tertiary)' }}>
              <User className="w-2 h-2 shrink-0" style={{ color: 'var(--text-muted)' }} />
              <span>{item.instructor}</span>
            </p>
          )}
        </div>
      )}

      {/* Bottom: Time */}
      <div
        className="relative z-10 flex items-center justify-between text-[10px] pt-0.5 tabular-nums"
        style={{ color: 'var(--text-tertiary)', borderTop: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-1 truncate">
          <Clock className="w-2.5 h-2.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
          <span>{format12Hour(item.startTime)} – {format12Hour(item.endTime)}</span>
        </div>
        {item.units && !isMultiColumn && (
          <span className="shrink-0" style={{ color: 'var(--text-muted)' }}>
            {item.units}u
          </span>
        )}
      </div>

      {/* Hover tooltip popover */}
      <div
        className="hidden group-hover:block absolute left-0 top-full mt-1.5 p-3 rounded-lg pointer-events-none animate-fade-in min-w-[220px]"
        style={{
          background: 'var(--surface-primary)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 50,
        }}
      >
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="font-semibold text-[13px]" style={{ color: 'var(--text-primary)' }}>
            {item.code}
          </span>
          {item.room && (
            <span
              className="text-[11px] px-1.5 py-0.5 rounded-md"
              style={{ background: 'var(--surface-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
            >
              {item.room}
            </span>
          )}
        </div>
        <p className="text-[13px] font-medium leading-tight mb-1.5" style={{ color: 'var(--text-primary)' }}>
          {item.name}
        </p>
        {item.instructor && (
          <p className="text-[12px] flex items-center gap-1.5 mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            <User className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
            <span>{item.instructor}</span>
          </p>
        )}
        <div
          className="flex items-center justify-between text-[12px] pt-1.5 tabular-nums"
          style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)' }}
        >
          <span>{format12Hour(item.startTime)} – {format12Hour(item.endTime)}</span>
          {item.units && <span>{item.units} Units</span>}
        </div>
      </div>
    </div>
  );
};
