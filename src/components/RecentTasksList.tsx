'use client';

import { Task } from '@/types';
import { getCategoryColor } from '@/lib/dataUtils';

interface Props { tasks: Task[] }

export default function RecentTasksList({ tasks }: Props) {
  const recent = [...tasks].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">최근 업무</h2>
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs text-gray-400 font-medium pb-2 pr-4 whitespace-nowrap">일자</th>
              <th className="text-left text-xs text-gray-400 font-medium pb-2 pr-4 whitespace-nowrap">대분류</th>
              <th className="text-left text-xs text-gray-400 font-medium pb-2 pr-4 whitespace-nowrap">소분류</th>
              <th className="text-left text-xs text-gray-400 font-medium pb-2">업무내용</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((task, idx) => {
              const color = getCategoryColor(task.mainCategory);
              return (
                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 pr-4 text-gray-400 text-xs whitespace-nowrap">{task.date}</td>
                  <td className="py-2.5 pr-4 whitespace-nowrap">
                    <span className="inline-block text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: `${color}18`, color }}>
                      {task.mainCategory}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-gray-600 text-xs whitespace-nowrap">{task.subCategory}</td>
                  <td className="py-2.5 text-gray-700 text-xs">{task.detail}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Mobile card list */}
      <div className="sm:hidden flex flex-col gap-3">
        {recent.map((task, idx) => {
          const color = getCategoryColor(task.mainCategory);
          return (
            <div key={idx} className="border border-gray-100 rounded-xl p-3 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: `${color}18`, color }}>
                  {task.mainCategory}
                </span>
                <span className="text-xs text-gray-400">{task.date}</span>
              </div>
              <p className="text-xs text-gray-500">{task.subCategory}</p>
              <p className="text-xs text-gray-700">{task.detail}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
