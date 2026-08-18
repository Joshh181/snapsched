import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ListFilter, 
  Clock 
} from 'lucide-react';
import { ClassItem, VacantPeriod, DAYS_OF_WEEK, DayAbbreviation } from '../../types/schedule';
import { ClassCard } from './ClassCard';
import { VacantCard } from './VacantCard';
import { timeToMinutes, format12Hour } from '../../hooks/useVacantPeriods';

interface TimetableGridProps {
  classes: ClassItem[];
  vacantPeriods: VacantPeriod[];
  todayAbbr: DayAbbreviation;
  currentTime: Date;
  onEditClass: (item: ClassItem) => void;
  onDeleteClass: (id: string) => void;
  onAddClass?: () => void;
  onSelectVacant?: (vacant: VacantPeriod) => void;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  classes,
  vacantPeriods,
  todayAbbr,
  currentTime,
  onEditClass,
  onDeleteClass,
  onSelectVacant,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'agenda'>('grid');
  const [selectedDayFilter, setSelectedDayFilter] = useState<DayAbbreviation | 'ALL'>('ALL');
  
  // 40px locked hour scale
  const hourHeight = 40;

  // Dynamically compute earliest and latest hours from classes (bounded between 7 AM and 8 PM)
  const { startHour, endHour } = useMemo(() => {
    if (classes.length === 0) return { startHour: 7, endHour: 18 };

    let earliest = 7;
    let latest = 18;

    classes.forEach((c) => {
      const sMin = timeToMinutes(c.startTime);
      const eMin = timeToMinutes(c.endTime);
      const sH = Math.floor(sMin / 60);
      const eH = Math.ceil(eMin / 60);

      if (sH < earliest) earliest = Math.max(sH, 6);
      if (eH > latest) latest = Math.min(eH, 22);
    });

    return { startHour: earliest, endHour: Math.max(latest, earliest + 9) };
  }, [classes]);

  // Hours array [startHour, ..., endHour]
  const hours = useMemo(() => {
    return Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
  }, [startHour, endHour]);

  // Compute current time line position
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const currentLineTop = ((currentMinutes - startHour * 60) / 60) * hourHeight;
  const isCurrentTimeVisible = currentMinutes >= startHour * 60 && currentMinutes <= endHour * 60;

  // Filtered days list
  const activeDays = selectedDayFilter === 'ALL' 
    ? DAYS_OF_WEEK 
    : DAYS_OF_WEEK.filter(d => d.key === selectedDayFilter);

