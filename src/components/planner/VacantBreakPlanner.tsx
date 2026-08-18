import React, { useState } from 'react';
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
} from 'lucide-react';
import { VacantPeriod, DAYS_OF_WEEK } from '../../types/schedule';
import { format12Hour } from '../../hooks/useVacantPeriods';
import { FocusTimer } from './FocusTimer';

interface VacantBreakPlannerProps {
  vacantPeriods: VacantPeriod[];
  selectedVacant?: VacantPeriod | null;
}

interface CustomTask {
  id: string;
  text: string;
  done: boolean;
}

export const VacantBreakPlanner: React.FC<VacantBreakPlannerProps> = ({
  vacantPeriods,
  selectedVacant,
}) => {
  const [activeBreak, setActiveBreak] = useState<VacantPeriod | null>(
    selectedVacant || vacantPeriods[0] || null
  );
  const [customTasks, setCustomTasks] = useState<Record<string, CustomTask[]>>({});
  const [newTaskInput, setNewTaskInput] = useState('');

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
            Turn free periods into productive study sessions.
            <span
              className="inline-flex items-center ml-2 px-2 py-0.5 rounded-md text-[12px] font-medium"
              style={{ background: 'var(--status-warning-bg)', color: '#92400e', border: '1px solid var(--status-warning-border)' }}
            >
              {vacantPeriods.length} free periods detected
            </span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>Weekly free time</div>
          <div className="font-semibold text-[15px] tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {totalBreaksHours} hours
          </div>
        </div>
      </div>

      {vacantPeriods.length === 0 ? (
        <div
          className="p-10 text-center rounded-lg"
          style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)' }}
        >
          <Coffee className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>No free periods detected</p>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-tertiary)' }}>Add classes with time gaps to enable the study planner.</p>
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
                Select a free period
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
                    <div className="flex items-center justify-between pb-2 mb-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--brand-600)' }} />
                        <h4 className="font-semibold text-[14px]" style={{ color: 'var(--text-primary)' }}>
                          Session Checklist
                        </h4>
                      </div>
                      <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                        {activeTasks.filter((t) => t.done).length}/{activeTasks.length}
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                      {activeTasks.length === 0 ? (
                        <p className="text-[13px] py-3 text-center" style={{ color: 'var(--text-muted)' }}>
                          No tasks yet. Add one below.
                        </p>
                      ) : (
                        activeTasks.map((t) => (
                          <div
                            key={t.id}
                            className="flex items-center justify-between p-2 rounded-lg text-[13px] group"
                            style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border-subtle)' }}
                          >
                            <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                              <input
                                type="checkbox"
                                checked={t.done}
                                onChange={() => toggleTask(activeBreak.id, t.id)}
                                className="w-4 h-4 rounded cursor-pointer accent-[var(--brand-600)]"
                              />
                              <span
                                className="truncate"
                                style={{
                                  color: t.done ? 'var(--text-muted)' : 'var(--text-primary)',
                                  textDecoration: t.done ? 'line-through' : 'none',
                                }}
                              >
                                {t.text}
                              </span>
                            </label>
                            <button
                              onClick={() => deleteTask(activeBreak.id, t.id)}
                              className="p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-red-50"
                              title="Delete task"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleAddTask} className="flex gap-2 pt-3 mt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <input
                      type="text"
                      value={newTaskInput}
                      onChange={(e) => setNewTaskInput(e.target.value)}
                      placeholder="Add a study objective..."
                      className="flex-1 text-[13px] px-3 py-2 rounded-lg focus:outline-none"
                      style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 rounded-lg text-white text-[13px] font-medium transition-colors flex items-center gap-1"
                      style={{ background: 'var(--text-primary)', boxShadow: 'var(--shadow-xs)' }}
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </form>
                </div>

                {/* Suggestions */}
                <div
                  className="p-3 rounded-lg space-y-2"
                  style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
                >
                  <div className="text-[12px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                    Suggested for {activeBreak.durationFormatted}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentSuggestions.map((sug, idx) => {
                      const Icon = sug.icon;
                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-lg space-y-1"
                          style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border-subtle)' }}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 shrink-0" style={{ color: 'var(--status-warning)' }} />
                            <h4 className="font-semibold text-[13px]" style={{ color: 'var(--text-primary)' }}>{sug.title}</h4>
                          </div>
                          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{sug.desc}</p>
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
