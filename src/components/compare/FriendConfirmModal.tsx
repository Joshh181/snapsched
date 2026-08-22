import React, { useState } from 'react';
import { Check, X, Users2, Calendar, Clock, MapPin, ChevronDown, Sparkles, BookOpen } from 'lucide-react';
import { FriendSchedule } from '../../types/schedule';
import { format12Hour } from '../../hooks/useVacantPeriods';

interface FriendConfirmModalProps {
  isOpen: boolean;
  friendData: FriendSchedule | null;
  onConfirm: (friend: FriendSchedule) => void;
  onCancel: () => void;
}

export const FriendConfirmModal: React.FC<FriendConfirmModalProps> = ({
  isOpen,
  friendData,
  onConfirm,
  onCancel,
}) => {
  const [showFullSchedule, setShowFullSchedule] = useState(true);

  if (!isOpen || !friendData) return null;

  const items = friendData.schedule?.items || [];
  const categoriesPresent = Array.from(new Set(items.map((i) => i.category || 'School')));

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 animate-overlay-in select-none z-50"
      style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        className="w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] rounded-2xl bg-white shadow-2xl border border-slate-200 animate-scale-in"
      >
        {/* Header Banner */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 relative">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-extrabold text-white shadow-md ring-4 ring-white"
              style={{ background: friendData.avatarColor || '#6366f1' }}
            >
              {friendData.name.charAt(0).toUpperCase()}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  Timetable Scanned
                </span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <Sparkles className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 leading-tight">
                {friendData.name}
              </h3>
              <p className="text-xs font-medium text-slate-500">
                {friendData.course || 'Student Schedule'}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-200/60">
            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/60 text-center">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Classes</span>
              <span className="text-sm font-black text-slate-800">{items.length}</span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/60 text-center">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Categories</span>
              <span className="text-sm font-black text-slate-800">{categoriesPresent.length}</span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/60 text-center">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Semester</span>
              <span className="text-sm font-black text-slate-800 truncate block">{friendData.schedule?.semester || 'Current'}</span>
            </div>
          </div>
        </div>

        {/* Schedule Preview Accordion */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">
              Schedule Summary ({items.length} subjects)
            </span>
            <button
              onClick={() => setShowFullSchedule(!showFullSchedule)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>{showFullSchedule ? 'Collapse' : 'Expand'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFullSchedule ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showFullSchedule && (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {items.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-400">
                  No classes found in timetable.
                </div>
              ) : (
                items.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{item.code}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-white border border-slate-200 text-slate-600 font-semibold">
                          {item.days.join('')}
                        </span>
                        <span className="text-[10px] text-slate-400">({item.category || 'School'})</span>
                      </div>
                      <div className="text-[11.5px] text-slate-600 truncate">{item.name}</div>
                    </div>

                    <div className="text-right shrink-0 text-slate-500 font-mono text-[11px]">
                      <div className="font-semibold">{format12Hour(item.startTime)} - {format12Hour(item.endTime)}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[90px]">{item.room || 'General'}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-100 text-xs text-emerald-900 leading-relaxed flex items-start gap-2.5 mt-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Accepting will add <strong>{friendData.name}</strong> to your comparison list and instantly calculate mutual vacant windows across both your schedules.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="py-2.5 rounded-xl font-bold text-xs border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
          >
            Decline / Cancel
          </button>

          <button
            type="button"
            onClick={() => onConfirm(friendData)}
            className="py-2.5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            <Check className="w-4 h-4" />
            <span>Accept & Compare Free Time</span>
          </button>
        </div>
      </div>
    </div>
  );
};
