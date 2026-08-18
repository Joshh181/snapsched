import React, { useState, useEffect } from 'react';
import {
  Coffee,
  Clock,
  CheckCircle2,
  BookOpen,
  Zap,
  Smile,
  Plus,
  Trash2,
  Sparkles,
  Tag,
} from 'lucide-react';
import { VacantPeriod, DAYS_OF_WEEK, CategoryItem } from '../../types/schedule';
import { format12Hour } from '../../hooks/useVacantPeriods';
import { FocusTimer } from './FocusTimer';
import { storageService } from '../../services/storageService';

interface VacantBreakPlannerProps {
  vacantPeriods: VacantPeriod[];
  selectedVacant?: VacantPeriod | null;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

interface CustomTask {
  id: string;
  text: string;
  done: boolean;
}

export const VacantBreakPlanner: React.FC<VacantBreakPlannerProps> = ({
  vacantPeriods,
  selectedVacant,
  selectedCategory = 'School',
  onSelectCategory,
}) => {
  const [categories] = useState<CategoryItem[]>(() => storageService.getCategories());
  const [activeBreak, setActiveBreak] = useState<VacantPeriod | null>(
    selectedVacant || vacantPeriods[0] || null
  );
  const [customTasks, setCustomTasks] = useState<Record<string, CustomTask[]>>({});
  const [newTaskInput, setNewTaskInput] = useState('');

  useEffect(() => {
    if (selectedVacant) {
      setActiveBreak(selectedVacant);
    } else if (!vacantPeriods.some((v) => v.id === activeBreak?.id)) {
      setActiveBreak(vacantPeriods[0] || null);
    }
  }, [vacantPeriods, selectedVacant]);

  const getSuggestedActivities = (durationMins: number) => {
    if (durationMins <= 45) {
      return [
        { title: 'Quick Review', desc: 'Review definitions, formulas, or flashcards before your next class.', icon: Zap },
        { title: 'Recharge Walk', desc: 'Take a brisk walk across campus to refresh your focus.', icon: Coffee },
      ];
    } else if (durationMins <= 120) {
      return [
        { title: 'Deep Focus Sprint', desc: 'Complete two 25-minute Pomodoro sessions on your current project.', icon: BookOpen },
        { title: 'Meal & Rest', desc: 'Grab lunch and step away from screens to recharge.', icon: Smile },
      ];
    } else {
      return [
        { title: 'Assignment Work', desc: 'Work through lab exercises or major project milestones.', icon: Sparkles },
        { title: 'Group Study', desc: 'Review deliverables or discuss problem sets with classmates.', icon: CheckCircle2 },
      ];
    }
  };

  const currentSuggestions = activeBreak ? getSuggestedActivities(activeBreak.durationMinutes) : [];

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBreak || !newTaskInput.trim()) return;
    const breakId = activeBreak.id;
    const currentList = customTasks[breakId] || [];
    setCustomTasks({
      ...customTasks,
      [breakId]: [...currentList, { id: Date.now().toString(), text: newTaskInput.trim(), done: false }],
    });
    setNewTaskInput('');
  };

  const toggleTask = (breakId: string, taskId: string) => {
    const list = customTasks[breakId] || [];
    setCustomTasks({
      ...customTasks,
      [breakId]: list.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
    });
  };

  const deleteTask = (breakId: string, taskId: string) => {
    const list = customTasks[breakId] || [];
    setCustomTasks({
      ...customTasks,
      [breakId]: list.filter((t) => t.id !== taskId),
    });
  };

  const activeTasks = activeBreak ? customTasks[activeBreak.id] || [] : [];
  const totalBreaksHours = Math.round(vacantPeriods.reduce((acc, v) => acc + v.durationMinutes, 0) / 60);

  return (
    <div className="space-y-4 max-w-5xl mx-auto select-none animate-fade-in">
      {/* Page header */}
      <div
        className="p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
      >
        <div>
          <h2 className="font-semibold text-[16px]" style={{ color: 'var(--text-primary)' }}>
            Study Planner
          </h2>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Turn free intervals in your <strong>{selectedCategory}</strong> schedule into focused sessions.
            <span
              className="inline-flex items-center ml-2 px-2 py-0.5 rounded-md text-[12px] font-medium"
              style={{ background: 'var(--status-warning-bg)', color: '#92400e', border: '1px solid var(--status-warning-border)' }}
            >
              {vacantPeriods.length} free periods in {selectedCategory}
            </span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>Weekly free time ({selectedCategory})</div>
          <div className="font-semibold text-[15px] tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {totalBreaksHours} hours
          </div>
        </div>
      </div>

      {/* Category Pill Bar */}
      <div
        className="p-2 rounded-lg flex items-center gap-1.5 overflow-x-auto"
        style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
      >
        <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-1 flex items-center gap-1 text-slate-400 shrink-0">
          <Tag className="w-3 h-3 text-slate-400" />
          Category:
        </span>
        {categories.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
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

      {vacantPeriods.length === 0 ? (
        <div
          className="p-10 text-center rounded-lg"
          style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)' }}
        >
          <Coffee className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            No free intervals detected in {selectedCategory}
          </p>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Add at least 2 classes with time gaps on the same day in <strong>{selectedCategory}</strong> to calculate study breaks.
          </p>
        </div>
      ) : (
        <>
          {/* Break slot selector */}
          <div
            className="p-3 rounded-lg space-y-2"
            style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
          >
            <div className="flex items-center justify-between px-1">
              <span className="text-[12px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                Select a free period in {selectedCategory}
              </span>
              {activeBreak && (
                <span className="text-[12px]" style={{ color: 'var(--status-warning)' }}>
                  {activeBreak.day} · {format12Hour(activeBreak.startTime)} – {format12Hour(activeBreak.endTime)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {vacantPeriods.map((v) => {
                const isSelected = activeBreak?.id === v.id;
                const dayFull = DAYS_OF_WEEK.find((d) => d.key === v.day)?.short || v.day;
                return (
                  <button
                    key={v.id}
                    onClick={() => setActiveBreak(v)}
                    className="p-2.5 rounded-lg text-left transition-all flex items-center justify-between gap-1.5"
                    style={{
                      background: isSelected ? 'var(--brand-50)' : 'var(--surface-secondary)',
                      border: isSelected ? '1px solid var(--brand-400)' : '1px solid var(--border-subtle)',
                    }}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[13px]" style={{ color: isSelected ? 'var(--brand-800)' : 'var(--text-primary)' }}>
                          {dayFull}
                        </span>
                        <span
                          className="text-[11px] font-medium px-1.5 py-0.5 rounded-md"
                          style={{ background: 'var(--status-warning-bg)', color: '#92400e', border: '1px solid var(--status-warning-border)' }}
                        >
                          {v.durationFormatted}
                        </span>
                      </div>
                      <div className="text-[11px] mt-0.5 tabular-nums" style={{ color: 'var(--text-tertiary)' }}>
                        {format12Hour(v.startTime)} – {format12Hour(v.endTime)}
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

          {/* Timer + Tasks workspace */}
          {activeBreak && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
              {/* Timer */}
              <div className="md:col-span-5 flex flex-col">
                <FocusTimer
                  initialMinutes={Math.min(activeBreak.durationMinutes, 25)}
                  subjectContext={`${activeBreak.day} (${activeBreak.durationFormatted})`}
                />
              </div>

              {/* Tasks + Suggestions */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                {/* Checklist */}
                <div
                  className="p-4 rounded-lg flex-1 flex flex-col justify-between"
                  style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
                >
                  <div>
                    <h3 className="font-semibold text-[14px] mb-1" style={{ color: 'var(--text-primary)' }}>
                      Tasks for this break
                    </h3>
                    <p className="text-[12px] mb-3" style={{ color: 'var(--text-tertiary)' }}>
                      Keep track of specific goals during this {activeBreak.durationFormatted} window.
                    </p>

                    {/* Task list */}
                    <div className="space-y-1.5 max-h-48 overflow-y-auto mb-3 pr-1">
                      {activeTasks.length === 0 ? (
                        <p className="text-[12px] italic py-2" style={{ color: 'var(--text-muted)' }}>
                          No tasks created yet for this break slot.
                        </p>
                      ) : (
                        activeTasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center justify-between gap-2 p-2 rounded-md transition-colors"
                            style={{ background: 'var(--surface-secondary)' }}
                          >
                            <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                              <input
                                type="checkbox"
                                checked={task.done}
                                onChange={() => toggleTask(activeBreak.id, task.id)}
                                className="w-4 h-4 rounded cursor-pointer accent-indigo-600"
                              />
                              <span
                                className="text-[13px] truncate"
                                style={{
                                  textDecoration: task.done ? 'line-through' : 'none',
                                  color: task.done ? 'var(--text-muted)' : 'var(--text-primary)',
                                }}
                              >
                                {task.text}
                              </span>
                            </label>
                            <button
                              onClick={() => deleteTask(activeBreak.id, task.id)}
                              className="p-1 text-slate-400 hover:text-red-500 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Add task form */}
                  <form onSubmit={handleAddTask} className="flex gap-2 pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <input
                      type="text"
                      value={newTaskInput}
                      onChange={(e) => setNewTaskInput(e.target.value)}
                      placeholder="Add a study goal..."
                      className="flex-1 px-3 py-1.5 text-[13px] rounded-lg border focus:outline-none"
                      style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg text-white font-medium text-[13px] flex items-center gap-1 shrink-0"
                      style={{ background: 'var(--brand-600)' }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </form>
                </div>

                {/* Suggestions */}
                <div
                  className="p-4 rounded-lg"
                  style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
                >
                  <h4 className="font-semibold text-[13px] mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Recommended for {activeBreak.durationFormatted}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentSuggestions.map((sug, idx) => {
                      const Icon = sug.icon;
                      return (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg flex items-start gap-2.5"
                          style={{ background: 'var(--surface-secondary)' }}
                        >
                          <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-[12px]" style={{ color: 'var(--text-primary)' }}>
                              {sug.title}
                            </div>
                            <p className="text-[11px] mt-0.5 leading-snug" style={{ color: 'var(--text-secondary)' }}>
                              {sug.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
