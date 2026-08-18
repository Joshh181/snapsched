import React from 'react';
import {
  Calendar,
  ScanLine,
  Coffee,
  Users2,
  Settings,
  X,
  ChevronDown,
  BookOpen,
} from 'lucide-react';
import { ScheduleSet } from '../../types/schedule';

export type ActiveTab = 'timetable' | 'scanner' | 'breaks' | 'compare' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  schedule: ScheduleSet;
  allSets: ScheduleSet[];
  onSelectSet: (setId: string) => void;
  vacantCount: number;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  schedule,
  allSets,
  onSelectSet,
  vacantCount,
  isOpen,
  onClose,
}) => {
  const totalUnits = schedule.items.reduce((sum, item) => sum + (item.units || 0), 0);

  const navItems = [
    {
      id: 'timetable' as ActiveTab,
      label: 'Timetable',
      icon: Calendar,
      badge: schedule.items.length > 0 ? `${schedule.items.length}` : undefined,
    },
    {
      id: 'scanner' as ActiveTab,
      label: 'Schedule Scanner',
      icon: ScanLine,
    },
    {
      id: 'breaks' as ActiveTab,
      label: 'Study Planner',
      icon: Coffee,
      badge: vacantCount > 0 ? `${vacantCount}` : undefined,
    },
    {
      id: 'compare' as ActiveTab,
      label: 'Compare Friends',
      icon: Users2,
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Settings',
      icon: Settings,
    },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs animate-overlay-in lg:hidden"
          style={{ zIndex: 'var(--z-overlay)' }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Floating Card Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 w-[270px]
          flex flex-col justify-between
          bg-white select-none
          transition-transform duration-300
          lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:translate-x-0
          lg:rounded-3xl lg:shadow-card lg:border lg:border-white/80
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          zIndex: 'var(--z-sidebar)',
        }}
      >
        {/* Top section */}
        <div className="flex flex-col min-h-0 p-4">
          {/* Brand header */}
          <div className="flex items-center justify-between pb-3 px-1">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-2xl flex items-center justify-center text-white"
                style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                  boxShadow: '0 2px 8px -2px rgba(79, 70, 229, 0.4)',
                }}
              >
                <BookOpen className="w-[18px] h-[18px]" />
              </div>
              <div>
                <div className="font-bold text-[16px] tracking-tight text-slate-900">
                  SnapSched
                </div>
                <p className="text-[12px] text-slate-500 font-medium truncate max-w-[140px]">
                  {schedule.name || 'Academic Timetable'}
                </p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-slate-500"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Semester Selector Pill */}
          <div className="my-2 px-1">
            <div className="relative">
              <select
                value={schedule.id}
                onChange={(e) => onSelectSet(e.target.value)}
                aria-label="Select Schedule"
                className="w-full appearance-none font-semibold text-[12px] pl-3 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 cursor-pointer focus:outline-none focus:border-indigo-400 transition-colors"
              >
                {allSets.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
              />
            </div>
          </div>

          {/* Navigation Items (Rounded Pill style) */}
          <nav className="flex-1 space-y-1 mt-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[13px] font-medium transition-all group ${
                    isActive
                      ? 'bg-indigo-50/90 text-indigo-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-[18px] h-[18px] transition-colors ${
                        isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                        isActive ? 'bg-indigo-200/80 text-indigo-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom summary card */}
        <div className="p-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-slate-100/80">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>Total Units</span>
              <span className="text-indigo-700 font-bold">{totalUnits} units</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mt-1.5">
              <span>Classes</span>
              <span className="text-slate-800 font-bold">{schedule.items.length} subjects</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
