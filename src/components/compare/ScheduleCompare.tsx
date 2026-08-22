import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Share2,
  Check,
  Coffee,
  Users2,
  Calendar,
  Clock,
  ArrowRight,
  UserPlus,
  Tag,
  Trash2,
  Download,
  Upload,
  Copy,
  Plus,
  X,
  Sparkles,
  BookOpen,
  Info,
  ChevronDown,
  QrCode,
  Camera,
  Loader2,
} from 'lucide-react';
import { ScheduleSet, FriendSchedule, OverlapFreeSlot, DAYS_OF_WEEK, CategoryItem, ClassItem } from '../../types/schedule';
import { COLOR_PALETTES } from '../../data/sampleSchedules';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../contexts/AuthContext';
import * as cloud from '../../services/supabaseDataService';
import { timeToMinutes, format12Hour, formatDuration } from '../../hooks/useVacantPeriods';
import {
  generateUniversalShareUrl,
  generateQrDataUrl,
  parseIncomingShareString,
} from '../../services/qrService';
import { QrScannerModal } from './QrScannerModal';
import { FriendConfirmModal } from './FriendConfirmModal';

interface ScheduleCompareProps {
  userSchedule: ScheduleSet;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

export const ScheduleCompare: React.FC<ScheduleCompareProps> = ({
  userSchedule,
  selectedCategory = 'School',
  onSelectCategory,
}) => {
  const { user } = useAuth();
  const isCloud = !!user;

  const [categories] = useState<CategoryItem[]>(() => storageService.getCategories());
  const [friends, setFriends] = useState<FriendSchedule[]>(() => storageService.getFriends());
  const [selectedFriendId, setSelectedFriendId] = useState<string>(() => friends[0]?.id || '');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'qr' | 'import' | 'manual' | 'export'>('qr');
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [pendingFriendConfirm, setPendingFriendConfirm] = useState<FriendSchedule | null>(null);

  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState('');
  const [copiedExport, setCopiedExport] = useState(false);
  const [copiedShareUrl, setCopiedShareUrl] = useState(false);
  const [showFriendClasses, setShowFriendClasses] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Manual Add Form State
  const [newFriendName, setNewFriendName] = useState('');
  const [newFriendCourse, setNewFriendCourse] = useState('');
  const [newFriendColor, setNewFriendColor] = useState(COLOR_PALETTES[0]);

  // Sync with Supabase cloud when logged in
  useEffect(() => {
    if (isCloud) {
      cloud.fetchFriends().then((cloudFriends) => {
        if (cloudFriends && cloudFriends.length > 0) {
          setFriends(cloudFriends);
          storageService.saveFriends(cloudFriends);
          if (!selectedFriendId) {
            setSelectedFriendId(cloudFriends[0]?.id || '');
          }
        } else {
          // If cloud has no friends yet, sync any local friends to cloud
          const localFriends = storageService.getFriends();
          if (localFriends && localFriends.length > 0) {
            localFriends.forEach((f) => cloud.saveFriend(f).catch(console.error));
          }
        }
      }).catch(console.warn);
    }
  }, [isCloud, user?.id]);

  // Keep selectedFriendId valid if friends list changes
  const activeFriend = friends.find((f) => f.id === selectedFriendId) || friends[0];

  const activeCategoryName = selectedCategory || 'School';

  const shareUrl = useMemo(() => {
    return generateUniversalShareUrl(userSchedule);
  }, [userSchedule]);

  // Generate QR Code data URL whenever activeModalTab is 'qr'
  useEffect(() => {
    if (isAddModalOpen && activeModalTab === 'qr') {
      generateQrDataUrl(shareUrl)
        .then((url) => setQrDataUrl(url))
        .catch(console.error);
    }
  }, [isAddModalOpen, activeModalTab, shareUrl]);

  // Check on mount for incoming URL hash #share=...
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('share=')) {
      const parsedFriend = parseIncomingShareString(window.location.hash);
      if (parsedFriend) {
        setPendingFriendConfirm(parsedFriend);
        // Clear hash to prevent duplicate popups
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, []);

  const commonFreeSlots = useMemo<OverlapFreeSlot[]>(() => {
    if (!activeFriend) return [];
    const results: OverlapFreeSlot[] = [];

    DAYS_OF_WEEK.forEach((dayInfo) => {
      const dayKey = dayInfo.key;
      // Filter user and friend classes strictly by active category
      const userDayClasses = userSchedule.items.filter(
        (c) => c.days.includes(dayKey) && (c.category || 'School').toLowerCase() === activeCategoryName.toLowerCase()
      );
      const friendDayClasses = activeFriend.schedule.items.filter(
        (c) => c.days.includes(dayKey) && (c.category || 'School').toLowerCase() === activeCategoryName.toLowerCase()
      );

      const slotStep = 30;
      let currentFreeStart: number | null = null;

      for (let min = 7 * 60; min <= 21 * 60; min += slotStep) {
        const isUserBusy = userDayClasses.some((c) => min >= timeToMinutes(c.startTime) && min < timeToMinutes(c.endTime));
        const isFriendBusy = friendDayClasses.some((c) => min >= timeToMinutes(c.startTime) && min < timeToMinutes(c.endTime));

        if (!isUserBusy && !isFriendBusy) {
          if (currentFreeStart === null) currentFreeStart = min;
        } else {
          if (currentFreeStart !== null) {
            const duration = min - currentFreeStart;
            if (duration >= 60) {
              results.push({
                id: `overlap-${dayKey}-${currentFreeStart}`,
                day: dayKey,
                dayFull: dayInfo.full,
                startTime: `${Math.floor(currentFreeStart / 60).toString().padStart(2, '0')}:${(currentFreeStart % 60).toString().padStart(2, '0')}`,
                endTime: `${Math.floor(min / 60).toString().padStart(2, '0')}:${(min % 60).toString().padStart(2, '0')}`,
                durationFormatted: formatDuration(duration),
                participants: [userSchedule.studentName || 'You', activeFriend.name],
              });
            }
            currentFreeStart = null;
          }
        }
      }
    });
    return results;
  }, [userSchedule, activeFriend, activeCategoryName]);

  const totalSharedHours = Math.round(
    commonFreeSlots.reduce((acc, slot) => acc + (timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime)), 0) / 60
  );

