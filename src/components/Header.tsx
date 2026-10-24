import React, { useState } from 'react';
import { CompanyProfile } from '../types/tally';
import { UserProfile } from '../types/auth';
import {
  BookOpen,
  RotateCcw,
  Upload,
  Download,
  ShieldCheck,
  Building2,
  UserCheck,
  LogOut,
  ChevronDown,
  User,
  PlusCircle,
  FolderLock,
  HelpCircle,
  Layers,
  Check,
} from 'lucide-react';

interface HeaderProps {
  company: CompanyProfile;
  companies: CompanyProfile[];
  onSelectCompany: (companyId: string) => void;
  onOpenRegisterCompany: () => void;
  onOpenCompanyDocuments: () => void;
  onOpenGuide: () => void;
  currentUser: UserProfile;
  themeMode: 'tally' | 'bahikhata';
  onToggleTheme: () => void;
  onOpenUpload: () => void;
  onExportTally: () => void;
  onResetData: () => void;
  onOpenCompanyProfile: () => void;
  onOpenLoginerProfile: () => void;
  onLogout: () => void;
  voucherCount: number;
  accountCount: number;
  documentCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  company,
  companies,
  onSelectCompany,
  onOpenRegisterCompany,
  onOpenCompanyDocuments,
  onOpenGuide,
  currentUser,
  themeMode,
  onToggleTheme,
  onOpenUpload,
  onExportTally,
  onResetData,
  onOpenCompanyProfile,
  onOpenLoginerProfile,
  onLogout,
  voucherCount,
  accountCount,
  documentCount = 0,
}) => {
  const isBahi = themeMode === 'bahikhata';
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);

  return (
    <header
      className={`border-b sticky top-0 z-30 transition-all duration-300 backdrop-blur-md ${
        isBahi
          ? 'bg-[#5c131a]/95 text-amber-50 border-amber-900/60 shadow-lg shadow-red-950/20'
          : 'bg-slate-950/90 text-slate-100 border-slate-800/80 shadow-lg shadow-black/20'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5">
          {/* Brand & Multi-Company Switcher */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="relative group">
              <button
                onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)}
                title="Switch active company or register sister entity"
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-200 group-hover:scale-105 shadow-sm ${
                  isBahi
                    ? 'bg-gradient-to-br from-amber-100 to-amber-200 text-red-950 border-amber-400 font-serif-heritage font-bold text-lg shadow-amber-950/30'
                    : 'bg-gradient-to-br from-teal-900/80 to-slate-900 text-teal-300 border-teal-500/40 font-mono font-bold text-sm shadow-teal-950/40 ring-1 ring-teal-500/20'
                }`}
              >
                {company.name.slice(0, 2).toUpperCase()}
              </button>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 ring-1 ring-emerald-400/50" />
            </div>

            <div className="relative">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Active Company Name Button with Dropdown Trigger */}
                <button
                  onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)}
                  className="text-base sm:text-lg font-bold tracking-tight text-white hover:text-amber-200 transition-colors flex items-center gap-2 text-left group"
                >
                  <span className="truncate max-w-[260px] sm:max-w-md font-semibold tracking-tight">{company.tradeName}</span>
                  <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-white/70 group-hover:bg-white/20 group-hover:text-white transition-all">
                    <ChevronDown className="w-3.5 h-3.5 transition-transform" />
                  </div>
                </button>

                <span className="text-[10px] tracking-wide uppercase px-2 py-0.5 rounded-md font-semibold font-mono bg-white/10 text-amber-300 border border-white/10 shadow-xs">
                  {company.entityType ? company.entityType.split(' ')[0] : 'SME'}
                </span>

                <span className="text-xs text-white/60 font-mono tabular-nums">
                  GSTIN: <span className="text-white/80">{company.gstin}</span>
                </span>
              </div>

              <div className="text-xs text-white/70 mt-1 flex items-center gap-2.5 flex-wrap">
                <span className="text-white/80 font-medium">{company.city}, {company.state}</span>
                <span className="text-white/30">·</span>
                <span className="font-mono text-white/85 font-semibold tabular-nums">{voucherCount}</span>
                <span className="text-white/60">Vouchers</span>
                <span className="text-white/30">·</span>
                <span className="font-mono text-white/85 font-semibold tabular-nums">{accountCount}</span>
                <span className="text-white/60">Ledgers</span>
                <span className="text-white/30">·</span>
                <button
                  onClick={onOpenCompanyDocuments}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-teal-950/60 text-teal-300 hover:bg-teal-900/80 border border-teal-500/30 transition-all font-medium text-[11px]"
                >
                  <FolderLock className="w-3 h-3 text-teal-400" />
                  <span>{documentCount} Vault Docs</span>
                </button>
                <span className="text-white/30">·</span>
                <span className="inline-flex items-center gap-1 text-emerald-300 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Isolated Partition</span>
                </span>
              </div>

              {/* Multi-Company Dropdown Menu */}
              {companyDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setCompanyDropdownOpen(false)}
                  />
                  <div
                    className={`absolute left-0 mt-3 w-80 sm:w-96 rounded-2xl border p-3.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 text-xs backdrop-blur-xl ${
                      isBahi
                        ? 'bg-[#fffefb]/98 border-amber-300/80 text-stone-900 shadow-amber-950/20'
                        : 'bg-slate-900/98 border-slate-700/80 text-slate-200 shadow-black/60 ring-1 ring-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/50">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                          Select Active Sister Entity
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Complete data isolation &amp; separate document vaults
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-400">
                        {companies.length} Registered
                      </span>
                    </div>

                    {/* Company List */}
                    <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                      {companies.map((c) => {
                        const isActive = c.id === company.id;
                        return (
                          <button
                            key={c.id}
                            onClick={() => {
                              onSelectCompany(c.id);
                              setCompanyDropdownOpen(false);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                              isActive
                                ? 'bg-teal-500/15 border-teal-500/40 text-teal-300 ring-1 ring-teal-500/30'
                                : 'bg-slate-800/40 hover:bg-slate-800 border-slate-700 text-slate-300'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isActive
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-slate-700 text-slate-300'
                                }`}
                              >
                                {c.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-xs flex items-center gap-1.5 text-white">
                                  <span className="truncate max-w-[180px]">{c.tradeName}</span>
                                  {isActive && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-teal-500 text-slate-950">
                                      Active
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  GSTIN: {c.gstin}
                                </div>
                                <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                                  {c.city}, {c.state} · {c.industryType || 'Trading'}
                                </div>
                              </div>
                            </div>

                            {isActive && <Check className="w-4 h-4 text-teal-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Dropdown Action Buttons */}
                    <div className="pt-2 mt-2 border-t border-slate-200/50 space-y-1.5">
                      <button
                        onClick={() => {
                          setCompanyDropdownOpen(false);
                          onOpenRegisterCompany();
                        }}
                        className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Register New Sister Company</span>
                      </button>

                      <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                        <button
                          onClick={() => {
                            setCompanyDropdownOpen(false);
                            onOpenCompanyDocuments();
                          }}
                          className="py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center gap-1"
                        >
                          <FolderLock className="w-3.5 h-3.5 text-teal-400" />
                          <span>Document Vault</span>
                        </button>

                        <button
                          onClick={() => {
                            setCompanyDropdownOpen(false);
                            onOpenGuide();
                          }}
                          className="py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center gap-1"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                          <span>Setup Guide</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons, Document Vault, Architecture Guide & Loginer Profile */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Multi-Company Architecture Guide Button */}
            <button
              onClick={onOpenGuide}
              title="Step-by-step guide on multi-company registration, document separation, data isolation, and RAG"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isBahi
                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 border-amber-400/40'
                  : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-amber-500/30 shadow-xs'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Guide</span>
            </button>

            {/* Document Vault Button */}
            <button
              onClick={onOpenCompanyDocuments}
              title="View separate document vault for active company"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isBahi
                  ? 'bg-white/10 hover:bg-white/15 text-amber-100 border-white/15'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700/80 shadow-xs'
              }`}
            >
              <FolderLock className="w-3.5 h-3.5 text-teal-400" />
              <span>Vault</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-teal-500/20 text-teal-300 font-bold ml-0.5">
                {documentCount}
              </span>
            </button>

            {/* Loginer Profile Button / Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all text-left ${
                  isBahi
                    ? 'bg-white/10 hover:bg-white/15 border-white/20 text-amber-100'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-200 shadow-xs'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[11px] shadow-xs ${
                    currentUser.role === 'Director & Owner'
                      ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 font-mono'
                      : currentUser.role === 'Statutory Auditor (CA)'
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-mono'
                      : 'bg-gradient-to-br from-teal-500 to-teal-600 text-white font-mono'
                  }`}
                >
                  {currentUser.initials}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold leading-tight flex items-center gap-1">
                    <span>{currentUser.name}</span>
                    <ChevronDown className="w-3 h-3 text-white/50" />
                  </div>
                  <div className="text-[10px] text-white/60 leading-tight">
                    {currentUser.role}
                  </div>
                </div>
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div
                    className={`absolute right-0 mt-2 w-60 rounded-2xl border p-2.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 text-xs backdrop-blur-xl ${
                      isBahi
                        ? 'bg-[#fffefb]/98 border-amber-300 text-stone-900 shadow-amber-950/20'
                        : 'bg-slate-900/98 border-slate-700/80 text-slate-200 shadow-black/60 ring-1 ring-white/10'
                    }`}
                  >
                    <div className="p-2 border-b border-slate-200/50 mb-1">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {currentUser.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">
                        {currentUser.email}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                        {currentUser.designation}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenLoginerProfile();
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                      <span>View Loginer Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenCompanyProfile();
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      <Building2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>Company Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenRegisterCompany();
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-teal-400 font-semibold transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add Sister Entity</span>
                    </button>

                    <div className="my-1 border-t border-slate-200/50" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-red-500/10 text-red-400 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Theme / Mode Switcher */}
            <button
              onClick={onToggleTheme}
              title="Toggle between Tally Prime Mode and Traditional Ledger View"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isBahi
                  ? 'bg-white/10 hover:bg-white/15 text-amber-100 border-white/15'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700/80 shadow-xs'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">
                {isBahi ? 'Tally Mode' : 'Bahi-Khata'}
              </span>
            </button>

            {/* Upload Document / XML */}
            <button
              onClick={onOpenUpload}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all shadow-sm ${
                isBahi
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-red-950 border-amber-400'
                  : 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white border-teal-500/50 shadow-teal-900/40'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload XML</span>
            </button>

            {/* Export Tally XML */}
            <button
              onClick={onExportTally}
              title="Download standard Tally XML format ready to import into Tally ERP 9 / Prime"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isBahi
                  ? 'bg-red-950/60 hover:bg-red-950 text-amber-200 border-red-800/80'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700/80'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Reset Data */}
            <button
              onClick={onResetData}
              title="Reset all sister companies to default SME dataset"
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
