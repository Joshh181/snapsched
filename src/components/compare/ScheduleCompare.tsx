import React, { useState, useMemo } from 'react';
import {
  Share2,
  Check,
  Coffee,
  Users2,
  Calendar,
  Clock,
  ArrowRight,
  UserPlus,
  Tag,
} from 'lucide-react';
import { ScheduleSet, FriendSchedule, OverlapFreeSlot, DAYS_OF_WEEK, CategoryItem } from '../../types/schedule';
import { storageService } from '../../services/storageService';
import { timeToMinutes, format12Hour, formatDuration } from '../../hooks/useVacantPeriods';

interface ScheduleCompareProps {
  userSchedule: ScheduleSet;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

export const ScheduleCompare: React.FC<ScheduleCompareProps> = ({
  userSchedule,
  selectedCategory = 'School',
  onSelectCategory,
}) => {
  const [categories] = useState<CategoryItem[]>(() => storageService.getCategories());
  const [friends] = useState<FriendSchedule[]>(() => storageService.getFriends());
  const [selectedFriendId, setSelectedFriendId] = useState<string>(friends[0]?.id || '');
  const [copiedLink, setCopiedLink] = useState(false);

  const activeFriend = friends.find((f) => f.id === selectedFriendId);

  const activeCategoryName = selectedCategory || 'School';

  const commonFreeSlots = useMemo<OverlapFreeSlot[]>(() => {
    if (!activeFriend) return [];
    const results: OverlapFreeSlot[] = [];

    DAYS_OF_WEEK.forEach((dayInfo) => {
      const dayKey = dayInfo.key;
      // Filter user and friend classes strictly by active category
      const userDayClasses = userSchedule.items.filter(
        (c) => c.days.includes(dayKey) && (c.category || 'School').toLowerCase() === activeCategoryName.toLowerCase()
      );
      const friendDayClasses = activeFriend.schedule.items.filter(
        (c) => c.days.includes(dayKey) && (c.category || 'School').toLowerCase() === activeCategoryName.toLowerCase()
      );

      const slotStep = 30;
      let currentFreeStart: number | null = null;

      for (let min = 7 * 60; min <= 21 * 60; min += slotStep) {
        const isUserBusy = userDayClasses.some((c) => min >= timeToMinutes(c.startTime) && min < timeToMinutes(c.endTime));
        const isFriendBusy = friendDayClasses.some((c) => min >= timeToMinutes(c.startTime) && min < timeToMinutes(c.endTime));

        if (!isUserBusy && !isFriendBusy) {
          if (currentFreeStart === null) currentFreeStart = min;
        } else {
          if (currentFreeStart !== null) {
            const duration = min - currentFreeStart;
            if (duration >= 60) {
              results.push({
                id: `overlap-${dayKey}-${currentFreeStart}`,
                day: dayKey,
                dayFull: dayInfo.full,
                startTime: `${Math.floor(currentFreeStart / 60).toString().padStart(2, '0')}:${(currentFreeStart % 60).toString().padStart(2, '0')}`,
                endTime: `${Math.floor(min / 60).toString().padStart(2, '0')}:${(min % 60).toString().padStart(2, '0')}`,
                durationFormatted: formatDuration(duration),
                participants: [userSchedule.studentName || 'You', activeFriend.name],
              });
            }
            currentFreeStart = null;
          }
        }
      }
    });
    return results;
  }, [userSchedule, activeFriend, activeCategoryName]);

  const totalSharedHours = Math.round(
    commonFreeSlots.reduce((acc, slot) => acc + (timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime)), 0) / 60
  );

