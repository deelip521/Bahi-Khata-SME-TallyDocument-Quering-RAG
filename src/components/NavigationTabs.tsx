import React from 'react';
import { Search, BookText, CalendarDays, FileCheck2, Building2, UserCheck } from 'lucide-react';
import { UserProfile } from '../types/auth';

export type ActiveTab =
  | 'rag-query'
  | 'bahi-khata'
  | 'day-book'
  | 'gst-audit'
  | 'profile'
  | 'loginer-profile';

interface NavigationTabsProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  themeMode: 'tally' | 'bahikhata';
  overdueCount: number;
  msmePendingCount: number;
  currentUser?: UserProfile | null;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onChangeTab,
  themeMode,
  overdueCount,
  msmePendingCount,
  currentUser,
}) => {
  const isBahi = themeMode === 'bahikhata';

  const tabs: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badgeCount?: number;
    badgeText?: string;
    badgeType?: 'alert' | 'warning' | 'info';
  }> = [
    {
      id: 'rag-query',
      label: 'RAG Query Desk',
      icon: <Search className="w-4 h-4" />,
    },
    {
      id: 'bahi-khata',
      label: 'Ledger Accounts',
      icon: <BookText className="w-4 h-4" />,
      badgeCount: overdueCount > 0 ? overdueCount : undefined,
      badgeText: overdueCount > 0 ? `${overdueCount} due` : undefined,
      badgeType: 'alert',
    },
    {
      id: 'day-book',
      label: 'Tally Day Book',
      icon: <CalendarDays className="w-4 h-4" />,
    },
    {
      id: 'gst-audit',
      label: 'GST & Tax Audit',
      icon: <FileCheck2 className="w-4 h-4" />,
      badgeCount: msmePendingCount > 0 ? msmePendingCount : undefined,
      badgeText: msmePendingCount > 0 ? `${msmePendingCount} MSME` : undefined,
      badgeType: 'warning',
    },
    {
      id: 'profile',
      label: 'Sister Companies',
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: 'loginer-profile',
      label: currentUser ? currentUser.name.split(' ')[0] : 'Profile',
      icon: <UserCheck className="w-4 h-4" />,
      badgeText: currentUser ? currentUser.role.split(' ')[0] : undefined,
      badgeType: 'info',
    },
  ];

  return (
    <div
      className={`border-b transition-colors ${
        isBahi
          ? 'bg-[#3b0b11] border-red-950/80 text-amber-100 shadow-inner'
          : 'bg-slate-900 border-slate-800 text-slate-300'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-1.5 overflow-x-auto py-2 scrollbar-none items-center">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 group ${
                  isActive
                    ? isBahi
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-red-950 shadow-md font-semibold ring-1 ring-amber-300/60'
                      : 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md shadow-teal-950/40 font-semibold ring-1 ring-teal-400/30'
                    : isBahi
                    ? 'text-amber-200/70 hover:text-white hover:bg-white/5'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <span className={isActive ? 'text-inherit' : 'text-slate-400 group-hover:text-slate-200'}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.badgeText && (
                  <span
                    className={`ml-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md leading-none tracking-tight ${
                      isActive
                        ? isBahi
                          ? 'bg-red-950/20 text-red-950'
                          : 'bg-teal-950/40 text-teal-100'
                        : tab.badgeType === 'alert'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : tab.badgeType === 'warning'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {tab.badgeText}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

