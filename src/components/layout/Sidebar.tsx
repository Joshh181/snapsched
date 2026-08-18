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
      label: 'Compare',
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
          className="fixed inset-0 bg-black/30 animate-overlay-in lg:hidden"
          style={{ zIndex: 'var(--z-overlay)' }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 w-[260px]
          flex flex-col justify-between
          bg-white border-r select-none
          transition-transform duration-300
          lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          zIndex: 'var(--z-sidebar)',
          borderColor: 'var(--border-default)',
        }}
      >
        {/* Top section */}
        <div className="flex flex-col min-h-0">
          {/* Brand header */}
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                style={{ background: 'var(--brand-600)', boxShadow: 'var(--shadow-xs)' }}
              >
                <BookOpen className="w-[18px] h-[18px]" />
              </div>
              <div>
                <div className="font-semibold text-[15px] tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  SnapSched
                </div>
                <p className="text-[12px] mt-0.5 truncate max-w-[140px]" style={{ color: 'var(--text-tertiary)' }}>
                  {schedule.name || 'Academic Timetable'}
                </p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Close navigation"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Semester selector */}
          <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <label className="block text-[11px] font-medium mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
              Schedule Set
            </label>
            <div className="relative">
              <select
                value={schedule.id}
                onChange={(e) => onSelectSet(e.target.value)}
                aria-label="Select Schedule"
                className="w-full appearance-none font-medium text-[13px] pl-3 pr-8 py-2 rounded-lg border cursor-pointer focus:outline-none transition-colors"
                style={{
                  background: 'var(--surface-secondary)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--text-primary)',
                }}
              >
                {allSets.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group"
                  style={{
                    background: isActive ? 'var(--brand-50)' : 'transparent',
                    color: isActive ? 'var(--brand-700)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'var(--surface-secondary)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className="w-[18px] h-[18px] transition-colors"
                      style={{ color: isActive ? 'var(--brand-600)' : 'var(--text-muted)' }}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md min-w-[22px] text-center"
                      style={{
                        background: isActive ? 'var(--brand-100)' : 'var(--surface-tertiary)',
                        color: isActive ? 'var(--brand-700)' : 'var(--text-tertiary)',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Academic stats */}
        <div className="px-4 py-4 space-y-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div
            className="p-3 rounded-lg space-y-2"
            style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center justify-between text-[13px]">
              <span style={{ color: 'var(--text-secondary)' }}>Study Load</span>
              <span className="font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                {totalUnits} units
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center py-1.5 rounded-md" style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)' }}>
                <div className="text-[14px] font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                  {schedule.items.length}
                </div>
                <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Classes</div>
              </div>
              <div className="text-center py-1.5 rounded-md" style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)' }}>
                <div className="text-[14px] font-semibold tabular-nums" style={{ color: 'var(--status-warning)' }}>
                  {vacantCount}
                </div>
                <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Free Periods</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] px-1" style={{ color: 'var(--text-muted)' }}>
            <span>{schedule.semester || 'AY 2026-2027'}</span>
          </div>
        </div>
      </aside>
    </>
  );
};
