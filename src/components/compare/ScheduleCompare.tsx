import React, { useState, useMemo } from 'react';
import { 
  Share2, 
  Check, 
  Coffee, 
  Users2,
  Calendar,
  Clock,
  ArrowRight
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

  // Compute common free time between user and selected friend
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
        const isUserBusy = userDayClasses.some(
          (c) => min >= timeToMinutes(c.startTime) && min < timeToMinutes(c.endTime)
        );
        const isFriendBusy = friendDayClasses.some(
          (c) => min >= timeToMinutes(c.startTime) && min < timeToMinutes(c.endTime)
        );

        const isBothFree = !isUserBusy && !isFriendBusy;

        if (isBothFree) {
          if (currentFreeStart === null) {
            currentFreeStart = min;
          }
        } else {
          if (currentFreeStart !== null) {
            const duration = min - currentFreeStart;
            if (duration >= 60) {
              const startH = Math.floor(currentFreeStart / 60);
              const startM = currentFreeStart % 60;
              const endH = Math.floor(min / 60);
              const endM = min % 60;

              results.push({
                id: `overlap-${dayKey}-${currentFreeStart}`,
                day: dayKey,
                dayFull: dayInfo.full,
                startTime: `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}`,
                endTime: `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`,
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

  const totalSharedHours = Math.round(
    commonFreeSlots.reduce((acc, slot) => {
      const start = timeToMinutes(slot.startTime);
      const end = timeToMinutes(slot.endTime);
      return acc + (end - start);
    }, 0) / 60
  );

  const handleCopyShareLink = () => {
    const fakeLink = `https://snapsched.app/share/${userSchedule.id || '2026-sem1'}`;
    navigator.clipboard?.writeText?.(fakeLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-3 max-w-5xl mx-auto select-none animate-fade-in">
      {/* 1. Header Banner */}
      <div className="p-3.5 rounded-xl bg-white border border-zinc-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-xs text-zinc-950 uppercase tracking-wider font-mono">
              Schedule Comparison & Free Time Matcher
            </h2>
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Sync Engine
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Compare timetables with classmates to discover common vacant periods for collaborative study sessions.
          </p>
        </div>

        {/* Share Action */}
        <button
          onClick={handleCopyShareLink}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium border border-zinc-200 transition-colors shadow-2xs"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-zinc-600" />}
          <span>{copiedLink ? 'Link Copied!' : 'Share Timetable'}</span>
        </button>
      </div>

      {/* 2. Horizontal Classmate Switcher Strip */}
      <div className="p-2.5 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold flex items-center gap-1">
            <Users2 className="w-3 h-3 text-zinc-400" /> Select Classmate to Compare
          </span>
          {activeFriend && (
            <span className="text-[10px] font-mono text-zinc-500">
              Comparing: <strong className="text-zinc-900">{activeFriend.name}</strong> ({activeFriend.course})
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
                className={`p-2.5 rounded-lg border text-left transition-all flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-500 shadow-2xs ring-1 ring-blue-500/30'
                    : 'bg-zinc-50/80 hover:bg-zinc-100/70 border-zinc-200 text-zinc-700'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-bold text-xs ${isSelected ? 'text-blue-900' : 'text-zinc-900'}`}>
                      {f.name}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-400">
                      {f.course}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                    {f.schedule.items.length} classes enrolled
                  </div>
                </div>
                {isSelected ? (
                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 ring-2 ring-blue-200"></span>
                ) : (
                  <span className="text-[10px] font-mono text-zinc-400">Select</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Common Free Slots Grid */}
      <div className="p-3.5 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Coffee className="w-3.5 h-3.5 text-amber-600" />
            <h3 className="font-semibold text-xs text-zinc-900">
              Mutual Free Windows ({commonFreeSlots.length} Slots Available)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
            {totalSharedHours} Total Shared Hours
          </span>
        </div>

        {commonFreeSlots.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400 font-mono">
            No overlapping 60+ minute free periods detected with {activeFriend?.name}.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {commonFreeSlots.map((slot) => (
              <div
                key={slot.id}
                className="p-2.5 rounded-lg bg-zinc-50/80 hover:bg-zinc-100/80 border border-zinc-200 transition-colors flex flex-col justify-between gap-2 group"
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-zinc-400" />
                    <span className="font-bold text-xs text-zinc-900 font-mono">{slot.dayFull}</span>
                  </div>
                  <span className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-200">
                    {slot.durationFormatted} Free
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-600 pt-1 border-t border-zinc-200/60">
                  <div className="flex items-center gap-1 text-zinc-700">
                    <Clock className="w-2.5 h-2.5 text-zinc-400" />
                    <span>{format12Hour(slot.startTime)} – {format12Hour(slot.endTime)}</span>
                  </div>
                  <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    <span>Study</span>
                    <ArrowRight className="w-2.5 h-2.5" />
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
