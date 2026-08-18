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
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { ScheduleSet } from '../../types/schedule';

interface SettingsModalProps {
  schedule: ScheduleSet;
  allSets: ScheduleSet[];
  onSelectSet: (setId: string) => void;
  onCreateSet: (name: string, semester: string, academicYear: string) => void;
  onResetToSample: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  schedule,
  allSets,
  onSelectSet,
  onCreateSet,
  onResetToSample,
}) => {
  const [studentName, setStudentName] = useState(() => schedule.studentName || 'Josh');
  const [course, setCourse] = useState(() => schedule.course || 'BS Information Technology');
  const [isSavedProfile, setIsSavedProfile] = useState(false);

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
            Settings
          </h2>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Manage your profile, academic terms, and backups.
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              Export your timetable as a lightweight JSON backup or restore a previously saved schedule.
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
              Restore from Backup
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Manage Existing Sets */}
        <div
          className="p-4 rounded-lg space-y-3 flex flex-col justify-between"
          style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
        >
          <div className="space-y-2">
            <h3 className="font-semibold text-[14px]" style={{ color: 'var(--text-primary)' }}>
              Active Sets ({allSets.length})
            </h3>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-0.5">
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

          <div className="pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset your schedule to the default sample dataset?')) {
                  onResetToSample();
                }
              }}
              className="w-full py-2 rounded-lg text-[13px] font-medium transition-colors flex items-center justify-center gap-1.5 hover:bg-red-50"
              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-default)', background: 'var(--surface-primary)' }}
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Sample Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
