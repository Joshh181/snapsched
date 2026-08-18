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
  Calendar
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
        {
          title: 'Rapid Concept Review',
          desc: 'Review definitions, formulas, or flashcards before your next lecture.',
          icon: Zap,
        },
        {
          title: 'Hydrate & Campus Walk',
          desc: 'Take a brisk walk across campus to recharge mental focus.',
          icon: Coffee,
        },
      ];
    } else if (durationMins <= 120) {
      return [
        {
          title: 'Deep Focus Sprint',
          desc: 'Complete two uninterrupted 25m Pomodoro sessions on project code.',
          icon: BookOpen,
        },
        {
          title: 'Meal & Cognitive Rest',
          desc: 'Grab lunch and step away from screens to refresh bandwidth.',
          icon: Smile,
        },
      ];
    } else {
      return [
        {
          title: 'Major Assignment Milestone',
          desc: 'Work through programming lab exercises in the university library.',
          icon: Sparkles,
        },
        {
          title: 'Peer Sync & Group Study',
          desc: 'Review capstone deliverables or discuss lecture problem sets.',
          icon: CheckCircle2,
        },
      ];
    }
  };

  const currentSuggestions = activeBreak ? getSuggestedActivities(activeBreak.durationMinutes) : [];

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBreak || !newTaskInput.trim()) return;

    const breakId = activeBreak.id;
    const currentList = customTasks[breakId] || [];
    const newTask: CustomTask = {
      id: Date.now().toString(),
      text: newTaskInput.trim(),
      done: false,
    };

    setCustomTasks({
      ...customTasks,
      [breakId]: [...currentList, newTask],
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
  const totalBreaksHours = Math.round(
    vacantPeriods.reduce((acc, v) => acc + v.durationMinutes, 0) / 60
  );

  return (
    <div className="space-y-3 max-w-5xl mx-auto select-none animate-fade-in">
      {/* 1. Header Banner with Stats */}
      <div className="p-3.5 rounded-xl bg-white border border-zinc-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-xs text-zinc-950 uppercase tracking-wider font-mono">
              Vacant Break & Focus Planner
            </h2>
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
              {vacantPeriods.length} Breaks Detected
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Transform free timetable intervals into structured study sessions with Pomodoro timeboxing.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block leading-none">Weekly Free Time</span>
            <span className="font-semibold text-zinc-900 text-xs">{totalBreaksHours} Total Hours</span>
          </div>
        </div>
      </div>

      {vacantPeriods.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-1">
          <p className="text-xs font-medium text-zinc-800">No vacant breaks detected in your current schedule.</p>
          <p className="text-[11px] font-mono text-zinc-400">Add classes with time gaps to enable the study planner.</p>
        </div>
      ) : (
        <>
          {/* 2. Sleek Horizontal Break Slot Selector Bar */}
          <div className="p-2 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                <Calendar className="w-3 h-3 text-zinc-400" /> Select Break Window
              </span>
              {activeBreak && (
                <span className="text-[10px] font-mono text-amber-700 font-medium">
                  Active: {activeBreak.day} ({format12Hour(activeBreak.startTime)} – {format12Hour(activeBreak.endTime)})
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {vacantPeriods.map((v) => {
                const isSelected = activeBreak?.id === v.id;
                const dayFull = DAYS_OF_WEEK.find((d) => d.key === v.day)?.short || v.day;

                return (
                  <button
                    key={v.id}
                    onClick={() => setActiveBreak(v)}
                    className={`p-2 rounded-lg border text-left transition-all flex items-center justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-500 shadow-2xs ring-1 ring-blue-500/30'
                        : 'bg-zinc-50/80 hover:bg-zinc-100/70 border-zinc-200 text-zinc-700'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className={`font-bold text-xs ${isSelected ? 'text-blue-900' : 'text-zinc-900'}`}>
                          {dayFull}
                        </span>
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-100/80 text-amber-900 border border-amber-200/80">
                          {v.durationFormatted}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500 truncate mt-0.5">
                        {format12Hour(v.startTime)} – {format12Hour(v.endTime)}
                      </div>
                    </div>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Balanced Dual-Column Workspace (Timer Left + Tasks & Recommendations Right) */}
          {activeBreak && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
              {/* Left Column: Focus Timer (5 Cols) */}
              <div className="md:col-span-5 flex flex-col">
                <FocusTimer
                  initialMinutes={Math.min(activeBreak.durationMinutes, 25)}
                  subjectContext={`${activeBreak.day} Break (${activeBreak.durationFormatted})`}
                />
              </div>

              {/* Right Column: Tasks & Recommendations (7 Cols) */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-3">
                {/* Break Checklist */}
                <div className="p-3.5 rounded-xl bg-white border border-zinc-200 shadow-2xs flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-100 mb-2">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <h4 className="font-semibold text-xs text-zinc-900">
                          Session Checklist
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {activeTasks.filter((t) => t.done).length}/{activeTasks.length} Completed
                      </span>
                    </div>

                    {/* Task List */}
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-0.5">
                      {activeTasks.length === 0 ? (
                        <p className="text-[11px] text-zinc-400 font-mono py-2 text-center">
                          No tasks added yet for this break session.
                        </p>
                      ) : (
                        activeTasks.map((t) => (
                          <div
                            key={t.id}
                            className="flex items-center justify-between p-1.5 rounded-md bg-zinc-50 border border-zinc-150 text-xs group"
                          >
                            <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                              <input
                                type="checkbox"
                                checked={t.done}
                                onChange={() => toggleTask(activeBreak.id, t.id)}
                                className="w-3.5 h-3.5 rounded text-blue-600 border-zinc-300 cursor-pointer focus:ring-0"
                              />
                              <span
                                className={`text-[11px] truncate ${
                                  t.done ? 'line-through text-zinc-400' : 'text-zinc-800'
                                }`}
                              >
                                {t.text}
                              </span>
                            </label>
                            <button
                              onClick={() => deleteTask(activeBreak.id, t.id)}
                              className="text-zinc-400 hover:text-rose-600 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete task"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Add Task Input */}
                  <form onSubmit={handleAddTask} className="flex gap-1.5 pt-2 border-t border-zinc-100 mt-2">
                    <input
                      type="text"
                      value={newTaskInput}
                      onChange={(e) => setNewTaskInput(e.target.value)}
                      placeholder="Add focus objective (e.g. Read Chapter 4)..."
                      className="flex-1 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-blue-500 rounded-md px-2.5 py-1 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </form>
                </div>

                {/* Smart Suggested Activities */}
                <div className="p-3 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-1.5">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                    Recommended for {activeBreak.durationFormatted} Window
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {currentSuggestions.map((sug, idx) => {
                      const Icon = sug.icon;
                      return (
                        <div
                          key={idx}
                          className="p-2 rounded-lg bg-zinc-50/80 border border-zinc-200/80 space-y-0.5"
                        >
                          <div className="flex items-center gap-1.5">
                            <Icon className="w-3 h-3 text-amber-600 shrink-0" />
                            <h4 className="font-semibold text-[11px] text-zinc-900">{sug.title}</h4>
                          </div>
                          <p className="text-[10px] text-zinc-500 leading-tight">{sug.desc}</p>
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
