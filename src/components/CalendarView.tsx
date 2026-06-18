'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Task } from '@/types';
import { CATEGORY_COLORS } from '@/lib/dataUtils';

interface Props {
  tasks: Task[];
}

function parseDateLocal(dateStr: string): Date | null {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
}

function fmtKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

export default function CalendarView({ tasks }: Props) {
  const [viewYear, setViewYear] = useState<number>(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(() => new Date().getMonth());

  // Sync calendar view to the latest date in tasks whenever tasks change
  useEffect(() => {
    if (tasks.length === 0) return;
    const latest = [...tasks].map(t => t.date).sort().at(-1);
    if (!latest) return;
    const d = parseDateLocal(latest);
    if (d) { setViewYear(d.getFullYear()); setViewMonth(d.getMonth()); }
  }, [tasks]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Build a map: dateStr -> Task[]
  const taskMap = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const task of tasks) {
      if (!map[task.date]) map[task.date] = [];
      map[task.date].push(task);
    }
    return map;
  }, [tasks]);

  // Calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay = new Date(viewYear, viewMonth + 1, 0);
  // Monday-first grid: 0=Mon … 6=Sun
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;

  const cells: Array<Date | null> = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startOffset + 1;
    if (dayNum < 1 || dayNum > lastDay.getDate()) {
      cells.push(null);
    } else {
      cells.push(new Date(viewYear, viewMonth, dayNum));
    }
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const selectedTasks = selectedDate ? (taskMap[selectedDate] ?? []) : [];

  return (
    <div className="flex flex-col h-full">
      {/* Month navigator */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-gray-800">
          {viewYear}년 {viewMonth + 1}월
        </h2>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
            <ChevronLeft size={16} />
          </button>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((d, i) => (
          <div key={d} className={`text-center text-xs font-medium pb-2 ${i === 5 ? 'text-blue-400' : i === 6 ? 'text-red-400' : 'text-gray-400'}`}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7 gap-1 flex-1">
        {cells.map((date, idx) => {
          if (!date) return <div key={`empty-${idx}`} />;
          const key = fmtKey(date);
          const dayTasks = taskMap[key] ?? [];
          const isSelected = selectedDate === key;
          const isSat = date.getDay() === 6;
          const isSun = date.getDay() === 0;
          const hasTasks = dayTasks.length > 0;

          // Collect up to 3 category colors for dots
          const cats = [...new Set(dayTasks.map(t => t.mainCategory))].slice(0, 3);

          return (
            <button
              key={key}
              onClick={() => setSelectedDate(isSelected ? null : key)}
              className={`relative min-h-[64px] rounded-xl p-1.5 flex flex-col items-center transition-all border
                ${isSelected
                  ? 'bg-blue-500 border-blue-500'
                  : hasTasks
                    ? 'bg-white border-gray-100 hover:border-blue-200 hover:bg-blue-50'
                    : 'bg-transparent border-transparent hover:bg-gray-50'
                }`}
            >
              <span className={`text-xs font-semibold mb-1 ${
                isSelected ? 'text-white' : isSat ? 'text-blue-400' : isSun ? 'text-red-400' : 'text-gray-700'
              }`}>
                {date.getDate()}
              </span>
              {hasTasks && (
                <>
                  <span className={`text-[10px] font-bold mb-1 ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                    {dayTasks.length}건
                  </span>
                  <div className="flex gap-0.5">
                    {cats.map(cat => (
                      <span
                        key={cat}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: isSelected ? '#ffffff99' : CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] }}
                      />
                    ))}
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day detail panel */}
      {selectedDate && (
        <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">{selectedDate} 업무 ({selectedTasks.length}건)</span>
            <button onClick={() => setSelectedDate(null)} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          </div>
          {selectedTasks.length === 0 ? (
            <p className="text-xs text-gray-400">등록된 업무가 없습니다.</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {selectedTasks.map((t, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-md font-medium shrink-0"
                    style={{
                      backgroundColor: `${CATEGORY_COLORS[t.mainCategory as keyof typeof CATEGORY_COLORS]}18`,
                      color: CATEGORY_COLORS[t.mainCategory as keyof typeof CATEGORY_COLORS],
                    }}
                  >
                    {t.mainCategory}
                  </span>
                  <span className="text-xs text-gray-500 shrink-0">{t.subCategory}</span>
                  <span className="text-xs text-gray-700">{t.detail}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
