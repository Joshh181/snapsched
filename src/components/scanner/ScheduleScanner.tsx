import React, { useState, useRef } from 'react';
import { 
  ScanLine, 
  Upload, 
  Key, 
  AlertCircle, 
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { geminiService } from '../../services/geminiService';
import { storageService } from '../../services/storageService';
import { OcrParsedClass } from '../../types/schedule';
import { PRELOADED_SAMPLE_CORS } from '../../data/sampleSchedules';
import { OcrReviewTable } from './OcrReviewTable';

interface ScheduleScannerProps {
  onImportClasses: (classes: OcrParsedClass[], replace: boolean) => void;
  onOpenSettings: () => void;
}

export const ScheduleScanner: React.FC<ScheduleScannerProps> = ({
  onImportClasses,
  onOpenSettings,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedResults, setParsedResults] = useState<OcrParsedClass[] | null>(null);
  const [_selectedFile, setSelectedFile] = useState<{ name: string; previewUrl?: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [apiKey] = useState(() => storageService.getGeminiApiKey());

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger file selection
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
            const results = await geminiService.parseScheduleDocument(
              {
                base64Image: base64Data,
                mimeType: file.type,
              },
              apiKey
            );
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
        const results = await geminiService.parseScheduleDocument({ text }, apiKey);
        setParsedResults(results);
        setIsProcessing(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process document.');
      setIsProcessing(false);
    }
  };

  // Instant 1-Click Preloaded Sample Test
  const handleLoadSample = async (sampleIndex: number) => {
    const sample = PRELOADED_SAMPLE_CORS[sampleIndex];
    setSelectedFile({ name: `${sample.title}.txt` });
    setIsProcessing(true);
    setErrorMessage(null);

    setTimeout(async () => {
      try {
        const results = await geminiService.parseScheduleDocument(
          { text: sample.sampleText },
          apiKey
        );
        setParsedResults(results);
      } catch (e: any) {
        setErrorMessage(e.message);
      } finally {
        setIsProcessing(false);
      }
    }, 1000);
  };

  // Table edit helpers
  const handleToggleSelect = (id: string) => {
    if (!parsedResults) return;
    setParsedResults(
      parsedResults.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
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
    setParsedResults(
      parsedResults.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
  };

  const handleConfirmImport = (replace: boolean) => {
    if (!parsedResults) return;
    const selected = parsedResults.filter((i) => i.selected);
    if (selected.length === 0) return;

    onImportClasses(selected, replace);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    setParsedResults(null);
    setSelectedFile(null);
  };

  return (
    <div className="space-y-3.5 max-w-4xl mx-auto select-none">
      {/* Header Panel */}
      <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-sm text-zinc-900">
              COR Document Scanner
            </h2>
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
              OCR Engine
            </span>
          </div>
          <p className="text-xs text-zinc-600 max-w-lg mt-0.5 leading-relaxed">
            Upload your university Certificate of Registration (COR) image or PDF to extract schedules automatically.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Ready to Scan</span>
        </div>
      </div>

      {/* If we have parsed results, show Review Table */}
      {parsedResults ? (
        <OcrReviewTable
          items={parsedResults}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onDeleteItem={handleDeleteItem}
          onUpdateItem={handleUpdateItem}
          onConfirmImport={handleConfirmImport}
          onReset={() => {
            setParsedResults(null);
            setSelectedFile(null);
          }}
        />
      ) : (
        /* Upload Area & Sample Selectors */
        <div className="space-y-3.5">
          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileSelect(e.dataTransfer.files[0]);
              }
            }}
            className={`rounded-xl border border-dashed p-8 text-center transition-colors cursor-pointer ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-zinc-300 bg-white hover:border-zinc-400 hover:bg-zinc-50/60 shadow-xs'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            {/* Processing / Scanning Animation */}
            {isProcessing ? (
              <div className="py-6 space-y-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 mx-auto flex items-center justify-center animate-pulse text-blue-600">
                  <ScanLine className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-xs text-zinc-900">
                  Parsing COR Document...
                </h3>
                <p className="text-[11px] font-mono text-zinc-500 max-w-sm mx-auto">
                  Extracting course codes, schedules, and room locations.
                </p>
              </div>
            ) : (
              <div className="py-4 space-y-2.5">
                <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 mx-auto flex items-center justify-center text-zinc-600">
                  <Upload className="w-4 h-4" />
                </div>

                <div className="space-y-0.5">
                  <h3 className="font-medium text-xs text-zinc-900">
                    Drop your Certificate of Registration (COR) image or PDF
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-400">
                    Supports JPG, PNG, PDF, or text load slips
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs shadow-2xs transition-colors">
                  <ScanLine className="w-3.5 h-3.5" />
                  <span>Select File</span>
                </div>
              </div>
            )}
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Instant 1-Click Sample Testing Section */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <h4 className="font-mono text-xs text-zinc-600 uppercase tracking-wider font-semibold">
                Sample Pre-loaded Schedules
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRELOADED_SAMPLE_CORS.map((sample, idx) => (
                <button
                  key={sample.id}
                  onClick={() => handleLoadSample(idx)}
                  disabled={isProcessing}
                  className="p-3 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 text-left transition-colors flex items-center justify-between gap-3 shadow-2xs group"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-xs font-semibold text-zinc-900 group-hover:text-blue-600 truncate transition-colors">
                      {sample.title}
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate">{sample.subtitle}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 text-[10px] font-mono shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
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
