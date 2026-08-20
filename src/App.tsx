import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ScanLine,
  Coffee,
  Users2,
  Settings,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/auth/AuthPage';
import { LandingPage } from './components/landing/LandingPage';
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

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [visitorView, setVisitorView] = useState<'landing' | 'auth'>('landing');
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
    updateScheduleProfile,
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

  // Show loading spinner during auth initialization
  if (authLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'radial-gradient(ellipse at 12% 8%, #e0e7ff 0%, transparent 42%), radial-gradient(ellipse at 88% 12%, #ede9fe 0%, transparent 40%), #f4f6fc',
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-sm text-slate-500 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  // Unauthenticated Visitor Flow: Landing Page -> Auth
  if (!user && visitorView === 'landing') {
    return (
      <LandingPage
        onGetStarted={() => setVisitorView('auth')}
        onSignIn={() => setVisitorView('auth')}
      />
    );
  }

  if (!user && visitorView === 'auth') {
    return <AuthPage onBackToLanding={() => setVisitorView('landing')} />;
  }

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{
        background: 'radial-gradient(ellipse at 12% 8%, #e0e7ff 0%, transparent 42%), radial-gradient(ellipse at 88% 12%, #ede9fe 0%, transparent 40%), #f4f6fc',
        color: 'var(--text-primary)',
      }}
    >
      {/* Floating Canvas Shell */}
      <div className="w-full max-w-[1500px] mx-auto min-h-screen p-2 md:p-4 lg:p-5 flex gap-5">
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
          <main className="flex-1 w-full pb-6 px-1 md:px-2">
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
                  onUpdateProfile={updateScheduleProfile}
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
          onDelete={deleteClassItem}
          initialData={editingClass}
          activeCategory={selectedCategory}
        />
      </div>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
