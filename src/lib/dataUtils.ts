import { Task, MainCategory } from '@/types';

export const CATEGORY_COLORS: Record<MainCategory, string> = {
  인사: '#4B7CF3',
  총무: '#2ECC99',
  법무: '#F5A623',
  재무: '#EF5DA8',
  지원사업: '#9B72EA',
  경영진비서: '#35BDD5',
};

export const CATEGORIES: MainCategory[] = [
  '인사',
  '총무',
  '법무',
  '재무',
  '지원사업',
  '경영진비서',
];

export function getCategoryStats(
  tasks: Task[]
): { category: string; count: number; percentage: number }[] {
  const counts: Record<string, number> = {};
  for (const task of tasks) {
    counts[task.mainCategory] = (counts[task.mainCategory] ?? 0) + 1;
  }
  const total = tasks.length;
  return CATEGORIES.map((cat) => ({
    category: cat,
    count: counts[cat] ?? 0,
    percentage: total > 0 ? Math.round(((counts[cat] ?? 0) / total) * 100) : 0,
  })).filter((s) => s.count > 0);
}

// Returns "M/N주" label for a date (week-of-month, 1-indexed)
function getWeekLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  // Week of month: which Monday-based week this day falls in
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayOfWeek = firstOfMonth.getDay(); // 0=Sun,1=Mon,...
  // Shift so Monday=0
  const shifted = (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1);
  const weekNum = Math.floor((day - 1 + shifted) / 7) + 1;
  return `${month}/${weekNum}주`;
}

// Canonical sort key for a week label like "4/2주" -> "04/2"
function weekSortKey(label: string): string {
  const match = label.match(/^(\d+)\/(\d+)주$/);
  if (!match) return label;
  return `${match[1].padStart(2, '0')}/${match[2]}`;
}

// Returns ISO Monday date for a given date string (for grouping)
function getMondayStr(dateStr: string): string {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return dateStr;
  const date = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function getWeeklyData(tasks: Task[]): Record<string, string | number>[] {
  // Group tasks by ISO week (Monday)
  const weekMap: Record<string, Record<string, number>> = {};
  const weekLabelMap: Record<string, string> = {}; // monday -> label

  for (const task of tasks) {
    const monday = getMondayStr(task.date);
    const label = getWeekLabel(task.date);
    weekLabelMap[monday] = label;
    if (!weekMap[monday]) {
      weekMap[monday] = {};
      for (const cat of CATEGORIES) weekMap[monday][cat] = 0;
    }
    weekMap[monday][task.mainCategory] = (weekMap[monday][task.mainCategory] ?? 0) + 1;
  }

  // Sort mondays chronologically, take last 8
  const sortedMondays = Object.keys(weekMap).sort();
  const last8 = sortedMondays.slice(-8);

  return last8.map((monday) => ({
    week: weekLabelMap[monday],
    _sortKey: weekSortKey(weekLabelMap[monday]),
    ...weekMap[monday],
  }));
}

export function getMonthlyData(tasks: Task[]): Record<string, string | number>[] {
  const monthMap: Record<string, Record<string, number>> = {};

  for (const task of tasks) {
    const d = new Date(task.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!monthMap[key]) {
      monthMap[key] = {};
      for (const cat of CATEGORIES) monthMap[key][cat] = 0;
    }
    monthMap[key][task.mainCategory] = (monthMap[key][task.mainCategory] ?? 0) + 1;
  }

  const sorted = Object.keys(monthMap).sort();
  return sorted.map((key) => {
    const [, m] = key.split('-');
    return {
      month: `${parseInt(m)}월`,
      ...monthMap[key],
    };
  });
}

export function getSubCategoryStats(
  tasks: Task[]
): { mainCategory: string; subCategory: string; count: number }[] {
  const map: Record<string, { mainCategory: string; subCategory: string; count: number }> = {};
  for (const task of tasks) {
    const key = `${task.mainCategory}__${task.subCategory}`;
    if (!map[key]) {
      map[key] = { mainCategory: task.mainCategory, subCategory: task.subCategory, count: 0 };
    }
    map[key].count += 1;
  }
  return Object.values(map).sort((a, b) => b.count - a.count);
}

export function filterByDateRange(tasks: Task[], start: string, end: string): Task[] {
  return tasks.filter((t) => t.date >= start && t.date <= end);
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

// kept for backward compat
export function getCurrentWeekRange(): [string, string] {
  return getWeekRangeForDate(fmtDate(new Date()));
}

export function getCurrentMonthRange(): [string, string] {
  return getMonthRangeForDate(fmtDate(new Date()));
}