  return (
    <div className="space-y-2 select-none">
      {/* Control Bar: View Switcher + Day Filters (No Scale Buttons) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-1.5 rounded-lg bg-white border border-zinc-200 shadow-2xs">
        {/* Left: View Mode Toggle */}
        <div className="flex p-0.5 bg-zinc-100 rounded-md border border-zinc-200">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>Weekly Grid</span>
          </button>
          <button
            onClick={() => setViewMode('agenda')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'agenda'
                ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5 text-blue-600" />
            <span>Daily Agenda</span>
          </button>
        </div>

        {/* Right: Day Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-0.5 sm:pb-0">
          <button
            onClick={() => setSelectedDayFilter('ALL')}
            className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
              selectedDayFilter === 'ALL'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-transparent'
            }`}
          >
            All
          </button>
          {DAYS_OF_WEEK.map((d) => {
            const isToday = d.key === todayAbbr;
            const isSelected = selectedDayFilter === d.key;
            return (
              <button
                key={d.key}
                onClick={() => setSelectedDayFilter(d.key)}
                className={`px-2 py-0.5 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
                  isSelected
                    ? 'bg-zinc-800 text-white font-semibold'
                    : isToday
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-transparent'
                }`}
              >
                <span>{d.short}</span>
                {isToday && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW 1: WEEKLY FULL GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="rounded-lg bg-white border border-zinc-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <div className="min-w-[840px] w-full">
              {/* Header: Days row */}
              <div className="grid grid-cols-[60px_repeat(6,1fr)] border-b border-zinc-200 bg-zinc-50/90 sticky top-0 z-20">
                {/* Time Axis corner */}
                <div className="p-1.5 text-center text-xs font-mono text-zinc-400 border-r border-zinc-200 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                </div>

                {/* Day Columns Headers */}
                {DAYS_OF_WEEK.map((d) => {
                  const isToday = d.key === todayAbbr;
                  const dayClasses = classes.filter((c) => c.days.includes(d.key));
                  return (
                    <div
                      key={d.key}
                      className={`py-1.5 px-1 text-center border-r border-zinc-200 last:border-r-0 transition-colors ${
                        isToday ? 'bg-blue-50/70' : ''
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span
                          className={`font-semibold text-xs tracking-tight ${
                            isToday ? 'text-blue-800' : 'text-zinc-800'
                          }`}
                        >
                          {d.full}
                        </span>
                        {isToday && (
                          <span className="text-[9px] uppercase font-mono font-semibold px-1 rounded bg-blue-600 text-white">
                            Today
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        {dayClasses.length} {dayClasses.length === 1 ? 'Class' : 'Classes'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Body: Time slots grid */}
              <div
                className="relative grid grid-cols-[60px_repeat(6,1fr)]"
                style={{ height: `${hours.length * hourHeight}px` }}
              >
                {/* Left Column: Time Axis Rulers */}
                <div className="border-r border-zinc-200 bg-zinc-50/40 select-none">
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      style={{ height: `${hourHeight}px` }}
                      className="border-b border-zinc-200/80 pr-1.5 pt-0.5 text-right text-[10px] font-mono text-zinc-400"
                    >
                      {format12Hour(`${hour}:00`)}
                    </div>
                  ))}
                </div>

                {/* Day Columns */}
                {DAYS_OF_WEEK.map((d) => {
                  const isToday = d.key === todayAbbr;
                  const dayClasses = classes.filter((c) => c.days.includes(d.key));
                  const dayVacant = vacantPeriods.filter((v) => v.day === d.key);

                  return (
                    <div
                      key={d.key}
                      className={`relative border-r border-zinc-200 last:border-r-0 ${
                        isToday ? 'bg-blue-50/[0.15]' : ''
                      }`}
                    >
                      {/* Hour background grid lines */}
                      {hours.map((hour) => (
                        <div
                          key={hour}
                          style={{ height: `${hourHeight}px` }}
                          className="border-b border-zinc-100"
                        />
                      ))}

                      {/* Render Class Cards on this day */}
                      {dayClasses.map((item) => {
                        const startMin = timeToMinutes(item.startTime);
                        const endMin = timeToMinutes(item.endTime);
                        const topOffset = ((startMin - startHour * 60) / 60) * hourHeight;
                        const durationMins = endMin - startMin;
                        const height = (durationMins / 60) * hourHeight;

                        return (
                          <ClassCard
                            key={item.id}
                            item={item}
                            topOffset={topOffset}
                            height={height}
                            onEdit={onEditClass}
                            onDelete={onDeleteClass}
                          />
                        );
                      })}

                      {/* Render Vacant Break Cards on this day */}
                      {dayVacant.map((vacant) => {
                        const startMin = timeToMinutes(vacant.startTime);
                        const topOffset = ((startMin - startHour * 60) / 60) * hourHeight;
                        const height = (vacant.durationMinutes / 60) * hourHeight;

                        return (
                          <VacantCard
                            key={vacant.id}
                            vacant={vacant}
                            topOffset={topOffset}
                            height={height}
                            onSelectVacant={onSelectVacant}
                          />
                        );
                      })}

                      {/* Real-time laser line (Only on Today column) */}
                      {isToday && isCurrentTimeVisible && (
                        <div
                          style={{ top: `${currentLineTop}px` }}
                          className="absolute left-0 right-0 z-30 flex items-center pointer-events-none"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 -ml-0.5 ring-2 ring-rose-300" />
                          <div className="w-full h-[1.5px] bg-rose-500" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: DAILY AGENDA VIEW */}
      {viewMode === 'agenda' && (
        <div className="space-y-2">
          {activeDays.map((d) => {
            const isToday = d.key === todayAbbr;
            const dayClasses = classes
              .filter((c) => c.days.includes(d.key))
              .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
            const dayVacant = vacantPeriods.filter((v) => v.day === d.key);

            return (
              <div
                key={d.key}
                className={`p-2.5 rounded-lg border transition-colors ${
                  isToday
                    ? 'bg-white border-blue-300 shadow-xs'
                    : 'bg-white border-zinc-200'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100 mb-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-xs text-zinc-900">
                      {d.full}
                    </h3>
                    {isToday && (
                      <span className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                        Today
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {dayClasses.length} {dayClasses.length === 1 ? 'class' : 'classes'} •{' '}
                    {dayVacant.length} {dayVacant.length === 1 ? 'break' : 'breaks'}
                  </span>
                </div>

                {/* Day Items List */}
                {dayClasses.length === 0 ? (
                  <div className="py-3 text-center text-zinc-400 text-xs font-mono">
                    No classes scheduled for {d.full}.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {dayClasses.map((item) => {
                      const breakAfter = dayVacant.find((v) => v.startTime === item.endTime);

                      return (
                        <React.Fragment key={item.id}>
                          {/* Class Row */}
                          <div
                            onClick={() => onEditClass(item)}
                            className="p-2 rounded-md bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-200 cursor-pointer transition-colors flex flex-col md:flex-row md:items-center justify-between gap-2 group relative overflow-hidden"
                          >
                            <div 
                              className="absolute left-0 top-0 bottom-0 w-1" 
                              style={{ backgroundColor: item.color || '#2563eb' }}
                            />

                            <div className="flex items-center gap-2.5 pl-1">
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-xs text-zinc-950 font-mono">
                                    {item.code}
                                  </span>
                                  {item.room && (
                                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white text-zinc-700 border border-zinc-200">
                                      {item.room}
                                    </span>
                                  )}
                                  {item.units && (
                                    <span className="text-[9px] font-mono text-zinc-500">
                                      {item.units}u
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-normal text-xs text-zinc-700">
                                  {item.name}
                                </h4>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded border border-zinc-200 text-xs font-mono text-zinc-600 shadow-2xs">
                              <Clock className="w-3 h-3 text-zinc-400" />
                              <span>{format12Hour(item.startTime)} – {format12Hour(item.endTime)}</span>
                            </div>
                          </div>

                          {/* Break Banner */}
                          {breakAfter && (
                            <div 
                              onClick={() => onSelectVacant?.(breakAfter)}
                              className="p-1.5 rounded-md border border-dashed border-amber-300 bg-amber-50/60 flex items-center justify-between cursor-pointer hover:bg-amber-100/60 transition-colors text-xs font-mono"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-amber-800 font-medium">
                                  ☕ {breakAfter.durationFormatted} Break
                                </span>
                                <span className="text-amber-700 text-[11px]">
                                  ({format12Hour(breakAfter.startTime)} – {format12Hour(breakAfter.endTime)})
                                </span>
                              </div>
                              <span className="text-amber-700 hover:text-amber-900 font-semibold text-[10px]">
                                Plan Focus →
                              </span>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
