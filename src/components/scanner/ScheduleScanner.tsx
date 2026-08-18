import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  AlertCircle,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import { geminiService } from '../../services/geminiService';
import { OcrParsedClass } from '../../types/schedule';
import { OcrReviewTable } from './OcrReviewTable';

interface ScheduleScannerProps {
  onImportClasses: (classes: OcrParsedClass[], replace: boolean) => void;
  onOpenSettings?: () => void;
  activeCategory?: string;
}

export const ScheduleScanner: React.FC<ScheduleScannerProps> = ({
  onImportClasses,
  activeCategory = 'School',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(15);
  const [parsedResults, setParsedResults] = useState<OcrParsedClass[] | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ name: string; previewUrl?: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Smooth, gradual progress estimation while AI is thinking
  useEffect(() => {
    let interval: any = null;
    if (isProcessing) {
      setProgress(15);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 92) return prev;
          const increment = Math.max(1, Math.floor((95 - prev) / 6));
          return prev + increment;
        });
      }, 400);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
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
            finishProcessing(results);
          } catch (e: any) {
            setErrorMessage(e.message || 'Failed to parse timetable image.');
            setIsProcessing(false);
          }
        };
        reader.readAsDataURL(file);
      } else {
        const text = await file.text();
        const results = await geminiService.parseScheduleDocument({ text });
        finishProcessing(results);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process document.');
      setIsProcessing(false);
    }
  };

  const finishProcessing = (results: OcrParsedClass[]) => {
    setProgress(100);
    const tagged = results.map((r) => ({
      ...r,
      category: r.category || activeCategory || 'School',
    }));
    setTimeout(() => {
      setIsProcessing(false);
      setParsedResults(tagged);
    }, 450);
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
    const selected = parsedResults
      .filter((i) => i.selected)
      .map((i) => ({
        ...i,
        category: i.category || activeCategory || 'School',
      }));
    if (selected.length === 0) return;
    onImportClasses(selected, replace);
    setParsedResults(null);
    setSelectedFile(null);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto select-none animate-fade-in">
      {/* Header */}
      <div
        className="p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
        style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
      >
        <div>
          <h2 className="font-semibold text-[16px]" style={{ color: 'var(--text-primary)' }}>
            Schedule Scanner
          </h2>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Upload your Certificate of Registration (COR) or schedule photo to automatically build your timetable.
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium"
          style={{ background: 'var(--brand-50)', color: 'var(--brand-700)', border: '1px solid var(--brand-200)' }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Powered by Gemini Vision
        </div>
      </div>

      {parsedResults ? (
        /* ── STEP 2: REVIEW & EDIT EXTRACTED CLASSES ── */
        <OcrReviewTable
          items={parsedResults}
          activeCategory={activeCategory}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onDeleteItem={handleDeleteItem}
          onUpdateItem={handleUpdateItem}
          onConfirmImport={handleConfirmImport}
          onReset={() => { setParsedResults(null); setSelectedFile(null); }}
        />
      ) : (
        /* ── STEP 1: UPLOAD OR ACTIVE PROCESSING STATE ── */
        <div className="space-y-3">
          {isProcessing ? (
            /* ── PROFESSIONAL DARK SLATE STUDIO SCANNER ── */
            <div
              className="rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden transition-all animate-fade-in"
              style={{
                background: '#090d16',
                border: '1px solid #1e293b',
                boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5), 0 0 50px rgba(79, 70, 229, 0.1)',
                minHeight: '380px',
              }}
            >
              {/* Subtle Ambient Radial Lighting */}
              <div
                className="absolute inset-0 pointer-events-none animate-ambient-pulse"
                style={{
                  background: 'radial-gradient(circle at 50% 40%, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
                }}
              />

              {/* Centered Document Frame with Light Beam */}
              <div
                className="relative z-10 w-full max-w-sm h-60 rounded-xl overflow-hidden flex items-center justify-center"
                style={{
                  background: '#0f172a',
                  border: '1px solid #334155',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                }}
              >
                {/* Uploaded document preview OR subtle document placeholder */}
                {selectedFile?.previewUrl ? (
                  <img
                    src={selectedFile.previewUrl}
                    alt="Schedule document"
                    className="w-full h-full object-contain filter contrast-105 brightness-95"
                  />
                ) : (
                  <div className="w-full h-full p-6 flex flex-col justify-between opacity-40">
                    <div className="space-y-2">
                      <div className="h-3 w-2/3 bg-slate-600 rounded" />
                      <div className="h-2 w-1/2 bg-slate-700 rounded" />
                      <div className="grid grid-cols-3 gap-2 pt-4">
                        <div className="h-5 bg-slate-700 rounded" />
                        <div className="h-5 bg-slate-700 rounded" />
                        <div className="h-5 bg-slate-700 rounded" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2 w-full bg-slate-700 rounded" />
                      <div className="h-2 w-5/6 bg-slate-700 rounded" />
                    </div>
                  </div>
                )}

                {/* ── Fluid Glowing Light Beam Sweep ── */}
                <div className="absolute left-0 right-0 z-30 pointer-events-none animate-scan-beam">
                  {/* Crisp light line */}
                  <div
                    className="w-full h-[2px]"
                    style={{
                      background: 'linear-gradient(90deg, rgba(99,102,241,0.1) 0%, rgba(129,140,248,1) 30%, rgba(192,132,252,1) 50%, rgba(129,140,248,1) 70%, rgba(99,102,241,0.1) 100%)',
                      boxShadow: '0 0 14px 2px rgba(129, 140, 248, 0.8), 0 0 28px 4px rgba(99, 102, 241, 0.4)',
                    }}
                  />
                  {/* Subtle ambient light bloom */}
                  <div
                    className="w-full h-10 -mt-10"
                    style={{
                      background: 'linear-gradient(to top, rgba(99, 102, 241, 0.18), transparent)',
                    }}
                  />
                </div>
              </div>

              {/* Minimal Progress & Status */}
              <div className="relative z-20 w-full max-w-sm mt-6 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-300 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    <span>Analyzing schedule document</span>
                  </div>
                  <span className="font-mono text-indigo-300 font-semibold tabular-nums">
                    {progress}%
                  </span>
                </div>

                {/* Refined Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60">
                  <div
                    className="h-full rounded-full transition-all duration-300 ease-out"
                    style={{
                      width: `${progress}%`,
                      background: 'linear-gradient(90deg, #4f46e5 0%, #818cf8 50%, #c084fc 100%)',
                      boxShadow: '0 0 8px rgba(129, 140, 248, 0.6)',
                    }}
                  />
                </div>

                {selectedFile?.name && (
                  <p className="text-[11px] text-slate-400 text-center truncate pt-0.5">
                    {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* ── CLEAN UPLOAD DROPZONE ── */
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault(); setIsDragging(false);
                if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
              }}
              className="rounded-xl p-12 text-center cursor-pointer transition-all group"
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

              <div className="space-y-4">
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
                  <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Supports PNG, JPG, JPEG, PDF, or document slips
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium text-[13px] transition-all hover:opacity-95"
                    style={{ background: 'var(--brand-600)', boxShadow: 'var(--shadow-xs)' }}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
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
