'use client';

import { Task, MainCategory } from '@/types';
import { CATEGORY_COLORS } from '@/lib/dataUtils';

interface RecentTasksListProps {
  tasks: Task[];
}

export default function RecentTasksList({ tasks }: RecentTasksListProps) {
  const sorted = [...tasks].sort((a, b) => b.date.localeCompare(a.date));
  const recent = sorted.slice(0, 10);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">최근 업무</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs text-gray-400 font-medium pb-2 pr-4 whitespace-nowrap">
                일자
              </th>
              <th className="text-left text-xs text-gray-400 font-medium pb-2 pr-4 whitespace-nowrap">
                대분류
              </th>
              <th className="text-left text-xs text-gray-400 font-medium pb-2 pr-4 whitespace-nowrap">
                소분류
              </th>
              <th className="text-left text-xs text-gray-400 font-medium pb-2">상세항목</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((task, idx) => {
              const color =
                CATEGORY_COLORS[task.mainCategory as MainCategory] ?? '#9CA3AF';
              return (
                <tr
                  key={idx}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-2.5 pr-4 text-gray-400 text-xs whitespace-nowrap">
                    {task.date}
                  </td>
                  <td className="py-2.5 pr-4 whitespace-nowrap">
                    <span
                      className="inline-block text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: `${color}18`, color }}
                    >
                      {task.mainCategory}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-gray-600 text-xs whitespace-nowrap">
                    {task.subCategory}
                  </td>
                  <td className="py-2.5 text-gray-700 text-xs">{task.detail}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
