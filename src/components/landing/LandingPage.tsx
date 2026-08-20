import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  ScanLine,
  Calendar,
  Coffee,
  Users2,
  Layers,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Clock,
  Zap,
  ShieldCheck,
  Smartphone,
  Laptop,
  Check,
  Star,
  Play,
  Share2,
  Flame,
  FileSpreadsheet,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onSignIn,
}) => {
  const [activeFeatureTab, setActiveFeatureTab] = useState<'scanner' | 'breaks' | 'compare' | 'categories'>('scanner');
  const [isFeatureAutoPaused, setIsFeatureAutoPaused] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);
  const [simulatedScanStep, setSimulatedScanStep] = useState(0);

  const FEATURE_TABS: Array<'scanner' | 'breaks' | 'compare' | 'categories'> = [
    'scanner',
    'breaks',
    'compare',
    'categories',
  ];

  // Auto-cycle between feature tabs when user is not hovering/interacting
  useEffect(() => {
    if (isFeatureAutoPaused) return;

    const interval = setInterval(() => {
      setActiveFeatureTab((prev) => {
        const nextIndex = (FEATURE_TABS.indexOf(prev) + 1) % FEATURE_TABS.length;
        return FEATURE_TABS[nextIndex];
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isFeatureAutoPaused]);

  // Auto-cycle simulation steps for scanner tab preview
  useEffect(() => {
    if (activeFeatureTab !== 'scanner') return;
    const interval = setInterval(() => {
      setSimulatedScanStep((prev) => (prev + 1) % 3);
    }, 2800);
    return () => clearInterval(interval);
  }, [activeFeatureTab]);

  // Navbar background change on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const routineBadges = [
    { icon: '🎓', name: 'University Classes', desc: 'Lectures, Labs & Sections', color: '#4f46e5' },
    { icon: '💼', name: 'Work & Shifts', desc: 'Office, Part-Time & Freelance', color: '#2563eb' },
    { icon: '🎯', name: 'Personal & Projects', desc: 'Goals, Errands & Habits', color: '#059669' },
    { icon: '📚', name: 'Deep Study & Review', desc: 'Exams & Self-Study', color: '#d97706' },
    { icon: '☕', name: 'Smart Vacant Breaks', desc: 'Recharge & Free Windows', color: '#ea580c' },
    { icon: '👥', name: 'Team & Friend Match', desc: 'Common Free Schedules', color: '#7c3aed' },
  ];

  const sampleClasses = [
    { code: 'IT 311', name: 'Web Systems & Technologies 2', time: '07:30 - 09:00', room: 'IT-LAB 2', color: '#4f46e5', day: 'M-W' },
    { code: 'CS 312', name: 'Information Assurance & Security', time: '09:00 - 10:30', room: 'CL 304', color: '#059669', day: 'M-W' },
    { code: 'GE 108', name: 'Ethics in the Modern World', time: '13:00 - 14:30', room: 'LH 101', color: '#d97706', day: 'T-TH' },
    { code: 'PE 3', name: 'Individual & Dual Sports', time: '15:00 - 17:00', room: 'COURT 1', color: '#7c3aed', day: 'F' },
  ];

  const faqs = [
    {
      q: 'How does the AI Schedule & COR Scanner work?',
      a: 'Simply upload or snap a photo of your registration slip, study load, work shift roster, or SIS portal screenshot. Powered by Google Gemini Vision, SnapSched instantly reads codes, titles, day schedules, time slots, instructors, and rooms, and converts them directly into your timetable.',
    },
    {
      q: 'Can I use SnapSched for work shifts, study, and personal routines as well as classes?',
      a: 'Yes! SnapSched features multi-category layers. You can organize School, Work, Study, and Personal schedules with custom colors and filter them independently on your timetable grid.',
    },
    {
      q: 'Can I use SnapSched across my phone, tablet, and laptop?',
      a: 'Yes! SnapSched is fully responsive and cloud-synced with Supabase. Sign in once with Email or Google, and your schedules, custom categories, and plans will be updated in real time across every device.',
    },
    {
      q: 'How does the Friend & Team Schedule Compare work?',
      a: 'You can compare schedules with classmates or teammates by importing their shared timetable. SnapSched automatically calculates and highlights overlapping free periods so you can plan study sessions, shift handovers, or lunch breaks together.',
    },
    {
      q: 'Is SnapSched free to use?',
      a: 'Yes! SnapSched is 100% free to use to help students, freelancers, and professionals organize their weekly life without costly subscriptions.',
    },
  ];

  return (
    <div
      className="min-h-screen relative selection:bg-indigo-500 selection:text-white"
      style={{
        background: 'radial-gradient(ellipse at 15% 10%, #e0e7ff 0%, transparent 45%), radial-gradient(ellipse at 85% 15%, #ede9fe 0%, transparent 40%), #f4f6fc',
        color: '#111827',
      }}
    >
      {/* ── 1. FIXED GLASSMORPHIC NAVBAR ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
            ? 'bg-white/90 backdrop-blur-md border-b border-slate-200/90 shadow-sm'
            : 'bg-white/40 backdrop-blur-sm border-b border-slate-200/40'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-sm transition-transform hover:scale-105 shrink-0"
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                boxShadow: '0 4px 14px -2px rgba(79, 70, 229, 0.4)',
              }}
            >
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-[18px] sm:text-[20px] tracking-tight text-slate-900 leading-none">
              SnapSched
            </span>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-8 text-[14px] font-semibold text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">
              How It Works
            </a>
            <a href="#comparison" className="hover:text-indigo-600 transition-colors">
              Why SnapSched
            </a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">
              FAQ
            </a>
          </div>

          {/* Right Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onSignIn}
              className="px-2.5 sm:px-4 py-2 text-[13px] sm:text-[14px] font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-xl font-semibold text-[12.5px] sm:text-[13.5px] text-white flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              }}
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── 2. HERO SECTION ── */}
      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Main Headline */}
            <h1 className="text-[38px] sm:text-[50px] lg:text-[56px] font-black tracking-tight text-slate-900 leading-[1.12]">
              Your Semester,{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent">
                Beautifully Organized.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-[16px] sm:text-[18px] text-slate-600 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Snap a photo of your Certificate of Registration (COR). Let AI extract every subject, room, and time slot into a sleek, cloud-synced weekly timetable in 10 seconds.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-bold text-[15px] text-white flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                  boxShadow: '0 8px 24px -4px rgba(79, 70, 229, 0.45)',
                }}
              >
                <span>Scan Your Schedule Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Benefits Guarantee */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 pt-3 text-[13px] font-semibold text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>No manual typing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Mobile & Desktop ready</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>100% Free for students</span>
              </div>
            </div>
          </div>

          {/* Right Column: Floating 3D Mockup Card */}
          <div className="lg:col-span-5 relative">
            {/* Ambient Background Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 rounded-3xl blur-2xl -z-10 transform rotate-1 scale-95" />

            {/* Interactive Schedule Hero Card */}
            <div
              className="rounded-3xl p-5 sm:p-6 bg-white/95 backdrop-blur-xl border border-white/80 shadow-2xl transition-transform duration-500 hover:scale-[1.01]"
              style={{
                boxShadow: '0 20px 50px -12px rgba(79, 70, 229, 0.18), 0 0 0 1px rgba(226, 232, 240, 0.8)',
              }}
            >
              {/* Mockup Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    IT
                  </div>
                  <div>
                    <div className="font-bold text-[14px] text-slate-900 leading-tight">
                      1st Semester 2026–2027
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      BS Information Technology
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>In Class Now</span>
                </div>
              </div>

              {/* Day Selector Pills */}
              <div className="flex items-center gap-1.5 mb-4 p-1 bg-slate-50 rounded-xl">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                  <div
                    key={d}
                    className={`flex-1 text-center py-1.5 rounded-lg text-[11px] font-bold transition-all ${i === 0
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Mini Classes Timeline Mock */}
              <div className="space-y-2.5">
                {sampleClasses.map((cls, idx) => (
                  <div
                    key={cls.code}
                    className="p-3 rounded-2xl flex items-center justify-between border transition-all hover:translate-x-1"
                    style={{
                      backgroundColor: idx === 0 ? '#f5f3ff' : '#ffffff',
                      borderColor: idx === 0 ? '#c7d2fe' : '#e2e8f0',
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-2.5 h-10 rounded-full shrink-0"
                        style={{ backgroundColor: cls.color }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[13px] text-slate-900">{cls.code}</span>
                          <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {cls.room}
                          </span>
                        </div>
                        <div className="text-[12px] text-slate-500 truncate font-medium">
                          {cls.name}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[11px] font-bold text-slate-700">{cls.time}</div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">{cls.day}</div>
                    </div>
                  </div>
                ))}

                {/* Detected Vacant Period Banner in Mockup */}
                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 text-amber-900 font-medium">
                    <Coffee className="w-3.5 h-3.5 text-amber-600" />
                    <span>2.5 hrs Vacant (10:30 AM – 1:00 PM)</span>
                  </div>
                  <span className="font-bold text-amber-700 underline cursor-pointer">Plan Study</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lifestyle & Routine Badges Ribbon */}
        <div className="mt-16 pt-10 border-t border-slate-200/60 text-center">
          <p className="text-[12px] sm:text-[12.5px] font-bold text-slate-400 uppercase tracking-widest mb-6">
            Designed for every weekly routine — Classes, Work Shifts, Study & Daily Life
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 max-w-6xl mx-auto">
            {routineBadges.map((badge) => (
              <div
                key={badge.name}
                className="p-3 sm:px-3.5 sm:py-3 rounded-2xl bg-white/85 hover:bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all hover:scale-105 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-2.5"
              >
                <span className="text-xl sm:text-lg leading-none shrink-0">{badge.icon}</span>
                <div className="min-w-0">
                  <span className="text-[12.5px] sm:text-[13px] font-bold text-slate-800 block leading-tight truncate">
                    {badge.name}
                  </span>
                  <span className="text-[10px] sm:text-[10.5px] font-semibold text-slate-400 block leading-tight mt-0.5 truncate">
                    {badge.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. INTERACTIVE PRODUCT SHOWCASE (TAB SWITCHER) ── */}
      <section id="features" className="py-20 bg-white/70 backdrop-blur-sm border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-[12px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Engineered For Dynamic Weekly Routines
            </span>
            <h2 className="text-[32px] sm:text-[40px] font-black tracking-tight text-slate-900">
              Built to replace chaotic group chats, rosters & spreadsheets
            </h2>
            <p className="text-[16px] text-slate-600 font-medium">
              Every tool in SnapSched gives you total clarity over your classes, shifts, study blocks, and free time.
            </p>
          </div>

          {/* Feature Tab Buttons */}
          <div
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10"
            onMouseEnter={() => setIsFeatureAutoPaused(true)}
            onMouseLeave={() => setIsFeatureAutoPaused(false)}
          >
            {[
              { id: 'scanner', label: 'AI COR Scanner', icon: ScanLine },
              { id: 'breaks', label: 'Vacant Study Planner', icon: Coffee },
              { id: 'compare', label: 'Compare with Friends', icon: Users2 },
              { id: 'categories', label: 'Multi-Layer Schedules', icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFeatureTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveFeatureTab(tab.id as any);
                    setIsFeatureAutoPaused(true);
                  }}
                  className={`relative flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-[13.5px] transition-all ${isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {isActive && !isFeatureAutoPaused && (
                    <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-white/50 rounded-full animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Interactive Feature Display Stage */}
          <div
            className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-slate-800"
            onMouseEnter={() => setIsFeatureAutoPaused(true)}
            onMouseLeave={() => setIsFeatureAutoPaused(false)}
          >
            {/* Ambient Background Lights */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* TAB 1: AI COR Scanner Live Motion Simulator */}
            {activeFeatureTab === 'scanner' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in">
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Live OCR Motion Simulator
                  </div>
                  <h3 className="text-[26px] sm:text-[30px] font-black leading-tight text-white">
                    Scan your registration slip. Skip hours of typing.
                  </h3>
                  <p className="text-slate-300 text-[15px] leading-relaxed">
                    Watch Gemini Vision AI scan official university registration forms, study load slips, or screen captures and instantly transform them into a color-coded timetable.
                  </p>
                  <div className="space-y-2.5 pt-2 text-[13px] text-slate-300">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">✓</span>
                      <span>Parses complex day codes (MW, TTH, FS, SAT)</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">✓</span>
                      <span>Converts 12h/24h timestamps into time grid coordinates</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">✓</span>
                      <span>Assigns vibrant subject colors automatically</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-slate-950 rounded-2xl p-5 sm:p-6 border border-slate-800 relative overflow-hidden shadow-inner">
                  {/* Scanner Device Shell Header */}
                  <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      <span className="font-mono text-slate-400 ml-2">COR_2026_STUDY_LOAD.PDF</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                      <span className="text-indigo-300 font-bold">AI SCANNING...</span>
                    </div>
                  </div>

                  {/* Document & Laser Scanning Simulation Container */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    {/* Simulated Document Slip with Live Laser Beam */}
                    <div className="sm:col-span-6 relative h-64 rounded-xl bg-slate-900 border border-slate-700/80 p-3.5 overflow-hidden flex flex-col justify-between select-none">
                      {/* Document Header Watermark */}
                      <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="h-2.5 w-24 bg-slate-600 rounded" />
                          <div className="h-2 w-16 bg-slate-700 rounded" />
                        </div>
                        <div className="h-5 w-12 bg-indigo-900/60 border border-indigo-500/40 rounded text-[9px] text-indigo-300 flex items-center justify-center font-mono">
                          VALID
                        </div>
                      </div>

                      {/* Mock Text Rows */}
                      <div className="space-y-2 my-2">
                        <div className="p-1.5 rounded bg-slate-800/80 border border-slate-700/50 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-indigo-300">IT 311 WEB SYS</span>
                          <span className="text-slate-400">07:30-09:00</span>
                        </div>
                        <div className="p-1.5 rounded bg-slate-800/80 border border-slate-700/50 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-emerald-300">CS 312 SECURITY</span>
                          <span className="text-slate-400">09:00-10:30</span>
                        </div>
                        <div className="p-1.5 rounded bg-slate-800/80 border border-slate-700/50 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-amber-300">GE 108 ETHICS</span>
                          <span className="text-slate-400">13:00-14:30</span>
                        </div>
                        <div className="p-1.5 rounded bg-slate-800/80 border border-slate-700/50 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-violet-300">PE 3 DUAL SPORT</span>
                          <span className="text-slate-400">15:00-17:00</span>
                        </div>
                      </div>

                      {/* Laser Beam with Particle Light Trails */}
                      <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_18px_4px_rgba(34,211,238,0.9)] animate-scan-beam pointer-events-none" />
                      <div className="absolute left-0 right-0 h-10 -mt-10 bg-gradient-to-t from-cyan-500/20 to-transparent pointer-events-none animate-scan-beam" />

                      <div className="text-[9.5px] font-mono text-slate-500 text-center">
                        DOCUMENT OCR CAPTURE ACTIVE
                      </div>
                    </div>

                    {/* Extracted Output Live Feed */}
                    <div className="sm:col-span-6 space-y-2">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Extracted Classes</span>
                        <span className="text-emerald-400 font-mono">4 Detected</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/40 flex items-center justify-between transition-all">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                            <div>
                              <div className="font-bold text-white text-[12px]">IT 311 — Web Systems</div>
                              <div className="text-[10px] text-indigo-300">CL 304 · 3.0 Units · MW</div>
                            </div>
                          </div>
                          <span className="font-mono text-[11px] text-indigo-200">07:30 AM</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between transition-all">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <div>
                              <div className="font-bold text-white text-[12px]">CS 312 — Info Assurance</div>
                              <div className="text-[10px] text-emerald-300">IT-LAB 2 · 3.0 Units · MW</div>
                            </div>
                          </div>
                          <span className="font-mono text-[11px] text-emerald-200">09:00 AM</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-between transition-all">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            <div>
                              <div className="font-bold text-white text-[12px]">GE 108 — Ethics</div>
                              <div className="text-[10px] text-amber-300">LH 101 · 3.0 Units · TTH</div>
                            </div>
                          </div>
                          <span className="font-mono text-[11px] text-amber-200">01:00 PM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Vacant Study Planner Live Motion Simulator */}
            {activeFeatureTab === 'breaks' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in">
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-semibold">
                    <Coffee className="w-3.5 h-3.5 text-amber-400" />
                    Gap Detection & Focus Timer
                  </div>
                  <h3 className="text-[26px] sm:text-[30px] font-black leading-tight text-white">
                    Turn dead hours between classes into effortless productivity.
                  </h3>
                  <p className="text-slate-300 text-[15px] leading-relaxed">
                    SnapSched computes every vacant gap across your week and automatically recommends structured Pomodoro study sessions, coffee breaks, or social catch-ups.
                  </p>
                  <div className="space-y-2.5 pt-2 text-[13px] text-slate-300">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">✓</span>
                      <span>Instant gap detection between class dismissal & start</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">✓</span>
                      <span>One-click Pomodoro focus session planner</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">✓</span>
                      <span>Never ask "what should I do during my vacant?" again</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-slate-950 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-4 shadow-inner">
                  {/* Timeline Bar Mock with Animated Pulse Gap */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>DAILY TIMELINE: 07:00 AM — 05:00 PM</span>
                      <span className="text-amber-400 font-bold">TUESDAY</span>
                    </div>

                    <div className="h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center p-1.5 gap-1.5 overflow-hidden">
                      <div className="h-full w-1/4 rounded-lg bg-indigo-600/80 text-[10px] font-bold text-white flex items-center justify-center truncate">
                        CS 312 (Class)
                      </div>
                      {/* Pulsing Vacant Window */}
                      <div className="h-full flex-1 rounded-lg bg-amber-500/25 border border-amber-400/80 text-[10px] font-extrabold text-amber-300 flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.3)] animate-pulse">
                        <Coffee className="w-3 h-3 text-amber-400" />
                        <span>2h 30m Vacant Window</span>
                      </div>
                      <div className="h-full w-1/3 rounded-lg bg-indigo-600/80 text-[10px] font-bold text-white flex items-center justify-center truncate">
                        GE 108 (Lecture)
                      </div>
                    </div>
                  </div>

                  {/* Interactive Plan Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30 space-y-2 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-indigo-400" />
                          Focus Study Sprint
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                          50 Mins
                        </span>
                      </div>
                      <div className="text-[13px] font-semibold text-white">Review Data Structures Exam</div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 w-3/4 rounded-full" />
                      </div>
                      <div className="text-[10.5px] text-slate-400 flex items-center justify-between">
                        <span>Library 3rd Floor</span>
                        <span className="text-indigo-400 font-mono">37:30 remaining</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <Coffee className="w-3.5 h-3.5 text-amber-400" />
                          Campus Break
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                          40 Mins
                        </span>
                      </div>
                      <div className="text-[13px] font-semibold text-white">Lunch & Catch-up with Friends</div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 w-1/2 rounded-full" />
                      </div>
                      <div className="text-[10.5px] text-slate-400 flex items-center justify-between">
                        <span>Student Center Food Court</span>
                        <span className="text-amber-400 font-mono">Scheduled</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Compare with Friends Live Motion Simulator */}
            {activeFeatureTab === 'compare' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in">
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                    <Users2 className="w-3.5 h-3.5 text-emerald-400" />
                    Multi-Schedule Overlay
                  </div>
                  <h3 className="text-[26px] sm:text-[30px] font-black leading-tight text-white">
                    Find common free time with friends in one second.
                  </h3>
                  <p className="text-slate-300 text-[15px] leading-relaxed">
                    Compare study loads with blockmates, study buddies, or team members. SnapSched calculates overlapping vacant slots so everyone knows when they can meet up.
                  </p>
                  <div className="space-y-2.5 pt-2 text-[13px] text-slate-300">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">✓</span>
                      <span>Side-by-side timetable slot comparison</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">✓</span>
                      <span>Highlights mutual vacant windows instantly</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">✓</span>
                      <span>Export and share schedule links with 1 click</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-slate-950 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-3.5 shadow-inner">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800 text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="font-bold text-white">You</span>
                      <span className="text-slate-500">+</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="font-bold text-white">Bea (Blockmate)</span>
                      <span className="text-slate-500">+</span>
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="font-bold text-white">Carlos (Study Group)</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">MATCH: 100%</span>
                  </div>

                  {/* Overlap Matching Zone Mock */}
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span className="font-mono text-slate-400">09:00 AM – 10:30 AM</span>
                      <span className="text-rose-400 font-semibold">Carlos has Lecture (CL 304)</span>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.25)] flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-extrabold text-[13.5px] text-emerald-300 flex items-center gap-2">
                          <span>🎉 Mutual Free Time Found!</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-400 text-slate-950 font-bold text-[10px]">2.5 HRS</span>
                        </div>
                        <div className="text-[11px] text-slate-300">
                          11:30 AM — 02:00 PM (Everyone is free for lunch & review)
                        </div>
                      </div>
                      <span className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white font-bold text-xs shadow-xs">
                        Plan Hangout
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span className="font-mono text-slate-400">02:00 PM – 04:00 PM</span>
                      <span className="text-rose-400 font-semibold">You have IT Lab 2</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Multi-Layer Categories Live Motion Simulator */}
            {activeFeatureTab === 'categories' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in">
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-violet-500/20 text-violet-300 text-xs font-semibold">
                    <Layers className="w-3.5 h-3.5 text-violet-400" />
                    Layered Life Organizer
                  </div>
                  <h3 className="text-[26px] sm:text-[30px] font-black leading-tight text-white">
                    One unified calendar for classes, shifts, study & personal tasks.
                  </h3>
                  <p className="text-slate-300 text-[15px] leading-relaxed">
                    Don't juggle three different calendar apps. Toggle between your School classes, Part-Time Work shifts, Study blocks, and Personal errands with dedicated layer filters.
                  </p>
                  <div className="space-y-2.5 pt-2 text-[13px] text-slate-300">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs font-bold">✓</span>
                      <span>Independent toggle filters on the timetable grid</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs font-bold">✓</span>
                      <span>Custom color tags per routine type</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs font-bold">✓</span>
                      <span>Calculates weekly units and shift hours</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-slate-950 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-4 shadow-inner">
                  {/* Category Layer Filter Pills */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'School', color: '#4f46e5', count: '18 Units' },
                      { name: 'Work', color: '#2563eb', count: '12 Hrs/wk' },
                      { name: 'Study', color: '#d97706', count: '6 Hrs' },
                      { name: 'Personal', color: '#7c3aed', count: 'Errands' },
                    ].map((cat, idx) => (
                      <div
                        key={cat.name}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                          idx < 2
                            ? 'bg-slate-800 border-indigo-400/50 text-white shadow-xs'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span>{cat.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700/80 text-slate-300 font-mono">
                          {cat.count}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Layered Week View Simulator */}
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-400" />
                        <span className="font-bold text-white">[School] 07:30 AM — 11:30 AM</span>
                      </div>
                      <span className="text-indigo-300 font-medium">3 Subjects (BSIT 3-A)</span>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                        <span className="font-bold text-white">[Work] 01:00 PM — 05:00 PM</span>
                      </div>
                      <span className="text-blue-300 font-medium">Remote Support Shift</span>
                    </div>

                    <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-400" />
                        <span className="font-bold text-white">[Personal] 06:00 PM — 07:30 PM</span>
                      </div>
                      <span className="text-purple-300 font-medium">Projects & Dinner</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 4. 3-STEP WORKFLOW ── */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-[12px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Lightning Fast Setup
          </span>
          <h2 className="text-[32px] sm:text-[40px] font-black tracking-tight text-slate-900">
            From COR paper slip to synced schedule in 10 seconds
          </h2>
          <p className="text-[16px] text-slate-600 font-medium">
            Three dead-simple steps to modernize your entire college timetable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm relative space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-[20px] shadow-sm">
              1
            </div>
            <h3 className="font-extrabold text-[20px] text-slate-900">Snap or Upload</h3>
            <p className="text-slate-600 text-[14px] leading-relaxed">
              Take a photo of your Certificate of Registration, study slip, or export it as PDF/PNG from your university portal.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm relative space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-[20px] shadow-sm">
              2
            </div>
            <h3 className="font-extrabold text-[20px] text-slate-900">AI Auto-Extraction</h3>
            <p className="text-slate-600 text-[14px] leading-relaxed">
              Gemini Vision AI parses your course codes, instructors, room numbers, and schedule times in seconds with high accuracy.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm relative space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-[20px] shadow-sm">
              3
            </div>
            <h3 className="font-extrabold text-[20px] text-slate-900">Sync & Go</h3>
            <p className="text-slate-600 text-[14px] leading-relaxed">
              Review your subjects, tweak colors, and your timetable is instantly ready on mobile, tablet, and desktop.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. COMPARISON MATRIX ── */}
      <section id="comparison" className="py-20 bg-slate-50/70 border-y border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <span className="text-[12px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Why Students Switch
            </span>
            <h2 className="text-[32px] sm:text-[40px] font-black tracking-tight text-slate-900">
              SnapSched vs. The Old Way
            </h2>
            <p className="text-[16px] text-slate-600 font-medium">
              See why spreadsheets and screenshot gallery folders are a thing of the past.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="p-4 sm:p-5 font-bold text-slate-700 text-[14px]">Feature</th>
                    <th className="p-4 sm:p-5 font-bold text-indigo-600 text-[15px] bg-indigo-50/50">
                      ✨ SnapSched
                    </th>
                    <th className="p-4 sm:p-5 font-semibold text-slate-500 text-[13px]">Excel / Sheets</th>
                    <th className="p-4 sm:p-5 font-semibold text-slate-500 text-[13px]">Phone Gallery Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13.5px]">
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold text-slate-800">Automatic OCR from COR</td>
                    <td className="p-4 sm:p-5 bg-indigo-50/20 font-bold text-emerald-600">
                      <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> 10 Seconds</div>
                    </td>
                    <td className="p-4 sm:p-5 text-slate-400">❌ Manual typing</td>
                    <td className="p-4 sm:p-5 text-slate-400">❌ Static image</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold text-slate-800">Live "In-Class" Status Tracker</td>
                    <td className="p-4 sm:p-5 bg-indigo-50/20 font-bold text-emerald-600">
                      <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Real-time</div>
                    </td>
                    <td className="p-4 sm:p-5 text-slate-400">❌ None</td>
                    <td className="p-4 sm:p-5 text-slate-400">❌ None</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold text-slate-800">Automatic Vacant Gap Finder</td>
                    <td className="p-4 sm:p-5 bg-indigo-50/20 font-bold text-emerald-600">
                      <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Built-in</div>
                    </td>
                    <td className="p-4 sm:p-5 text-slate-400">❌ Manual math</td>
                    <td className="p-4 sm:p-5 text-slate-400">❌ None</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold text-slate-800">Compare with Friends' Schedules</td>
                    <td className="p-4 sm:p-5 bg-indigo-50/20 font-bold text-emerald-600">
                      <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> 1-Click Match</div>
                    </td>
                    <td className="p-4 sm:p-5 text-slate-400">❌ Clunky</td>
                    <td className="p-4 sm:p-5 text-slate-400">❌ Group chat spam</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold text-slate-800">Multi-Device Cloud Sync</td>
                    <td className="p-4 sm:p-5 bg-indigo-50/20 font-bold text-emerald-600">
                      <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Supabase Realtime</div>
                    </td>
                    <td className="p-4 sm:p-5 text-slate-500">⚠️ Needs Google Drive</td>
                    <td className="p-4 sm:p-5 text-slate-400">❌ Local only</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. INTERACTIVE FAQ ACCORDION ── */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <span className="text-[12px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Got Questions?
          </span>
          <h2 className="text-[32px] sm:text-[38px] font-black tracking-tight text-slate-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden transition-all shadow-2xs"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-[15px] text-slate-900 hover:text-indigo-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-indigo-600' : ''
                      }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-[14px] text-slate-600 font-medium leading-relaxed animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 7. HIGH-CONVERSION CTA BANNER ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div
          className="rounded-3xl p-8 sm:p-14 text-center text-white relative overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #4338ca 0%, #4f46e5 50%, #7c3aed 100%)',
          }}
        >
          {/* Floating Glow Accents */}
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-300/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-[34px] sm:text-[46px] font-black tracking-tight text-white leading-tight">
              Ready to take control of your weekly schedule?
            </h2>
            <p className="text-indigo-100 text-[16px] sm:text-[18px] font-medium leading-relaxed">
              Join students, freelancers, and professionals who never miss a schedule, find easy focus gaps, and stay ahead.
            </p>

            <div className="flex justify-center pt-2">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-[16px] text-indigo-900 bg-white hover:bg-slate-50 shadow-xl transition-all hover:scale-[1.03] active:scale-[0.98]"
              >
                Get Started Free Now →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. FOOTER ── */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-[17px] tracking-tight">SnapSched</span>
            </div>

            <div className="flex items-center gap-6 text-[13px] font-medium text-slate-400">
              <a href="#features" className="hover:text-white transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="hover:text-white transition-colors">
                How It Works
              </a>
              <a href="#comparison" className="hover:text-white transition-colors">
                Comparison
              </a>
              <a href="#faq" className="hover:text-white transition-colors">
                FAQ
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
