'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Task } from '@/types';
import { getCategoryStats, getCategoryColor } from '@/lib/dataUtils';

interface Props { tasks: Task[] }

interface TooltipPayloadEntry { name: string; value: number; payload: { percentage: number } }
interface CustomTooltipProps { active?: boolean; payload?: TooltipPayloadEntry[] }

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-gray-700">{entry.name}</p>
      <p className="text-gray-500">{entry.value}건 ({entry.payload.percentage}%)</p>
    </div>
  );
}

export default function CategoryDonutChart({ tasks }: Props) {
  const stats = getCategoryStats(tasks);
  const data = stats.map(s => ({
    name: s.category,
    value: s.count,
    percentage: s.percentage,
    color: getCategoryColor(s.category),
  }));

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 h-full flex flex-col">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">누적 업무 비중</h2>
      <div className="flex-1 flex items-center gap-4">
        <div className="w-36 h-36 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="value" strokeWidth={0}>
                {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {data.map(entry => (
            <div key={entry.name} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="text-xs text-gray-600 flex-1 truncate">{entry.name}</span>
              <span className="text-xs font-semibold text-gray-700 flex-shrink-0">{entry.value}</span>
              <span className="text-xs text-gray-400 flex-shrink-0 w-8 text-right">{entry.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
