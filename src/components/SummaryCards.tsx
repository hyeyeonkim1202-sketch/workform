'use client';

import { ListChecks, TrendingUp, BarChart2, Star } from 'lucide-react';
import { Task } from '@/types';
import {
  filterByDateRange,
  getLatestDate,
  getWeekRangeForDate,
  getMonthRangeForDate,
  getCategoryStats,
} from '@/lib/dataUtils';

interface SummaryCardsProps {
  tasks: Task[];
}

interface CardProps {
  title: string;
  value: string | number;
  unit?: string;
  subText?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

function Card({ title, value, unit, subText, icon, iconBg, iconColor }: CardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 font-medium">{title}</span>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-1.5">
        <span className="text-3xl font-bold text-gray-800 leading-none">{value}</span>
        {unit && <span className="text-sm text-gray-500 mb-0.5">{unit}</span>}
      </div>
      {subText && <span className="text-xs text-gray-400">{subText}</span>}
    </div>
  );
}

export default function SummaryCards({ tasks }: SummaryCardsProps) {
  const latestDate = getLatestDate(tasks);
  const [weekStart, weekEnd] = latestDate ? getWeekRangeForDate(latestDate) : ['', ''];
  const [monthStart, monthEnd] = latestDate ? getMonthRangeForDate(latestDate) : ['', ''];

  const weekTasks = filterByDateRange(tasks, weekStart, weekEnd);
  const monthTasks = filterByDateRange(tasks, monthStart, monthEnd);
  const totalTasks = tasks.length;

  const catStats = getCategoryStats(tasks);
  const topCat = catStats.sort((a, b) => b.count - a.count)[0];

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card
        title="이번 주 업무"
        value={weekTasks.length}
        unit="건"
        subText={`${weekStart} ~ ${weekEnd}`}
        icon={<ListChecks size={18} />}
        iconBg="#EEF3FE"
        iconColor="#4B7CF3"
      />
      <Card
        title="이번 달 업무"
        value={monthTasks.length}
        unit="건"
        subText={`${monthStart} ~ ${monthEnd}`}
        icon={<TrendingUp size={18} />}
        iconBg="#E6FAF4"
        iconColor="#2ECC99"
      />
      <Card
        title="총 누적 업무"
        value={totalTasks}
        unit="건"
        subText="전체 기간"
        icon={<BarChart2 size={18} />}
        iconBg="#F0EAFE"
        iconColor="#9B72EA"
      />
      <Card
        title="TOP 업무 영역"
        value={topCat?.category ?? '-'}
        subText={topCat ? `전체의 ${topCat.percentage}% (${topCat.count}건)` : ''}
        icon={<Star size={18} />}
        iconBg="#FEF4E4"
        iconColor="#F5A623"
      />
    </div>
  );
}
