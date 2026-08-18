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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim() || !room.trim()) {
      alert('Please fill in Subject Code, Name, and Room.');
      return;
    }

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in select-none">
      <div className="w-full max-w-lg bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-150 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-3.5 h-3.5 rounded-full shadow-2xs" 
              style={{ backgroundColor: color }} 
            />
            <h3 className="font-semibold text-sm text-zinc-900">
              {initialData ? 'Edit Class Details' : 'Add New Class'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto">
          {/* Row 1: Code & Units */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-[11px] font-mono text-zinc-600 mb-1">
                Subject Code *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CS 301"
                required
                className="w-full bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-blue-500 rounded-md px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-zinc-600 mb-1">
                Units
              </label>
              <input
                type="number"
                min="1"
                max="9"
                value={units}
                onChange={(e) => setUnits(Number(e.target.value))}
                className="w-full bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-blue-500 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none transition-colors font-mono"
              />
            </div>
          </div>

          {/* Row 2: Subject Description Name */}
          <div>
            <label className="block text-[11px] font-mono text-zinc-600 mb-1">
              Subject Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Distributed Systems & Cloud Architecture"
              required
              className="w-full bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-blue-500 rounded-md px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none transition-colors"
            />
          </div>

          {/* Row 3: Room & Instructor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-zinc-600 mb-1">
                Room / Lab *
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g. LAB-304"
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-blue-500 rounded-md pl-8 pr-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none transition-colors font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-mono text-zinc-600 mb-1">
                Instructor
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  placeholder="e.g. Prof. Vance"
                  className="w-full bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-blue-500 rounded-md pl-8 pr-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Days Checkboxes */}
          <div>
            <label className="block text-[11px] font-mono text-zinc-600 mb-1">
              Class Days
            </label>
            <div className="grid grid-cols-6 gap-1">
              {DAYS_OF_WEEK.map((d) => {
                const isSelected = days.includes(d.key);
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => toggleDay(d.key)}
                    className={`py-1.5 rounded-md text-xs font-mono transition-colors border ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white font-semibold shadow-2xs'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    {d.short}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 5: Start Time & End Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-zinc-600 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-blue-500 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-zinc-600 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-blue-500 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Row 6: Color Badge Picker */}
          <div>
            <label className="block text-[11px] font-mono text-zinc-600 mb-1.5">
              Subject Color Accent
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_PALETTES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    color === c ? 'ring-2 ring-blue-500 ring-offset-2 scale-105 shadow-xs' : 'hover:scale-105 opacity-85 hover:opacity-100'
                  }`}
                >
                  {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Row 7: Notes */}
          <div>
            <label className="block text-[11px] font-mono text-zinc-600 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Lab manual required, midterm in week 8"
              className="w-full bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-blue-500 rounded-md px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none transition-colors"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-zinc-150 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
            >
              {initialData ? 'Save Changes' : 'Add Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
