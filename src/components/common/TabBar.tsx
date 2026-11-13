import { BookOpen, BookText, Dna, Gamepad2, GraduationCap, Trophy } from 'lucide-react';
import React from 'react';
import { ActiveTab } from '../../types';

interface TabBarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    {
      id: 'dictionary' as ActiveTab,
      labelEn: 'Dictionary',
      labelAr: 'القاموس',
      icon: BookOpen,
      color: 'text-blue-600',
      activeBg: 'bg-blue-50 text-blue-700',
    },
    {
      id: 'reading' as ActiveTab,
      labelEn: 'Stories',
      labelAr: 'القصص',
      icon: BookText,
      color: 'text-emerald-600',
      activeBg: 'bg-emerald-50 text-emerald-700',
    },
    {
      id: 'games' as ActiveTab,
      labelEn: 'Games',
      labelAr: 'ألعاب',
      icon: Gamepad2,
      color: 'text-purple-600',
      activeBg: 'bg-purple-50 text-purple-700',
    },
    {
      id: 'verbs' as ActiveTab,
      labelEn: 'Verbs',
      labelAr: 'الأفعال',
      icon: Dna,
      color: 'text-amber-600',
      activeBg: 'bg-amber-50 text-amber-700',
    },
    {
      id: 'progress' as ActiveTab,
      labelEn: 'My Stars',
      labelAr: 'إنجازاتي',
      icon: Trophy,
      color: 'text-rose-600',
      activeBg: 'bg-rose-50 text-rose-700',
    },
    {
      id: 'teacher' as ActiveTab,
      labelEn: 'Teacher',
      labelAr: 'المعلم',
      icon: GraduationCap,
      color: 'text-slate-600',
      activeBg: 'bg-slate-100 text-slate-800',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-4xl mx-auto px-2 flex items-center justify-around py-1 sm:py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 sm:px-3 rounded-2xl transition-all tap-active min-w-[54px] ${
                isActive
                  ? `${tab.activeBg} font-extrabold shadow-2xs scale-105`
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] sm:text-xs tracking-tight mt-0.5 leading-tight">
                {tab.labelEn}
              </span>
              <span className="text-[9px] font-arabic opacity-70 leading-none hidden xs:inline">
                {tab.labelAr}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
