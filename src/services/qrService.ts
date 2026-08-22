import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { ScheduleSet, FriendSchedule, ClassItem, DayAbbreviation } from '../types/schedule';
import { COLOR_PALETTES } from '../data/sampleSchedules';

export interface CompactSharePayload {
  v: number;
  n: string; // student name
  c?: string; // course
  i: Array<{
    c: string; // code
    n: string; // name
    k?: string; // category
    r?: string; // room
    t?: string; // instructor
    d: DayAbbreviation[]; // days
    s: string; // start
    e: string; // end
    u?: number; // units
    x?: string; // color
  }>;
}

// Convert ScheduleSet to ultra-compact transport payload
export function compressScheduleToPayload(schedule: ScheduleSet): CompactSharePayload {
  return {
    v: 2,
    n: (schedule.studentName || 'Student').slice(0, 40),
    c: (schedule.course || '').slice(0, 40),
    i: (schedule.items || []).map((item) => ({
      c: item.code || '',
      n: item.name || '',
      k: item.category && item.category.toLowerCase() !== 'school' ? item.category : undefined,
      r: item.room || undefined,
      t: item.instructor || undefined,
      d: item.days || [],
      s: item.startTime || '08:00',
      e: item.endTime || '09:30',
      u: item.units && item.units !== 3 ? item.units : undefined,
      x: item.color,
    })),
  };
}

// Convert compact transport payload to a standard FriendSchedule
export function expandPayloadToFriendSchedule(payload: any): FriendSchedule {
  const friendName = payload.n || payload.studentName || payload.name || 'Friend';
  const friendCourse = payload.c || payload.course || 'Student';
  const idSuffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  const rawItems = payload.i || payload.items || [];
  const items: ClassItem[] = rawItems.map((c: any, idx: number) => {
    let days: DayAbbreviation[] = ['M', 'W'];
    if (Array.isArray(c.d)) {
      days = c.d;
    } else if (typeof c.d === 'string') {
      days = (c.d.includes(',') ? c.d.split(',') : c.d.split('')) as DayAbbreviation[];
    } else if (Array.isArray(c.days)) {
      days = c.days;
    }

    return {
      id: `shared-class-${idSuffix}-${idx}`,
      code: c.c || c.code || '',
      name: c.n || c.name || '',
      category: c.k || c.category || 'School',
      room: c.r || c.room || 'General',
      instructor: c.t || c.instructor || '',
      days,
      startTime: c.s || c.startTime || '08:00',
      endTime: c.e || c.endTime || '09:30',
      units: c.u || c.units || 3,
      color: c.x || c.color || COLOR_PALETTES[idx % COLOR_PALETTES.length],
    };
  });

  return {
    id: `friend-${idSuffix}`,
    name: friendName,
    course: friendCourse,
    avatarColor: COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)],
    schedule: {
      id: `friend-sched-${idSuffix}`,
      name: `${friendName}'s Timetable`,
      semester: '1st Semester',
      academicYear: '2026-2027',
      studentName: friendName,
      course: friendCourse,
      isDefault: false,
      createdAt: new Date().toISOString(),
      items,
    },
  };
}

