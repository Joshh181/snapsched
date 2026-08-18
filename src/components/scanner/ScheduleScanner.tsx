import React, { useState, useRef } from 'react';
import {
  ScanLine,
  Upload,
  AlertCircle,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { geminiService } from '../../services/geminiService';
import { OcrParsedClass } from '../../types/schedule';
import { PRELOADED_SAMPLE_CORS } from '../../data/sampleSchedules';
import { OcrReviewTable } from './OcrReviewTable';

interface ScheduleScannerProps {
  onImportClasses: (classes: OcrParsedClass[], replace: boolean) => void;
  onOpenSettings?: () => void;
}

export const ScheduleScanner: React.FC<ScheduleScannerProps> = ({
  onImportClasses,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedResults, setParsedResults] = useState<OcrParsedClass[] | null>(null);
  const [_selectedFile, setSelectedFile] = useState<{ name: string; previewUrl?: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;
    setSelectedFile({
      name: file.name,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
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
            setParsedResults(results);
          } catch (e: any) {
            setErrorMessage(e.message || 'Failed to parse image.');
          } finally {
            setIsProcessing(false);
          }
        };
        reader.readAsDataURL(file);
      } else {
        const text = await file.text();
        const results = await geminiService.parseScheduleDocument({ text });
        setParsedResults(results);
        setIsProcessing(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process document.');
      setIsProcessing(false);
    }
  };

  const handleLoadSample = async (sampleIndex: number) => {
    const sample = PRELOADED_SAMPLE_CORS[sampleIndex];
    setSelectedFile({ name: `${sample.title}.txt` });
    setIsProcessing(true);
    setErrorMessage(null);

    setTimeout(async () => {
      try {
        const results = await geminiService.parseScheduleDocument({ text: sample.sampleText });
        setParsedResults(results);
      } catch (e: any) {
        setErrorMessage(e.message);
      } finally {
        setIsProcessing(false);
      }
    }, 1000);
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
            Upload your COR image or document to extract class schedules automatically.
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium"
          style={{ background: 'var(--status-success-bg)', color: '#065f46', border: '1px solid var(--status-success-border)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--status-success)' }} />
          Ready
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
          {/* Upload zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault(); setIsDragging(false);
              if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
            }}
            className="rounded-lg p-10 text-center cursor-pointer transition-all"
            style={{
              background: isDragging ? 'var(--brand-50)' : 'var(--surface-primary)',
              border: isDragging ? '2px dashed var(--brand-400)' : '2px dashed var(--border-strong)',
              boxShadow: isDragging ? 'none' : 'var(--shadow-xs)',
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef} type="file" accept="image/*,.pdf,.txt" className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }}
            />

            {isProcessing ? (
              <div className="space-y-3">
                <div
                  className="w-10 h-10 rounded-lg mx-auto flex items-center justify-center animate-pulse"
                  style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-200)', color: 'var(--brand-600)' }}
                >
                  <ScanLine className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-[14px]" style={{ color: 'var(--text-primary)' }}>
                  Scanning document with Gemini AI...
                </h3>
                <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                  Extracting course codes, schedules, and rooms.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div
                  className="w-10 h-10 rounded-lg mx-auto flex items-center justify-center"
                  style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
                >
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-[14px]" style={{ color: 'var(--text-primary)' }}>
                    Drop your COR or schedule document
                  </h3>
                  <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    Supports JPG, PNG, PDF, or text files
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white font-medium text-[13px] transition-colors"
                  style={{ background: 'var(--text-primary)', boxShadow: 'var(--shadow-xs)' }}
                >
                  <ScanLine className="w-4 h-4" />
                  Select File
                </button>
              </div>
            )}
          </div>

          {/* Error */}
          {errorMessage && (
            <div
              className="p-3 rounded-lg flex items-center gap-2 text-[13px]"
              style={{ background: 'var(--status-error-bg)', border: '1px solid var(--status-error-border)', color: 'var(--status-error)' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Sample schedules */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" style={{ color: 'var(--status-warning)' }} />
              <h4 className="text-[13px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Try a Sample Schedule
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRELOADED_SAMPLE_CORS.map((sample, idx) => (
                <button
                  key={sample.id}
                  onClick={() => handleLoadSample(idx)}
                  disabled={isProcessing}
                  className="p-3 rounded-lg text-left transition-all flex items-center justify-between gap-3 group"
                  style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; }}
                >
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{sample.title}</div>
                    <div className="text-[12px] truncate" style={{ color: 'var(--text-tertiary)' }}>{sample.subtitle}</div>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-md text-[12px] font-medium shrink-0 transition-colors"
                    style={{ background: 'var(--surface-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                  >
                    Test →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
