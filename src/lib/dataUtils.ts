import { Task } from '@/types';

// Deterministic color from category name (works with any language)
const COLOR_PALETTE = [
  '#4B7CF3', '#2ECC99', '#F5A623', '#EF5DA8',
  '#9B72EA', '#35BDD5', '#FF6B6B', '#48CAE4',
  '#FFB347', '#77DD77', '#AEC6CF', '#F49AC2',
];

export function getCategoryColor(category: string): string {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = ((hash << 5) - hash + category.charCodeAt(i)) | 0;
  }
  return COLOR_PALETTE[Math.abs(hash) % COLOR_PALETTE.length];
}

// Derive unique categories from tasks (preserves original names)
export function getUniqueCategories(tasks: Task[]): string[] {
  return [...new Set(tasks.map(t => t.mainCategory))].filter(Boolean).sort();
}

export function getCategoryStats(
  tasks: Task[]
): { category: string; count: number; percentage: number }[] {
  const counts: Record<string, number> = {};
  for (const task of tasks) {
    counts[task.mainCategory] = (counts[task.mainCategory] ?? 0) + 1;
  }
  const total = tasks.length;
  return Object.entries(counts)
    .map(([category, count]) => ({
      category,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

function getMondayStr(dateStr: string): string {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return dateStr;
  const date = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getWeekLabel(dateStr: string): string {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return dateStr;
  const date = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
  const month = date.getMonth() + 1;
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const shifted = (firstOfMonth.getDay() + 6) % 7;
  const weekNum = Math.floor((date.getDate() - 1 + shifted) / 7) + 1;
  return `${month}/${weekNum}주`;
}

export function getWeeklyData(tasks: Task[]): Record<string, string | number>[] {
  const weekMap: Record<string, Record<string, number>> = {};
  const labelMap: Record<string, string> = {};

  for (const task of tasks) {
    const monday = getMondayStr(task.date);
    labelMap[monday] = getWeekLabel(task.date);
    if (!weekMap[monday]) weekMap[monday] = {};
    weekMap[monday][task.mainCategory] = (weekMap[monday][task.mainCategory] ?? 0) + 1;
  }

  const sorted = Object.keys(weekMap).sort().slice(-8);
  return sorted.map(monday => ({ week: labelMap[monday], ...weekMap[monday] }));
}

export function getMonthlyData(tasks: Task[]): Record<string, string | number>[] {
  const monthMap: Record<string, Record<string, number>> = {};

  for (const task of tasks) {
    const match = task.date.match(/^(\d{4})-(\d{2})/);
    if (!match) continue;
    const key = `${match[1]}-${match[2]}`;
    if (!monthMap[key]) monthMap[key] = {};
    monthMap[key][task.mainCategory] = (monthMap[key][task.mainCategory] ?? 0) + 1;
  }

  return Object.keys(monthMap)
    .sort()
    .map(key => {
      const m = parseInt(key.split('-')[1]);
      return { month: `${m}월`, ...monthMap[key] };
    });
}

export function getSubCategoryStats(
  tasks: Task[]
): { mainCategory: string; subCategory: string; count: number }[] {
  const map: Record<string, { mainCategory: string; subCategory: string; count: number }> = {};
  for (const task of tasks) {
    const key = `${task.mainCategory}__${task.subCategory}`;
    if (!map[key]) map[key] = { mainCategory: task.mainCategory, subCategory: task.subCategory, count: 0 };
    map[key].count += 1;
  }
  return Object.values(map).sort((a, b) => b.count - a.count);
}

export function filterByDateRange(tasks: Task[], start: string, end: string): Task[] {
  return tasks.filter(t => t.date >= start && t.date <= end);
}

function parseDateLocal(dateStr: string): Date | null {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
}

function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getLatestDate(tasks: Task[]): string {
  if (tasks.length === 0) return '';
  return tasks.map(t => t.date).sort().at(-1) ?? '';
}

export function getWeekRangeForDate(dateStr: string): [string, string] {
  const date = parseDateLocal(dateStr);
  if (!date) return ['', ''];
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() + diff);
  const sunday = new Date(date.getFullYear(), date.getMonth(), date.getDate() + diff + 6);
  return [fmtDate(monday), fmtDate(sunday)];
}

export function getMonthRangeForDate(dateStr: string): [string, string] {
  const match = dateStr.match(/^(\d{4})-(\d{2})/);
  if (!match) return ['', ''];
  const year = parseInt(match[1]);
  const month = parseInt(match[2]);
  const lastDay = new Date(year, month, 0).getDate();
  return [`${match[1]}-${match[2]}-01`, `${match[1]}-${match[2]}-${String(lastDay).padStart(2, '0')}`];
}
