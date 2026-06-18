'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/types';
import { allTasks } from '@/lib/sampleData';
import Sidebar, { ActiveTab } from '@/components/Sidebar';
import SummaryCards from '@/components/SummaryCards';
import WeeklyStackedChart from '@/components/WeeklyStackedChart';
import CategoryDonutChart from '@/components/CategoryDonutChart';
import MonthlyTrendChart from '@/components/MonthlyTrendChart';
import SubCategoryTable from '@/components/SubCategoryTable';
import RecentTasksList from '@/components/RecentTasksList';
import CalendarView from '@/components/CalendarView';

type DataSource = 'loading' | 'sheets' | 'sample' | 'error';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>(allTasks);
  const [dataSource, setDataSource] = useState<DataSource>('loading');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/sheets');
        if (!res.ok) throw new Error('Network error');
        const json = (await res.json()) as { tasks: Task[]; source: string };
        if (json.source === 'sheets' && json.tasks.length > 0) {
          setTasks(json.tasks);
          setDataSource('sheets');
        } else {
          setTasks(allTasks);
          setDataSource('sample');
        }
      } catch {
        setTasks(allTasks);
        setDataSource('error');
      }
    }
    fetchData();
  }, []);

  const sourceLabel: Record<DataSource, { text: string; dotClass: string; badgeClass: string }> = {
    loading: {
      text: '데이터 로딩 중...',
      dotClass: 'bg-gray-400 animate-pulse',
      badgeClass: 'bg-gray-100 text-gray-500',
    },
    sheets: {
      text: 'Google Sheets 연결됨',
      dotClass: 'bg-green-500',
      badgeClass: 'bg-green-50 text-green-600',
    },
    sample: {
      text: '샘플 데이터',
      dotClass: 'bg-amber-400',
      badgeClass: 'bg-amber-50 text-amber-600',
    },
    error: {
      text: '오류 — 샘플 데이터',
      dotClass: 'bg-red-400',
      badgeClass: 'bg-red-50 text-red-500',
    },
  };

  const { text: sourceText, dotClass, badgeClass } = sourceLabel[dataSource];

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 pl-16">
        <div className="p-6 max-w-screen-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {activeTab === 'dashboard' ? '업무 대시보드' : '업무 캘린더'}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {activeTab === 'dashboard' ? '업무 현황 분석' : '날짜별 업무 현황'}
              </p>
            </div>
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 ${badgeClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full inline-block ${dotClass}`} />
              {sourceText} ({tasks.length}건)
            </span>
          </div>

          {activeTab === 'dashboard' ? (
            <>
              <SummaryCards tasks={tasks} />
              <div className="grid grid-cols-3 gap-4 mt-4" style={{ minHeight: 320 }}>
                <div className="col-span-2"><WeeklyStackedChart tasks={tasks} /></div>
                <div className="col-span-1"><CategoryDonutChart tasks={tasks} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4" style={{ minHeight: 320 }}>
                <div className="col-span-2"><MonthlyTrendChart tasks={tasks} /></div>
                <div className="col-span-1"><SubCategoryTable tasks={tasks} /></div>
              </div>
              <div className="mt-4"><RecentTasksList tasks={tasks} /></div>
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-6">
              <CalendarView tasks={tasks} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
