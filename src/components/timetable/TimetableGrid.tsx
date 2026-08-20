import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ListFilter,
  Clock,
  ChevronLeft,
  ChevronRight,
  Columns3,
  CalendarDays,
  Plus,
  X,
  Tag,
  Trash2,
  CheckSquare,
} from 'lucide-react';
import { ClassItem, VacantPeriod, DAYS_OF_WEEK, DayAbbreviation, CategoryItem } from '../../types/schedule';
import { ClassCard } from './ClassCard';
import { VacantCard } from './VacantCard';
import { timeToMinutes, format12Hour } from '../../hooks/useVacantPeriods';
import { storageService } from '../../services/storageService';
import { COLOR_PALETTES } from '../../data/sampleSchedules';

interface TimetableGridProps {
  classes: ClassItem[];
  vacantPeriods: VacantPeriod[];
  todayAbbr: DayAbbreviation;
  currentTime: Date;
  onEditClass: (item: ClassItem) => void;
  onDeleteClass: (id: string) => void;
  onAddClass?: () => void;
  onSelectVacant?: (vacant: VacantPeriod) => void;
  selectedCategory?: string;
  onSelectCategory?: (cat: string) => void;
  onClearCategory?: (cat: string) => void;
  onDeleteMultiple?: (ids: string[]) => void;
}

interface PositionedClass {
  item: ClassItem;
  topOffset: number;
  height: number;
  leftPercent: number;
  widthPercent: number;
}

