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
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (mode === 'work') {
        setCompletedSessions((prev) => prev + 1);
        try {
          confetti({ particleCount: 35, spread: 50 });
        } catch (e) {}
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
  const progressPercent =
    ((mode === 'work' ? workDuration * 60 - timeLeft : breakDuration * 60 - timeLeft) /
      (mode === 'work' ? workDuration * 60 : breakDuration * 60)) *
    100;

  return (
    <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs flex flex-col items-center justify-between gap-4 select-none">
      {/* Top Mode Segmented Control */}
      <div className="flex items-center gap-1 p-0.5 bg-zinc-100 rounded-md border border-zinc-200">
        <button
          onClick={() => setMode('work')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition-colors ${
            mode === 'work'
              ? 'bg-white text-zinc-900 font-semibold shadow-2xs'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <span>25m Focus Block</span>
        </button>
        <button
          onClick={() => setMode('break')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition-colors ${
            mode === 'break'
              ? 'bg-white text-amber-900 font-semibold shadow-2xs'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <span>5m Rest</span>
        </button>
      </div>

      {/* Circular Progress Display */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* SVG Progress Ring */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            className="stroke-zinc-100"
            strokeWidth="5"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            style={{
              strokeDasharray: 264,
              strokeDashoffset: 264 - (264 * progressPercent) / 100,
            }}
            className={`transition-all duration-300 ${
              mode === 'work' ? 'stroke-blue-600' : 'stroke-amber-500'
            }`}
            strokeWidth="5"
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Digital Time Inside */}
        <div className="absolute flex flex-col items-center justify-center font-mono">
          <span className="font-semibold text-2xl text-zinc-900 tabular-nums">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </span>
          <span className="text-[9px] text-zinc-400 uppercase tracking-wider mt-0.5">
            {mode === 'work' ? 'Focus Interval' : 'Rest Window'}
          </span>
        </div>
      </div>

      {/* Context Badge */}
      {subjectContext && (
        <div className="text-[11px] text-zinc-600 font-mono bg-zinc-50 px-2.5 py-0.5 rounded border border-zinc-200 max-w-xs truncate text-center">
          Target: <span className="text-zinc-900 font-semibold">{subjectContext}</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={resetTimer}
          title="Reset Timer"
          className="p-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 border border-zinc-200 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={toggleTimer}
          className={`px-5 py-1.5 rounded-md font-medium text-xs text-white transition-colors flex items-center gap-1.5 ${
            isRunning
              ? 'bg-rose-600 hover:bg-rose-700 shadow-2xs'
              : mode === 'work'
              ? 'bg-blue-600 hover:bg-blue-700 shadow-2xs'
              : 'bg-amber-600 hover:bg-amber-700 shadow-2xs'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5" /> Pause
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" /> Start Timer
            </>
          )}
        </button>
      </div>

      {/* Streak / Sessions Footer */}
      <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span>
          <strong className="text-zinc-800 font-semibold">{completedSessions}</strong> intervals completed today
        </span>
      </div>
    </div>
  );
};
