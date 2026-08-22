import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Upload, RefreshCw, AlertCircle, Sparkles, Image, CheckCircle } from 'lucide-react';
import { decodeQrFromImage, decodeQrFromImageData } from '../../services/qrService';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (rawPayload: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanResult,
}) => {
  const [scanMode, setScanMode] = useState<'camera' | 'upload'>('camera');
  const [cameraError, setCameraError] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isScanning, setIsScanning] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError('');
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser or environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsScanning(true);
        startScanLoop();
      }
    } catch (err: any) {
      console.warn('Camera stream error', err);
      let msg = 'Unable to access camera. Please allow camera permissions or upload a QR image.';
      if (err.name === 'NotAllowedError') {
        msg = 'Camera permission was denied. Please grant permission in browser settings or upload a QR screenshot.';
      } else if (err.name === 'NotFoundError') {
        msg = 'No camera found on this device. Please upload a QR code image instead.';
      }
      setCameraError(msg);
      setScanMode('upload');
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    setIsScanning(false);
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  // Real-time scan loop
  const startScanLoop = () => {
    const scanFrame = () => {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = decodeQrFromImageData(imageData);

        if (code) {
          stopCamera();
          onScanResult(code);
          return;
        }
      }

      animationFrameId.current = requestAnimationFrame(scanFrame);
    };

    animationFrameId.current = requestAnimationFrame(scanFrame);
  };

  useEffect(() => {
    if (isOpen && scanMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, scanMode, facingMode]);

  // Handle uploaded image
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const decoded = decodeQrFromImage(img);
        if (decoded) {
          onScanResult(decoded);
        } else {
          setUploadError('No readable QR code found in this image. Please try a clearer screenshot or crop closer.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 animate-overlay-in select-none z-50"
      style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md overflow-hidden flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 animate-scale-in"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[15px] text-slate-900">Scan Friend's QR Code</h3>
              <p className="text-[11.5px] text-slate-500 font-medium">Point camera at friend's SnapSched QR</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex border-b border-slate-200 text-xs font-bold">
          <button
            onClick={() => setScanMode('camera')}
            className={`flex-1 py-3 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 border-b-2 ${
              scanMode === 'camera'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                : 'border-transparent text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Camera</span>
          </button>
          <button
            onClick={() => setScanMode('upload')}
            className={`flex-1 py-3 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 border-b-2 ${
              scanMode === 'upload'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                : 'border-transparent text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>
        </div>

        {/* Scanner Viewport */}
        <div className="p-5 flex flex-col items-center">
          {scanMode === 'camera' && (
            <div className="w-full flex flex-col items-center space-y-3">
              <div className="relative w-full aspect-square max-w-[280px] rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-800 shadow-inner flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Reticle Target Overlay */}
                <div className="absolute inset-8 border-2 border-indigo-400/80 rounded-xl pointer-events-none flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                  {/* Laser Scan Line */}
                  <div className="w-full h-0.5 bg-indigo-400 shadow-[0_0_8px_#818cf8] animate-bounce opacity-80" />

                  {/* Corner accents */}
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-3 border-l-3 border-indigo-400 rounded-tl" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-3 border-r-3 border-indigo-400 rounded-tr" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-3 border-l-3 border-indigo-400 rounded-bl" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-3 border-r-3 border-indigo-400 rounded-br" />
                </div>

                {!isScanning && !cameraError && (
                  <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center text-white text-xs font-semibold">
                    Starting camera...
                  </div>
                )}
              </div>

              {cameraError ? (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2 text-left w-full">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{cameraError}</span>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full max-w-[280px] text-xs">
                  <span className="text-slate-500 font-medium">Align QR inside frame</span>
                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Flip</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {scanMode === 'upload' && (
            <div className="w-full space-y-3">
              <label
                htmlFor="qr-file-upload"
                className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/30 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-white group-hover:bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-2xs border border-slate-200 mb-3 transition-colors">
                  <Image className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-slate-800">
                  Select QR Screenshot / Image
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  Supports PNG, JPG, WEBP images
                </span>

                <input
                  id="qr-file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 text-left">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>SnapSched QR Reader v2</span>
          <button
            onClick={onClose}
            className="font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
