import React, { useState, useMemo } from 'react';
import {
  Share2,
  Check,
  Coffee,
  Users2,
  Calendar,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { ScheduleSet, FriendSchedule, OverlapFreeSlot, DAYS_OF_WEEK } from '../../types/schedule';
import { storageService } from '../../services/storageService';
import { timeToMinutes, format12Hour, formatDuration } from '../../hooks/useVacantPeriods';

interface ScheduleCompareProps {
  userSchedule: ScheduleSet;
}

export const ScheduleCompare: React.FC<ScheduleCompareProps> = ({ userSchedule }) => {
  const [friends] = useState<FriendSchedule[]>(() => storageService.getFriends());
  const [selectedFriendId, setSelectedFriendId] = useState<string>(friends[0]?.id || '');
  const [copiedLink, setCopiedLink] = useState(false);

  const activeFriend = friends.find((f) => f.id === selectedFriendId);

  const commonFreeSlots = useMemo<OverlapFreeSlot[]>(() => {
    if (!activeFriend) return [];
    const results: OverlapFreeSlot[] = [];
    DAYS_OF_WEEK.forEach((dayInfo) => {
      const dayKey = dayInfo.key;
      const userDayClasses = userSchedule.items.filter((c) => c.days.includes(dayKey));
      const friendDayClasses = activeFriend.schedule.items.filter((c) => c.days.includes(dayKey));
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
  }, [userSchedule, activeFriend]);

  const totalSharedHours = Math.round(commonFreeSlots.reduce((acc, slot) => acc + (timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime)), 0) / 60);

  const handleCopyShareLink = () => {
    const fakeLink = `https://snapsched.app/share/${userSchedule.id || '2026-sem1'}`;
    navigator.clipboard?.writeText?.(fakeLink);
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
            Compare timetables with classmates to find common free time.
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

      {/* Classmate selector */}
      <div
        className="p-3 rounded-lg space-y-2"
        style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
      >
        <div className="flex items-center justify-between px-1">
          <span className="text-[12px] font-medium flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
            <Users2 className="w-3.5 h-3.5" /> Select classmate
          </span>
          {activeFriend && (
            <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
              Comparing: <strong style={{ color: 'var(--text-primary)' }}>{activeFriend.name}</strong> ({activeFriend.course})
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {friends.map((f) => {
            const isSelected = f.id === selectedFriendId;
            return (
              <button
                key={f.id}
                onClick={() => setSelectedFriendId(f.id)}
                className="p-3 rounded-lg text-left transition-all flex items-center justify-between gap-2"
                style={{
                  background: isSelected ? 'var(--brand-50)' : 'var(--surface-secondary)',
                  border: isSelected ? '1px solid var(--brand-400)' : '1px solid var(--border-subtle)',
                }}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[13px]" style={{ color: isSelected ? 'var(--brand-800)' : 'var(--text-primary)' }}>
                      {f.name}
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{f.course}</span>
                  </div>
                  <div className="text-[12px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    {f.schedule.items.length} classes
                  </div>
                </div>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--brand-600)' }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Free slots */}
      <div
        className="p-4 rounded-lg space-y-3"
        style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
      >
        <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4" style={{ color: 'var(--status-warning)' }} />
            <h3 className="font-semibold text-[14px]" style={{ color: 'var(--text-primary)' }}>
              Shared Free Time ({commonFreeSlots.length} windows)
            </h3>
          </div>
          <span
            className="text-[12px] font-medium px-2.5 py-1 rounded-md"
            style={{ background: 'var(--status-success-bg)', color: '#065f46', border: '1px solid var(--status-success-border)' }}
          >
            {totalSharedHours} hours total
          </span>
        </div>

        {commonFreeSlots.length === 0 ? (
          <div className="py-10 text-center" style={{ color: 'var(--text-tertiary)' }}>
            <Users2 className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>No overlapping free time found</p>
            <p className="text-[13px] mt-1">No 60+ minute shared free periods with {activeFriend?.name}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {commonFreeSlots.map((slot) => (
              <div
                key={slot.id}
                className="p-3 rounded-lg flex flex-col justify-between gap-2 group transition-all"
                style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border-subtle)' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                    <span className="font-semibold text-[13px]" style={{ color: 'var(--text-primary)' }}>{slot.dayFull}</span>
                  </div>
                  <span
                    className="text-[11px] font-medium px-1.5 py-0.5 rounded-md"
                    style={{ background: 'var(--status-warning-bg)', color: '#92400e', border: '1px solid var(--status-warning-border)' }}
                  >
                    {slot.durationFormatted}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[12px] pt-1.5" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <div className="flex items-center gap-1 tabular-nums">
                    <Clock className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                    {format12Hour(slot.startTime)} – {format12Hour(slot.endTime)}
                  </div>
                  <span
                    className="font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
                    style={{ color: 'var(--brand-600)' }}
                  >
                    Study <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