// Safe base64 encoding (UTF-8 safe + URL safe)
function safeBase64Encode(str: string): string {
  const utf8Bytes = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
    String.fromCharCode(parseInt(p1, 16))
  );
  return btoa(utf8Bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Safe base64 decoding (resilient to URL encoding, spaces, padding)
function safeBase64Decode(str: string): string | null {
  try {
    let clean = decodeURIComponent(str).trim();
    // Replace URL-safe chars back to standard base64
    clean = clean.replace(/-/g, '+').replace(/_/g, '/').replace(/ /g, '+');
    // Add back padding
    while (clean.length % 4 !== 0) {
      clean += '=';
    }
    const binary = atob(clean);
    return decodeURIComponent(
      Array.prototype.map.call(binary, (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
  } catch (err) {
    try {
      // Fallback: direct atob
      return atob(str.trim());
    } catch {
      return null;
    }
  }
}

// Universal Share URL generator
export function generateUniversalShareUrl(schedule: ScheduleSet): string {
  const compact = compressScheduleToPayload(schedule);
  const jsonStr = JSON.stringify(compact);
  const b64 = safeBase64Encode(jsonStr);
  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : 'https://snapsched.app';
  return `${baseUrl}#share=${b64}`;
}

// Generate Data URL directly for fast and robust <img> tag rendering
export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 320,
      margin: 2,
      color: {
        dark: '#1e1b4b',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'L',
    });
  } catch (err) {
    console.error('Failed to generate QR data URL', err);
    throw err;
  }
}

// Safely parse from URL, hash string, or raw JSON
export function parseIncomingShareString(rawText: string): FriendSchedule | null {
  if (!rawText || !rawText.trim()) return null;
  const trimmed = rawText.trim();

  try {
    // 1. Check if it's a URL containing #share=... or share=...
    if (trimmed.includes('share=')) {
      const match = trimmed.match(/share=([A-Za-z0-9\-_+=%]+)/);
      if (match && match[1]) {
        const decodedJson = safeBase64Decode(match[1]);
        if (decodedJson) {
          const parsed = JSON.parse(decodedJson);
          if (parsed && (parsed.i || parsed.items || parsed.n)) {
            return expandPayloadToFriendSchedule(parsed);
          }
        }
      }
    }

    // 2. Check if it's raw base64 string
    const decodedJson = safeBase64Decode(trimmed);
    if (decodedJson) {
      try {
        const parsed = JSON.parse(decodedJson);
        if (parsed && (parsed.i || parsed.items || parsed.n)) {
          return expandPayloadToFriendSchedule(parsed);
        }
      } catch {
        // continue
      }
    }

    // 3. Check if it's standard JSON format
    const parsed = JSON.parse(trimmed);
    if (parsed.v === 2 && Array.isArray(parsed.i)) {
      return expandPayloadToFriendSchedule(parsed);
    }
    if (parsed.schedule && Array.isArray(parsed.schedule.items)) {
      return expandPayloadToFriendSchedule({
        v: 2,
        n: parsed.schedule.studentName || parsed.studentName || 'Friend',
        c: parsed.schedule.course || parsed.course || '',
        i: parsed.schedule.items.map((it: any) => ({
          c: it.code || '',
          n: it.name || '',
          k: it.category || 'School',
          r: it.room || '',
          t: it.instructor || '',
          d: it.days || [],
          s: it.startTime || '08:00',
          e: it.endTime || '09:30',
          u: it.units || 3,
          x: it.color,
        })),
      });
    }
    if (Array.isArray(parsed.items)) {
      return expandPayloadToFriendSchedule({
        v: 2,
        n: parsed.studentName || 'Friend',
        c: parsed.course || '',
        i: parsed.items,
      });
    }
  } catch (err) {
    console.warn('Failed to parse share payload', err);
  }
  return null;
}

// Helper to scan ImageData on canvas with jsQR
function scanCanvasImageData(canvas: HTMLCanvasElement): string | null {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'attemptBoth',
  });
  return code ? code.data : null;
}

// Decode QR Code from an HTML Image Element with multi-scale recognition for mobile screenshots
export function decodeQrFromImage(imgElement: HTMLImageElement): string | null {
  const origW = imgElement.naturalWidth || imgElement.width;
  const origH = imgElement.naturalHeight || imgElement.height;
  if (!origW || !origH) return null;

  // Try 1: Scan at natural resolution
  const canvas = document.createElement('canvas');
  canvas.width = origW;
  canvas.height = origH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  ctx.drawImage(imgElement, 0, 0, origW, origH);
  let result = scanCanvasImageData(canvas);
  if (result) return result;

  // Try 2: Scale down high-resolution smartphone screenshots (e.g. 1080p/4K) to 800px max
  const maxScales = [800, 500, 1200];
  for (const maxDim of maxScales) {
    if (origW > maxDim || origH > maxDim) {
      const scale = maxDim / Math.max(origW, origH);
      canvas.width = Math.round(origW * scale);
      canvas.height = Math.round(origH * scale);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
      result = scanCanvasImageData(canvas);
      if (result) return result;
    }
  }

  return null;
}

// Decode QR from Video Stream ImageData
export function decodeQrFromImageData(imageData: ImageData): string | null {
  const code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'dontInvert',
  });
  return code ? code.data : null;
}
