import React, { useState, useEffect } from 'react';
import { X, MapPin, User, Check } from 'lucide-react';
import { ClassItem, DayAbbreviation, DAYS_OF_WEEK } from '../../types/schedule';
import { COLOR_PALETTES } from '../../data/sampleSchedules';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classData: Omit<ClassItem, 'id'>) => void;
  onUpdate?: (id: string, classData: Partial<ClassItem>) => void;
  initialData?: ClassItem | null;
}

export const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  initialData,
}) => {
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
    if (initialData) {
      setCode(initialData.code);
      setName(initialData.name);
      setSection(initialData.section || '');
      setInstructor(initialData.instructor || '');
      setRoom(initialData.room);
      setDays(initialData.days);
      setStartTime(initialData.startTime);
      setEndTime(initialData.endTime);
      setColor(initialData.color);
      setUnits(initialData.units);
      setNotes(initialData.notes || '');
    } else {
      setCode('');
      setName('');
      setSection('BSIT 3-A');
      setInstructor('');
      setRoom('');
      setDays(['M', 'W']);
      setStartTime('08:00');
      setEndTime('09:30');
      setColor(COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)]);
      setUnits(3);
      setNotes('');
    }
    setErrors({});
  }, [initialData, isOpen]);

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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!code.trim()) newErrors.code = 'Subject code is required';
    if (!name.trim()) newErrors.name = 'Subject name is required';
    if (!room.trim()) newErrors.room = 'Room is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      code: code.trim(),
      name: name.trim(),
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
              {initialData ? 'Edit Class' : 'Add New Class'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-gray-100"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Subject Code + Units */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Subject Code <span style={{ color: 'var(--status-error)' }}>*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CS 301"
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
                Units
              </label>
              <input
                type="number"
                min="1"
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

          {/* Subject Name */}
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Subject Name <span style={{ color: 'var(--status-error)' }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Distributed Systems & Cloud Architecture"
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
                Room / Lab <span style={{ color: 'var(--status-error)' }}>*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g. LAB-304"
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
                Instructor
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

          {/* Class Days */}
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Class Days
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
              placeholder="e.g. Lab manual required, midterm in week 8"
              className={inputClasses}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, inputStyle)}
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
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
              {initialData ? 'Save Changes' : 'Add Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