function calculateClassLayout(
  dayClasses: ClassItem[],
  startHour: number,
  hourHeight: number
): PositionedClass[] {
  if (dayClasses.length === 0) return [];

  const sorted = [...dayClasses].sort((a, b) => {
    const startA = timeToMinutes(a.startTime);
    const startB = timeToMinutes(b.startTime);
    if (startA !== startB) return startA - startB;
    const durA = timeToMinutes(a.endTime) - startA;
    const durB = timeToMinutes(b.endTime) - startB;
    return durB - durA;
  });

  const clusters: ClassItem[][] = [];
  let currentCluster: ClassItem[] = [];
  let clusterEnd = -1;

  for (const item of sorted) {
    const sMin = timeToMinutes(item.startTime);
    const eMin = timeToMinutes(item.endTime);

    if (currentCluster.length === 0 || sMin < clusterEnd) {
      currentCluster.push(item);
      clusterEnd = Math.max(clusterEnd, eMin);
    } else {
      clusters.push(currentCluster);
      currentCluster = [item];
      clusterEnd = eMin;
    }
  }
  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  const results: PositionedClass[] = [];

  for (const cluster of clusters) {
    const columns: ClassItem[][] = [];

    for (const item of cluster) {
      const sMin = timeToMinutes(item.startTime);
      let placed = false;

      for (let colIdx = 0; colIdx < columns.length; colIdx++) {
        const lastInCol = columns[colIdx][columns[colIdx].length - 1];
        if (timeToMinutes(lastInCol.endTime) <= sMin) {
          columns[colIdx].push(item);
          placed = true;
          break;
        }
      }

      if (!placed) {
        columns.push([item]);
      }
    }

    const totalCols = columns.length;

    columns.forEach((col, colIdx) => {
      col.forEach((item) => {
        const startMin = timeToMinutes(item.startTime);
        const endMin = timeToMinutes(item.endTime);
        const topOffset = ((startMin - startHour * 60) / 60) * hourHeight;
        const height = ((endMin - startMin) / 60) * hourHeight;
        const leftPercent = (colIdx / totalCols) * 100;
        const widthPercent = (1 / totalCols) * 100;

        results.push({
          item,
          topOffset,
          height,
          leftPercent,
          widthPercent,
        });
      });
    });
  }

  return results;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  classes,
  vacantPeriods,
  todayAbbr,
  currentTime,
  onEditClass,
  onDeleteClass,
  onSelectVacant,
  selectedCategory: propCategory,
  onSelectCategory,
  onClearCategory,
  onDeleteMultiple,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'agenda'>('grid');
  const [selectedDayFilter, setSelectedDayFilter] = useState<DayAbbreviation | 'ALL'>('ALL');
  const [isBatchSelectMode, setIsBatchSelectMode] = useState(false);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  
  // Categories state
  const [categories, setCategories] = useState<CategoryItem[]>(() => storageService.getCategories());
  const [internalCategory, setInternalCategory] = useState<string>(() => {
    const stored = storageService.getCategories();
    return stored[0]?.name || 'School';
  });

  const activeCategoryName = propCategory || internalCategory;

  const handleSelectCat = (catName: string) => {
    setInternalCategory(catName);
    onSelectCategory?.(catName);
    setSelectedClassIds([]);
  };
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(COLOR_PALETTES[0]);

  // Mobile layout sub-mode: 'single-day' or 'full-week-scroll'
  const [mobileLayout, setMobileLayout] = useState<'single-day' | 'week-scroll'>('single-day');

  // Mobile single day index
  const [mobileDayIndex, setMobileDayIndex] = useState(() => {
    const todayIdx = DAYS_OF_WEEK.findIndex(d => d.key === todayAbbr);
    return todayIdx >= 0 ? todayIdx : 0;
  });

  // Touch swipe handling for mobile single day navigation
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) >= 45) {
      if (deltaX < 0) {
        setMobileDayIndex((prev) => Math.min(DAYS_OF_WEEK.length - 1, prev + 1));
      } else {
        setMobileDayIndex((prev) => Math.max(0, prev - 1));
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  useEffect(() => {
    if (propCategory) {
      setInternalCategory(propCategory);
    }
  }, [propCategory]);

  useEffect(() => {
    setCategories(storageService.getCategories());
  }, [classes]);

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const created = storageService.addCategory(newCatName.trim(), newCatColor);
    setCategories(storageService.getCategories());
    handleSelectCat(created.name);
    setNewCatName('');
    setIsAddingCategory(false);
  };

  // Filter classes by active category
  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      const itemCat = c.category || 'School';
      return itemCat.toLowerCase() === activeCategoryName.toLowerCase();
    });
  }, [classes, activeCategoryName]);

  const hourHeight = 44;

  const { startHour, endHour } = useMemo(() => {
    if (filteredClasses.length === 0) return { startHour: 7, endHour: 18 };

    let earliest = 7;
    let latest = 18;

    filteredClasses.forEach((c) => {
      const sMin = timeToMinutes(c.startTime);
      const eMin = timeToMinutes(c.endTime);
      const sH = Math.floor(sMin / 60);
      const eH = Math.ceil(eMin / 60);

      if (sH < earliest) earliest = Math.max(sH, 6);
      if (eH > latest) latest = Math.min(eH, 22);
    });

    return { startHour: earliest, endHour: Math.max(latest, earliest + 9) };
  }, [filteredClasses]);

  const hours = useMemo(() => {
    return Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
  }, [startHour, endHour]);

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const currentLineTop = ((currentMinutes - startHour * 60) / 60) * hourHeight;
  const isCurrentTimeVisible = currentMinutes >= startHour * 60 && currentMinutes <= endHour * 60;

  const activeDays = selectedDayFilter === 'ALL'
    ? DAYS_OF_WEEK
    : DAYS_OF_WEEK.filter(d => d.key === selectedDayFilter);

  const mobileDay = DAYS_OF_WEEK[mobileDayIndex];

  return (
    <div className="space-y-4 select-none">
      {/* ── Category Pill Bar (Floating Card) ── */}
      <div
        className="p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3"
        style={{
          background: 'var(--surface-primary)',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
        }}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider px-1.5 sm:px-2.5 py-1 flex items-center gap-1.5 text-slate-400 shrink-0">
            <Tag className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Category:</span>
          </span>

          {/* Category Pills */}
          {categories.map((cat) => {
            const isSelected = activeCategoryName.toLowerCase() === cat.name.toLowerCase();
            const count = classes.filter((c) => (c.category || 'School').toLowerCase() === cat.name.toLowerCase()).length;

            return (
              <button
                key={cat.id}
                onClick={() => handleSelectCat(cat.name)}
                className="px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
                style={{
                  background: isSelected ? 'var(--brand-50)' : 'var(--surface-secondary)',
                  color: isSelected ? 'var(--brand-800)' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid var(--brand-300)' : '1px solid transparent',
                  fontWeight: isSelected ? 700 : 500,
                }}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="whitespace-nowrap">{cat.name}</span>
                {count > 0 && (
                  <span
                    className="text-[10px] px-1.5 py-0.2 rounded font-mono shrink-0"
                    style={{
                      background: isSelected ? 'var(--brand-100)' : 'var(--surface-primary)',
                      color: isSelected ? 'var(--brand-700)' : 'var(--text-muted)',
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Category Actions: Clear Category & Add Category */}
        <div className="shrink-0 flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l sm:pl-2.5" style={{ borderColor: 'var(--border-subtle)' }}>
          {filteredClasses.length > 0 ? (
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete all ${filteredClasses.length} item(s) in "${activeCategoryName}"?`)) {
                  onClearCategory?.(activeCategoryName);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium text-red-500 bg-red-50/90 hover:bg-red-100 transition-colors active:scale-95 shrink-0"
              title={`Clear all ${activeCategoryName} items`}
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>Clear {activeCategoryName} ({filteredClasses.length})</span>
            </button>
          ) : (
            <span className="text-[11px] text-slate-400 font-medium sm:hidden">
              0 {activeCategoryName} items
            </span>
          )}

          {isAddingCategory ? (
            <form onSubmit={handleCreateCategory} className="flex items-center gap-1">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Category name..."
                autoFocus
                className="px-2.5 py-1 text-[11px] rounded-full border focus:outline-none w-28"
                style={{ background: 'var(--surface-secondary)', borderColor: 'var(--brand-400)', color: 'var(--text-primary)' }}
              />
              <button
                type="submit"
                className="p-1 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 text-[11px]"
                title="Save Category"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsAddingCategory(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-gray-100"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingCategory(true)}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-medium text-indigo-600 bg-indigo-50/90 hover:bg-indigo-100 transition-colors active:scale-95 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Category</span>
            </button>
          )}
        </div>
      </div>

      {/* Control Bar (Floating Card) */}
      <div
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl"
        style={{
          background: 'var(--surface-primary)',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
        }}
      >
        {/* View toggle (Grid / Agenda) */}
        <div className="flex items-center justify-between gap-2">
          <div
            className="flex p-1 rounded-xl"
            style={{ background: 'var(--surface-secondary)' }}
          >
            <button
              onClick={() => setViewMode('grid')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all"
              style={{
                background: viewMode === 'grid' ? 'white' : 'transparent',
                color: viewMode === 'grid' ? 'var(--brand-700)' : 'var(--text-tertiary)',
                boxShadow: viewMode === 'grid' ? 'var(--shadow-xs)' : 'none',
                fontWeight: viewMode === 'grid' ? 700 : 500,
              }}
            >
              <CalendarIcon className="w-4 h-4" style={{ color: viewMode === 'grid' ? 'var(--brand-600)' : 'var(--text-muted)' }} />
              <span className="hidden sm:inline">Weekly Grid</span>
              <span className="sm:hidden">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all"
              style={{
                background: viewMode === 'agenda' ? 'white' : 'transparent',
                color: viewMode === 'agenda' ? 'var(--brand-700)' : 'var(--text-tertiary)',
                boxShadow: viewMode === 'agenda' ? 'var(--shadow-xs)' : 'none',
                fontWeight: viewMode === 'agenda' ? 700 : 500,
              }}
            >
              <ListFilter className="w-4 h-4" style={{ color: viewMode === 'agenda' ? 'var(--brand-600)' : 'var(--text-muted)' }} />
              <span>Agenda</span>
            </button>
          </div>

          {/* Mobile view sub-toggle (Single Day vs Scrollable Full Week) */}
          {viewMode === 'grid' && (
            <div className="flex sm:hidden p-1 rounded-xl" style={{ background: 'var(--surface-secondary)' }}>
              <button
                onClick={() => setMobileLayout('single-day')}
                title="Single Day with Swipe"
                className="p-1.5 rounded-lg text-[12px] transition-colors"
                style={{
                  background: mobileLayout === 'single-day' ? 'white' : 'transparent',
                  color: mobileLayout === 'single-day' ? 'var(--brand-700)' : 'var(--text-tertiary)',
                  boxShadow: mobileLayout === 'single-day' ? 'var(--shadow-xs)' : 'none',
                }}
              >
                <CalendarDays className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMobileLayout('week-scroll')}
                title="Full Week Scroll"
                className="p-1.5 rounded-lg text-[12px] transition-colors"
                style={{
                  background: mobileLayout === 'week-scroll' ? 'white' : 'transparent',
                  color: mobileLayout === 'week-scroll' ? 'var(--brand-700)' : 'var(--text-tertiary)',
                  boxShadow: mobileLayout === 'week-scroll' ? 'var(--shadow-xs)' : 'none',
                }}
              >
                <Columns3 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Day filter tabs for Desktop */}
        <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto max-w-full">
          <button
            onClick={() => setSelectedDayFilter('ALL')}
            className="px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all"
            style={{
              background: selectedDayFilter === 'ALL' ? 'var(--brand-600)' : 'transparent',
              color: selectedDayFilter === 'ALL' ? 'white' : 'var(--text-secondary)',
              boxShadow: selectedDayFilter === 'ALL' ? '0 2px 8px -2px rgba(79, 70, 229, 0.4)' : 'none',
            }}
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
                className="px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all flex items-center gap-1"
                style={{
                  background: isSelected
                    ? 'var(--brand-600)'
                    : isToday
                      ? 'var(--brand-50)'
                      : 'transparent',
                  color: isSelected
                    ? 'white'
                    : isToday
                      ? 'var(--brand-700)'
                      : 'var(--text-secondary)',
                  boxShadow: isSelected ? '0 2px 8px -2px rgba(79, 70, 229, 0.4)' : 'none',
                }}
              >
                <span>{d.short}</span>
                {isToday && !isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--brand-600)' }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile day navigator (Mon - Sat buttons + Swipe indicator) */}
        {viewMode === 'grid' && mobileLayout === 'single-day' && (
          <div className="flex sm:hidden items-center gap-1.5 w-full justify-between pt-1 border-t sm:border-t-0" style={{ borderColor: 'var(--border-subtle)' }}>
            <button
              onClick={() => setMobileDayIndex(Math.max(0, mobileDayIndex - 1))}
              disabled={mobileDayIndex === 0}
              className="p-1.5 rounded-lg transition-colors disabled:opacity-20"
              style={{ color: 'var(--text-secondary)' }}
              aria-label="Previous day"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-1 flex-1 justify-around">
              {DAYS_OF_WEEK.map((d, idx) => {
                const isToday = d.key === todayAbbr;
                const isCurrent = idx === mobileDayIndex;
                const dayClassCount = filteredClasses.filter(c => c.days.includes(d.key)).length;

                return (
                  <button
                    key={d.key}
                    onClick={() => setMobileDayIndex(idx)}
                    className="relative px-2.5 py-1 rounded-lg text-[12px] font-medium flex flex-col items-center justify-center transition-all"
                    style={{
                      background: isCurrent ? 'var(--brand-600)' : isToday ? 'var(--brand-50)' : 'transparent',
                      color: isCurrent ? 'white' : isToday ? 'var(--brand-700)' : 'var(--text-secondary)',
                      fontWeight: isCurrent || isToday ? 600 : 500,
                    }}
                  >
                    <span>{d.short}</span>
                    {dayClassCount > 0 && !isCurrent && (
                      <span className="w-1 h-1 rounded-full mt-0.5" style={{ background: isToday ? 'var(--brand-600)' : 'var(--text-muted)' }} />
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setMobileDayIndex(Math.min(DAYS_OF_WEEK.length - 1, mobileDayIndex + 1))}
              disabled={mobileDayIndex === DAYS_OF_WEEK.length - 1}
              className="p-1.5 rounded-lg transition-colors disabled:opacity-20"
              style={{ color: 'var(--text-secondary)' }}
              aria-label="Next day"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        <>
          {/* Desktop full-week grid OR mobile when 'week-scroll' is selected */}
          <div
            className={`${mobileLayout === 'week-scroll' ? 'block' : 'hidden sm:block'} rounded-3xl overflow-hidden`}
            style={{
              background: 'var(--surface-primary)',
              boxShadow: 'var(--shadow-card)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
            }}
          >
            <div className="overflow-x-auto">
              <div className="min-w-[800px] w-full">
                {/* Header row */}
                <div
                  className="grid grid-cols-[56px_repeat(6,1fr)] sticky top-0 z-20"
                  style={{ background: 'var(--surface-secondary)', borderBottom: '1px solid var(--border-default)' }}
                >
                  <div
                    className="p-2 flex items-center justify-center"
                    style={{ borderRight: '1px solid var(--border-subtle)' }}
                  >
                    <Clock className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                  </div>

                  {DAYS_OF_WEEK.map((d) => {
                    const isToday = d.key === todayAbbr;
                    const dayClasses = filteredClasses.filter((c) => c.days.includes(d.key));
                    return (
                      <div
                        key={d.key}
                        className="py-2 px-1 text-center"
                        style={{
                          borderRight: '1px solid var(--border-subtle)',
                          background: isToday ? 'var(--brand-50)' : 'transparent',
                        }}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <span
                            className="font-semibold text-[13px]"
                            style={{ color: isToday ? 'var(--brand-800)' : 'var(--text-primary)' }}
                          >
                            {d.full}
                          </span>
                          {isToday && (
                            <span
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md text-white"
                              style={{ background: 'var(--brand-600)' }}
                            >
                              Today
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                          {dayClasses.length} {dayClasses.length === 1 ? 'class' : 'classes'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Grid body */}
                <div
                  className="relative grid grid-cols-[56px_repeat(6,1fr)]"
                  style={{ height: `${hours.length * hourHeight}px` }}
                >
                  {/* Time axis */}
                  <div style={{ borderRight: '1px solid var(--border-subtle)', background: 'var(--surface-secondary)' }}>
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        style={{
                          height: `${hourHeight}px`,
                          borderBottom: '1px solid var(--border-subtle)',
                          color: 'var(--text-muted)',
                        }}
                        className="pr-2 pt-1 text-right text-[10px] tabular-nums"
                      >
                        {format12Hour(`${hour}:00`)}
                      </div>
                    ))}
                  </div>

                  {/* Day columns */}
                  {DAYS_OF_WEEK.map((d) => {
                    const isToday = d.key === todayAbbr;
                    const dayClasses = filteredClasses.filter((c) => c.days.includes(d.key));
                    const dayVacant = vacantPeriods.filter((v) => v.day === d.key);
                    const positionedClasses = calculateClassLayout(dayClasses, startHour, hourHeight);

                    return (
                      <div
                        key={d.key}
                        className="relative"
                        style={{
                          borderRight: '1px solid var(--border-subtle)',
                          background: isToday ? 'rgba(79, 70, 229, 0.02)' : 'transparent',
                        }}
                      >
                        {hours.map((hour) => (
                          <div
                            key={hour}
                            style={{ height: `${hourHeight}px`, borderBottom: '1px solid var(--border-subtle)' }}
                          />
                        ))}

                        {/* Positioned Classes with collision resolution */}
                        {positionedClasses.map((pos) => (
                          <ClassCard
                            key={pos.item.id}
                            item={pos.item}
                            topOffset={pos.topOffset}
                            height={pos.height}
                            leftPercent={pos.leftPercent}
                            widthPercent={pos.widthPercent}
                            onEdit={onEditClass}
                            onDelete={onDeleteClass}
                          />
                        ))}

                        {/* Vacant periods */}
                        {dayVacant.map((vacant) => {
                          const startMin = timeToMinutes(vacant.startTime);
                          const topOff = ((startMin - startHour * 60) / 60) * hourHeight;
                          const h = (vacant.durationMinutes / 60) * hourHeight;
                          return (
                            <VacantCard
                              key={vacant.id}
                              vacant={vacant}
                              topOffset={topOff}
                              height={h}
                              onSelectVacant={onSelectVacant}
                            />
                          );
                        })}

                        {isToday && isCurrentTimeVisible && (
                          <div
                            style={{ top: `${currentLineTop}px` }}
                            className="absolute left-0 right-0 z-30 flex items-center pointer-events-none"
                          >
                            <div className="w-2 h-2 rounded-full -ml-1" style={{ background: '#e11d48', boxShadow: '0 0 0 2px #fda4af' }} />
                            <div className="w-full h-[1.5px]" style={{ background: '#e11d48' }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile single-day grid with touch swipe gestures */}
          {mobileLayout === 'single-day' && (
            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="sm:hidden rounded-lg overflow-hidden transition-all"
              style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}
            >
              {/* Mobile day header */}
              <div className="px-4 py-3" style={{ background: 'var(--surface-secondary)', borderBottom: '1px solid var(--border-default)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>
                      {mobileDay.full}
                    </span>
                    {mobileDay.key === todayAbbr && (
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md text-white"
                        style={{ background: 'var(--brand-600)' }}
                      >
                        Today
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                      {filteredClasses.filter(c => c.days.includes(mobileDay.key)).length} items
                    </span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-primary)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                      Swipe ⇄
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile time grid */}
              <div
                className="relative grid grid-cols-[48px_1fr]"
                style={{ height: `${hours.length * hourHeight}px` }}
              >
                {/* Time axis */}
                <div style={{ borderRight: '1px solid var(--border-subtle)', background: 'var(--surface-secondary)' }}>
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      style={{
                        height: `${hourHeight}px`,
                        borderBottom: '1px solid var(--border-subtle)',
                        color: 'var(--text-muted)',
                      }}
                      className="pr-1.5 pt-1 text-right text-[10px] tabular-nums"
                    >
                      {format12Hour(`${hour}:00`)}
                    </div>
                  ))}
                </div>

                {/* Single day column with collision resolution */}
                <div className="relative">
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      style={{ height: `${hourHeight}px`, borderBottom: '1px solid var(--border-subtle)' }}
                    />
                  ))}

                  {calculateClassLayout(
                    filteredClasses.filter(c => c.days.includes(mobileDay.key)),
                    startHour,
                    hourHeight
                  ).map((pos) => (
                    <ClassCard
                      key={pos.item.id}
                      item={pos.item}
                      topOffset={pos.topOffset}
                      height={pos.height}
                      leftPercent={pos.leftPercent}
                      widthPercent={pos.widthPercent}
                      onEdit={onEditClass}
                      onDelete={onDeleteClass}
                    />
                  ))}

                  {vacantPeriods.filter(v => v.day === mobileDay.key).map((vacant) => {
                    const startMin = timeToMinutes(vacant.startTime);
                    const topOff = ((startMin - startHour * 60) / 60) * hourHeight;
                    const h = (vacant.durationMinutes / 60) * hourHeight;
                    return (
                      <VacantCard
                        key={vacant.id}
                        vacant={vacant}
                        topOffset={topOff}
                        height={h}
                        onSelectVacant={onSelectVacant}
                      />
                    );
                  })}

                  {mobileDay.key === todayAbbr && isCurrentTimeVisible && (
                    <div
                      style={{ top: `${currentLineTop}px` }}
                      className="absolute left-0 right-0 z-30 flex items-center pointer-events-none"
                    >
                      <div className="w-2 h-2 rounded-full -ml-1" style={{ background: '#e11d48', boxShadow: '0 0 0 2px #fda4af' }} />
                      <div className="w-full h-[1.5px]" style={{ background: '#e11d48' }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* AGENDA VIEW */}
      {viewMode === 'agenda' && (
        <div className="space-y-3 relative pb-16">
          {/* Agenda Toolbar: Select Multiple Toggle */}
          {filteredClasses.length > 0 && (
            <div
              className="p-2.5 rounded-lg flex items-center justify-between gap-2"
              style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {filteredClasses.length} item(s) in {activeCategoryName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsBatchSelectMode(!isBatchSelectMode);
                  setSelectedClassIds([]);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors"
                style={{
                  background: isBatchSelectMode ? 'var(--brand-50)' : 'var(--surface-secondary)',
                  color: isBatchSelectMode ? 'var(--brand-700)' : 'var(--text-secondary)',
                  border: isBatchSelectMode ? '1px solid var(--brand-300)' : '1px solid var(--border-subtle)',
                }}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>{isBatchSelectMode ? 'Done Selecting' : 'Select Multiple'}</span>
              </button>
            </div>
          )}

          {/* Sticky Floating Bulk Action Bar */}
          {isBatchSelectMode && (
            <div
              className="sticky top-2 z-30 p-3 rounded-lg flex items-center justify-between gap-3 animate-slide-in-left"
              style={{
                background: 'var(--text-primary)',
                color: 'white',
                boxShadow: 'var(--shadow-overlay)',
              }}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedClassIds.length === filteredClasses.length && filteredClasses.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedClassIds(filteredClasses.map((c) => c.id));
                    } else {
                      setSelectedClassIds([]);
                    }
                  }}
                  className="w-4 h-4 rounded cursor-pointer accent-indigo-500"
                />
                <span className="text-[13px] font-semibold">
                  {selectedClassIds.length} of {filteredClasses.length} selected
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedClassIds.length === 0) return;
                    if (confirm(`Delete all ${selectedClassIds.length} selected item(s)?`)) {
                      onDeleteMultiple?.(selectedClassIds);
                      setSelectedClassIds([]);
                      setIsBatchSelectMode(false);
                    }
                  }}
                  disabled={selectedClassIds.length === 0}
                  className="px-3.5 py-1.5 rounded-md text-[12px] font-semibold bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 disabled:opacity-40 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedClassIds.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsBatchSelectMode(false);
                    setSelectedClassIds([]);
                  }}
                  className="px-2.5 py-1.5 rounded-md text-[12px] font-medium text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {activeDays.map((d) => {
            const isToday = d.key === todayAbbr;
            const dayClasses = filteredClasses
              .filter((c) => c.days.includes(d.key))
              .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
            const dayVacant = vacantPeriods.filter((v) => v.day === d.key);

            return (
              <div
                key={d.key}
                className="p-4 rounded-3xl transition-all"
                style={{
                  background: 'var(--surface-primary)',
                  boxShadow: 'var(--shadow-card)',
                  border: isToday ? '1px solid var(--brand-300)' : '1px solid rgba(255, 255, 255, 0.8)',
                }}
              >
                {/* Day header */}
                <div className="flex items-center justify-between pb-2 mb-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[14px]" style={{ color: 'var(--text-primary)' }}>
                      {d.full}
                    </h3>
                    {isToday && (
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md text-white"
                        style={{ background: 'var(--brand-600)' }}
                      >
                        Today
                      </span>
                    )}
                  </div>
                  <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                    {dayClasses.length} {dayClasses.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Day items */}
                {dayClasses.length === 0 ? (
                  <div className="py-6 text-center text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                    No items scheduled for {d.full} in {activeCategoryName}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dayClasses.map((item) => {
                      const breakAfter = dayVacant.find((v) => v.startTime === item.endTime);
                      const isSelectedInBatch = selectedClassIds.includes(item.id);

                      return (
                        <React.Fragment key={item.id}>
                          <div
                            onClick={() => {
                              if (isBatchSelectMode) {
                                setSelectedClassIds((prev) =>
                                  prev.includes(item.id)
                                    ? prev.filter((id) => id !== item.id)
                                    : [...prev, item.id]
                                );
                              } else {
                                onEditClass(item);
                              }
                            }}
                            className="p-3 rounded-lg cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-2 group relative overflow-hidden"
                            style={{
                              background: isSelectedInBatch ? 'var(--brand-50)' : 'var(--surface-secondary)',
                              border: isSelectedInBatch ? '1px solid var(--brand-400)' : '1px solid var(--border-subtle)',
                              borderLeft: `3px solid ${item.color || '#4f46e5'}`,
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelectedInBatch) {
                                e.currentTarget.style.background = 'var(--surface-tertiary)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelectedInBatch) {
                                e.currentTarget.style.background = 'var(--surface-secondary)';
                                e.currentTarget.style.boxShadow = 'none';
                              }
                            }}
                          >
                            <div className="flex items-center gap-3">
                              {isBatchSelectMode && (
                                <input
                                  type="checkbox"
                                  checked={isSelectedInBatch}
                                  onChange={() => {}}
                                  className="w-4 h-4 rounded cursor-pointer accent-indigo-600 shrink-0"
                                />
                              )}
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-[13px]" style={{ color: 'var(--text-primary)' }}>
                                    {item.code}
                                  </span>
                                  {item.category && (
                                    <span
                                      className="text-[10px] px-1.5 py-0.2 rounded font-medium"
                                      style={{ background: 'var(--surface-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                                    >
                                      {item.category}
                                    </span>
                                  )}
                                  {item.room && (
                                    <span
                                      className="text-[11px] px-1.5 py-0.5 rounded-md"
                                      style={{ background: 'var(--surface-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                                    >
                                      {item.room}
                                    </span>
                                  )}
                                  {item.units && (
                                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                                      {item.units} units
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-[13px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                                  {item.name}
                                </h4>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <div
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] tabular-nums"
                                style={{
                                  background: 'var(--surface-primary)',
                                  border: '1px solid var(--border-subtle)',
                                  color: 'var(--text-secondary)',
                                }}
                              >
                                <Clock className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                                <span>{format12Hour(item.startTime)} – {format12Hour(item.endTime)}</span>
                              </div>

                              {!isBatchSelectMode && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(`Delete ${item.code} - ${item.name}?`)) {
                                      onDeleteClass(item.id);
                                    }
                                  }}
                                  title="Delete Item"
                                  aria-label="Delete Item"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Break after */}
                          {breakAfter && (
                            <div
                              onClick={() => onSelectVacant?.(breakAfter)}
                              className="p-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors text-[13px]"
                              style={{
                                background: 'var(--status-warning-bg)',
                                border: '1px dashed var(--status-warning-border)',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#fef3c7'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--status-warning-bg)'; }}
                            >
                              <div className="flex items-center gap-2">
                                <span style={{ color: '#92400e' }} className="font-medium">
                                  {breakAfter.durationFormatted} free
                                </span>
                                <span className="text-[12px]" style={{ color: '#b45309' }}>
                                  {format12Hour(breakAfter.startTime)} – {format12Hour(breakAfter.endTime)}
                                </span>
                              </div>
                              <span className="font-semibold text-[12px]" style={{ color: '#92400e' }}>
                                Plan →
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
