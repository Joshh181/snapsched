import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FocusTimerProps {
  initialMinutes?: number;
  subjectContext?: string;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  initialMinutes = 25,
  subjectContext,
}) => {
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const workDuration = initialMinutes;
  const breakDuration = 5;
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  useEffect(() => {
    setTimeLeft(mode === 'work' ? workDuration * 60 : breakDuration * 60);
    setIsRunning(false);
  }, [mode, workDuration, breakDuration]);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (mode === 'work') {
        setCompletedSessions((prev) => prev + 1);
        try { confetti({ particleCount: 35, spread: 50 }); } catch (e) {}
        setMode('break');
      } else {
        setMode('work');
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? workDuration * 60 : breakDuration * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalDuration = mode === 'work' ? workDuration * 60 : breakDuration * 60;
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;

  const strokeColor = mode === 'work' ? 'var(--brand-600)' : 'var(--status-warning)';
  const buttonBg = isRunning
    ? 'var(--status-error)'
    : mode === 'work'
      ? 'var(--brand-600)'
      : 'var(--status-warning)';

  return (
    <div
      className="p-5 rounded-lg flex flex-col items-center justify-between gap-5 select-none h-full"
      style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Mode toggle */}
      <div
        className="flex items-center gap-1 p-0.5 rounded-lg"
        style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border-subtle)' }}
      >
        <button
          onClick={() => setMode('work')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors"
          style={{
            background: mode === 'work' ? 'var(--surface-primary)' : 'transparent',
            color: mode === 'work' ? 'var(--text-primary)' : 'var(--text-tertiary)',
            boxShadow: mode === 'work' ? 'var(--shadow-xs)' : 'none',
            fontWeight: mode === 'work' ? 600 : 500,
          }}
        >
          25m Focus
        </button>
        <button
          onClick={() => setMode('break')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors"
          style={{
            background: mode === 'break' ? 'var(--surface-primary)' : 'transparent',
            color: mode === 'break' ? '#92400e' : 'var(--text-tertiary)',
            boxShadow: mode === 'break' ? 'var(--shadow-xs)' : 'none',
            fontWeight: mode === 'break' ? 600 : 500,
          }}
        >
          5m Rest
        </button>
      </div>

      {/* Progress ring */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" strokeWidth="4" fill="transparent"
            style={{ stroke: 'var(--border-subtle)' }}
          />
          <circle cx="50" cy="50" r="42"
            style={{
              stroke: strokeColor,
              strokeDasharray: 264,
              strokeDashoffset: 264 - (264 * progressPercent) / 100,
              transition: 'stroke-dashoffset 300ms ease-out',
            }}
            strokeWidth="4" strokeLinecap="round" fill="transparent"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="font-semibold text-3xl tabular-nums" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </span>
          <span className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
            {mode === 'work' ? 'Focus' : 'Rest'}
          </span>
        </div>
      </div>

      {/* Context */}
      {subjectContext && (
        <div
          className="text-[12px] px-3 py-1 rounded-lg max-w-xs truncate text-center"
          style={{ background: 'var(--surface-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
        >
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{subjectContext}</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={resetTimer}
          title="Reset Timer"
          className="p-2 rounded-lg transition-colors hover:bg-gray-100"
          style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={toggleTimer}
          className="px-5 py-2 rounded-lg font-medium text-[13px] text-white transition-colors flex items-center gap-1.5"
          style={{ background: buttonBg, boxShadow: 'var(--shadow-xs)' }}
        >
          {isRunning ? (
            <><Pause className="w-4 h-4" /> Pause</>
          ) : (
            <><Play className="w-4 h-4" /> Start</>
          )}
        </button>
      </div>

      {/* Sessions count */}
      <div className="text-[12px] flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
        <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--status-success)' }} />
        <span>
          <strong style={{ color: 'var(--text-primary)' }}>{completedSessions}</strong> sessions completed
        </span>
      </div>
    </div>
  );
};
