import React, { useState } from 'react';
import { 
  User, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Plus, 
  Layers,
  ShieldCheck
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

  // New semester state
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

  // 1-Click JSON Backup Export
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(schedule, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `SnapSched_${schedule.name.replace(/\s+/g, '_')}_Backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // 1-Click JSON Backup Import
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

  return (
    <div className="space-y-3.5 max-w-4xl mx-auto select-none animate-fade-in">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-sm text-zinc-900">
            Schedule Settings & Profile
          </h2>
          <p className="text-xs text-zinc-600 mt-0.5">
            Manage your student profile, academic terms, and private local backup files.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>100% Private (Local Storage)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Card 1: Student Profile */}
        <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-zinc-600" />
            <h3 className="font-medium text-xs text-zinc-900">
              Student Profile
            </h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-2">
            <div>
              <label className="block text-[11px] font-mono text-zinc-500 mb-1">
                Student Name
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Josh"
                className="w-full bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-blue-500 rounded-md px-3 py-1 text-xs text-zinc-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-zinc-500 mb-1">
                Degree / Program
              </label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. BS Information Technology"
                className="w-full bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-blue-500 rounded-md px-3 py-1 text-xs text-zinc-900 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              {isSavedProfile ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Profile Saved</span>
                </>
              ) : (
                <span>Save Profile</span>
              )}
            </button>
          </form>
        </div>

        {/* Card 2: Privacy & Local Data Backup */}
        <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-2.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Download className="w-4 h-4 text-zinc-600" />
              <h3 className="font-medium text-xs text-zinc-900">
                Backup & Restore Schedule
              </h3>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Export your timetable as a lightweight JSON backup or restore a previously saved schedule file.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleExportJson}
              className="w-full py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-medium text-xs border border-zinc-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-zinc-600" />
              <span>Export Schedule Backup (.json)</span>
            </button>

            <label className="w-full py-1.5 rounded-md bg-zinc-50 hover:bg-zinc-100 text-zinc-700 font-medium text-xs border border-zinc-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-zinc-500" />
              <span>Restore from Backup (.json)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJson}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Card 3: Semester Sets & Factory Reset */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Create New Semester Set */}
        <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-zinc-600" />
            <h3 className="font-medium text-xs text-zinc-900">
              Create New Semester Set
            </h3>
          </div>

          <form onSubmit={handleCreateNewSet} className="space-y-2">
            <input
              type="text"
              value={newSetName}
              onChange={(e) => setNewSetName(e.target.value)}
              placeholder="e.g. 1st Sem BSCS 3rd Year"
              required
              className="w-full bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-blue-500 rounded-md px-3 py-1 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={newSemester}
                onChange={(e) => setNewSemester(e.target.value)}
                placeholder="2nd Semester"
                className="bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-blue-500 rounded-md px-3 py-1 text-xs text-zinc-900 focus:outline-none"
              />
              <input
                type="text"
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
                placeholder="2026-2027"
                className="bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-blue-500 rounded-md px-3 py-1 text-xs text-zinc-900 focus:outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Schedule Set</span>
            </button>
          </form>
        </div>

        {/* Manage Existing Sets & Reset */}
        <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-2.5 flex flex-col justify-between">
          <div className="space-y-1.5">
            <h3 className="font-medium text-xs text-zinc-900">
              Active Schedule Sets ({allSets.length})
            </h3>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {allSets.map((s) => (
                <div
                  key={s.id}
                  onClick={() => onSelectSet(s.id)}
                  className={`p-2 rounded-md border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                    s.id === schedule.id
                      ? 'bg-blue-50 border-blue-200 text-blue-900 font-semibold'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <span className="truncate">{s.name}</span>
                  <span className="text-[10px] font-mono text-zinc-400">{s.items.length} classes</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-150">
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset your schedule to the default sample dataset?')) {
                  onResetToSample();
                }
              }}
              className="w-full py-1 rounded-md bg-zinc-50 hover:bg-rose-50 text-zinc-600 hover:text-rose-700 border border-zinc-200 text-xs font-mono transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Sample Schedule</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
