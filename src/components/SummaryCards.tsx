'use client';

import { ListChecks, TrendingUp, BarChart2, Star } from 'lucide-react';
import { Task } from '@/types';
import {
  filterByDateRange, getLatestDate,
  getWeekRangeForDate, getMonthRangeForDate, getCategoryStats,
} from '@/lib/dataUtils';

interface CardProps {
  title: string; value: string | number; unit?: string;
  subText?: string; icon: React.ReactNode; iconBg: string; iconColor: string;
}

function Card({ title, value, unit, subText, icon, iconBg, iconColor }: CardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 flex flex-col gap-2 sm:gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm text-gray-500 font-medium">{title}</span>
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: iconBg, color: iconColor }}>
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-1.5">
        <span className="text-2xl sm:text-3xl font-bold text-gray-800 leading-none">{value}</span>
        {unit && <span className="text-xs sm:text-sm text-gray-500 mb-0.5">{unit}</span>}
      </div>
      {subText && <span className="text-xs text-gray-400 truncate">{subText}</span>}
    </div>
  );
}

export default function SummaryCards({ tasks }: { tasks: Task[] }) {
  const latestDate = getLatestDate(tasks);
  const [weekStart, weekEnd] = latestDate ? getWeekRangeForDate(latestDate) : ['', ''];
  const [monthStart, monthEnd] = latestDate ? getMonthRangeForDate(latestDate) : ['', ''];

  const weekTasks  = filterByDateRange(tasks, weekStart, weekEnd);
  const monthTasks = filterByDateRange(tasks, monthStart, monthEnd);
  const topCat = getCategoryStats(tasks)[0];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <Card title="이번 주 업무" value={weekTasks.length} unit="건"
        subText={weekStart ? `${weekStart} ~ ${weekEnd}` : ''}
        icon={<ListChecks size={18} />} iconBg="#EEF3FE" iconColor="#4B7CF3" />
      <Card title="이번 달 업무" value={monthTasks.length} unit="건"
        subText={monthStart ? `${monthStart} ~ ${monthEnd}` : ''}
        icon={<TrendingUp size={18} />} iconBg="#E6FAF4" iconColor="#2ECC99" />
      <Card title="총 누적 업무" value={tasks.length} unit="건" subText="전체 기간"
        icon={<BarChart2 size={18} />} iconBg="#F0EAFE" iconColor="#9B72EA" />
      <Card title="TOP 업무 영역" value={topCat?.category ?? '-'}
        subText={topCat ? `전체의 ${topCat.percentage}% (${topCat.count}건)` : ''}
        icon={<Star size={18} />} iconBg="#FEF4E4" iconColor="#F5A623" />
    </div>
  );
}
