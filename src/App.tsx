import React, { useState, useEffect } from 'react';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { TimetableGrid } from './components/timetable/TimetableGrid';
import { ClassModal } from './components/timetable/ClassModal';
import { ScheduleScanner } from './components/scanner/ScheduleScanner';
import { VacantBreakPlanner } from './components/planner/VacantBreakPlanner';
import { ScheduleCompare } from './components/compare/ScheduleCompare';
import { SettingsModal } from './components/settings/SettingsModal';
import { useSchedule } from './hooks/useSchedule';
import { useVacantPeriods } from './hooks/useVacantPeriods';
import { ClassItem, VacantPeriod } from './types/schedule';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('timetable');
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [targetVacantForPlanner, setTargetVacantForPlanner] = useState<VacantPeriod | null>(null);

  const {
    schedule,
    classes,
    allSets,
    isSyncing,
    syncMessage,
    addClassItem,
    updateClassItem,
    deleteClassItem,
    importOcrClasses,
    switchScheduleSet,
    createNewScheduleSet,
    syncToCloud,
    resetToSample,
  } = useSchedule();

  const {
    allVacantPeriods,
    todayAbbr,
    currentStatus,
    currentTime,
  } = useVacantPeriods(classes);

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

  return (
    <div className="min-h-screen bg-zinc-100/60 text-zinc-900 selection:bg-blue-600 selection:text-white flex justify-center">
      {/* 1280px Bounded Application Shell (AppBuilders Dimension) */}
      <div className="w-full max-w-7xl min-h-screen flex bg-zinc-50 border-x border-zinc-200/80 shadow-xs">
        {/* 208px Side Navigation Rail */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          schedule={schedule}
          allSets={allSets}
          onSelectSet={switchScheduleSet}
          vacantCount={allVacantPeriods.length}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top 44px Control Bar */}
          <Header
            schedule={schedule}
            onOpenAddModal={handleOpenAddModal}
            currentStatus={currentStatus}
            currentTime={currentTime}
          />

          {/* Dynamic Workspace Canvas */}
          <main className="flex-1 p-3 md:p-4 pb-16 md:pb-4 w-full animate-fade-in">
          {activeTab === 'timetable' && (
            <TimetableGrid
              classes={classes}
              vacantPeriods={allVacantPeriods}
              todayAbbr={todayAbbr}
              currentTime={currentTime}
              onEditClass={handleOpenEditModal}
              onDeleteClass={deleteClassItem}
              onAddClass={handleOpenAddModal}
              onSelectVacant={handleSelectVacantFromGrid}
            />
          )}

          {activeTab === 'scanner' && (
            <ScheduleScanner
              onImportClasses={(imported, replace) => {
                importOcrClasses(imported, replace);
                setActiveTab('timetable');
              }}
              onOpenSettings={() => setActiveTab('settings')}
            />
          )}

          {activeTab === 'breaks' && (
            <VacantBreakPlanner
              vacantPeriods={allVacantPeriods}
              selectedVacant={targetVacantForPlanner}
            />
          )}

          {activeTab === 'compare' && (
            <ScheduleCompare userSchedule={schedule} />
          )}

          {activeTab === 'settings' && (
            <SettingsModal
              schedule={schedule}
              allSets={allSets}
              onSelectSet={switchScheduleSet}
              onCreateSet={createNewScheduleSet}
              onResetToSample={resetToSample}
            />
          )}
        </main>
      </div>

      {/* Add / Edit Class Modal Dialog */}
      <ClassModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        onSave={addClassItem}
        onUpdate={updateClassItem}
        initialData={editingClass}
      />
      </div>
    </div>
  );
}

export default App;