  // Generate clean exportable JSON payload
  const getExportPayloadString = () => {
    const payload = {
      app: 'snapsched',
      version: 2,
      exportedAt: new Date().toISOString(),
      studentName: userSchedule.studentName || 'My Timetable',
      course: userSchedule.course || '',
      schedule: {
        id: userSchedule.id,
        name: userSchedule.name,
        semester: userSchedule.semester,
        academicYear: userSchedule.academicYear,
        studentName: userSchedule.studentName,
        course: userSchedule.course,
        items: userSchedule.items,
      },
    };
    return JSON.stringify(payload, null, 2);
  };

  const handleCopyMyScheduleCode = () => {
    navigator.clipboard?.writeText?.(getExportPayloadString());
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2200);
  };

  const handleCopyShareUrl = () => {
    navigator.clipboard?.writeText?.(shareUrl);
    setCopiedShareUrl(true);
    setTimeout(() => setCopiedShareUrl(false), 2200);
  };

  const handleDownloadQrImage = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `snapsched-qr-${(userSchedule.studentName || 'schedule').toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(getExportPayloadString());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `snapsched-${(userSchedule.studentName || 'timetable').toLowerCase().replace(/\s+/g, '-')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Handle QR scanner result
  const handleScanResult = (rawPayload: string) => {
    setIsQrScannerOpen(false);
    const parsedFriend = parseIncomingShareString(rawPayload);
    if (parsedFriend) {
      setPendingFriendConfirm(parsedFriend);
    } else {
      alert('Could not decode a valid SnapSched timetable from this QR code. Please check that it is a SnapSched share QR.');
    }
  };

  // Handle confirming and saving friend
  const handleConfirmFriend = async (friend: FriendSchedule) => {
    storageService.addFriend(friend);
    const updated = storageService.getFriends();
    setFriends(updated);
    setSelectedFriendId(friend.id);
    setPendingFriendConfirm(null);
    setIsAddModalOpen(false);

    if (isCloud) {
      try {
        await cloud.saveFriend(friend);
      } catch (err) {
        console.warn('Failed to sync friend to cloud', err);
      }
    }
  };

  // Handle importing a friend's schedule JSON
  const handleImportFriend = () => {
    setImportError('');
    if (!importJsonText.trim()) {
      setImportError('Please paste a friend schedule JSON or code.');
      return;
    }

    const parsedFriend = parseIncomingShareString(importJsonText);
    if (parsedFriend) {
      setPendingFriendConfirm(parsedFriend);
      setImportJsonText('');
    } else {
      setImportError('Unrecognized format. Please ensure you pasted a valid SnapSched schedule JSON or code.');
    }
  };

  // Handle creating a friend manually
  const handleManualCreateFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName.trim()) {
      setImportError('Please enter friend name');
      return;
    }

    const newFriend: FriendSchedule = {
      id: `friend-${Date.now()}`,
      name: newFriendName.trim(),
      course: newFriendCourse.trim() || 'Student',
      avatarColor: newFriendColor,
      schedule: {
        id: `friend-sched-${Date.now()}`,
        name: `${newFriendName.trim()}'s Schedule`,
        semester: userSchedule.semester || '1st Semester',
        academicYear: userSchedule.academicYear || '2026-2027',
        studentName: newFriendName.trim(),
        course: newFriendCourse.trim() || '',
        isDefault: false,
        createdAt: new Date().toISOString(),
        items: [],
      },
    };

    handleConfirmFriend(newFriend);
    setNewFriendName('');
    setNewFriendCourse('');
  };

  const handleDeleteFriend = async (id: string, name: string) => {
    if (confirm(`Remove ${name} from your comparison list?`)) {
      storageService.deleteFriend(id);
      const updated = storageService.getFriends();
      setFriends(updated);
      if (selectedFriendId === id) {
        setSelectedFriendId(updated[0]?.id || '');
      }

      if (isCloud) {
        try {
          await cloud.deleteFriend(id);
        } catch (err) {
          console.warn('Failed to delete friend from cloud', err);
        }
      }
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto select-none animate-fade-in">
      {/* Header Bar */}
      <div
        className="p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
      >
        <div>
          <h2 className="font-semibold text-[16px]" style={{ color: 'var(--text-primary)' }}>
            Schedule Comparison & Overlap Finder
          </h2>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Compare your <strong>{activeCategoryName}</strong> timetable with friends to automatically find mutual free time.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setActiveModalTab('qr');
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-default)', background: 'var(--surface-secondary)' }}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>My QR Code</span>
          </button>

          <button
            onClick={() => setIsQrScannerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Friend QR</span>
          </button>

          <button
            onClick={() => {
              setActiveModalTab('qr');
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold text-white transition-all shadow-xs hover:shadow-md cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Friend</span>
          </button>
        </div>
      </div>

      {/* Category Pill Bar */}
      <div
        className="p-2 rounded-lg flex items-center gap-1.5 overflow-x-auto"
        style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
      >
        <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-1 flex items-center gap-1 text-slate-400 shrink-0">
          <Tag className="w-3 h-3 text-slate-400" />
          Compare Category:
        </span>
        {categories.map((cat) => {
          const isSelected = activeCategoryName.toLowerCase() === cat.name.toLowerCase();
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory?.(cat.name)}
              className="px-3 py-1 rounded-md text-[12px] font-medium transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              style={{
                background: isSelected ? 'var(--brand-50)' : 'var(--surface-secondary)',
                color: isSelected ? 'var(--brand-800)' : 'var(--text-secondary)',
                border: isSelected ? '1px solid var(--brand-400)' : '1px solid var(--border-subtle)',
                fontWeight: isSelected ? 600 : 500,
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Comparison Stage */}
      {friends.length === 0 ? (
        <div
          className="p-12 text-center rounded-2xl space-y-4 border"
          style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs border border-indigo-100">
            <Users2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-[17px]" style={{ color: 'var(--text-primary)' }}>
              No Friends Added Yet
            </h3>
            <p className="text-[13.5px] max-w-md mx-auto text-slate-500 font-medium leading-relaxed">
              Scan a classmate's QR code or share your timetable link to automatically compute mutual free hours.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
            <button
              onClick={() => setIsQrScannerOpen(true)}
              className="px-5 py-2.5 rounded-xl text-white font-bold text-[13.5px] inline-flex items-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}
            >
              <Camera className="w-4 h-4" />
              <span>Scan Friend's QR Code</span>
            </button>
            <button
              onClick={() => {
                setActiveModalTab('qr');
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl font-semibold text-[13px] border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4 text-indigo-600" />
              <span>Show My QR Code</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Friends Selector Bar */}
          <div
            className="p-3 rounded-lg flex items-center justify-between gap-2 overflow-x-auto"
            style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
          >
            <div className="flex items-center gap-2 overflow-x-auto min-w-0">
              <span className="text-[12px] font-medium px-2 shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                Comparing with:
              </span>
              {friends.map((f) => {
                const isSelected = activeFriend?.id === f.id;
                const friendClassCount = f.schedule.items.filter(
                  (c) => (c.category || 'School').toLowerCase() === activeCategoryName.toLowerCase()
                ).length;

                return (
                  <div
                    key={f.id}
                    className="flex items-center rounded-lg transition-all shrink-0 group"
                    style={{
                      background: isSelected ? 'var(--brand-50)' : 'var(--surface-secondary)',
                      border: isSelected ? '1px solid var(--brand-300)' : '1px solid var(--border-subtle)',
                    }}
                  >
                    <button
                      onClick={() => setSelectedFriendId(f.id)}
                      className="px-3 py-1.5 text-[13px] font-medium flex items-center gap-2 cursor-pointer"
                      style={{ color: isSelected ? 'var(--brand-800)' : 'var(--text-primary)' }}
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ background: f.avatarColor || '#6366f1' }}
                      >
                        {f.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold">{f.name}</span>
                      <span
                        className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold"
                        style={{
                          background: isSelected ? 'var(--brand-100)' : 'rgba(0,0,0,0.05)',
                          color: isSelected ? 'var(--brand-700)' : 'var(--text-secondary)',
                        }}
                      >
                        {friendClassCount} items
                      </span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFriend(f.id, f.name);
                      }}
                      className="pr-2 pl-1.5 py-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title={`Remove ${f.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                setActiveModalTab('qr');
                setIsAddModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 border border-dashed border-indigo-300 text-[12px] font-bold shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another</span>
            </button>
          </div>

          {/* Overlap Summary Banner */}
          {activeFriend && (
            <div
              className="p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              style={{
                background: 'var(--surface-primary)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-emerald-600 shrink-0"
                  style={{ background: 'var(--status-success-bg)', border: '1px solid var(--status-success-border)' }}
                >
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[15px] flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <span>{commonFreeSlots.length} Matching Free Windows Found</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      {totalSharedHours}h Shared
                    </span>
                  </h4>
                  <p className="text-[13px] text-slate-500 font-medium">
                    You and <strong>{activeFriend.name}</strong> share <strong>{totalSharedHours} hours</strong> of vacant time across your <strong>{activeCategoryName}</strong> schedule.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
                <button
                  onClick={() => setShowFriendClasses(!showFriendClasses)}
                  className="text-[12px] font-bold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>{showFriendClasses ? 'Hide' : 'View'} {activeFriend.name}'s Schedule</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFriendClasses ? 'rotate-180' : ''}`} />
                </button>

                <button
                  onClick={() => handleDeleteFriend(activeFriend.id, activeFriend.name)}
                  className="text-[12px] font-bold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200/60 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title={`Remove ${activeFriend.name} from comparison`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Friend</span>
                </button>
              </div>
            </div>
          )}

          {/* Friend Schedule Drawer Preview */}
          {activeFriend && showFriendClasses && (
            <div
              className="p-4 rounded-xl border space-y-3 animate-fade-in"
              style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>{activeFriend.name}'s Classes in {activeCategoryName} ({activeFriend.course})</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono">
                    {activeFriend.schedule.items.filter((c) => (c.category || 'School').toLowerCase() === activeCategoryName.toLowerCase()).length} Total
                  </span>
                  <button
                    onClick={() => handleDeleteFriend(activeFriend.id, activeFriend.name)}
                    className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete Friend</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {activeFriend.schedule.items
                  .filter((c) => (c.category || 'School').toLowerCase() === activeCategoryName.toLowerCase())
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[12.5px] text-slate-900 truncate">{item.code}</span>
                        <span className="text-[10px] font-mono font-semibold text-slate-500">{item.days.join('')}</span>
                      </div>
                      <div className="text-[11.5px] text-slate-600 truncate">{item.name}</div>
                      <div className="text-[10.5px] text-slate-400 flex items-center justify-between">
                        <span>{item.room || 'General'}</span>
                        <span className="font-mono">{format12Hour(item.startTime)} - {format12Hour(item.endTime)}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Overlap Matching Free Windows Grid */}
          {commonFreeSlots.length === 0 ? (
            <div
              className="p-8 text-center rounded-xl border"
              style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)' }}
            >
              <p className="text-[13.5px] text-slate-500 font-medium">
                No overlapping free periods found in {activeCategoryName} between you and {activeFriend?.name}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {commonFreeSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="p-4 rounded-xl transition-all hover:shadow-xs"
                  style={{
                    background: 'var(--surface-primary)',
                    border: '1px solid var(--border-default)',
                    boxShadow: 'var(--shadow-xs)',
                    borderLeft: '4px solid var(--status-success)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[14px]" style={{ color: 'var(--text-primary)' }}>
                      {slot.dayFull}
                    </span>
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--status-success-bg)', color: 'var(--status-success)' }}
                    >
                      {slot.durationFormatted} Free
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2.5 text-[12.5px] font-mono font-medium" style={{ color: 'var(--text-secondary)' }}>
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{format12Hour(slot.startTime)} – {format12Hour(slot.endTime)}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                    <span>Both free for lunch, study or break</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── ADD FRIEND & QR CODE MODAL ── */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 animate-overlay-in select-none z-50"
          style={{ background: 'rgba(0, 0, 0, 0.45)', backdropFilter: 'blur(3px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddModalOpen(false);
          }}
        >
          <div
            className="w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] rounded-2xl bg-white shadow-2xl border border-slate-200 animate-scale-in"
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Users2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-slate-900">
                    Share & Add Friends
                  </h3>
                  <p className="text-[11.5px] text-slate-500 font-medium">
                    Exchange schedules to calculate mutual free windows
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 text-[12.5px] font-bold">
              <button
                onClick={() => setActiveModalTab('qr')}
                className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeModalTab === 'qr'
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                    : 'border-transparent text-slate-600 hover:bg-slate-50'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>My QR Code</span>
              </button>

              <button
                onClick={() => setActiveModalTab('import')}
                className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeModalTab === 'import'
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                    : 'border-transparent text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Paste Code</span>
              </button>

              <button
                onClick={() => setActiveModalTab('manual')}
                className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeModalTab === 'manual'
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                    : 'border-transparent text-slate-600 hover:bg-slate-50'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Manual</span>
              </button>

              <button
                onClick={() => setActiveModalTab('export')}
                className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeModalTab === 'export'
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                    : 'border-transparent text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* TAB 1: MY QR CODE */}
              {activeModalTab === 'qr' && (
                <div className="space-y-4 text-center">
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col items-center justify-center space-y-3">
                    <div className="bg-white p-3 rounded-2xl shadow-xs border border-slate-200 flex items-center justify-center min-w-[220px] min-h-[220px]">
                      {qrDataUrl ? (
                        <img
                          src={qrDataUrl}
                          alt="My Timetable QR Code"
                          className="w-52 h-52 object-contain rounded-lg shadow-2xs"
                        />
                      ) : (
                        <div className="w-52 h-52 flex flex-col items-center justify-center text-slate-400 gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                          <span className="text-xs font-medium">Generating QR Code...</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{userSchedule.studentName || 'My Timetable'}</h4>
                      <p className="text-xs text-slate-400 font-medium">{userSchedule.items.length} classes · {userSchedule.course || 'Student'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadQrImage}
                      className="py-2.5 px-3 rounded-xl font-bold text-xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download QR PNG</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyShareUrl}
                      className="py-2.5 px-3 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}
                    >
                      {copiedShareUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedShareUrl ? 'Link Copied!' : 'Copy Share Link'}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setIsQrScannerOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Scan Friend's QR Code Instead</span>
                  </button>
                </div>
              )}

              {/* TAB 2: IMPORT SCHEDULE CODE */}
              {activeModalTab === 'import' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[12px] font-bold text-slate-700 mb-1">
                      Paste Friend's Schedule Code, URL, or JSON
                    </label>
                    <textarea
                      rows={5}
                      value={importJsonText}
                      onChange={(e) => setImportJsonText(e.target.value)}
                      placeholder="Paste share link, QR code string, or JSON here..."
                      className="w-full text-xs font-mono p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50 leading-relaxed"
                    />
                    {importError && (
                      <p className="text-xs text-rose-600 font-semibold mt-1">{importError}</p>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-900 leading-relaxed">
                    <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>
                      Ask your classmate to send their <strong>SnapSched Share Link</strong> or timetable JSON.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleImportFriend}
                    className="w-full py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Review & Verify Friend Timetable</span>
                  </button>
                </div>
              )}

              {/* TAB 3: MANUAL FRIEND CREATION */}
              {activeModalTab === 'manual' && (
                <form onSubmit={handleManualCreateFriend} className="space-y-3.5">
                  <div>
                    <label className="block text-[12px] font-bold text-slate-700 mb-1">
                      Friend's Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newFriendName}
                      onChange={(e) => setNewFriendName(e.target.value)}
                      placeholder="e.g. Bea Alonzo"
                      className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-slate-700 mb-1">
                      Course / Department / Section
                    </label>
                    <input
                      type="text"
                      value={newFriendCourse}
                      onChange={(e) => setNewFriendCourse(e.target.value)}
                      placeholder="e.g. BSIT 3-A or Work Team"
                      className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-slate-700 mb-1.5">
                      Avatar Color
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {COLOR_PALETTES.map((clr) => (
                        <button
                          key={clr}
                          type="button"
                          onClick={() => setNewFriendColor(clr)}
                          className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                          style={{ backgroundColor: clr }}
                        >
                          {newFriendColor === clr && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer mt-2"
                    style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Friend Profile</span>
                  </button>
                </form>
              )}

              {/* TAB 4: EXPORT MY SCHEDULE */}
              {activeModalTab === 'export' && (
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-[12px] font-bold text-slate-700">
                      Your Timetable JSON
                    </label>
                    <p className="text-[11.5px] text-slate-500">
                      Raw JSON export compatible with all SnapSched clients.
                    </p>
                  </div>

                  <div className="relative">
                    <textarea
                      readOnly
                      rows={5}
                      value={getExportPayloadString()}
                      className="w-full text-[11px] font-mono p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 select-all focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyMyScheduleCode}
                      className="py-2.5 px-3 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}
                    >
                      {copiedExport ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedExport ? 'Copied to Clipboard!' : 'Copy JSON'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadJson}
                      className="py-2.5 px-3 rounded-xl font-bold text-xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download .JSON</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── LIVE CAMERA / IMAGE QR SCANNER MODAL ── */}
      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onScanResult={handleScanResult}
      />

      {/* ── RICH FRIEND VERIFICATION & CONFIRMATION MODAL ── */}
      <FriendConfirmModal
        isOpen={!!pendingFriendConfirm}
        friendData={pendingFriendConfirm}
        onConfirm={handleConfirmFriend}
        onCancel={() => setPendingFriendConfirm(null)}
      />
    </div>
  );
};

