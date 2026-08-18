import React, { useState } from 'react';
import {
  User,
  Download,
  Upload,
  RotateCcw,
  Check,
  Plus,
  Layers,
  ShieldCheck,
  Tag,
  Trash2,
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { ScheduleSet, CategoryItem } from '../../types/schedule';
import { COLOR_PALETTES } from '../../data/sampleSchedules';

interface SettingsModalProps {
  schedule: ScheduleSet;
  allSets: ScheduleSet[];
  onSelectSet: (setId: string) => void;
  onCreateSet: (name: string, semester: string, academicYear: string) => void;
  onResetToSample: () => void;
  onClearAll?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  schedule,
  allSets,
  onSelectSet,
  onCreateSet,
  onResetToSample,
  onClearAll,
}) => {
  const [studentName, setStudentName] = useState(() => schedule.studentName || 'Josh');
  const [course, setCourse] = useState(() => schedule.course || 'BS Information Technology');
  const [isSavedProfile, setIsSavedProfile] = useState(false);

  // Category Manager State
  const [categories, setCategories] = useState<CategoryItem[]>(() => storageService.getCategories());
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(COLOR_PALETTES[0]);

  const [newSetName, setNewSetName] = useState('');
  const [newSemester, setNewSemester] = useState('2nd Semester');
  const [newYear, setNewYear] = useState('2026-2027');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    schedule.studentName = studentName.trim();
    schedule.course = course.trim();
    storageService.saveActiveSchedule(schedule);
    setIsSavedProfile(true);
    setTimeout(() => setIsSavedProfile(false), 2000);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    storageService.addCategory(newCatName.trim(), newCatColor);
    setCategories(storageService.getCategories());
    setNewCatName('');
  };

  const handleDeleteCategory = (id: string) => {
    storageService.deleteCategory(id);
    setCategories(storageService.getCategories());
  };

  const handleCreateNewSet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSetName.trim()) return;
    onCreateSet(newSetName.trim(), newSemester, newYear);
    setNewSetName('');
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(schedule, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `SnapSched_${schedule.name.replace(/\s+/g, '_')}_Backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.items && Array.isArray(imported.items)) {
          storageService.saveActiveSchedule(imported);
          window.location.reload();
        } else {
          alert('Invalid schedule backup format.');
        }
      } catch (err) {
        alert('Failed to parse JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const inputClasses = "w-full text-[13px] pl-3 pr-3 py-2 rounded-lg focus:outline-none transition-colors";
  const inputStyle = {
    background: 'var(--surface-secondary)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto select-none animate-fade-in">
      {/* Header */}
      <div
        className="p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
      >
        <div>
          <h2 className="font-semibold text-[16px]" style={{ color: 'var(--text-primary)' }}>
            Settings & Profile
          </h2>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Manage categories, student profile, academic terms, and private backups.
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium"
          style={{ background: 'var(--status-success-bg)', color: '#065f46', border: '1px solid var(--status-success-border)' }}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          100% Private (Local Storage)
        </div>
      </div>

      {/* Grid: Categories & Profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Manager */}
        <div
          className="p-4 rounded-lg space-y-3 flex flex-col justify-between"
          style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4" style={{ color: 'var(--brand-600)' }} />
              <h3 className="font-semibold text-[14px]" style={{ color: 'var(--text-primary)' }}>
                Schedule Categories ({categories.length})
              </h3>
            </div>
            <p className="text-[12px] mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Organize classes, gym, work, and personal schedules into dedicated layers.
            </p>

            {/* Existing Categories List */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5 mb-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-2 rounded-lg text-[12px] font-medium flex items-center justify-between"
                  style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border-subtle)' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span style={{ color: 'var(--text-primary)' }}>{cat.name}</span>
                    {cat.isDefault && (
                      <span className="text-[10px] text-slate-400 font-normal">(Default)</span>
                    )}
                  </div>
                  {!cat.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                      title="Delete category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add New Category Form */}
          <form onSubmit={handleAddCategory} className="pt-2 border-t space-y-2" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="New category name (e.g. Side Hustle)"
                className={inputClasses}
                style={inputStyle}
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-white font-medium text-[12px] transition-colors shrink-0"
                style={{ background: 'var(--brand-600)', boxShadow: 'var(--shadow-xs)' }}
              >
                Add
              </button>
            </div>
            {/* Color picker */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-500">Color:</span>
              <div className="flex items-center gap-1.5">
                {COLOR_PALETTES.slice(0, 6).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewCatColor(c)}
                    className="w-5 h-5 rounded-full transition-transform"
                    style={{
                      backgroundColor: c,
                      transform: newCatColor === c ? 'scale(1.2)' : 'scale(1)',
                      boxShadow: newCatColor === c ? '0 0 0 2px white, 0 0 0 3px ' + c : 'none',
                    }}
                  />
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Student Profile */}
        <div
          className="p-4 rounded-lg space-y-3 flex flex-col justify-between"
          style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4" style={{ color: 'var(--brand-600)' }} />
              <h3 className="font-semibold text-[14px]" style={{ color: 'var(--text-primary)' }}>Student Profile</h3>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Student Name
                </label>
                <input
                  type="text" value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Josh"
                  className={inputClasses}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Degree / Program
                </label>
                <input
                  type="text" value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g. BS Information Technology"
                  className={inputClasses}
                  style={inputStyle}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-lg font-medium text-[13px] text-white transition-colors flex items-center justify-center gap-1.5"
                style={{ background: 'var(--text-primary)', boxShadow: 'var(--shadow-xs)' }}
              >
                {isSavedProfile ? (
                  <><Check className="w-4 h-4" style={{ color: '#6ee7b7' }} /> Profile Saved</>
                ) : (
                  'Save Profile'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Grid: Create New Set & Manage Sets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Backup & Restore */}
        <div
          className="p-4 rounded-lg space-y-3 flex flex-col justify-between"
          style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Download className="w-4 h-4" style={{ color: 'var(--brand-600)' }} />
              <h3 className="font-semibold text-[14px]" style={{ color: 'var(--text-primary)' }}>Backup & Restore</h3>
            </div>
            <p className="text-[12px] mb-3" style={{ color: 'var(--text-tertiary)' }}>
              Export your timetable as a lightweight JSON backup or restore a previously saved schedule file.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleExportJson}
              className="w-full py-2 rounded-lg font-medium text-[13px] transition-colors flex items-center justify-center gap-1.5"
              style={{ color: 'var(--text-primary)', border: '1px solid var(--border-default)', background: 'var(--surface-secondary)' }}
            >
              <Download className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              Export Backup (.json)
            </button>

            <label className="w-full py-2 rounded-lg font-medium text-[13px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-default)', background: 'var(--surface-primary)' }}
            >
              <Upload className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              Restore from Backup (.json)
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>
          </div>
        </div>

        {/* Create New Semester Set */}
        <div
          className="p-4 rounded-lg space-y-3"
          style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4" style={{ color: 'var(--brand-600)' }} />
            <h3 className="font-semibold text-[14px]" style={{ color: 'var(--text-primary)' }}>New Semester Set</h3>
          </div>

          <form onSubmit={handleCreateNewSet} className="space-y-2">
            <input
              type="text" value={newSetName}
              onChange={(e) => setNewSetName(e.target.value)}
              placeholder="e.g. 1st Sem BSCS 3rd Year"
              required
              className={inputClasses}
              style={inputStyle}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text" value={newSemester}
                onChange={(e) => setNewSemester(e.target.value)}
                placeholder="2nd Semester"
                className={inputClasses}
                style={inputStyle}
              />
              <input
                type="text" value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
                placeholder="2026-2027"
                className={inputClasses + ' tabular-nums'}
                style={inputStyle}
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 rounded-lg text-white font-medium text-[13px] transition-colors flex items-center justify-center gap-1"
              style={{ background: 'var(--brand-600)', boxShadow: 'var(--shadow-xs)' }}
            >
              <Plus className="w-4 h-4" />
              Create Schedule Set
            </button>
          </form>
        </div>
      </div>

      {/* Active Semester Sets & Sample Reset */}
      <div
        className="p-4 rounded-lg space-y-3"
        style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[14px]" style={{ color: 'var(--text-primary)' }}>
            Active Sets ({allSets.length})
          </h3>
          <div className="flex items-center gap-3">
            {schedule.items.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete all ${schedule.items.length} classes across all categories?`)) {
                    onClearAll?.();
                  }
                }}
                className="text-[12px] font-medium flex items-center gap-1 text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All Classes ({schedule.items.length})
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset your schedule to a clean empty state?')) {
                  onResetToSample();
                }
              }}
              className="text-[12px] font-medium flex items-center gap-1 text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Schedule
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-0.5">
          {allSets.map((s) => (
            <div
              key={s.id}
              onClick={() => onSelectSet(s.id)}
              className="p-2.5 rounded-lg text-[13px] cursor-pointer flex items-center justify-between transition-colors"
              style={{
                background: s.id === schedule.id ? 'var(--brand-50)' : 'var(--surface-secondary)',
                border: s.id === schedule.id ? '1px solid var(--brand-200)' : '1px solid var(--border-subtle)',
                color: s.id === schedule.id ? 'var(--brand-800)' : 'var(--text-primary)',
                fontWeight: s.id === schedule.id ? 600 : 400,
              }}
            >
              <span className="truncate">{s.name}</span>
              <span className="text-[12px] shrink-0" style={{ color: 'var(--text-muted)' }}>{s.items.length} classes</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
