import React, { useState, useMemo } from 'react';
import {
  BahiKhataAccount,
  CompanyProfile,
  TallyVoucher,
} from '../types/tally';
import {
  Search,
  MessageCircle,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  Building2,
  Phone,
  MapPin,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronDown,
  ChevronUp,
  Bell,
  Edit3,
  Check,
  X,
  CreditCard,
  Send,
} from 'lucide-react';
import { formatInr } from '../services/ragEngine';

interface BahiKhataViewProps {
  accounts: BahiKhataAccount[];
  vouchers: TallyVoucher[];
  company: CompanyProfile;
  themeMode: 'tally' | 'bahikhata';
  onSelectParty: (partyName: string) => void;
  onOpenWhatsApp: (account: BahiKhataAccount) => void;
}

type AccountFilter = 'All' | 'Flagged' | 'Sundry Debtor' | 'Sundry Creditor' | 'Bank/Cash';

export const BahiKhataView: React.FC<BahiKhataViewProps> = ({
  accounts: initialAccounts,
  vouchers,
  company,
  themeMode,
  onSelectParty,
  onOpenWhatsApp,
}) => {
  const [filterType, setFilterType] = useState<AccountFilter>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState(true);
  const [editingLimitParty, setEditingLimitParty] = useState<string | null>(null);
  const [tempLimitValue, setTempLimitValue] = useState<string>('');

  // Local state for accounts so Munimji can tweak party credit limits
  const [accounts, setAccounts] = useState<BahiKhataAccount[]>(initialAccounts);

  // Sync if initialAccounts change
  React.useEffect(() => {
    setAccounts(initialAccounts);
  }, [initialAccounts]);

  const isBahi = themeMode === 'bahikhata';

  // Calculations for totals
  const totalReceivables = useMemo(
    () =>
      accounts
        .filter((a) => a.partyType === 'Sundry Debtor')
        .reduce((sum, a) => sum + Math.max(0, a.currentBalance), 0),
    [accounts]
  );

  const totalPayables = useMemo(
    () =>
      accounts
        .filter((a) => a.partyType === 'Sundry Creditor')
        .reduce((sum, a) => sum + Math.abs(Math.min(0, a.currentBalance)), 0),
    [accounts]
  );

  // Helper to evaluate debtor risk & violation flags
  const getDebtorRiskAnalysis = (account: BahiKhataAccount) => {
    if (account.partyType !== 'Sundry Debtor') {
      return {
        isFlagged: false,
        creditLimit: 0,
        isCreditLimitExceeded: false,
        excessCredit: 0,
        creditUsagePercent: 0,
        maxDaysOverdue: 0,
        isOverdue: false,
        overdueVouchers: [],
        oldestOverdueVoucher: undefined,
        severity: 'normal' as const,
      };
    }

    const creditLimit = account.creditLimit ?? 200000;
    const isCreditLimitExceeded = account.currentBalance > creditLimit;
    const excessCredit = Math.max(0, account.currentBalance - creditLimit);
    const creditUsagePercent =
      creditLimit > 0 ? Math.round((account.currentBalance / creditLimit) * 100) : 0;

    const partyVouchers = vouchers.filter(
      (v) => v.partyName.toLowerCase() === account.partyName.toLowerCase()
    );

    const overdueSalesVouchers = partyVouchers.filter((v) => {
      if (v.voucherType !== 'Sales') return false;
      if (v.paymentStatus === 'Paid') return false;
      const isPastDueDate = v.dueDate ? new Date(v.dueDate) < new Date() : false;
      const hasDaysOverdue = Boolean(v.daysOverdue && v.daysOverdue > 0);
      return hasDaysOverdue || isPastDueDate;
    });

    const maxDaysOverdue = Math.max(0, ...partyVouchers.map((v) => v.daysOverdue || 0));
    const isOverdue = maxDaysOverdue > 0 || overdueSalesVouchers.length > 0;
    const oldestOverdueVoucher = overdueSalesVouchers.sort(
      (a, b) => (b.daysOverdue || 0) - (a.daysOverdue || 0)
    )[0];

    const isFlagged = account.currentBalance > 0 && (isCreditLimitExceeded || isOverdue);

    let severity: 'high' | 'medium' | 'normal' = 'normal';
    if (isFlagged) {
      if (isCreditLimitExceeded && isOverdue) {
        severity = 'high';
      } else if (maxDaysOverdue > 30 || excessCredit > 50000) {
        severity = 'high';
      } else {
        severity = 'medium';
      }
    }

    return {
      isFlagged,
      creditLimit,
      isCreditLimitExceeded,
      excessCredit,
      creditUsagePercent,
      maxDaysOverdue,
      isOverdue,
      overdueVouchers: overdueSalesVouchers,
      oldestOverdueVoucher,
      severity,
    };
  };

  // Pre-calculate flagged debtors list
  const flaggedDebtors = useMemo(() => {
    return accounts
      .filter((a) => a.partyType === 'Sundry Debtor')
      .map((acc) => ({ account: acc, analysis: getDebtorRiskAnalysis(acc) }))
      .filter((item) => item.analysis.isFlagged);
  }, [accounts, vouchers]);

  const totalAtRiskReceivables = useMemo(() => {
    return flaggedDebtors.reduce((sum, item) => sum + Math.max(0, item.account.currentBalance), 0);
  }, [flaggedDebtors]);

  const creditLimitBreachedCount = useMemo(() => {
    return flaggedDebtors.filter((d) => d.analysis.isCreditLimitExceeded).length;
  }, [flaggedDebtors]);

  const overdueBillsCount = useMemo(() => {
    return flaggedDebtors.filter((d) => d.analysis.isOverdue).length;
  }, [flaggedDebtors]);

  // Handle saving new credit limit
  const handleSaveCreditLimit = (partyName: string) => {
    const numericValue = parseFloat(tempLimitValue.replace(/[^0-9.]/g, ''));
    if (!isNaN(numericValue) && numericValue >= 0) {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.partyName === partyName ? { ...acc, creditLimit: numericValue } : acc
        )
      );
    }
    setEditingLimitParty(null);
    setTempLimitValue('');
  };

  const handleStartEditLimit = (account: BahiKhataAccount) => {
    setEditingLimitParty(account.partyName);
    setTempLimitValue(String(account.creditLimit ?? 200000));
  };

  // Filtered accounts list
  const filteredAccounts = accounts.filter((acc) => {
    const analysis = getDebtorRiskAnalysis(acc);

    if (filterType === 'Flagged' && !analysis.isFlagged) return false;
    if (filterType === 'Sundry Debtor' && acc.partyType !== 'Sundry Debtor') return false;
    if (filterType === 'Sundry Creditor' && acc.partyType !== 'Sundry Creditor') return false;
    if (filterType === 'Bank/Cash' && acc.partyType !== 'Bank' && acc.partyType !== 'Cash') return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        acc.partyName.toLowerCase().includes(q) ||
        (acc.city && acc.city.toLowerCase().includes(q)) ||
        (acc.contactPerson && acc.contactPerson.toLowerCase().includes(q)) ||
        (acc.gstin && acc.gstin.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Financial Stat Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Receivables Card */}
        <div
          className={`p-5 rounded-2xl border shadow-md transition-all border-l-4 border-l-red-600 ${
            isBahi
              ? 'bg-[#fffefb] border-amber-200/90 text-stone-900 shadow-amber-950/5'
              : 'bg-white border-slate-200 text-slate-900 shadow-slate-950/5'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-bold uppercase tracking-wider text-[11px] text-slate-600">
              Total Receivables (Debit)
            </span>
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-200/60">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-bold font-mono text-red-700 tracking-tight block tabular-nums">
            {formatInr(totalReceivables)}
          </span>
          <span className="text-xs text-slate-500 mt-1.5 block font-medium">
            Outstanding from Sundry Debtors
          </span>
        </div>

        {/* Payables Card */}
        <div
          className={`p-5 rounded-2xl border shadow-md transition-all border-l-4 border-l-emerald-600 ${
            isBahi
              ? 'bg-[#fffefb] border-amber-200/90 text-stone-900 shadow-amber-950/5'
              : 'bg-white border-slate-200 text-slate-900 shadow-slate-950/5'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-bold uppercase tracking-wider text-[11px] text-slate-600">
              Total Payables (Credit)
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-bold font-mono text-emerald-700 tracking-tight block tabular-nums">
            {formatInr(totalPayables)}
          </span>
          <span className="text-xs text-slate-500 mt-1.5 block font-medium">
            Dues to Sundry Creditors &amp; MSME Suppliers
          </span>
        </div>

        {/* Net Working Position Card */}
        <div
          className={`p-5 rounded-2xl border shadow-md transition-all border-l-4 border-l-teal-600 ${
            isBahi
              ? 'bg-[#fffefb] border-amber-200/90 text-stone-900 shadow-amber-950/5'
              : 'bg-white border-slate-200 text-slate-900 shadow-slate-950/5'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-bold uppercase tracking-wider text-[11px] text-slate-600">
              Net Working Position
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-200/60">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-bold font-mono text-slate-900 tracking-tight block tabular-nums">
            {formatInr(totalReceivables - totalPayables)}
          </span>
          <span className="text-xs text-slate-500 mt-1.5 block font-medium">
            Net Book Surplus Receivable
          </span>
        </div>
      </div>

      {/* NOTIFICATION SYSTEM: Sundry Debtors Risk & Overdue Alert Panel */}
      {flaggedDebtors.length > 0 && (
        <div
          className={`rounded-2xl border shadow-md transition-all overflow-hidden ${
            isBahi
              ? 'bg-[#fffcf7] border-amber-300 shadow-amber-950/5'
              : 'bg-slate-900 text-white border-slate-800 shadow-slate-950/20'
          }`}
        >
          {/* Banner Header */}
          <div
            className={`px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b ${
              isBahi
                ? 'bg-gradient-to-r from-red-900/10 via-amber-500/10 to-transparent border-amber-200/80 text-stone-900'
                : 'bg-slate-900/90 border-slate-800 text-white'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  isBahi
                    ? 'bg-red-800 text-amber-100 ring-2 ring-red-700/20'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30 ring-2 ring-red-500/10'
                }`}
              >
                <Bell className="w-5 h-5 animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-sm sm:text-base font-bold tracking-tight">
                    {isBahi
                      ? 'तगादा व जोखिम सूचना (Debtor Collection Flags)'
                      : 'Sundry Debtors Collection & Risk Alerts'}
                  </h3>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                      isBahi
                        ? 'bg-red-700 text-white shadow-xs'
                        : 'bg-red-500 text-white shadow-xs'
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    {flaggedDebtors.length} Debtors Flagged
                  </span>
                </div>

                <p
                  className={`text-xs mt-1 font-medium ${
                    isBahi ? 'text-stone-600' : 'text-slate-400'
                  }`}
                >
                  Identified parties exceeding credit limit or with past-due sales bills. One-click WhatsApp reminder ready.
                </p>
              </div>
            </div>

            {/* Quick stats & action triggers */}
            <div className="flex items-center gap-3 self-end md:self-center flex-wrap">
              <div className="text-right hidden sm:block">
                <span
                  className={`text-[11px] block uppercase tracking-wider font-semibold ${
                    isBahi ? 'text-stone-500' : 'text-slate-400'
                  }`}
                >
                  At-Risk Outstanding
                </span>
                <span className="text-base font-bold font-mono text-red-600 dark:text-red-400 tabular-nums">
                  {formatInr(totalAtRiskReceivables)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setFilterType(filterType === 'Flagged' ? 'All' : 'Flagged')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  filterType === 'Flagged'
                    ? isBahi
                      ? 'bg-red-800 text-white border-red-800 shadow-sm'
                      : 'bg-red-600 text-white border-red-600 shadow-sm'
                    : isBahi
                    ? 'bg-white text-stone-800 border-amber-300 hover:bg-amber-50'
                    : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <span>{filterType === 'Flagged' ? 'Showing Flagged' : 'Filter Flagged'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAlertDrawerOpen(!isAlertDrawerOpen)}
                className={`p-1.5 rounded-xl border transition-all ${
                  isBahi
                    ? 'border-amber-300 hover:bg-amber-100 text-stone-700'
                    : 'border-slate-700 hover:bg-slate-800 text-slate-300'
                }`}
                title={isAlertDrawerOpen ? 'Collapse Notification Drawer' : 'Expand Notification Drawer'}
              >
                {isAlertDrawerOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar inside alert */}
          <div
            className={`px-5 py-2.5 flex flex-wrap items-center gap-4 sm:gap-6 text-xs border-b ${
              isBahi
                ? 'bg-amber-50/60 border-amber-200/60 text-stone-700'
                : 'bg-slate-900/60 border-slate-800/80 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span className="font-semibold">{creditLimitBreachedCount}</span>
              <span className="text-[11px] opacity-80">Crossed Credit Limit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="font-semibold">{overdueBillsCount}</span>
              <span className="text-[11px] opacity-80">Overdue Beyond Due Date</span>
            </div>
            <div className="ml-auto text-[11px] opacity-75 font-mono hidden md:block">
              FY 24-25 Customary Credit Policy: 30 Days
            </div>
          </div>

          {/* Expandable Action Drawer */}
          {isAlertDrawerOpen && (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
              {flaggedDebtors.map(({ account, analysis }) => (
                <div
                  key={account.partyName}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-colors ${
                    isBahi ? 'hover:bg-amber-100/30' : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-bold ${
                          isBahi ? 'text-stone-900' : 'text-slate-100'
                        }`}
                      >
                        {account.partyName}
                      </span>
                      {account.city && (
                        <span
                          className={`text-xs ${
                            isBahi ? 'text-stone-500' : 'text-slate-400'
                          }`}
                        >
                          · {account.city}
                        </span>
                      )}
                      {analysis.severity === 'high' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white">
                          High Risk
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      {analysis.isCreditLimitExceeded && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 font-medium border border-red-200 dark:border-red-900/50">
                          <AlertTriangle className="w-3 h-3 text-red-600" />
                          Limit crossed by {formatInr(analysis.excessCredit)} (Cap: {formatInr(analysis.creditLimit)})
                        </span>
                      )}

                      {analysis.isOverdue && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-medium border border-amber-200 dark:border-amber-900/50">
                          <Clock className="w-3 h-3 text-amber-700" />
                          Overdue by {analysis.maxDaysOverdue} days
                          {analysis.oldestOverdueVoucher && ` (Inv: ${analysis.oldestOverdueVoucher.voucherNumber})`}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-[11px] opacity-75 block">Total Due</span>
                      <span className="text-sm font-bold font-mono text-red-600 dark:text-red-400 tabular-nums">
                        {formatInr(account.currentBalance)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenWhatsApp(account)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm hover:scale-[1.02]"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Send WhatsApp Reminder</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3.5 shadow-sm ${
          isBahi ? 'bg-[#fdfbf7] border-amber-200/80' : 'bg-white border-slate-200'
        }`}
      >
        {/* Segmented Filter Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-full sm:w-auto overflow-x-auto shadow-inner">
          {(
            [
              { key: 'All', label: 'All Accounts', isAlert: false },
              {
                key: 'Flagged',
                label: `Flagged (${flaggedDebtors.length})`,
                isAlert: flaggedDebtors.length > 0,
              },
              { key: 'Sundry Debtor', label: 'Sundry Debtors', isAlert: false },
              { key: 'Sundry Creditor', label: 'Sundry Creditors', isAlert: false },
              { key: 'Bank/Cash', label: 'Bank & Cash', isAlert: false },
            ] as Array<{ key: AccountFilter; label: string; isAlert: boolean }>
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => setFilterType(item.key)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                filterType === item.key
                  ? isBahi
                    ? 'bg-red-800 text-white shadow-sm'
                    : 'bg-teal-600 text-white shadow-sm'
                  : item.isAlert
                  ? 'text-red-700 hover:bg-red-50 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.isAlert && filterType !== item.key && (
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping inline-block" />
              )}
              {item.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-80 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search party, city, GSTIN..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 bg-slate-50/50 focus:bg-white transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Party Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAccounts.map((account) => {
          const isDebtor = account.partyType === 'Sundry Debtor';
          const isCreditor = account.partyType === 'Sundry Creditor';
          const isDr = account.currentBalance > 0;
          const isCr = account.currentBalance < 0;

          const analysis = getDebtorRiskAnalysis(account);
          const isFlagged = analysis.isFlagged;

          const partyVouchers = vouchers.filter(
            (v) => v.partyName.toLowerCase() === account.partyName.toLowerCase()
          );

          return (
            <div
              key={account.partyName}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between hover:shadow-lg shadow-sm group ${
                isFlagged
                  ? isBahi
                    ? 'bg-[#fffcf7] border-red-300 ring-1 ring-red-400/30 hover:border-red-500'
                    : 'bg-white border-red-300 ring-1 ring-red-400/30 hover:border-red-500'
                  : isBahi
                  ? 'bg-[#fffefb] border-amber-200/90 hover:border-amber-400'
                  : 'bg-white border-slate-200 hover:border-teal-400/80'
              }`}
            >
              <div>
                {/* Flag Ribbon for Breached Debtors */}
                {isFlagged && (
                  <div className="mb-3 -mt-1 flex items-center justify-between p-2 rounded-xl bg-red-50/90 border border-red-200 text-xs text-red-900">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>
                        {analysis.isCreditLimitExceeded && analysis.isOverdue
                          ? 'Flagged: Credit Limit & Due Date Exceeded'
                          : analysis.isCreditLimitExceeded
                          ? 'Flagged: Sanctioned Credit Limit Exceeded'
                          : 'Flagged: Payment Overdue Past Due Date'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenWhatsApp(account)}
                      className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      Remind
                    </button>
                  </div>
                )}

                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-900 transition-colors">
                        {account.partyName}
                      </h4>
                      {account.msmeRegistered && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shadow-xs">
                          MSME 43B(h)
                        </span>
                      )}
                      {isDebtor && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isFlagged
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          Sundry Debtor (उगाणी)
                        </span>
                      )}
                    </div>
                    {account.contactPerson && (
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        Contact: {account.contactPerson}
                      </p>
                    )}
                  </div>

                  {/* Balance Badge */}
                  <div className="text-right shrink-0">
                    <span
                      className={`text-lg font-bold font-mono block tabular-nums ${
                        isDr ? 'text-red-700' : isCr ? 'text-emerald-700' : 'text-slate-700'
                      }`}
                    >
                      {formatInr(Math.abs(account.currentBalance))}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {isDr ? 'Receivable (Dr)' : isCr ? 'Payable (Cr)' : 'Nil Balance'}
                    </span>
                  </div>
                </div>

                {/* Credit Limit Meter for Debtors */}
                {isDebtor && (
                  <div className="my-3 p-3 rounded-xl bg-slate-50/80 border border-slate-200/90 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-semibold text-slate-700">Credit Limit:</span>
                        {editingLimitParty === account.partyName ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={tempLimitValue}
                              onChange={(e) => setTempLimitValue(e.target.value)}
                              className="w-24 px-1.5 py-0.5 text-xs font-mono border border-teal-500 rounded bg-white"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveCreditLimit(account.partyName)}
                              className="p-1 text-emerald-700 hover:bg-emerald-100 rounded"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingLimitParty(null)}
                              className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 font-mono font-medium">
                            <span>{formatInr(analysis.creditLimit)}</span>
                            <button
                              type="button"
                              onClick={() => handleStartEditLimit(account)}
                              className="p-0.5 text-slate-400 hover:text-slate-700 transition-colors"
                              title="Edit Credit Limit"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-mono font-bold ${
                            analysis.isCreditLimitExceeded
                              ? 'text-red-700'
                              : analysis.creditUsagePercent > 80
                              ? 'text-amber-700'
                              : 'text-teal-700'
                          }`}
                        >
                          {analysis.creditUsagePercent}% Used
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full transition-all rounded-full ${
                          analysis.isCreditLimitExceeded
                            ? 'bg-red-600'
                            : analysis.creditUsagePercent > 80
                            ? 'bg-amber-500'
                            : 'bg-teal-600'
                        }`}
                        style={{ width: `${Math.min(100, analysis.creditUsagePercent)}%` }}
                      />
                    </div>

                    {analysis.isCreditLimitExceeded && (
                      <div className="text-[11px] text-red-700 font-semibold flex items-center justify-between pt-0.5">
                        <span>Exceeded approved limit by:</span>
                        <span className="font-mono font-bold">
                          +{formatInr(analysis.excessCredit)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub details */}
                <div className="space-y-1.5 text-xs text-slate-600 my-3 pt-2.5 border-t border-slate-100">
                  {account.city && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {account.city}, {account.state || ''}
                      </span>
                    </div>
                  )}
                  {account.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono">{account.phone}</span>
                    </div>
                  )}
                  {account.gstin && (
                    <div className="text-[11px] font-mono text-slate-500">
                      GSTIN: {account.gstin}
                    </div>
                  )}
                </div>

                {/* Overdue Warning */}
                {isDebtor && analysis.maxDaysOverdue > 0 && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200/80 text-xs text-red-900 flex items-center gap-2 mb-3.5">
                    <Clock className="w-4 h-4 text-red-600 shrink-0" />
                    <span>
                      <strong className="font-bold">{analysis.maxDaysOverdue} Days Overdue:</strong>{' '}
                      Payment due date crossed
                      {analysis.oldestOverdueVoucher &&
                        ` for invoice #${analysis.oldestOverdueVoucher.voucherNumber} (${formatInr(
                          analysis.oldestOverdueVoucher.amount
                        )})`}
                      .
                    </span>
                  </div>
                )}

                {isCreditor && account.msmeRegistered && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-center gap-2 mb-3.5">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      <strong className="font-bold">MSME Section 43B(h):</strong> Disallowance
                      applies if unpaid beyond 45 days.
                    </span>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectParty(account.partyName)}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors flex items-center gap-1"
                >
                  <span>View Vouchers ({partyVouchers.length})</span>
                </button>

                {isDebtor && account.currentBalance > 0 && (
                  <button
                    onClick={() => onOpenWhatsApp(account)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm hover:scale-[1.02] ${
                      isFlagged
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-500/30'
                        : 'bg-slate-800 hover:bg-slate-900 text-white'
                    }`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Reminder</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredAccounts.length === 0 && (
        <div className="text-center py-12 p-6 rounded-2xl border border-dashed border-slate-300 text-slate-500 bg-slate-50">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
          <h4 className="text-sm font-bold text-slate-700">No Accounts Found</h4>
          <p className="text-xs text-slate-500 mt-1">
            No accounts match your current filter or search criteria.
          </p>
          {filterType !== 'All' && (
            <button
              onClick={() => {
                setFilterType('All');
                setSearchTerm('');
              }}
              className="mt-3 text-xs font-semibold text-teal-700 underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};
