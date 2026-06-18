'use client';

import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Task } from '@/types';
import { getWeeklyData, getUniqueCategories, getCategoryColor } from '@/lib/dataUtils';

interface Props { tasks: Task[] }

interface TooltipPayloadEntry { dataKey: string; value: number; color: string }
interface CustomTooltipProps { active?: boolean; payload?: TooltipPayloadEntry[]; label?: string }

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((sum, p) => sum + (p.value || 0), 0);
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm min-w-[140px]">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.filter(p => p.value > 0).reverse().map(p => (
        <div key={p.dataKey} className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-gray-600">{p.dataKey}</span>
          </div>
          <span className="font-medium text-gray-700">{p.value}</span>
        </div>
      ))}
      <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between">
        <span className="text-gray-500">합계</span>
        <span className="font-semibold text-gray-700">{total}</span>
      </div>
    </div>
  );
}

export default function WeeklyStackedChart({ tasks }: Props) {
  const data = getWeeklyData(tasks);
  const categories = useMemo(() => getUniqueCategories(tasks), [tasks]);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 h-full flex flex-col">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">주별 업무 분포</h2>
      <div className="flex-1" style={{ minHeight: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barSize={14}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F9FAFB' }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
            {categories.map((cat, i) => (
              <Bar
                key={cat} dataKey={cat} stackId="a"
                fill={getCategoryColor(cat)}
                radius={i === categories.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
