'use client';

import { Task } from '@/types';
import { getSubCategoryStats, CATEGORY_COLORS } from '@/lib/dataUtils';
import { MainCategory } from '@/types';

interface SubCategoryTableProps {
  tasks: Task[];
}

export default function SubCategoryTable({ tasks }: SubCategoryTableProps) {
  const allStats = getSubCategoryStats(tasks);
  const top10 = allStats.slice(0, 10);
  const maxCount = top10[0]?.count ?? 1;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 h-full flex flex-col">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">소분류 TOP 10</h2>
      <div className="flex flex-col gap-2.5 flex-1 overflow-hidden">
        {top10.map((item, idx) => {
          const color = CATEGORY_COLORS[item.mainCategory as MainCategory] ?? '#9CA3AF';
          const barWidth = Math.round((item.count / maxCount) * 100);
          return (
            <div key={`${item.mainCategory}-${item.subCategory}`} className="flex items-center gap-2.5">
              {/* Rank */}
              <span
                className={`text-xs font-bold w-5 text-center flex-shrink-0 ${
                  idx < 3 ? 'text-[#4B7CF3]' : 'text-gray-400'
                }`}
              >
                {idx + 1}
              </span>

              {/* Category badge */}
              <span
                className="text-xs px-1.5 py-0.5 rounded-md font-medium flex-shrink-0 whitespace-nowrap"
                style={{ backgroundColor: `${color}18`, color }}
              >
                {item.mainCategory}
              </span>

              {/* Sub category name + bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs text-gray-700 truncate">{item.subCategory}</span>
                  <span className="text-xs font-semibold text-gray-600 ml-2 flex-shrink-0">
                    {item.count}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${barWidth}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
