import React from 'react';
import { 
  Calendar, 
  ScanLine, 
  Coffee, 
  Users2, 
  SlidersHorizontal, 
  Layers,
  ChevronDown
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
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  schedule,
  allSets,
  onSelectSet,
  vacantCount,
}) => {
  const totalUnits = schedule.items.reduce((sum, item) => sum + (item.units || 0), 0);

  const navItems = [
    {
      id: 'timetable' as ActiveTab,
      label: 'Timetable',
      icon: Calendar,
      badge: `${schedule.items.length}`,
      shortcut: '1',
    },
    {
      id: 'scanner' as ActiveTab,
      label: 'OCR Scanner',
      icon: ScanLine,
      badge: 'AI',
      shortcut: '2',
    },
    {
      id: 'breaks' as ActiveTab,
      label: 'Breaks & Focus',
      icon: Coffee,
      badge: vacantCount > 0 ? `${vacantCount}` : undefined,
      shortcut: '3',
    },
    {
      id: 'compare' as ActiveTab,
      label: 'Compare',
      icon: Users2,
      shortcut: '4',
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Settings',
      icon: SlidersHorizontal,
      shortcut: '5',
    },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR (Visible on md and larger) */}
      <aside className="hidden md:flex w-52 bg-zinc-100/90 border-r border-zinc-200 flex-col justify-between shrink-0 h-screen sticky top-0 z-30 select-none backdrop-blur-md">
        {/* Top: Brand & Workspace */}
        <div>
          {/* Brand Header */}
          <div className="p-3.5 border-b border-zinc-200/80">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-xs tracking-tight text-zinc-900">SnapSched</span>
                  <span className="text-[9px] font-mono font-semibold px-1 py-0.2 rounded bg-zinc-200 text-zinc-700">
                    PRO
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 truncate font-mono mt-0.5">
                  {schedule.name || 'Academic Timetable'}
                </p>
              </div>
            </div>

            {/* Semester Selector Dropdown */}
            <div className="mt-2.5 relative">
              <select
                value={schedule.id}
                onChange={(e) => onSelectSet(e.target.value)}
                aria-label="Select Schedule"
                className="w-full appearance-none bg-white text-zinc-800 font-medium text-[11px] pl-2.5 pr-6 py-1 rounded-md border border-zinc-200 hover:border-zinc-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors shadow-2xs"
              >
                {allSets.map((s) => (
                  <option key={s.id} value={s.id} className="text-zinc-900 bg-white">
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Navigation list */}
          <nav className="p-2 space-y-0.5">
            <div className="px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 group ${
                    isActive
                      ? 'bg-white text-zinc-900 font-semibold shadow-xs border border-zinc-200/90'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-blue-600' : 'text-zinc-400 group-hover:text-zinc-700'}`} />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono px-1 py-0.2 rounded ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                            : 'bg-zinc-200/70 text-zinc-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    <kbd className="hidden group-hover:inline-block text-[9px] font-mono text-zinc-400 bg-zinc-200 px-1 py-0.2 rounded">
                      {item.shortcut}
                    </kbd>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Academic load footer */}
        <div className="p-2.5 border-t border-zinc-200/80 space-y-2">
          <div className="p-2 rounded-md bg-white border border-zinc-200/80 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-500 font-medium">Study Load</span>
              <span className="font-mono font-semibold text-zinc-800">{totalUnits} Units</span>
            </div>

            <div className="grid grid-cols-2 gap-1 text-center">
              <div className="p-1 rounded bg-zinc-50 border border-zinc-150">
                <div className="text-xs font-mono font-semibold text-zinc-900">{schedule.items.length}</div>
                <div className="text-[9px] text-zinc-500 font-medium">Classes</div>
              </div>
              <div className="p-1 rounded bg-zinc-50 border border-zinc-150">
                <div className="text-xs font-mono font-semibold text-amber-600">{vacantCount}</div>
                <div className="text-[9px] text-zinc-500 font-medium">Breaks</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-zinc-400 px-1 font-mono">
            <span>{schedule.semester || 'AY 2026-2027'}</span>
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Live
            </span>
          </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION BAR (Visible on screens < md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-zinc-200 px-2 py-1.5 flex items-center justify-around backdrop-blur-md shadow-lg select-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-md text-[10px] transition-colors relative ${
                isActive ? 'text-blue-600 font-semibold' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label.split(' ')[0]}</span>
              {item.badge && (
                <span className="absolute top-0 right-1 w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
