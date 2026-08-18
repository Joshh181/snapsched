import { useState, useEffect, useCallback } from 'react';
import { ScheduleSet, ClassItem, OcrParsedClass } from '../types/schedule';
import { storageService } from '../services/storageService';
import { cloudService } from '../services/supabaseClient';
import { COLOR_PALETTES } from '../data/sampleSchedules';

export const useSchedule = () => {
  const [activeSchedule, setActiveSchedule] = useState<ScheduleSet>(() => storageService.getActiveSchedule());
  const [allSets, setAllSets] = useState<ScheduleSet[]>(() => storageService.getAllScheduleSets());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Save to storage whenever active schedule changes
  useEffect(() => {
    storageService.saveActiveSchedule(activeSchedule);
  }, [activeSchedule]);

  // Add new class item
  const addClassItem = useCallback((item: Omit<ClassItem, 'id'>) => {
    const newItem: ClassItem = {
      ...item,
      id: `class-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      color: item.color || COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)],
      scheduleId: activeSchedule.id,
    };

    setActiveSchedule((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  }, [activeSchedule.id]);

  // Update existing class item
  const updateClassItem = useCallback((id: string, updated: Partial<ClassItem>) => {
    setActiveSchedule((prev) => ({
      ...prev,
      items: prev.items.map((c) => (c.id === id ? { ...c, ...updated } : c)),
    }));
  }, []);

  // Delete class item
  const deleteClassItem = useCallback((id: string) => {
    setActiveSchedule((prev) => ({
      ...prev,
      items: prev.items.filter((c) => c.id !== id),
    }));
  }, []);

  // Import confirmed OCR items into active schedule
  const importOcrClasses = useCallback((ocrClasses: OcrParsedClass[], replaceExisting: boolean = false) => {
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
  }, [activeSchedule.id, activeSchedule.course]);

  // Switch between saved schedule sets (e.g. 1st Sem vs 2nd Sem)
  const switchScheduleSet = useCallback((setId: string) => {
    const sets = storageService.getAllScheduleSets();
    const target = sets.find((s) => s.id === setId);
    if (target) {
      setActiveSchedule(target);
    }
  }, []);

  // Create new schedule set
  const createNewScheduleSet = useCallback((name: string, semester: string, academicYear: string) => {
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
    storageService.saveAllScheduleSets(updated);
    setActiveSchedule(newSet);
  }, [allSets]);

  // Sync to Supabase Cloud
  const syncToCloud = useCallback(async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const result = await cloudService.syncScheduleToCloud(activeSchedule);
      setSyncMessage(result.message);
    } catch (e: any) {
      setSyncMessage(e.message || 'Failed to sync.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 4000);
    }
  }, [activeSchedule]);

  // Reset to default preloaded schedule
  const resetToSample = useCallback(() => {
    const initial = storageService.resetToSample();
    setActiveSchedule(initial);
    setAllSets(storageService.getAllScheduleSets());
  }, []);

  return {
    schedule: activeSchedule,
    classes: activeSchedule.items,
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
  };
};
