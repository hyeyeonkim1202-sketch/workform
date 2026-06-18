'use client';

import { LayoutDashboard, Calendar, FileText, Mail, Briefcase } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'calendar';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

const navItems: { icon: typeof LayoutDashboard; label: string; tab: ActiveTab | null }[] = [
  { icon: LayoutDashboard, label: '대시보드', tab: 'dashboard' },
  { icon: Calendar,        label: '일정',     tab: 'calendar' },
  { icon: FileText,        label: '문서',     tab: null },
  { icon: Mail,            label: '메일',     tab: null },
  { icon: Briefcase,       label: '업무',     tab: null },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <>
      {/* Desktop: vertical sidebar */}
      <aside className="hidden sm:flex fixed left-0 top-0 h-screen w-16 bg-white border-r border-gray-100 flex-col items-center py-4 z-50 shadow-sm">
        <div className="w-10 h-10 bg-[#4B7CF3] rounded-xl flex items-center justify-center mb-8 flex-shrink-0">
          <span className="text-white font-bold text-sm tracking-tight">WF</span>
        </div>
        <nav className="flex flex-col items-center gap-2 flex-1">
          {navItems.map(({ icon: Icon, label, tab }) => {
            const active = tab !== null && activeTab === tab;
            return (
              <button key={label} title={label} onClick={() => tab && onTabChange(tab)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  active ? 'bg-blue-50 text-[#4B7CF3]' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                }`}>
                <Icon size={20} />
              </button>
            );
          })}
        </nav>
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
          <span className="text-gray-500 text-xs font-medium">Y</span>
        </div>
      </aside>

      {/* Mobile: bottom tab bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 flex items-center justify-around px-2 py-2 safe-area-pb">
        {navItems.filter(n => n.tab).map(({ icon: Icon, label, tab }) => {
          const active = tab !== null && activeTab === tab;
          return (
            <button key={label} onClick={() => tab && onTabChange(tab)}
              className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors ${
                active ? 'text-[#4B7CF3]' : 'text-gray-400'
              }`}>
              <Icon size={22} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
