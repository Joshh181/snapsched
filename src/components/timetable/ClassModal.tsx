import React, { useState, useEffect } from 'react';
import { X, MapPin, User, Check, Tag, Trash2 } from 'lucide-react';
import { ClassItem, DayAbbreviation, DAYS_OF_WEEK, CategoryItem } from '../../types/schedule';
import { COLOR_PALETTES } from '../../data/sampleSchedules';
import { storageService } from '../../services/storageService';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classData: Omit<ClassItem, 'id'>) => void;
  onUpdate?: (id: string, classData: Partial<ClassItem>) => void;
  onDelete?: (id: string) => void;
  initialData?: ClassItem | null;
  activeCategory?: string;
}

export const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  initialData,
  activeCategory = 'School',
}) => {
  const [categories, setCategories] = useState<CategoryItem[]>(() => storageService.getCategories());
  const [category, setCategory] = useState(activeCategory);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [section, setSection] = useState('');
  const [instructor, setInstructor] = useState('');
  const [room, setRoom] = useState('');
  const [days, setDays] = useState<DayAbbreviation[]>(['M', 'W']);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:30');
  const [color, setColor] = useState(COLOR_PALETTES[0]);
  const [units, setUnits] = useState(3);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setCategories(storageService.getCategories());
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code);
      setName(initialData.name);
      setCategory(initialData.category || activeCategory);
      setSection(initialData.section || '');
      setInstructor(initialData.instructor || '');
      setRoom(initialData.room);
      setDays(initialData.days);
      setStartTime(initialData.startTime);
      setEndTime(initialData.endTime);
      setColor(initialData.color);
      setUnits(initialData.units || 3);
      setNotes(initialData.notes || '');
    } else {
      const defaultCat = activeCategory || 'School';
      setCode('');
      setName('');
      setCategory(defaultCat);
      setSection('BSIT 3-A');
      setInstructor('');
      setRoom('');
      setDays(['M', 'W']);
      setStartTime('08:00');
      setEndTime('09:30');
      const matched = storageService.getCategories().find((c) => c.name.toLowerCase() === defaultCat.toLowerCase());
      setColor(matched?.color || COLOR_PALETTES[0]);
      setUnits(3);
      setNotes('');
    }
    setErrors({});
  }, [initialData, isOpen, activeCategory]);

  if (!isOpen) return null;

  const toggleDay = (dayKey: DayAbbreviation) => {
    if (days.includes(dayKey)) {
      if (days.length > 1) {
        setDays(days.filter((d) => d !== dayKey));
      }
    } else {
      setDays([...days, dayKey]);
    }
  };

  const handleCategoryChange = (selectedCatName: string) => {
    setCategory(selectedCatName);
    const matchedCat = categories.find((c) => c.name.toLowerCase() === selectedCatName.toLowerCase());
    if (matchedCat) {
      setColor(matchedCat.color);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!code.trim()) newErrors.code = 'Title / Code is required';
    if (!name.trim()) newErrors.name = 'Description / Name is required';
    if (!room.trim()) newErrors.room = 'Location / Room is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      code: code.trim(),
      name: name.trim(),
      category: category.trim(),
      section: section.trim(),
      instructor: instructor.trim(),
      room: room.trim(),
      days,
      startTime,
      endTime,
      color,
      units: Number(units) || 3,
      notes: notes.trim(),
    };

    if (initialData && onUpdate) {
      onUpdate(initialData.id, payload);
    } else {
      onSave(payload);
    }
    onClose();
  };

  const inputClasses = "w-full text-[13px] pl-3 pr-3 py-2 rounded-lg focus:outline-none transition-colors";
  const inputStyle = {
    background: 'var(--surface-secondary)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
  };
  const inputFocusStyle = {
    borderColor: 'var(--brand-500)',
    background: 'var(--surface-primary)',
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 animate-overlay-in select-none"
      style={{ zIndex: 'var(--z-modal)', background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-scale-in"
        style={{
          background: 'var(--surface-primary)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-overlay)',
        }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border-default)', background: 'var(--surface-secondary)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: color, boxShadow: 'var(--shadow-xs)' }}
            />
            <h3 className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>
              {initialData ? 'Edit Schedule Item' : 'Add New Schedule Item'}
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            {initialData && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete ${initialData.code || 'this schedule item'} - ${initialData.name}?`)) {
                    onDelete(initialData.id);
                    onClose();
                  }
                }}
                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title="Delete Schedule Item"
                aria-label="Delete Schedule Item"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors hover:bg-gray-100"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Category Selector Bar */}
          <div>
            <label className="block text-[12px] font-medium mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
              <Tag className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              Category
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {categories.map((cat) => {
                const isSelected = category.toLowerCase() === cat.name.toLowerCase();
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.name)}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-medium flex items-center gap-1.5 transition-all"
                    style={{
                      background: isSelected ? 'var(--brand-50)' : 'var(--surface-secondary)',
                      color: isSelected ? 'var(--brand-800)' : 'var(--text-secondary)',
                      border: isSelected ? '1px solid var(--brand-400)' : '1px solid var(--border-subtle)',
                      fontWeight: isSelected ? 600 : 500,
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title / Code + Units */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Code / Title <span style={{ color: 'var(--status-error)' }}>*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. IT 311 or WORK SHIFT"
                className={inputClasses}
                style={{
                  ...inputStyle,
                  borderColor: errors.code ? 'var(--status-error)' : 'var(--border-default)',
                }}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              />
              {errors.code && (
                <p className="text-[11px] mt-1" style={{ color: 'var(--status-error)' }}>{errors.code}</p>
              )}
            </div>
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Units / Load
              </label>
              <input
                type="number"
                min="0"
                max="9"
                value={units}
                onChange={(e) => setUnits(Number(e.target.value))}
                className={inputClasses}
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              />
            </div>
          </div>

          {/* Subject / Activity Name */}
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Description / Subject Name <span style={{ color: 'var(--status-error)' }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Distributed Systems or Workout Routine"
              className={inputClasses}
              style={{
                ...inputStyle,
                borderColor: errors.name ? 'var(--status-error)' : 'var(--border-default)',
              }}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, inputStyle)}
            />
            {errors.name && (
              <p className="text-[11px] mt-1" style={{ color: 'var(--status-error)' }}>{errors.name}</p>
            )}
          </div>

          {/* Room + Instructor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Location / Room <span style={{ color: 'var(--status-error)' }}>*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g. LAB-304 / Fitness Center"
                  className={inputClasses}
                  style={{
                    ...inputStyle,
                    paddingLeft: '36px',
                    borderColor: errors.room ? 'var(--status-error)' : 'var(--border-default)',
                  }}
                  onFocus={(e) => Object.assign(e.target.style, { ...inputFocusStyle, paddingLeft: '36px' })}
                  onBlur={(e) => Object.assign(e.target.style, { ...inputStyle, paddingLeft: '36px' })}
                />
              </div>
              {errors.room && (
                <p className="text-[11px] mt-1" style={{ color: 'var(--status-error)' }}>{errors.room}</p>
              )}
            </div>
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Instructor / Trainer
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  placeholder="e.g. Prof. Vance"
                  className={inputClasses}
                  style={{ ...inputStyle, paddingLeft: '36px' }}
                  onFocus={(e) => Object.assign(e.target.style, { ...inputFocusStyle, paddingLeft: '36px' })}
                  onBlur={(e) => Object.assign(e.target.style, { ...inputStyle, paddingLeft: '36px' })}
                />
              </div>
            </div>
          </div>

          {/* Schedule Days */}
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Scheduled Days
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {DAYS_OF_WEEK.map((d) => {
                const isSelected = days.includes(d.key);
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => toggleDay(d.key)}
                    className="py-2 rounded-lg text-[13px] font-medium transition-colors"
                    style={{
                      background: isSelected ? 'var(--brand-600)' : 'var(--surface-secondary)',
                      color: isSelected ? 'white' : 'var(--text-secondary)',
                      border: isSelected ? '1px solid var(--brand-600)' : '1px solid var(--border-default)',
                      fontWeight: isSelected ? 600 : 500,
                    }}
                  >
                    {d.short}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start / End Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className={inputClasses + ' tabular-nums'}
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className={inputClasses + ' tabular-nums'}
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              />
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Color Accent
            </label>
            <div className="flex items-center gap-2.5 flex-wrap">
              {COLOR_PALETTES.map((c) => {
                const isSelected = color === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{
                      backgroundColor: c,
                      boxShadow: isSelected ? `0 0 0 2px var(--surface-primary), 0 0 0 4px ${c}` : 'none',
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      opacity: isSelected ? 1 : 0.8,
                    }}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Notes <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bring lab manual, project requirements, etc."
              className={inputClasses}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, inputStyle)}
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-between gap-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            {initialData && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete ${initialData.code || 'this schedule item'} - ${initialData.name}?`)) {
                    onDelete(initialData.id);
                    onClose();
                  }
                }}
                className="px-3.5 py-2 rounded-lg text-[13px] font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Item</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-[13px] font-medium transition-colors hover:bg-gray-100"
                style={{ color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg text-[13px] font-medium text-white transition-colors hover:opacity-90"
                style={{ background: 'var(--brand-600)', boxShadow: 'var(--shadow-xs)' }}
              >
                {initialData ? 'Save Changes' : 'Add Item'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
