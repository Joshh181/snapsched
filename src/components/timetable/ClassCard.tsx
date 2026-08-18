import React from 'react';
import { Clock, Edit2, Trash2, User } from 'lucide-react';
import { ClassItem } from '../../types/schedule';
import { format12Hour } from '../../hooks/useVacantPeriods';

interface ClassCardProps {
  item: ClassItem;
  topOffset: number;       // In pixels
  height: number;          // In pixels
  onEdit: (item: ClassItem) => void;
  onDelete: (id: string) => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  item,
  topOffset,
  height,
  onEdit,
  onDelete,
}) => {
  const isSmall = height < 50;

  return (
    <div
      style={{
        top: `${topOffset}px`,
        height: `${Math.max(height - 2, 28)}px`,
      }}
      className="absolute left-1 right-1 rounded-md p-1.5 flex flex-col justify-between transition-all duration-150 group border border-zinc-200/90 bg-white hover:border-zinc-300 cursor-pointer hover:z-30 hover:shadow-md select-none overflow-hidden hover:overflow-visible"
      onClick={() => onEdit(item)}
    >
      {/* 3px Solid Left Color Stripe */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 transition-all group-hover:w-1.5" 
        style={{ backgroundColor: item.color || '#2563eb' }} 
      />

      {/* Subtle Background Color Tint */}
      <div 
        className="absolute inset-0 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity pointer-events-none"
        style={{ backgroundColor: item.color || '#2563eb' }}
      />

      {/* Top Header: Code + Room + Action Buttons */}
      <div className="relative z-10 flex items-center justify-between gap-1 pl-1">
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-[11px] font-bold text-zinc-950 font-mono tracking-tight shrink-0">
            {item.code}
          </span>
          {item.room && (
            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-zinc-100 text-zinc-700 border border-zinc-200 truncate">
              {item.room}
            </span>
          )}
        </div>

        {/* Quick Edit / Delete buttons on hover */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity bg-white/95 rounded p-0.5 border border-zinc-200 shadow-2xs">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
            title="Edit Class"
            className="p-0.5 hover:text-zinc-900 text-zinc-500 hover:bg-zinc-100 rounded transition-colors"
          >
            <Edit2 className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete ${item.code} - ${item.name}?`)) {
                onDelete(item.id);
              }
            }}
            title="Delete Class"
            className="p-0.5 hover:text-rose-600 text-zinc-500 hover:bg-zinc-100 rounded transition-colors"
          >
            <Trash2 className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Middle: Full Subject Name (Multi-line wrapped) */}
      {!isSmall && (
        <div className="relative z-10 my-0.5 pl-1 space-y-0.5">
          <h4 className="font-medium text-[10px] text-zinc-800 leading-snug line-clamp-2">
            {item.name}
          </h4>
          {item.instructor && height >= 75 && (
            <p className="text-[9px] text-zinc-500 flex items-center gap-0.5 truncate font-normal">
              <User className="w-2 h-2 text-zinc-400 shrink-0" />
              <span>{item.instructor}</span>
            </p>
          )}
        </div>
      )}

      {/* Bottom: Time range + Units */}
      <div className="relative z-10 flex items-center justify-between text-[10px] text-zinc-500 pt-0.5 border-t border-zinc-100/80 font-mono pl-1">
        <div className="flex items-center gap-1 truncate">
          <Clock className="w-2.5 h-2.5 text-zinc-400 shrink-0" />
          <span>{format12Hour(item.startTime)} – {format12Hour(item.endTime)}</span>
        </div>
        {item.units && (
          <span className="text-[9px] text-zinc-500 font-mono shrink-0">
            {item.units}u
          </span>
        )}
      </div>

      {/* Full Hover Tooltip Popover (Reveals complete details on hover) */}
      <div className="hidden group-hover:block absolute left-0 right-0 top-full mt-1 p-2 rounded-md bg-white border border-zinc-200 shadow-lg z-40 text-left pointer-events-none animate-fade-in min-w-[180px]">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="font-bold text-xs text-zinc-950 font-mono">{item.code}</span>
          <span className="text-[9px] font-mono px-1 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">{item.room}</span>
        </div>
        <p className="text-xs font-medium text-zinc-900 leading-tight mb-1">{item.name}</p>
        {item.instructor && (
          <p className="text-[10px] text-zinc-600 flex items-center gap-1 mb-1">
            <User className="w-2.5 h-2.5 text-zinc-400" />
            <span>{item.instructor}</span>
          </p>
        )}
        <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-1 border-t border-zinc-100">
          <span>{format12Hour(item.startTime)} – {format12Hour(item.endTime)}</span>
          {item.units && <span>{item.units} Units</span>}
        </div>
      </div>
    </div>
  );
};
