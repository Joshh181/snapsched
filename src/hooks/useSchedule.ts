import { useState, useEffect, useCallback } from 'react';
import { ScheduleSet, ClassItem, OcrParsedClass } from '../types/schedule';
import { storageService } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import * as cloud from '../services/supabaseDataService';
import { COLOR_PALETTES } from '../data/sampleSchedules';
import { INITIAL_SCHEDULE_SET } from '../data/sampleSchedules';

export const useSchedule = () => {
  const { user } = useAuth();
  const isCloud = !!user;

  const [activeSchedule, setActiveSchedule] = useState<ScheduleSet>(() => storageService.getActiveSchedule());
  const [allSets, setAllSets] = useState<ScheduleSet[]>(() => storageService.getAllScheduleSets());
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Load data from Supabase when user logs in
  useEffect(() => {
    if (!isCloud) return;

    let cancelled = false;

    const loadCloudData = async () => {
      setIsLoading(true);

      // Attempt migration of localStorage data on first login
      const migrationResult = await cloud.migrateFromLocalStorage();
      if (migrationResult.migrated) {
        console.log('[SnapSched]', migrationResult.message);
      }

      // Fetch cloud data
      const cloudSets = await cloud.fetchScheduleSets();

      if (cancelled) return;

      if (cloudSets.length > 0) {
        setAllSets(cloudSets);
        const defaultSet = cloudSets.find(s => s.isDefault) || cloudSets[0];
        setActiveSchedule(defaultSet);
      } else {
        // No cloud data — create initial set
        const initialSet: ScheduleSet = {
          ...INITIAL_SCHEDULE_SET,
          id: `set-${Date.now()}`,
        };
        await cloud.createScheduleSet(initialSet);
        const refreshed = await cloud.fetchScheduleSets();
        if (!cancelled && refreshed.length > 0) {
          setAllSets(refreshed);
          setActiveSchedule(refreshed[0]);
        }
      }

      setIsLoading(false);
    };

    loadCloudData();
    return () => { cancelled = true; };
  }, [isCloud, user?.id]);

  // Save to localStorage whenever active schedule changes (fallback mode only)
  useEffect(() => {
    if (!isCloud) {
      storageService.saveActiveSchedule(activeSchedule);
    }
  }, [activeSchedule, isCloud]);

  // Add new class item
  const addClassItem = useCallback(async (item: Omit<ClassItem, 'id'>) => {
    const newItem: ClassItem = {
      ...item,
      id: `class-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      color: item.color || COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)],
      scheduleId: activeSchedule.id,
    };

    // Optimistic update
    setActiveSchedule((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    if (isCloud) {
      await cloud.createClass(activeSchedule.id, newItem);
    }
  }, [activeSchedule.id, isCloud]);

  // Update existing class item
  const updateClassItem = useCallback(async (id: string, updated: Partial<ClassItem>) => {
    setActiveSchedule((prev) => ({
      ...prev,
      items: prev.items.map((c) => (c.id === id ? { ...c, ...updated } : c)),
    }));

    if (isCloud) {
      await cloud.updateClass(id, updated);
    }
  }, [isCloud]);

  // Delete single class item
  const deleteClassItem = useCallback(async (id: string) => {
    setActiveSchedule((prev) => ({
      ...prev,
      items: prev.items.filter((c) => c.id !== id),
    }));

    if (isCloud) {
      await cloud.deleteClass(id);
    }
  }, [isCloud]);

  // Bulk delete multiple classes by ID
  const deleteMultipleClasses = useCallback(async (ids: string[]) => {
    const idSet = new Set(ids);
    setActiveSchedule((prev) => ({
      ...prev,
      items: prev.items.filter((c) => !idSet.has(c.id)),
    }));

    if (isCloud) {
      await cloud.deleteMultipleClasses(ids);
    }
  }, [isCloud]);

  // Clear all items in a specific category
  const clearCategoryClasses = useCallback(async (categoryName: string) => {
    setActiveSchedule((prev) => ({
      ...prev,
      items: prev.items.filter((c) => (c.category || 'School').toLowerCase() !== categoryName.toLowerCase()),
    }));

    if (isCloud) {
      await cloud.deleteClassesByCategory(activeSchedule.id, categoryName);
    }
  }, [isCloud, activeSchedule.id]);

  // Clear all items across all categories
  const clearAllClasses = useCallback(async () => {
    setActiveSchedule((prev) => ({
      ...prev,
      items: [],
    }));

    if (isCloud) {
      await cloud.deleteAllClasses(activeSchedule.id);
    }
  }, [isCloud, activeSchedule.id]);

  // Import confirmed OCR items into active schedule
  const importOcrClasses = useCallback(async (ocrClasses: OcrParsedClass[], replaceExisting: boolean = false) => {
    const savedCategories = storageService.getCategories();
    const newItems: ClassItem[] = ocrClasses.map((item, idx) => {
      const itemCategory = item.category || 'School';
      const matchedCat = savedCategories.find((c) => c.name.toLowerCase() === itemCategory.toLowerCase());
      const itemColor = matchedCat?.color || COLOR_PALETTES[idx % COLOR_PALETTES.length];

      return {
        id: `class-${Date.now()}-${idx}`,
        code: item.code,
        name: item.name,
        category: itemCategory,
        section: item.section || activeSchedule.course || 'Enrolled',
        instructor: item.instructor || 'Department Faculty',
        room: item.room,
        days: item.days,
        startTime: item.startTime,
        endTime: item.endTime,
        color: itemColor,
        units: item.units || 3,
        scheduleId: activeSchedule.id,
      };
    });

    setActiveSchedule((prev) => ({
      ...prev,
      items: replaceExisting ? newItems : [...prev.items, ...newItems],
    }));

    if (isCloud) {
      if (replaceExisting) {
        await cloud.deleteAllClasses(activeSchedule.id);
      }
      for (const item of newItems) {
        await cloud.createClass(activeSchedule.id, item);
      }
    }
  }, [activeSchedule.id, activeSchedule.course, isCloud]);

  // Switch between saved schedule sets (e.g. 1st Sem vs 2nd Sem)
  const switchScheduleSet = useCallback(async (setId: string) => {
    if (isCloud) {
      const target = allSets.find((s) => s.id === setId);
      if (target) {
        setActiveSchedule(target);
      }
    } else {
      const sets = storageService.getAllScheduleSets();
      const target = sets.find((s) => s.id === setId);
      if (target) {
        setActiveSchedule(target);
      }
    }
  }, [isCloud, allSets]);

  // Create new schedule set
  const createNewScheduleSet = useCallback(async (name: string, semester: string, academicYear: string) => {
    const newSet: ScheduleSet = {
      id: `set-${Date.now()}`,
      name,
      semester,
      academicYear,
      isDefault: false,
      createdAt: new Date().toISOString(),
      items: [],
    };

    const updated = [...allSets, newSet];
    setAllSets(updated);
    setActiveSchedule(newSet);

    if (isCloud) {
      await cloud.createScheduleSet(newSet);
    } else {
      storageService.saveAllScheduleSets(updated);
    }
  }, [allSets, isCloud]);

  // Reset to default preloaded schedule
  const resetToSample = useCallback(async () => {
    if (isCloud) {
      // Delete all cloud data and create fresh
      for (const s of allSets) {
        await cloud.deleteScheduleSet(s.id);
      }
      const initialSet: ScheduleSet = {
        ...INITIAL_SCHEDULE_SET,
        id: `set-${Date.now()}`,
      };
      await cloud.createScheduleSet(initialSet);
      const refreshed = await cloud.fetchScheduleSets();
      if (refreshed.length > 0) {
        setAllSets(refreshed);
        setActiveSchedule(refreshed[0]);
      }
    } else {
      const initial = storageService.resetToSample();
      setActiveSchedule(initial);
      setAllSets(storageService.getAllScheduleSets());
    }
  }, [isCloud, allSets]);

  return {
    schedule: activeSchedule,
    classes: activeSchedule.items,
    allSets,
    isLoading,
    isSyncing,
    syncMessage,
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
  };
};
