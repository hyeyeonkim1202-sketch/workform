import { Task, MainCategory } from '@/types';

const SHEET_ID = '1VW8rVdMq7vNQQigb3SDvmalY0Gv_ILnpRj0MHjc2LIs';

export const revalidate = 0;

export async function GET() {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const csv = await res.text();
    const tasks = parseCSV(csv);
    return Response.json({ tasks, source: 'sheets', count: tasks.length });
  } catch (e) {
    return Response.json({ tasks: [], source: 'error', error: String(e) }, { status: 500 });
  }
}

// "01월 22일 (목)" → "2026-01-22"  (year inferred from current date)
function normalizeDate(raw: string): string {
  const s = raw.trim().replace(/\r/g, '');
  if (!s) return '';

  // "1월 22일" or "01월 22일 (목)" — Korean month/day without year
  const krNoYear = s.match(/^(\d{1,2})월\s*(\d{1,2})일/);
  if (krNoYear) {
    const m = parseInt(krNoYear[1]);
    const d = parseInt(krNoYear[2]);
    const now = new Date();
    const curMonth = now.getMonth() + 1;
    const curYear = now.getFullYear();
    // If parsed month is ahead of current month → last year
    const y = m > curMonth ? curYear - 1 : curYear;
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  // "2026년 1월 22일"
  const krFull = s.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
  if (krFull) {
    return `${krFull[1]}-${krFull[2].padStart(2, '0')}-${krFull[3].padStart(2, '0')}`;
  }

  // YYYY-MM-DD or YYYY-M-D
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)) {
    const [y, m, d] = s.split('-');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // YYYY/MM/DD
  if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(s)) {
    const [y, m, d] = s.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // "2024. 6. 18."
  const dotMatch = s.match(/^(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.?\s*$/);
  if (dotMatch) {
    return `${dotMatch[1]}-${dotMatch[2].padStart(2, '0')}-${dotMatch[3].padStart(2, '0')}`;
  }

  return '';
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function parseCSV(csv: string): Task[] {
  const lines = csv.split('\n').filter(l => l.trim().replace(/\r/g, ''));
  if (lines.length < 2) return [];

  // Parse header to find column positions dynamically
  const header = splitCSVLine(lines[0]).map(c => c.trim().replace(/\r/g, ''));

  const dateIdx    = header.findIndex(h => h === '날짜');
  const mainCatIdx = header.findIndex(h => h === '상위항목');        // col 10
  const subCatIdx  = header.findIndex(h => h === '하위항목');        // col 12 (exact, not 하위항목_가공)
  const detailIdx  = header.findIndex(h => h === '업무내용');        // col 5

  // Fallbacks if headers not matched
  const dIdx  = dateIdx    >= 0 ? dateIdx    : 0;
  const mIdx  = mainCatIdx >= 0 ? mainCatIdx : 1;
  const sIdx  = subCatIdx  >= 0 ? subCatIdx  : 2;
  const deIdx = detailIdx  >= 0 ? detailIdx  : 5;

  const tasks: Task[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]).map(c => c.trim().replace(/\r/g, ''));
    if (cols.every(c => !c)) continue;

    const date = normalizeDate(cols[dIdx] ?? '');
    if (!date) continue;

    const mainCategory = (cols[mIdx] ?? '') as MainCategory;
    if (!mainCategory) continue;

    const subCategory = cols[sIdx] ?? '';
    const detail      = cols[deIdx] ?? '';

    tasks.push({ date, mainCategory, subCategory, detail });
  }

  return tasks;
}
