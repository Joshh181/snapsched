import { useMemo, useState, useEffect } from 'react';
import { ClassItem, VacantPeriod, DayAbbreviation, DAYS_OF_WEEK } from '../types/schedule';

// Helper to convert "HH:mm" to minutes from midnight
export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

// Helper to convert minutes from midnight to "HH:mm"
export const minutesToTime = (totalMinutes: number): string => {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// Helper to format "07:30" to "7:30 AM"
export const format12Hour = (timeStr: string): string => {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
};

// Format minutes into human readable duration
export const formatDuration = (mins: number): string => {
  const hours = Math.floor(mins / 60);
  const remMinutes = mins % 60;
  if (hours > 0 && remMinutes > 0) {
    return `${hours} hr${hours > 1 ? 's' : ''} ${remMinutes} min${remMinutes > 1 ? 's' : ''}`;
  }
  if (hours > 0) {
    return `${hours} hr${hours > 1 ? 's' : ''}`;
  }
  return `${remMinutes} mins`;
};

// Map JavaScript Date.getDay() (0=Sun, 1=Mon, ..., 6=Sat) to DayAbbreviation
export const getTodayAbbreviation = (): DayAbbreviation => {
  const dayIndex = new Date().getDay();
  switch (dayIndex) {
    case 1: return 'M';
    case 2: return 'T';
    case 3: return 'W';
    case 4: return 'TH';
    case 5: return 'F';
    case 6: return 'S';
    default: return 'M'; // Default to Monday if Sunday
  }
};

export const useVacantPeriods = (classes: ClassItem[]) => {
  const [now, setNow] = useState(new Date());

  // Update current time every minute for live countdowns
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const todayAbbr = useMemo(() => getTodayAbbreviation(), [now]);

  // Compute all vacant periods across the whole week
  const allVacantPeriods = useMemo<VacantPeriod[]>(() => {
    const results: VacantPeriod[] = [];

    DAYS_OF_WEEK.forEach((dayInfo) => {
      // Find and sort classes on this day by start time
      const dayClasses = classes
        .filter((c) => c.days.includes(dayInfo.key))
        .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

      if (dayClasses.length < 2) return;

      // Find gaps between consecutive classes
      for (let i = 0; i < dayClasses.length - 1; i++) {
        const currentClass = dayClasses[i];
        const nextClass = dayClasses[i + 1];

        const endMinutes = timeToMinutes(currentClass.endTime);
        const nextStartMinutes = timeToMinutes(nextClass.startTime);
        const gapMinutes = nextStartMinutes - endMinutes;

        // Any gap >= 20 minutes is considered a meaningful vacant period / break
        if (gapMinutes >= 20) {
          results.push({
            id: `vacant-${dayInfo.key}-${i}`,
            day: dayInfo.key,
            dayFull: dayInfo.full,
            startTime: currentClass.endTime,
            endTime: nextClass.startTime,
            durationMinutes: gapMinutes,
            durationFormatted: formatDuration(gapMinutes),
            previousClassName: currentClass.name,
            nextClassName: nextClass.name,
            nextClassRoom: nextClass.room,
            nextClassStartTime: nextClass.startTime,
            isToday: dayInfo.key === todayAbbr,
          });
        }
      }
    });

    return results;
  }, [classes, todayAbbr]);

  // Vacant periods for today only
  const todayVacantPeriods = useMemo(() => {
    return allVacantPeriods.filter((v) => v.day === todayAbbr);
  }, [allVacantPeriods, todayAbbr]);

  // Active / Upcoming current status (Ongoing class, active break, or next class)
  const currentStatus = useMemo(() => {
    const currentMins = now.getHours() * 60 + now.getMinutes();

    const todayClasses = classes
      .filter((c) => c.days.includes(todayAbbr))
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    // Check ongoing class
    const ongoingClass = todayClasses.find(
      (c) => currentMins >= timeToMinutes(c.startTime) && currentMins < timeToMinutes(c.endTime)
    );

    if (ongoingClass) {
      const remainingMins = timeToMinutes(ongoingClass.endTime) - currentMins;
      return {
        type: 'class' as const,
        title: 'Class in Progress',
        subject: ongoingClass,
        details: `${ongoingClass.code} in ${ongoingClass.room}`,
        endsIn: formatDuration(remainingMins),
      };
    }

    // Check ongoing vacant period
    const ongoingBreak = todayVacantPeriods.find(
      (v) => currentMins >= timeToMinutes(v.startTime) && currentMins < timeToMinutes(v.endTime)
    );

    if (ongoingBreak) {
      const remainingBreakMins = timeToMinutes(ongoingBreak.endTime) - currentMins;
      return {
        type: 'break' as const,
        title: 'Vacant Break Period',
        breakItem: ongoingBreak,
        details: `${ongoingBreak.durationFormatted} break before ${ongoingBreak.nextClassName} (${ongoingBreak.nextClassRoom})`,
        endsIn: formatDuration(remainingBreakMins),
      };
    }

    // Next upcoming class today
    const nextClass = todayClasses.find((c) => timeToMinutes(c.startTime) > currentMins);
    if (nextClass) {
      const untilMins = timeToMinutes(nextClass.startTime) - currentMins;
      return {
        type: 'upcoming' as const,
        title: 'Next Class Today',
        subject: nextClass,
        details: `${nextClass.code} at ${format12Hour(nextClass.startTime)} in ${nextClass.room}`,
        startsIn: formatDuration(untilMins),
      };
    }

    return {
      type: 'free' as const,
      title: 'Classes Finished for Today',
      details: todayClasses.length > 0 ? 'All scheduled classes completed! 🎉' : 'No classes scheduled for today.',
    };
  }, [classes, todayAbbr, todayVacantPeriods, now]);

  return {
    allVacantPeriods,
    todayVacantPeriods,
    todayAbbr,
    currentStatus,
    currentTime: now,
  };
};
