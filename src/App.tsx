import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ScanLine,
  Coffee,
  Users2,
  Settings,
} from 'lucide-react';
import { useSchedule } from './hooks/useSchedule';
import { useVacantPeriods } from './hooks/useVacantPeriods';
import { storageService } from './services/storageService';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { TimetableGrid } from './components/timetable/TimetableGrid';
import { ScheduleScanner } from './components/scanner/ScheduleScanner';
import { VacantBreakPlanner } from './components/planner/VacantBreakPlanner';
import { ScheduleCompare } from './components/compare/ScheduleCompare';
import { SettingsModal } from './components/settings/SettingsModal';
import { ClassModal } from './components/timetable/ClassModal';
import { ClassItem, VacantPeriod } from './types/schedule';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('timetable');
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [targetVacantForPlanner, setTargetVacantForPlanner] = useState<VacantPeriod | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    return storageService.getCategories()[0]?.name || 'School';
  });

  const {
    schedule,
    classes,
    allSets,
    addClassItem,
    updateClassItem,
    deleteClassItem,
    deleteMultipleClasses,
    clearCategoryClasses,
    clearAllClasses,
    importOcrClasses,
    switchScheduleSet,
    createNewScheduleSet,
    resetToSample,
  } = useSchedule();

  const currentCategoryClasses = classes.filter(
    (c) => (c.category || 'School').toLowerCase() === selectedCategory.toLowerCase()
  );

  const {
    allVacantPeriods,
    todayAbbr,
    currentStatus,
    currentTime,
  } = useVacantPeriods(currentCategoryClasses);

  // Close sidebar on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (['input', 'textarea', 'select'].includes(activeTag)) return;

      if (e.key === '1') setActiveTab('timetable');
      else if (e.key === '2') setActiveTab('scanner');
      else if (e.key === '3') setActiveTab('breaks');
      else if (e.key === '4') setActiveTab('compare');
      else if (e.key === '5') setActiveTab('settings');
      else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleOpenAddModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenAddModal = () => {
    setEditingClass(null);
    setIsClassModalOpen(true);
  };

  const handleOpenEditModal = (item: ClassItem) => {
    setEditingClass(item);
    setIsClassModalOpen(true);
  };

  const handleSelectVacantFromGrid = (vacant: VacantPeriod) => {
    setTargetVacantForPlanner(vacant);
    setActiveTab('breaks');
  };

  const mobileNavItems = [
    { id: 'timetable' as ActiveTab, icon: Calendar, label: 'Timetable' },
    { id: 'scanner' as ActiveTab, icon: ScanLine, label: 'Scanner' },
    { id: 'breaks' as ActiveTab, icon: Coffee, label: 'Planner' },
    { id: 'compare' as ActiveTab, icon: Users2, label: 'Compare' },
    { id: 'settings' as ActiveTab, icon: Settings, label: 'Settings' },
  ];

  return (
    <div
      className="min-h-screen flex justify-center"
      style={{ background: 'var(--surface-ground)', color: 'var(--text-primary)' }}
    >
      {/* Bounded application shell */}
      <div
        className="w-full max-w-[1400px] min-h-screen flex"
        style={{
          background: 'var(--surface-primary)',
        }}
      >
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          schedule={schedule}
          allSets={allSets}
          onSelectSet={switchScheduleSet}
          vacantCount={allVacantPeriods.length}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top header bar */}
          <Header
            schedule={schedule}
            onOpenAddModal={handleOpenAddModal}
            onToggleSidebar={() => setIsSidebarOpen(true)}
            currentStatus={currentStatus}
            currentTime={currentTime}
          />

          {/* Workspace content */}
          <main
            className="flex-1 p-4 md:p-5 lg:p-6 w-full pb-20 lg:pb-6"
            style={{ background: 'var(--surface-ground)' }}
          >
            <div className="animate-fade-in">
              {activeTab === 'timetable' && (
                <TimetableGrid
                  classes={classes}
                  vacantPeriods={allVacantPeriods}
                  todayAbbr={todayAbbr}
                  currentTime={currentTime}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  onEditClass={handleOpenEditModal}
                  onDeleteClass={deleteClassItem}
                  onClearCategory={clearCategoryClasses}
                  onDeleteMultiple={deleteMultipleClasses}
                  onAddClass={handleOpenAddModal}
                  onSelectVacant={handleSelectVacantFromGrid}
                />
              )}

              {activeTab === 'scanner' && (
                <ScheduleScanner
                  activeCategory={selectedCategory}
                  onImportClasses={(imported, replace) => {
                    const targetCat = imported.find((i) => i.category)?.category || imported[0]?.category || selectedCategory || 'School';
                    importOcrClasses(imported, replace);
                    setSelectedCategory(targetCat);
                    setActiveTab('timetable');
                  }}
                  onOpenSettings={() => setActiveTab('settings')}
                />
              )}

              {activeTab === 'breaks' && (
                <VacantBreakPlanner
                  vacantPeriods={allVacantPeriods}
                  selectedVacant={targetVacantForPlanner}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              )}

              {activeTab === 'compare' && (
                <ScheduleCompare
                  userSchedule={schedule}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsModal
                  schedule={schedule}
                  allSets={allSets}
                  onSelectSet={switchScheduleSet}
                  onCreateSet={createNewScheduleSet}
                  onResetToSample={resetToSample}
                  onClearAll={clearAllClasses}
                />
              )}
            </div>
          </main>
        </div>

        {/* Add / Edit Class Modal */}
        <ClassModal
          isOpen={isClassModalOpen}
          onClose={() => setIsClassModalOpen(false)}
          onSave={addClassItem}
          onUpdate={updateClassItem}
          initialData={editingClass}
          activeCategory={selectedCategory}
        />
      </div>

      {/* Mobile bottom navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 lg:hidden flex items-center justify-around px-2 py-1"
        style={{
          background: 'var(--surface-primary)',
          borderTop: '1px solid var(--border-default)',
          zIndex: 'var(--z-sticky)',
          boxShadow: '0 -1px 3px rgba(0,0,0,0.06)',
        }}
      >
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-lg transition-colors min-w-[56px]"
              style={{
                color: isActive ? 'var(--brand-600)' : 'var(--text-muted)',
              }}
            >
              <Icon className="w-5 h-5" />
              <span
                className="text-[10px] font-medium"
                style={{
                  color: isActive ? 'var(--brand-600)' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default App;

