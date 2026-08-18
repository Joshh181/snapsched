import React, { useState, useRef, useEffect } from 'react';
import {
  ScanLine,
  Upload,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { geminiService } from '../../services/geminiService';
import { OcrParsedClass } from '../../types/schedule';
import { OcrReviewTable } from './OcrReviewTable';

interface ScheduleScannerProps {
  onImportClasses: (classes: OcrParsedClass[], replace: boolean) => void;
  onOpenSettings?: () => void;
}

const SCAN_STAGES = [
  { text: 'Enhancing document clarity & contrast...', progress: 25 },
  { text: 'Detecting schedule grid & day columns...', progress: 55 },
  { text: 'Extracting course codes, rooms & faculty...', progress: 80 },
  { text: 'Formatting 24-hour academic timetable...', progress: 95 },
];

export const ScheduleScanner: React.FC<ScheduleScannerProps> = ({
  onImportClasses,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [parsedResults, setParsedResults] = useState<OcrParsedClass[] | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ name: string; previewUrl?: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccessFlash, setIsSuccessFlash] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic stage ticker interval while processing
  useEffect(() => {
    let timer: any = null;
    if (isProcessing) {
      setCurrentStageIdx(0);
      timer = setInterval(() => {
        setCurrentStageIdx((prev) => (prev < SCAN_STAGES.length - 1 ? prev + 1 : prev));
      }, 1400);
    }
    return () => clearInterval(timer);
  }, [isProcessing]);

  const handleFileSelect = async (file: File) => {
    if (!file) return;
    const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
    setSelectedFile({
      name: file.name,
      previewUrl,
    });
    setErrorMessage(null);
    setIsProcessing(true);
    setIsSuccessFlash(false);

    try {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          try {
            const results = await geminiService.parseScheduleDocument({
              base64Image: base64Data,
              mimeType: file.type,
            });
            triggerSuccess(results);
          } catch (e: any) {
            setErrorMessage(e.message || 'Failed to parse image.');
            setIsProcessing(false);
          }
        };
        reader.readAsDataURL(file);
      } else {
        const text = await file.text();
        const results = await geminiService.parseScheduleDocument({ text });
        triggerSuccess(results);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process document.');
      setIsProcessing(false);
    }
  };

  const triggerSuccess = (results: OcrParsedClass[]) => {
    setIsSuccessFlash(true);
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#6366f1', '#06b6d4', '#10b981', '#f59e0b'],
      });
    } catch (e) {}

    setTimeout(() => {
      setIsProcessing(false);
      setParsedResults(results);
      setIsSuccessFlash(false);
    }, 600);
  };

  const handleToggleSelect = (id: string) => {
    if (!parsedResults) return;
    setParsedResults(parsedResults.map((item) => item.id === id ? { ...item, selected: !item.selected } : item));
  };
  const handleSelectAll = (select: boolean) => {
    if (!parsedResults) return;
    setParsedResults(parsedResults.map((item) => ({ ...item, selected: select })));
  };
  const handleDeleteItem = (id: string) => {
    if (!parsedResults) return;
    setParsedResults(parsedResults.filter((item) => item.id !== id));
  };
  const handleUpdateItem = (id: string, updated: Partial<OcrParsedClass>) => {
    if (!parsedResults) return;
    setParsedResults(parsedResults.map((item) => (item.id === id ? { ...item, ...updated } : item)));
  };
  const handleConfirmImport = (replace: boolean) => {
    if (!parsedResults) return;
    const selected = parsedResults.filter((i) => i.selected);
    if (selected.length === 0) return;
    onImportClasses(selected, replace);
    try { confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } }); } catch (e) {}
    setParsedResults(null);
    setSelectedFile(null);
  };

  const currentStage = SCAN_STAGES[currentStageIdx];

  return (
    <div className="space-y-4 max-w-4xl mx-auto select-none animate-fade-in">
      {/* Header */}
      <div
        className="p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
        style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
      >
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-[16px]" style={{ color: 'var(--text-primary)' }}>
              Schedule Scanner
            </h2>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1" style={{ background: 'var(--brand-50)', color: 'var(--brand-700)', border: '1px solid var(--brand-200)' }}>
              <Sparkles className="w-3 h-3 text-indigo-600" />
              Gemini Vision AI
            </span>
          </div>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Upload your COR image or timetable photo to automatically extract all classes.
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium"
          style={{ background: 'var(--status-success-bg)', color: '#065f46', border: '1px solid var(--status-success-border)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--status-success)' }} />
          OCR Engine Ready
        </div>
      </div>

      {parsedResults ? (
        <OcrReviewTable
          items={parsedResults}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onDeleteItem={handleDeleteItem}
          onUpdateItem={handleUpdateItem}
          onConfirmImport={handleConfirmImport}
          onReset={() => { setParsedResults(null); setSelectedFile(null); }}
        />
      ) : (
        <div className="space-y-4">
          {/* Main Scanner Stage */}
          {isProcessing ? (
            /* ── HOLOGRAPHIC LASER SCANNER ACTIVE STATE ── */
            <div
              className="relative rounded-xl overflow-hidden p-6 md:p-8 flex flex-col items-center justify-center min-h-[380px] select-none"
              style={{
                background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)',
                border: '1px solid #4338ca',
                boxShadow: '0 10px 30px -5px rgba(79, 70, 229, 0.3)',
              }}
            >
              {/* Subtle Matrix Grid Overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: `linear-gradient(to right, rgba(99, 102, 241, 0.2) 1px, transparent 1px),
                                    linear-gradient(to bottom, rgba(99, 102, 241, 0.2) 1px, transparent 1px)`,
                  backgroundSize: '24px 24px',
                }}
              />

              {/* HUD Header Status */}
              <div className="relative z-20 flex items-center justify-between w-full max-w-md px-2 mb-4 text-[11px] font-mono text-indigo-300/80">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="font-semibold tracking-wider uppercase">DEEP SCAN ACTIVE</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>LATENCY: 34ms</span>
                  <span>·</span>
                  <span className="text-cyan-300">GEMINI VISION</span>
                </div>
              </div>

              {/* Holographic Document Container with Scanning Laser */}
              <div
                className="relative z-10 w-full max-w-sm h-56 rounded-lg overflow-hidden flex items-center justify-center"
                style={{
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  boxShadow: '0 0 20px rgba(99, 102, 241, 0.25)',
                }}
              >
                {/* 4 Corner HUD Reticles */}
                <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 z-30 pointer-events-none" />
                <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 z-30 pointer-events-none" />
                <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400 z-30 pointer-events-none" />
                <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400 z-30 pointer-events-none" />

                {/* Uploaded image preview OR mock document wireframe */}
                {selectedFile?.previewUrl ? (
                  <img
                    src={selectedFile.previewUrl}
                    alt="Scanning preview"
                    className="w-full h-full object-cover opacity-60 filter contrast-125 brightness-90"
                  />
                ) : (
                  <div className="w-full h-full p-4 flex flex-col justify-between opacity-50">
                    <div className="space-y-2">
                      <div className="h-3 w-3/4 bg-indigo-400/40 rounded animate-pulse" />
                      <div className="h-2.5 w-1/2 bg-indigo-400/20 rounded" />
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        <div className="h-4 bg-indigo-400/25 rounded" />
                        <div className="h-4 bg-indigo-400/25 rounded" />
                        <div className="h-4 bg-indigo-400/25 rounded" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2 w-full bg-indigo-400/20 rounded" />
                      <div className="h-2 w-5/6 bg-indigo-400/20 rounded" />
                      <div className="h-2 w-4/6 bg-indigo-400/20 rounded" />
                    </div>
                  </div>
                )}

                {/* Animated OCR Target Bounding Boxes */}
                <div className="absolute top-8 left-8 w-28 h-6 border border-cyan-400/70 bg-cyan-500/10 rounded animate-ocr-box pointer-events-none z-20 flex items-center justify-between px-1">
                  <span className="text-[8px] font-mono text-cyan-300 font-bold">SUBJ_DETECTED</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                </div>
                <div className="absolute bottom-12 right-6 w-32 h-6 border border-indigo-400/70 bg-indigo-500/10 rounded animate-ocr-box pointer-events-none z-20 flex items-center justify-between px-1" style={{ animationDelay: '0.9s' }}>
                  <span className="text-[8px] font-mono text-indigo-300 font-bold">TIME_MATRIX</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                </div>

                {/* ── Holographic Sweeping Laser Beam ── */}
                <div className="absolute left-0 right-0 z-30 pointer-events-none animate-laser-sweep">
                  {/* Laser line */}
                  <div
                    className="w-full h-[2.5px]"
                    style={{
                      background: 'linear-gradient(90deg, rgba(6,182,212,0.2) 0%, rgba(6,182,212,1) 20%, rgba(99,102,241,1) 50%, rgba(6,182,212,1) 80%, rgba(6,182,212,0.2) 100%)',
                      boxShadow: '0 0 12px 3px rgba(6, 182, 212, 0.75), 0 0 24px 6px rgba(99, 102, 241, 0.5)',
                    }}
                  />
                  {/* Trailing laser glow bloom */}
                  <div
                    className="w-full h-12 -mt-12"
                    style={{
                      background: 'linear-gradient(to top, rgba(6, 182, 212, 0.25), transparent)',
                    }}
                  />
                </div>

                {/* Flash light overlay on success */}
                {isSuccessFlash && (
                  <div className="absolute inset-0 bg-white z-40 animate-flash-expand pointer-events-none" />
                )}
              </div>

              {/* Dynamic Stage Ticker & Progress */}
              <div className="relative z-20 w-full max-w-sm mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-indigo-200 font-medium">
                    <ScanLine className="w-4 h-4 text-cyan-400 animate-spin" />
                    <span>{currentStage.text}</span>
                  </div>
                  <span className="font-mono text-cyan-300 tabular-nums font-semibold">
                    {currentStage.progress}%
                  </span>
                </div>

                {/* Sleek Gradient Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden border border-indigo-900/60">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${currentStage.progress}%`,
                      background: 'linear-gradient(90deg, #06b6d4 0%, #6366f1 50%, #a855f7 100%)',
                      boxShadow: '0 0 10px rgba(99, 102, 241, 0.8)',
                    }}
                  />
                </div>

                <div className="text-[11px] font-mono text-center text-indigo-300/60 pt-1">
                  Parsing {selectedFile?.name || 'document'} with Google Gemini
                </div>
              </div>
            </div>
          ) : (
            /* ── DEFAULT UPLOAD DROPZONE ── */
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault(); setIsDragging(false);
                if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
              }}
              className="rounded-xl p-10 text-center cursor-pointer transition-all group"
              style={{
                background: isDragging ? 'var(--brand-50)' : 'var(--surface-primary)',
                border: isDragging ? '2px dashed var(--brand-500)' : '2px dashed var(--border-strong)',
                boxShadow: isDragging ? 'var(--shadow-md)' : 'var(--shadow-xs)',
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef} type="file" accept="image/*,.pdf,.txt" className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }}
              />

              <div className="space-y-3.5">
                <div
                  className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center transition-transform group-hover:scale-105"
                  style={{
                    background: 'var(--brand-50)',
                    border: '1px solid var(--brand-200)',
                    color: 'var(--brand-600)',
                    boxShadow: 'var(--shadow-xs)',
                  }}
                >
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>
                    Drop your COR or schedule photo here
                  </h3>
                  <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    Supports PNG, JPG, JPEG, PDF, or text slips
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium text-[13px] transition-all hover:opacity-95"
                    style={{ background: 'var(--brand-600)', boxShadow: 'var(--shadow-xs)' }}
                  >
                    <ScanLine className="w-4 h-4" />
                    Select Timetable Photo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div
              className="p-3.5 rounded-lg flex items-center gap-2.5 text-[13px] animate-fade-in"
              style={{ background: 'var(--status-error-bg)', border: '1px solid var(--status-error-border)', color: 'var(--status-error)' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
