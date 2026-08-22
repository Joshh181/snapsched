import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  ScanLine,
  Coffee,
  Users2,
  Settings,
  Plus,
  Sparkles,
  Upload,
  Check,
  CheckCircle2,
  Trash2,
  RotateCcw,
  BookOpen,
  ChevronDown,
  Clock,
  ArrowRight,
  FolderOpen,
} from 'lucide-react';

interface HeroWorkflowDemoProps {
  onGetStarted?: () => void;
}

type Stage = 'timetable_initial' | 'scanner_empty' | 'scanner_analyzing' | 'scanner_review' | 'timetable_filled';

export const HeroWorkflowDemo: React.FC<HeroWorkflowDemoProps> = ({ onGetStarted }) => {
  const [stage, setStage] = useState<Stage>('timetable_initial');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isClicking, setIsClicking] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(35);

  // Canvas & element refs for 100% pixel-perfect cursor tracking
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const sidebarScannerRef = useRef<HTMLDivElement | null>(null);
  const dropzoneRef = useRef<HTMLDivElement | null>(null);
  const selectBtnRef = useRef<HTMLButtonElement | null>(null);
  const analyzeRef = useRef<HTMLDivElement | null>(null);
  const importBtnRef = useRef<HTMLButtonElement | null>(null);
  const vacantCardRef = useRef<HTMLDivElement | null>(null);

  const [cursorLabel, setCursorLabel] = useState<string>('Schedule Scanner');
  const cursorCoordRef = useRef<{ x: number; y: number }>({ x: 90, y: 140 });
  const [clickOrigin, setClickOrigin] = useState<{ x: number; y: number }>({ x: 90, y: 140 });

  // Trigger click animation: snaps zoom origin to exact cursor coordinates, zooms in directly at cursor, then zooms out
  const triggerClick = () => {
    setClickOrigin(cursorCoordRef.current);
    setIsClicking(true);
    setTimeout(() => {
      setIsClicking(false);
    }, 700);
  };

  // Real-time 60fps tracking that lock-on tracks target DOM element relative to outer containerRef
  useEffect(() => {
    let animId: number;

    const getStageTarget = () => {
      switch (stage) {
        case 'timetable_initial':
          return { el: sidebarScannerRef.current, label: 'Schedule Scanner', offsetX: 0, offsetY: 0 };
        case 'scanner_empty':
          return { el: selectBtnRef.current || dropzoneRef.current, label: 'Select Timetable Photo', offsetX: 0, offsetY: 0 };
        case 'scanner_analyzing':
          return { el: analyzeRef.current, label: 'Gemini Vision AI...', offsetX: 0, offsetY: -20 };
        case 'scanner_review':
          return { el: importBtnRef.current, label: 'Import 12 to School', offsetX: 0, offsetY: 0 };
        case 'timetable_filled':
          return { el: vacantCardRef.current, label: '12 Classes Synced!', offsetX: 0, offsetY: 0 };
        default:
          return { el: null, label: '', offsetX: 0, offsetY: 0 };
      }
    };

    const targetConfig = getStageTarget();
    setCursorLabel(targetConfig.label);

    const updateCursorPosition = () => {
      const { el, offsetX, offsetY } = getStageTarget();
      if (el && containerRef.current && cursorRef.current) {
        const elRect = el.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        const x = elRect.left - containerRect.left + elRect.width / 2 + offsetX;
        const y = elRect.top - containerRect.top + elRect.height / 2 + offsetY;

        cursorCoordRef.current = { x, y };
        cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        cursorRef.current.style.opacity = '1';
      }
      animId = requestAnimationFrame(updateCursorPosition);
    };

    animId = requestAnimationFrame(updateCursorPosition);
    return () => cancelAnimationFrame(animId);
  }, [stage]);

  // Stage sequence timeline - immediate snappy zoom on arrival & smooth zoom out
  useEffect(() => {
    if (!isPlaying) return;

    const clickTimers: ReturnType<typeof setTimeout>[] = [];

    if (stage === 'timetable_initial') {
      clickTimers.push(setTimeout(triggerClick, 280));
      const timer = setTimeout(() => setStage('scanner_empty'), 1600);
      return () => {
        clearTimeout(timer);
        clickTimers.forEach(clearTimeout);
      };
    }

    if (stage === 'scanner_empty') {
      clickTimers.push(setTimeout(triggerClick, 320));
      const timer = setTimeout(() => {
        setScanProgress(35);
        setStage('scanner_analyzing');
      }, 1650);
      return () => {
        clearTimeout(timer);
        clickTimers.forEach(clearTimeout);
      };
    }

    if (stage === 'scanner_analyzing') {
      const p1 = setTimeout(() => setScanProgress(77), 400);
      const p2 = setTimeout(() => setScanProgress(100), 1100);
      const timer = setTimeout(() => setStage('scanner_review'), 1700);
      return () => {
        clearTimeout(p1);
        clearTimeout(p2);
        clearTimeout(timer);
      };
    }

    if (stage === 'scanner_review') {
      clickTimers.push(setTimeout(triggerClick, 320));
      const timer = setTimeout(() => setStage('timetable_filled'), 1650);
      return () => {
        clearTimeout(timer);
        clickTimers.forEach(clearTimeout);
      };
    }

    if (stage === 'timetable_filled') {
      const timer = setTimeout(() => setStage('timetable_initial'), 3600);
      return () => clearTimeout(timer);
    }
  }, [stage, isPlaying]);

  // Cinematic zoom centered directly on cursor position
  const getCameraStyle = () => {
    return {
      transform: isClicking ? 'scale(1.52) translate3d(0, 0, 0)' : 'scale(1.0) translate3d(0, 0, 0)',
      transformOrigin: `${clickOrigin.x}px ${clickOrigin.y}px`,
      transition: isClicking
        ? 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
        : 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
      willChange: 'transform',
    };
  };

  const isScannerActive = stage === 'scanner_empty' || stage === 'scanner_analyzing' || stage === 'scanner_review';

  return (
    <div className="relative select-none w-full">
      {/* Ambient Pulsing Glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-violet-500/15 to-pink-500/20 rounded-3xl blur-2xl -z-10 animate-ambient-pulse pointer-events-none" />

      {/* ─────────────────────────────────────────────────────────────
          STABLE FIXED-HEIGHT REAL APP CARD
         ───────────────────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 bg-white/95 backdrop-blur-xl border border-white/80 shadow-2xl relative overflow-hidden text-slate-900 h-[395px] sm:h-[425px] max-w-[620px] mx-auto box-border flex flex-col justify-between"
        style={{
          boxShadow: '0 20px 50px -12px rgba(79, 70, 229, 0.18), 0 0 0 1px rgba(226, 232, 240, 0.8)',
        }}
      >
        {/* Camera Zoom/Pan Viewport Canvas */}
        <div
          ref={canvasRef}
          className="w-full h-full relative"
          style={getCameraStyle()}
        >
          <div className="grid grid-cols-12 gap-2.5 sm:gap-3.5 h-full items-stretch">
            {/* ─────────────────────────────────────────────────────────
                REAL LEFT SIDEBAR (1:1 with photo)
               ───────────────────────────────────────────────────────── */}
            <div className="col-span-3 bg-white rounded-2xl p-2 sm:p-2.5 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
              <div className="space-y-2">
                {/* Brand Logo & Semester */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 hidden sm:block">
                    <div className="font-black text-[11px] sm:text-[12px] text-slate-900 tracking-tight leading-none">
                      SnapSched
                    </div>
                    <div className="text-[8.5px] text-slate-400 font-medium truncate mt-0.5">
                      1st Semester 2026–2027
                    </div>
                  </div>
                </div>

                {/* Semester Dropdown Pill */}
                <div className="p-1 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-[9px] font-bold text-slate-700">
                  <span className="truncate">1st Semester 2026–2027</span>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                </div>

                {/* Navigation Items */}
                <div className="space-y-0.5 text-[10px] sm:text-[10.5px] font-bold">
                  {/* Timetable Nav Item */}
                  <div
                    className={`p-1.5 rounded-lg flex items-center justify-between transition-all ${
                      !isScannerActive
                        ? 'bg-indigo-50 text-indigo-700 shadow-2xs border border-indigo-100'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Calendar className="w-3 h-3 shrink-0" />
                      <span className="truncate">Timetable</span>
                    </div>
                    <span
                      className={`text-[8.5px] font-mono px-1 rounded-full ${
                        !isScannerActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {stage === 'timetable_filled' ? '12' : '0'}
                    </span>
                  </div>

                  {/* Schedule Scanner Nav Item (Ref Target 1) */}
                  <div
                    ref={sidebarScannerRef}
                    className={`p-1.5 rounded-lg flex items-center justify-between transition-all duration-150 ${
                      isScannerActive
                        ? 'bg-indigo-50 text-indigo-700 shadow-2xs border border-indigo-100 ring-2 ring-indigo-400/40 font-extrabold'
                        : 'text-slate-600 hover:bg-slate-50'
                    } ${isClicking && stage === 'timetable_initial' ? 'scale-[0.96] bg-indigo-100 ring-2 ring-indigo-500/50' : ''}`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <ScanLine className="w-3 h-3 shrink-0 text-indigo-600" />
                      <span className="truncate">Schedule Scanner</span>
                    </div>
                  </div>

                  {/* Study Planner */}
                  <div className="p-1.5 rounded-lg flex items-center justify-between text-slate-500">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Coffee className="w-3 h-3 shrink-0" />
                      <span className="truncate">Study Planner</span>
                    </div>
                    <span className="text-[8.5px] font-mono px-1 rounded-full bg-slate-100 text-slate-500">
                      3
                    </span>
                  </div>

                  {/* Compare Friends */}
                  <div className="p-1.5 rounded-lg flex items-center gap-1.5 text-slate-500">
                    <Users2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Compare Friends</span>
                  </div>

                  {/* Settings */}
                  <div className="p-1.5 rounded-lg flex items-center gap-1.5 text-slate-500">
                    <Settings className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Settings</span>
                  </div>
                </div>
              </div>

              {/* Sidebar Bottom Stats */}
              <div className="pt-1.5 border-t border-slate-100 text-[9px] space-y-0.5 text-slate-500">
                <div className="flex items-center justify-between">
                  <span>Total Units</span>
                  <span className="font-bold text-indigo-600">{stage === 'timetable_filled' ? '36 units' : '0 units'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Classes</span>
                  <span className="font-bold text-slate-700">{stage === 'timetable_filled' ? '12 subjects' : '0 subjects'}</span>
                </div>
              </div>
            </div>

            {/* ─────────────────────────────────────────────────────────
                RIGHT MAIN APPLICATION AREA
               ───────────────────────────────────────────────────────── */}
            <div className="col-span-9 flex flex-col justify-between h-full space-y-2">
              {/* Top Greeting & Status Bar */}
              <div className="flex items-center justify-between flex-wrap gap-1 shrink-0">
                <div className="hidden sm:block">
                  <h3 className="font-black text-[13.5px] sm:text-[15px] text-slate-900 tracking-tight leading-none">
                    Good evening
                  </h3>
                  <p className="text-[9.5px] text-slate-500 font-medium mt-0.5">
                    Here's your day at a glance.
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>No classes today</span>
                  </div>

                  <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[9px] font-mono">
                    <Clock className="w-2.5 h-2.5 text-slate-400" />
                    <span>6:40 PM</span>
                  </div>

                  <button
                    type="button"
                    className="px-2 py-0.5 rounded-lg bg-indigo-600 text-white font-bold text-[10px] flex items-center gap-0.5 shadow-2xs"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>Add Class</span>
                  </button>
                </div>
              </div>

              {/* ───────────────────────────────────────────────────────
                  STATE A: TIMETABLE VIEW (Initial or Populated)
                 ─────────────────────────────────────────────────────── */}
              {!isScannerActive && (
                <div className="space-y-1.5 flex-1 flex flex-col justify-between animate-fade-in">
                  {/* Category Bar */}
                  <div className="p-1.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between text-[9.5px]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[8.5px]">
                        Category:
                      </span>
                      <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white font-bold flex items-center gap-0.5 shadow-2xs">
                        <span>● School</span>
                        <span className="text-[8px] bg-white/20 px-1 rounded-full">{stage === 'timetable_filled' ? '12' : '0'}</span>
                      </span>
                      <span className="text-slate-500 font-medium">● Work</span>
                      <span className="text-slate-500 font-medium">● Study</span>
                      <span className="text-slate-500 font-medium">● Personal</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-rose-500 font-bold flex items-center gap-0.5 text-[9px]">
                        <Trash2 className="w-2.5 h-2.5" /> Clear
                      </span>
                      <span className="text-indigo-600 font-bold text-[9px]">+ New Category</span>
                    </div>
                  </div>

                  {/* Sub-toggle and Day Pills */}
                  <div className="flex items-center justify-between text-[9.5px]">
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md font-bold">
                      <span className="px-1.5 py-0.2 rounded bg-white text-indigo-700 shadow-2xs">
                        Weekly Grid
                      </span>
                      <span className="px-1.5 py-0.2 text-slate-500">Agenda</span>
                    </div>

                    <div className="flex items-center gap-1 font-bold">
                      <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white shadow-2xs">All</span>
                      <span className="text-slate-400">Mon</span>
                      <span className="text-indigo-700 font-black">Tue</span>
                      <span className="text-indigo-700 font-black">Wed</span>
                      <span className="text-indigo-700 font-black">Thu</span>
                      <span className="text-slate-400">Fri</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800">
                        Saturday <span className="bg-indigo-600 text-white text-[8px] px-1 rounded">Today</span>
                      </span>
                    </div>
                  </div>

                  {/* Real Timetable Grid (Photo 1 & 5) */}
                  <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-xs flex-1 flex flex-col justify-between">
                    {/* Column Headers */}
                    <div className="grid grid-cols-6 gap-1 text-center text-[9px] pb-1 border-b border-slate-100 font-bold text-slate-600">
                      <div>
                        <div>Monday</div>
                        <div className="text-[8px] text-slate-400">0 classes</div>
                      </div>
                      <div className="text-indigo-700 font-black">
                        <div>Tuesday</div>
                        <div className="text-[8px] text-indigo-500">{stage === 'timetable_filled' ? '4 classes' : '0 classes'}</div>
                      </div>
                      <div className="text-indigo-700 font-black">
                        <div>Wednesday</div>
                        <div className="text-[8px] text-indigo-500">{stage === 'timetable_filled' ? '4 classes' : '0 classes'}</div>
                      </div>
                      <div className="text-indigo-700 font-black">
                        <div>Thursday</div>
                        <div className="text-[8px] text-indigo-500">{stage === 'timetable_filled' ? '4 classes' : '0 classes'}</div>
                      </div>
                      <div>
                        <div>Friday</div>
                        <div className="text-[8px] text-slate-400">0 classes</div>
                      </div>
                      <div className="bg-indigo-50/50 rounded">
                        <div className="text-indigo-900">Saturday</div>
                        <div className="text-[8px] text-slate-400">0 classes</div>
                      </div>
                    </div>

                    {/* Classes Grid Body */}
                    <div className="pt-1.5 flex-1 flex flex-col justify-center">
                      {stage === 'timetable_filled' ? (
                        <div className="grid grid-cols-6 gap-1 text-[8.5px]">
                          {/* Monday */}
                          <div className="rounded border border-dashed border-slate-100 h-44" />

                          {/* Tuesday Column */}
                          <div className="space-y-1">
                            <div className="p-1 rounded border border-indigo-200 bg-indigo-50/80 space-y-0.5">
                              <div className="flex items-center justify-between font-bold text-indigo-950">
                                <span>SUBJ 100</span>
                                <span className="text-[7.5px] bg-white px-0.5 rounded text-slate-600">COMLAB</span>
                              </div>
                              <div className="text-[8px] text-slate-600 font-medium truncate">
                                Advanced Web Dev
                              </div>
                              <div className="text-[7.5px] text-slate-400">8:00 AM – 11:00 AM</div>
                            </div>

                            <div className="p-1 rounded border border-indigo-200 bg-indigo-50/80 space-y-0.5">
                              <div className="flex items-center justify-between font-bold text-indigo-950">
                                <span>SUBJ 101</span>
                                <span className="text-[7.5px] bg-white px-0.5 rounded text-slate-600">COMLAB</span>
                              </div>
                              <div className="text-[8px] text-slate-600 font-medium truncate">
                                Info Management 2
                              </div>
                              <div className="text-[7.5px] text-slate-400">11:00 AM – 2:00 PM</div>
                            </div>
                          </div>

                          {/* Wednesday Column (Ref Target 5) */}
                          <div className="space-y-1">
                            <div className="p-1 rounded border border-indigo-200 bg-indigo-50/80 space-y-0.5">
                              <div className="flex items-center justify-between font-bold text-indigo-950">
                                <span>SUBJ 104</span>
                                <span className="text-[7.5px] bg-white px-0.5 rounded text-slate-600">LEC</span>
                              </div>
                              <div className="text-[8.5px] text-slate-600 font-medium truncate">
                                Info Security 1
                              </div>
                              <div className="text-[7.5px] text-slate-400">8:00 AM – 10:00 AM</div>
                            </div>

                            {/* Vacant Study Break Card */}
                            <div
                              ref={vacantCardRef}
                              className="p-1 rounded bg-amber-50 border border-amber-300 text-[8px] text-amber-900 flex items-center justify-between font-bold shadow-2xs ring-2 ring-amber-300/40"
                            >
                              <span>☕ 1h Free: 12-1 PM</span>
                              <span className="text-amber-700 underline">Plan →</span>
                            </div>

                            <div className="p-1 rounded border border-indigo-200 bg-indigo-50/80 space-y-0.5">
                              <div className="flex items-center justify-between font-bold text-indigo-950">
                                <span>SUBJ 106</span>
                                <span className="text-[7.5px] bg-white px-0.5 rounded text-slate-600">TBA</span>
                              </div>
                              <div className="text-[8px] text-slate-600 font-medium truncate">
                                Research Design
                              </div>
                              <div className="text-[7.5px] text-slate-400">1:00 PM – 4:00 PM</div>
                            </div>
                          </div>

                          {/* Thursday Column */}
                          <div className="space-y-1">
                            <div className="p-1 rounded border border-indigo-200 bg-indigo-50/80 space-y-0.5">
                              <div className="flex items-center justify-between font-bold text-indigo-950">
                                <span>SUBJ 108</span>
                                <span className="text-[7.5px] bg-white px-0.5 rounded text-slate-600">TBA</span>
                              </div>
                              <div className="text-[8px] text-slate-600 font-medium truncate">
                                Quantitative Methods
                              </div>
                              <div className="text-[7.5px] text-slate-400">8:00 AM – 11:00 AM</div>
                            </div>

                            <div className="p-1 rounded border border-indigo-200 bg-indigo-50/80 space-y-0.5">
                              <div className="flex items-center justify-between font-bold text-indigo-950">
                                <span>SUBJ 109</span>
                                <span className="text-[7.5px] bg-white px-0.5 rounded text-slate-600">COMLAB</span>
                              </div>
                              <div className="text-[8px] text-slate-600 font-medium truncate">
                                Info Security Lab
                              </div>
                              <div className="text-[7.5px] text-slate-400">11:00 AM – 2:00 PM</div>
                            </div>
                          </div>

                          {/* Friday */}
                          <div className="rounded border border-dashed border-slate-100 h-36 sm:h-38" />

                          {/* Saturday */}
                          <div className="rounded border border-dashed border-slate-100 h-36 sm:h-38 bg-indigo-50/20" />
                        </div>
                      ) : (
                        /* Initial Empty State */
                        <div className="h-36 sm:h-38 flex flex-col items-center justify-center text-center space-y-1">
                          <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Calendar className="w-3.5 h-3.5" />
                          </div>
                          <div className="text-[10.5px] font-bold text-slate-700">No classes loaded</div>
                          <div className="text-[9px] text-slate-400">Click Schedule Scanner on the left sidebar</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ───────────────────────────────────────────────────────
                  STATE B: SCHEDULE SCANNER (DROPZONE - Photo 2)
                 ─────────────────────────────────────────────────────── */}
              {stage === 'scanner_empty' && (
                <div className="space-y-2 flex-1 flex flex-col justify-between animate-fade-in">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-[12px] text-slate-900">Schedule Scanner</h4>
                      <p className="text-[9px] text-slate-500 font-medium">
                        Upload your Certificate of Registration (COR) or schedule photo to automatically build your timetable.
                      </p>
                    </div>
                    <span className="text-[8.5px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-indigo-600" />
                      Powered by Gemini Vision
                    </span>
                  </div>

                  {/* Dropzone Container (Ref Target 2) */}
                  <div
                    ref={dropzoneRef}
                    className="rounded-xl border-2 border-dashed border-indigo-300/80 bg-indigo-50/30 p-4 sm:p-5 flex-1 flex flex-col items-center justify-center text-center space-y-1.5"
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-2xs animate-bounce">
                      <Upload className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-[11.5px] text-slate-900">
                        Drop your COR or schedule photo here
                      </div>
                      <div className="text-[9.5px] text-slate-500 font-medium mt-0.5">
                        Supports PNG, JPG, JPEG, PDF, or document slips
                      </div>
                    </div>

                    <button
                      ref={selectBtnRef}
                      type="button"
                      className={`px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-[10.5px] inline-flex items-center gap-1 shadow-xs ring-4 ring-indigo-400/30 transition-all duration-150 ${
                        isClicking && stage === 'scanner_empty' ? 'scale-95 bg-indigo-700 ring-indigo-500/60' : ''
                      }`}
                    >
                      <FolderOpen className="w-3 h-3" />
                      <span>Select Timetable Photo</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ───────────────────────────────────────────────────────
                  STATE C: DOCUMENT SCANNING ANIMATION (Photo 3)
                 ─────────────────────────────────────────────────────── */}
              {stage === 'scanner_analyzing' && (
                <div className="space-y-2 flex-1 flex flex-col justify-between animate-fade-in">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-[12px] text-slate-900">Schedule Scanner</h4>
                      <p className="text-[9px] text-slate-500 font-medium">
                        Upload your Certificate of Registration (COR) or schedule photo to automatically build your timetable.
                      </p>
                    </div>
                    <span className="text-[8.5px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-indigo-600" />
                      Powered by Gemini Vision
                    </span>
                  </div>

                  {/* Dark Document Scan Theater (Ref Target 3) */}
                  <div
                    ref={analyzeRef}
                    className="rounded-xl bg-slate-950 p-2.5 sm:p-3 border border-slate-800 text-white text-center flex-1 flex flex-col justify-between relative overflow-hidden shadow-xl"
                  >
                    {/* Laser Scan Beam */}
                    <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_16px_4px_rgba(34,211,238,0.9)] animate-scan-beam pointer-events-none z-10" />
                    <div className="absolute left-0 right-0 h-6 -mt-6 bg-gradient-to-t from-cyan-500/20 to-transparent pointer-events-none animate-scan-beam z-10" />

                    {/* Simulated Document Card */}
                    <div className="max-w-xs mx-auto rounded-lg bg-slate-900 border border-slate-700 p-2 space-y-1 text-left text-[8.5px] font-mono">
                      <div className="bg-indigo-600 text-white p-0.5 rounded font-bold text-center text-[9px]">
                        WEEKLY CLASS SCHEDULE
                      </div>
                      <div className="p-1 rounded bg-slate-800 border border-cyan-500/40 text-cyan-300">
                        SUBJ 100 · Advanced Web Development · 8:00 AM - 11:00 AM
                      </div>
                      <div className="p-1 rounded bg-slate-800 border border-emerald-500/40 text-emerald-300">
                        SUBJ 101 · Information Management 2 · 11:00 AM - 2:00 PM
                      </div>
                      <div className="p-1 rounded bg-slate-800 border border-amber-500/40 text-amber-300">
                        SUBJ 104 · Information Assurance & Security · 8:00 AM - 10:00 AM
                      </div>
                    </div>

                    {/* Progress Bar & Status */}
                    <div className="max-w-xs mx-auto w-full space-y-0.5 text-left">
                      <div className="flex items-center justify-between text-[9px] font-mono">
                        <span className="flex items-center gap-1 text-indigo-300">
                          <span className="w-1 h-1 rounded-full bg-indigo-400 animate-ping" />
                          Analyzing schedule document
                        </span>
                        <span className="text-cyan-400 font-bold">{scanProgress}%</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 rounded-full"
                          style={{ width: `${scanProgress}%` }}
                        />
                      </div>
                      <div className="text-[8px] text-slate-500 font-mono text-center pt-0.5">download.jpg</div>
                    </div>
                  </div>
                </div>
              )}

              {/* ───────────────────────────────────────────────────────
                  STATE D: EXTRACTION COMPLETE & REVIEW TABLE (Photo 4)
                 ─────────────────────────────────────────────────────── */}
              {stage === 'scanner_review' && (
                <div className="space-y-2 flex-1 flex flex-col justify-between animate-fade-in">
                  {/* Extraction Complete Banner */}
                  <div className="p-2 rounded-xl bg-white border border-emerald-200/90 shadow-2xs flex items-center justify-between flex-wrap gap-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold text-[10px]">
                        ✓
                      </div>
                      <div>
                        <div className="font-extrabold text-[11px] text-slate-900">Extraction Complete</div>
                        <div className="text-[8.5px] text-slate-500 font-medium">
                          12 items found · 36 units. Select items to import.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        className="px-2 py-0.5 rounded-lg border border-slate-200 text-slate-600 font-bold text-[9.5px]"
                      >
                        Scan Another
                      </button>
                      <button
                        ref={importBtnRef}
                        type="button"
                        className={`px-3 py-1 rounded-xl bg-indigo-600 text-white font-bold text-[10.5px] flex items-center gap-1 shadow-md ring-4 ring-indigo-400/40 transition-all duration-150 ${
                          isClicking && stage === 'scanner_review' ? 'scale-95 bg-indigo-700 ring-indigo-500/60' : 'animate-pulse'
                        }`}
                      >
                        <span>Import 12 to School</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Real Extracted Table Preview (Photo 4) */}
                  <div className="rounded-xl border border-slate-200 bg-white p-1.5 shadow-xs flex-1 flex flex-col justify-between text-[9px]">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100 font-bold text-slate-500 px-1 text-[8.5px]">
                      <span>☑ Select All (12/12)</span>
                      <span className="text-indigo-600">12 selected</span>
                    </div>

                    <div className="space-y-1">
                      {/* Row 1 */}
                      <div className="p-1 rounded bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <input type="checkbox" checked readOnly className="rounded text-indigo-600 w-2.5 h-2.5" />
                          <span className="font-bold text-slate-900">SUBJ 100</span>
                          <span className="px-1 rounded bg-indigo-50 text-indigo-700 font-semibold text-[8px]">
                            School
                          </span>
                          <span className="text-slate-700 font-medium truncate max-w-[130px]">Advanced Web Development</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-[8.5px]">
                          <span className="bg-indigo-600 text-white px-1 rounded font-bold">Tue</span>
                          <span className="font-semibold text-slate-800">8:00 AM - 11:00 AM</span>
                          <span>COMLAB</span>
                          <span className="font-bold text-indigo-600">3u</span>
                        </div>
                      </div>

                      {/* Row 2 */}
                      <div className="p-1 rounded bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <input type="checkbox" checked readOnly className="rounded text-indigo-600 w-2.5 h-2.5" />
                          <span className="font-bold text-slate-900">SUBJ 101</span>
                          <span className="px-1 rounded bg-indigo-50 text-indigo-700 font-semibold text-[8px]">
                            School
                          </span>
                          <span className="text-slate-700 font-medium truncate max-w-[130px]">Information Management 2</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-[8.5px]">
                          <span className="bg-indigo-600 text-white px-1 rounded font-bold">Tue</span>
                          <span className="font-semibold text-slate-800">11:00 AM - 2:00 PM</span>
                          <span>COMLAB</span>
                          <span className="font-bold text-indigo-600">3u</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            PROMINENT PRECISION CURSOR (WENSITY STYLE)
           ───────────────────────────────────────────────────────────── */}
        <div
          ref={cursorRef}
          className="absolute top-0 left-0 z-50 pointer-events-none transition-transform duration-300 ease-out opacity-0"
          style={{
            transform: 'translate3d(0px, 0px, 0)',
          }}
        >
          {/* Click Ripple Wave Animation (centered on cursor arrow tip) */}
          {isClicking && (
            <span className="absolute top-[3px] left-[5px] -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full border-2 border-indigo-500 bg-indigo-500/30 animate-ping pointer-events-none" />
          )}

          {/* Precision Pointer SVG (hotspot aligned with 0,0) */}
          <div className="relative -top-[3px] -left-[5px]">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`drop-shadow-xl transition-transform duration-150 ${
                isClicking ? 'scale-85 rotate-[-8deg]' : 'scale-100'
              }`}
            >
              <path
                d="M5.5 3.5L18.5 11.5L12 13.5L9.5 19.5L5.5 3.5Z"
                fill="#0f172a"
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>

            {/* Context Label Tag */}
            {cursorLabel && (
              <div className="absolute left-7 top-3 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-slate-900/95 text-white text-[9.5px] font-bold border border-slate-700/70 shadow-lg flex items-center gap-1.5 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <span>{cursorLabel}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
