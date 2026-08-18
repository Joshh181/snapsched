import { OcrParsedClass, DayAbbreviation } from '../types/schedule';
import { storageService } from './storageService';

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const OCR_SYSTEM_PROMPT = `You are an expert academic schedule and Certificate of Registration (COR) parser.
Analyze the provided registration slip, study load form, class schedule table, or timetable document image/text.
Extract every enrolled subject/course accurately.

Return ONLY a valid JSON array of objects with the exact structure below (no markdown ticks, no commentary, pure JSON):
[
  {
    "code": "IT 311",
    "name": "Advanced Web Development",
    "section": "BSIT 3-A",
    "units": 3.0,
    "days": ["M", "W"],
    "startTime": "07:30",
    "endTime": "09:00",
    "room": "IT-LAB 2",
    "instructor": "Prof. Name"
  }
]

RULES FOR TIME & DAYS:
- "days" must ONLY contain single valid values: "M" (Monday), "T" (Tuesday), "W" (Wednesday), "TH" (Thursday), "F" (Friday), "S" (Saturday).
- Convert all day combinations properly: e.g. "MW" -> ["M", "W"], "TTH" -> ["T", "TH"], "MWF" -> ["M", "W", "F"], "SAT" -> ["S"], "TH" -> ["TH"].
- "startTime" and "endTime" MUST be in 24-hour "HH:mm" format (e.g. "07:30", "13:30", "15:00", "18:00").
- If times are written as "7:30AM-9:00AM", convert to "07:30" and "09:00".
- If times are written as "1:30PM-3:00PM", convert to "13:30" and "15:00".
`;