  const handleCopyShareLink = () => {
    const shareLink = `https://snapsched.app/share/${userSchedule.id || 'schedule'}`;
    navigator.clipboard?.writeText?.(shareLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto select-none animate-fade-in">
      {/* Header */}
      <div
        className="p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
      >
        <div>
          <h2 className="font-semibold text-[16px]" style={{ color: 'var(--text-primary)' }}>
            Schedule Comparison
          </h2>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Compare your <strong>{activeCategoryName}</strong> timetable with friends to find common free time.
          </p>
        </div>
        <button
          onClick={handleCopyShareLink}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-colors"
          style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-default)', background: 'var(--surface-primary)' }}
        >
          {copiedLink ? <Check className="w-4 h-4" style={{ color: 'var(--status-success)' }} /> : <Share2 className="w-4 h-4" />}
          {copiedLink ? 'Link Copied!' : 'Share Timetable'}
        </button>
      </div>

      {/* Category Pill Bar */}
      <div
        className="p-2 rounded-lg flex items-center gap-1.5 overflow-x-auto"
        style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
      >
        <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-1 flex items-center gap-1 text-slate-400 shrink-0">
          <Tag className="w-3 h-3 text-slate-400" />
          Compare Category:
        </span>
        {categories.map((cat) => {
          const isSelected = activeCategoryName.toLowerCase() === cat.name.toLowerCase();
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory?.(cat.name)}
              className="px-3 py-1 rounded-md text-[12px] font-medium transition-all flex items-center gap-1.5 shrink-0"
              style={{
                background: isSelected ? 'var(--brand-50)' : 'var(--surface-secondary)',
                color: isSelected ? 'var(--brand-800)' : 'var(--text-secondary)',
                border: isSelected ? '1px solid var(--brand-400)' : '1px solid var(--border-subtle)',
                fontWeight: isSelected ? 600 : 500,
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {friends.length === 0 ? (
        <div
          className="p-12 text-center rounded-lg space-y-3"
          style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)' }}
        >
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Users2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>
              No Friends Added Yet
            </h3>
            <p className="text-[13px] max-w-md mx-auto mt-1" style={{ color: 'var(--text-secondary)' }}>
              Share your schedule link with classmates or add friend schedules to automatically compare free intervals in {activeCategoryName}.
            </p>
          </div>
          <button
            onClick={handleCopyShareLink}
            className="px-4 py-2 rounded-lg text-white font-medium text-[13px] inline-flex items-center gap-1.5"
            style={{ background: 'var(--brand-600)' }}
          >
            <Share2 className="w-4 h-4" />
            Share Your {activeCategoryName} Schedule
          </button>
        </div>
      ) : (
        <>
          {/* Friend selector */}
          <div
            className="p-3 rounded-lg flex items-center gap-2 overflow-x-auto"
            style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
          >
            <span className="text-[12px] font-medium px-2 shrink-0" style={{ color: 'var(--text-tertiary)' }}>
              Comparing with:
            </span>
            {friends.map((f) => {
              const isSelected = selectedFriendId === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFriendId(f.id)}
                  className="px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all shrink-0 flex items-center gap-2"
                  style={{
                    background: isSelected ? 'var(--brand-50)' : 'var(--surface-secondary)',
                    color: isSelected ? 'var(--brand-800)' : 'var(--text-primary)',
                    border: isSelected ? '1px solid var(--brand-300)' : '1px solid var(--border-subtle)',
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                    style={{ background: f.avatarColor || '#6366f1' }}
                  >
                    {f.name.charAt(0)}
                  </div>
                  <span>{f.name}</span>
                </button>
              );
            })}
          </div>

          {/* Overlap Summary */}
          {activeFriend && (
            <div
              className="p-4 rounded-lg flex items-center justify-between"
              style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-emerald-600 shrink-0"
                  style={{ background: 'var(--status-success-bg)', border: '1px solid var(--status-success-border)' }}
                >
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-[14px]" style={{ color: 'var(--text-primary)' }}>
                    {commonFreeSlots.length} Matching Free Windows
                  </h4>
                  <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                    You and {activeFriend.name} share <strong>{totalSharedHours} hours</strong> of free time in {activeCategoryName}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Free Slots Grid */}
          {commonFreeSlots.length === 0 ? (
            <div
              className="p-8 text-center rounded-lg"
              style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)' }}
            >
              <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                No overlapping free periods found in {activeCategoryName} between you and {activeFriend?.name}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {commonFreeSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="p-3 rounded-lg"
                  style={{
                    background: 'var(--surface-primary)',
                    border: '1px solid var(--border-default)',
                    boxShadow: 'var(--shadow-xs)',
                    borderLeft: '3px solid var(--status-success)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[13px]" style={{ color: 'var(--text-primary)' }}>
                      {slot.dayFull}
                    </span>
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                      style={{ background: 'var(--status-success-bg)', color: 'var(--status-success)' }}
                    >
                      {slot.durationFormatted}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-[12px] tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{format12Hour(slot.startTime)} – {format12Hour(slot.endTime)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
