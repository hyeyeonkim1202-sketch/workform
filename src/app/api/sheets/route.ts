import { Task, MainCategory } from '@/types';

const SHEET_ID = '1VW8rVdMq7vNQQigb3SDvmalY0Gv_ILnpRj0MHjc2LIs';

export const revalidate = 300;

export async function GET() {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
    const res = await fetch(url, { cache: 'force-cache', next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`Failed to fetch sheet: ${res.status}`);
    const csv = await res.text();
    const tasks = parseCSV(csv);
    return Response.json({ tasks, source: 'sheets' });
  } catch (e) {
    return Response.json(
      { tasks: [], source: 'error', error: String(e) },
      { status: 500 }
    );
  }
}

function normalizeDate(raw: string): string {
  const s = raw.trim();
  // YYYY-MM-DD
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)) {
    const [y, m, d] = s.split('-');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  // YYYY/MM/DD or YYYY/M/D
  if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(s)) {
    const [y, m, d] = s.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  // Google Sheets Korean locale: "2024. 6. 18." or "2024. 06. 18"
  const dotMatch = s.match(/^(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.?\s*$/);
  if (dotMatch) {
    const [, y, m, d] = dotMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  // Korean: 2026년 6월 18일
  const krMatch = s.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
  if (krMatch) {
    const [, y, m, d] = krMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  // MM/DD/YYYY
  const usMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    const [, m, d, y] = usMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return s;
}

function parseCSV(csv: string): Task[] {
  const lines = csv.split('\n').filter((l) => l.trim());
  const tasks: Task[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]).map((c) => c.trim());
    if (cols.length < 4 || !cols[0]) continue;
    const date = normalizeDate(cols[0]);
    // Only skip if date couldn't be parsed at all
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const mainCategory = cols[1] as MainCategory;
    if (!mainCategory) continue;
    tasks.push({
      date,
      mainCategory,
      subCategory: cols[2] ?? '',
      detail: cols[3] ?? '',
    });
  }
  return tasks;
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}