export const geminiService = {
  /**
   * Parse a Certificate of Registration from an image (base64) or raw text
   */
  async parseScheduleDocument(
    input: { base64Image?: string; mimeType?: string; text?: string },
    userApiKey?: string
  ): Promise<OcrParsedClass[]> {
    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    const apiKey = (envKey && envKey.trim()) || (userApiKey && userApiKey.trim()) || storageService.getGeminiApiKey();

    if (!apiKey) {
      if (input.text) {
        return this.fallbackHeuristicParser(input.text);
      }
      throw new Error(
        'No Gemini API Key found. Please add your Gemini API Key in your .env file: VITE_GEMINI_API_KEY=AIzaSy...'
      );
    }

    const payload: any = {
      contents: [
        {
          parts: [],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    };

    if (input.base64Image && input.mimeType) {
      payload.contents[0].parts.push({
        inlineData: {
          mimeType: input.mimeType,
          data: input.base64Image,
        },
      });
    }

    const promptText = `${OCR_SYSTEM_PROMPT}\n\nInput Document / Instructions:\n${
      input.text || 'Extract all class schedule items from this image accurately.'
    }`;
    payload.contents[0].parts.push({ text: promptText });

    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const msg = errData?.error?.message || `Google Gemini API returned error code ${response.status}`;
      throw new Error(`Gemini Vision Error: ${msg}`);
    }

    const data = await response.json();
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!rawContent.trim()) {
      throw new Error('Gemini API returned an empty response for this image.');
    }

    // Clean JSON formatting
    const cleanedJson = rawContent
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    try {
      const parsedItems = JSON.parse(cleanedJson);
      const formatted = this.formatParsedClasses(parsedItems);
      if (formatted.length === 0) {
        throw new Error('No class schedule items could be detected in the provided document.');
      }
      return formatted;
    } catch (parseErr: any) {
      throw new Error(`Failed to parse extracted schedule JSON: ${parseErr.message}`);
    }
  },

  /**
   * Helper to format and validate parsed class items
   */
  formatParsedClasses(rawItems: any[]): OcrParsedClass[] {
    if (!Array.isArray(rawItems)) return [];

    return rawItems.map((item, idx) => {
      // Normalize days
      let days: DayAbbreviation[] = [];
      if (Array.isArray(item.days)) {
        days = item.days.map((d: string) => d.toUpperCase().trim() as DayAbbreviation);
      } else if (typeof item.days === 'string') {
        days = this.parseDayString(item.days);
      }

      if (days.length === 0) days = ['M', 'W'];

      return {
        id: `ocr-${Date.now()}-${idx}`,
        code: item.code || `SUBJ ${100 + idx}`,
        name: item.name || item.description || 'Enrolled Course',
        section: item.section || 'BSIT 3-A',
        units: Number(item.units) || 3.0,
        days: days,
        startTime: this.normalize24hTime(item.startTime || '08:00'),
        endTime: this.normalize24hTime(item.endTime || '09:30'),
        room: item.room || 'TBA',
        instructor: item.instructor || 'Staff Instructor',
        confidence: 0.98,
        selected: true,
      };
    });
  },

  /**
   * Converts day abbreviations like "MWF", "TTH", "M/W" to array ['M', 'W', 'F']
   */
  parseDayString(dayStr: string): DayAbbreviation[] {
    const s = dayStr.toUpperCase().replace(/[\s,\/]/g, '');
    const result: DayAbbreviation[] = [];

    if (s.includes('TTH')) {
      result.push('T', 'TH');
    } else if (s.includes('MWF')) {
      result.push('M', 'W', 'F');
    } else if (s.includes('MW')) {
      result.push('M', 'W');
    } else {
      if (s.includes('TH')) result.push('TH');
      if (s.includes('M')) result.push('M');
      if (s.includes('T') && !s.includes('TH')) result.push('T');
      if (s.includes('W')) result.push('W');
      if (s.includes('F')) result.push('F');
      if (s.includes('S') || s.includes('SAT')) result.push('S');
    }

    return Array.from(new Set(result));
  },

  /**
   * Normalizes any time string (e.g. "7:30AM", "1:30 PM", "07:30") to standard "HH:mm"
   */
  normalize24hTime(timeStr: string): string {
    if (!timeStr) return '08:00';
    const clean = timeStr.trim().toUpperCase();

    // Already 24h format like 07:30 or 14:00
    if (/^\d{1,2}:\d{2}$/.test(clean)) {
      const [h, m] = clean.split(':');
      return `${h.padStart(2, '0')}:${m}`;
    }

    // 12-hour format with AM/PM like 7:30AM or 01:30 PM
    const match = clean.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = match[2];
      const meridiem = match[3];

      if (meridiem === 'PM' && hours < 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;

      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }

    return '08:00';
  },

  /**
   * Fast rule-based local parser for Certificate of Registration text format
   */
  fallbackHeuristicParser(text: string): OcrParsedClass[] {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const results: OcrParsedClass[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('COLLEGE') || line.includes('STUDENT') || line.includes('---') || line.includes('CODE')) {
        continue;
      }

      const timeMatch = line.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
      
      if (timeMatch) {
        const parts = line.split(/\s{2,}|\t/).filter(Boolean);
        let code = 'SUBJ 101';
        let name = 'University Course';
        let units = 3.0;
        let dayStr = 'MW';
        let room = 'TBA';

        if (parts.length >= 4) {
          code = parts[0];
          name = parts[1];
          units = parseFloat(parts[2]) || 3.0;
          dayStr = parts[3] || 'MW';
          room = parts[parts.length - 1] || 'ROOM 101';
        } else {
          const tokens = line.split(/\s+/);
          if (tokens.length >= 2) {
            code = `${tokens[0]} ${tokens[1]}`;
            name = tokens.slice(2, tokens.length - 4).join(' ') || 'Lecture Subject';
            room = tokens[tokens.length - 1];
          }
        }

        results.push({
          id: `ocr-local-${Date.now()}-${results.length}`,
          code: code.trim(),
          name: name.trim(),
          section: 'BSIT 3-A',
          units: units,
          days: this.parseDayString(dayStr),
          startTime: this.normalize24hTime(timeMatch[1]),
          endTime: this.normalize24hTime(timeMatch[2]),
          room: room.trim(),
          instructor: 'Department Faculty',
          confidence: 0.92,
          selected: true,
        });
      }
    }

    return results;
  },
};
