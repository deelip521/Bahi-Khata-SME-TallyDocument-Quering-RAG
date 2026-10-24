import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Sparkles,
  ArrowRight,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Printer,
  ChevronRight,
  ExternalLink,
  BookOpen,
  HelpCircle,
  History,
  Trash2,
  Building2,
  Scale,
  Receipt,
  Landmark,
  CornerDownLeft,
  ArrowUpRight,
  Tag,
  X,
  Filter,
} from 'lucide-react';
import {
  RagResponseData,
  RagCitation,
  CompanyProfile,
  TallyVoucher,
  BahiKhataAccount,
} from '../types/tally';
import { samplePredefinedQueries } from '../data/sampleTallyData';
import {
  buildIndexChunks,
  retrieveTopChunks,
  executeLocalFallbackRag,
  formatInr,
} from '../services/ragEngine';

interface RagQueryDeskProps {
  vouchers: TallyVoucher[];
  accounts: BahiKhataAccount[];
  company: CompanyProfile;
  predefinedQueries?: Array<{ title: string; query: string; langTag: string }>;
  themeMode: 'tally' | 'bahikhata';
  onInspectVoucher: (voucher: TallyVoucher) => void;
}

interface AutoCompleteItem {
  id: string;
  type: 'party' | 'statutory' | 'gst' | 'tax' | 'audit' | 'recent';
  categoryLabel: string;
  title: string;
  query: string;
  subtext?: string;
  badge: string;
  badgeStyle: string;
  iconType: 'building' | 'scale' | 'receipt' | 'landmark' | 'file' | 'history';
  keywords: string[];
}

const COMMON_ACCOUNTING_TERMS: Array<{
  categoryLabel: string;
  type: 'statutory' | 'gst' | 'tax' | 'audit';
  title: string;
  query: string;
  subtext: string;
  badge: string;
  badgeStyle: string;
  iconType: 'building' | 'scale' | 'receipt' | 'landmark' | 'file';
  keywords: string[];
}> = [
  {
    categoryLabel: 'Statutory & MSME',
    type: 'statutory',
    title: 'Section 43B(h) MSME overdue supplier payments (>45 days)',
    query: 'Show all purchases from MSME registered suppliers under Section 43B(h) and check if payment is delayed beyond 45 days',
    subtext: 'Mandatory 45/15-day timeline audit • Add-back to taxable income if unpaid',
    badge: 'MSME 43B(h)',
    badgeStyle: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200',
    iconType: 'scale',
    keywords: ['msme', '43b', '43b(h)', 'section 43b', 'overdue', 'supplier', 'creditor', 'udyam', 'disallowance'],
  },
  {
    categoryLabel: 'Statutory & MSME',
    type: 'statutory',
    title: 'Calculate potential Income Tax disallowances under Section 43B(h)',
    query: 'Calculate potential income tax disallowances under Section 43B(h) for unpaid MSME invoices in this financial year',
    subtext: 'Statutory tax liability assessment on delayed enterprise disbursements',
    badge: 'Tax Audit',
    badgeStyle: 'bg-rose-100 text-rose-900 border-rose-300',
    iconType: 'scale',
    keywords: ['disallowance', 'income tax', '43b', 'taxable profit', 'unpaid dues', 'audit addback'],
  },
  {
    categoryLabel: 'GST & ITC',
    type: 'gst',
    title: 'GSTR-3B vs GSTR-2B Input Tax Credit (ITC) reconciliation',
    query: 'Reconcile GSTR-3B eligible Input Tax Credit (ITC) with purchase register and flag missing invoices or mismatches',
    subtext: 'Rule 36(4) compliance • Purchase voucher vs 2B auto-drafted tax credit',
    badge: 'GST ITC',
    badgeStyle: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    iconType: 'receipt',
    keywords: ['itc', 'gstr-3b', 'gstr-2b', 'gst', 'input tax credit', 'reconciliation', 'mismatch', 'rule 36'],
  },
  {
    categoryLabel: 'GST & ITC',
    type: 'gst',
    title: 'Reverse Charge Mechanism (RCM) voucher liability check',
    query: 'Identify all inward supplies and expenses subject to Reverse Charge Mechanism (RCM) under Section 9(3) / 9(4)',
    subtext: 'GTA freight, advocate fees, director remuneration, RCM self-invoicing',
    badge: 'RCM Audit',
    badgeStyle: 'bg-purple-100 text-purple-900 border-purple-300',
    iconType: 'receipt',
    keywords: ['rcm', 'reverse charge', 'gta', 'freight', 'advocate', 'section 9', 'gst liability'],
  },
  {
    categoryLabel: 'GST & ITC',
    type: 'gst',
    title: 'E-Way Bill verification for outward sales exceeding ₹50,000',
    query: 'Verify E-Way Bill numbers generated for all sales invoices exceeding ₹50,000 threshold',
    subtext: 'Rule 138 mandatory e-way bill generation on inter-state & intra-state supplies',
    badge: 'E-Way Bill',
    badgeStyle: 'bg-cyan-100 text-cyan-900 border-cyan-300',
    iconType: 'file',
    keywords: ['eway', 'e-way bill', 'threshold', '50000', 'outward supply', 'interstate'],
  },
  {
    categoryLabel: 'Income Tax & Cash',
    type: 'tax',
    title: 'Cash payments exceeding ₹10,000 limit (Section 40A(3))',
    query: 'Check all cash payments made to any party in a single day exceeding ₹10,000 under Section 40A(3)',
    subtext: '100% expense disallowance penalty if paid in cash above ₹10,000 (₹35k for transport)',
    badge: 'Sec 40A(3)',
    badgeStyle: 'bg-red-100 text-red-900 border-red-300',
    iconType: 'scale',
    keywords: ['cash', '40a', '40a(3)', '10000', 'cash payment', 'disallowance', 'petty cash'],
  },
  {
    categoryLabel: 'Income Tax & Cash',
    type: 'tax',
    title: 'TDS Section 194Q & TCS Section 206C(1H) on goods turnover',
    query: 'Verify TDS deduction under Section 194Q and TCS on sale of goods under Section 206C(1H) exceeding ₹50 Lakhs',
    subtext: '0.1% TDS on cumulative purchases > ₹50 Lakhs from any single supplier',
    badge: 'TDS 194Q',
    badgeStyle: 'bg-amber-100 text-amber-900 border-amber-300',
    iconType: 'scale',
    keywords: ['tds', 'tcs', '194q', '206c', '50 lakh', 'goods purchase', 'withholding tax'],
  },
  {
    categoryLabel: 'Ledgers & Aging',
    type: 'audit',
    title: 'Sundry Debtors overdue aging analysis (>45, >90, >180 days)',
    query: 'Which sundry debtors have outstanding payments overdue beyond 45 days, 90 days, and 180 days?',
    subtext: 'Aging bucketing for credit control & provision for doubtful debts',
    badge: 'Debtors Aging',
    badgeStyle: 'bg-blue-100 text-blue-900 border-blue-300',
    iconType: 'building',
    keywords: ['debtors', 'sundry debtors', 'aging', 'overdue', 'receivables', 'collections', 'pending'],
  },
  {
    categoryLabel: 'Ledgers & Aging',
    type: 'audit',
    title: 'Sundry Creditors pending balance and payment schedule',
    query: 'Show all sundry creditors with outstanding credit balances and upcoming payment due dates',
    subtext: 'Payables ledger review & working capital outflow schedule',
    badge: 'Creditors',
    badgeStyle: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    iconType: 'building',
    keywords: ['creditors', 'sundry creditors', 'payables', 'pending bills', 'vendor balance'],
  },
  {
    categoryLabel: 'Audit & Banking',
    type: 'audit',
    title: 'Bank Reconciliation Statement (BRS) pending entries',
    query: 'Show bank reconciliation statement with uncredited cheques, uncleared deposits and bank ledger balance',
    subtext: 'Passbook vs ledger balance variance and cheque clearance tracking',
    badge: 'BRS Audit',
    badgeStyle: 'bg-teal-100 text-teal-900 border-teal-300',
    iconType: 'landmark',
    keywords: ['brs', 'bank reconciliation', 'cheque', 'bank balance', 'cleared', 'uncredited', 'contra'],
  },
  {
    categoryLabel: 'Audit & Banking',
    type: 'audit',
    title: 'Cash-in-Hand negative closing balance audit check',
    query: 'Audit daily Cash-in-Hand balance and flag any date where closing balance went negative',
    subtext: 'Statutory audit red flag • Chronological cash receipt/disbursement integrity',
    badge: 'Negative Cash',
    badgeStyle: 'bg-rose-100 text-rose-900 border-rose-300',
    iconType: 'landmark',
    keywords: ['negative cash', 'cash-in-hand', 'cash balance', 'audit check', 'daily cash'],
  },
  {
    categoryLabel: 'Audit & Banking',
    type: 'audit',
    title: 'Debit Note & Credit Note register summary with tax impact',
    query: 'Display all Debit Notes and Credit Notes issued during the period with tax adjustments and reasons',
    subtext: 'Sales returns, purchase returns, post-sale discounts and GST adjustments',
    badge: 'Notes Register',
    badgeStyle: 'bg-orange-100 text-orange-900 border-orange-300',
    iconType: 'file',
    keywords: ['debit note', 'credit note', 'sales return', 'purchase return', 'dn', 'cn', 'adjustment'],
  },
];

export const RagQueryDesk: React.FC<RagQueryDeskProps> = ({
  vouchers,
  accounts,
  company,
  predefinedQueries,
  themeMode,
  onInspectVoucher,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<RagResponseData | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeQueryTitle, setActiveQueryTitle] = useState<string>('');
  const isBahi = themeMode === 'bahikhata';
  const queriesToDisplay = predefinedQueries && predefinedQueries.length > 0 ? predefinedQueries : samplePredefinedQueries;

  // Autocomplete UI state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'party' | 'statutory' | 'gst' | 'audit'>('all');

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Persisted last 5 searches in local storage
  const [recentQueries, setRecentQueries] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('tally_rag_recent_queries');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(0, 5);
      }
    } catch {
      // ignore
    }
    return [
      'Which sundry debtors have outstanding payments overdue beyond 45 days?',
      'Provide a complete statement of account for Ramesh Enterprises',
      'Show all purchases from MSME registered suppliers under Section 43B(h)',
    ];
  });

  const saveRecentQuery = (newQuery: string) => {
    const trimmed = newQuery.trim();
    if (!trimmed) return;
    setRecentQueries((prev) => {
      const updated = [trimmed, ...prev.filter((q) => q.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
      try {
        localStorage.setItem('tally_rag_recent_queries', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save recent queries in localStorage:', err);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setRecentQueries([]);
    try {
      localStorage.removeItem('tally_rag_recent_queries');
    } catch (err) {
      console.error(err);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Dynamic Party extraction from accounts & vouchers
  const partyItems = useMemo<AutoCompleteItem[]>(() => {
    const items: AutoCompleteItem[] = [];
    const seenParties = new Set<string>();

    // 1. From accounts
    accounts.forEach((acc) => {
      const partyKey = acc.partyName.toLowerCase().trim();
      if (seenParties.has(partyKey)) return;
      seenParties.add(partyKey);

      const voucherCount = vouchers.filter(
        (v) => v.partyName.toLowerCase() === partyKey
      ).length;

      const isDebtor = acc.partyType === 'Sundry Debtor';
      const isCreditor = acc.partyType === 'Sundry Creditor';
      const isBank = acc.partyType === 'Bank' || acc.partyType === 'Cash';

      let queryText = `Provide a complete statement of account, ledger balance and recent vouchers for ${acc.partyName}`;
      let badge: string = acc.partyType;
      let badgeStyle = 'bg-slate-100 text-slate-800 border-slate-300';
      let iconType: 'building' | 'landmark' | 'scale' = 'building';
      let subtext = `${acc.partyType} • Balance: ${formatInr(acc.currentBalance || 0)} (${voucherCount} vouchers)`;

      if (isDebtor) {
        queryText = `What is the outstanding balance, overdue bills, and collection status for ${acc.partyName}?`;
        badge = 'Sundry Debtor';
        badgeStyle = 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-200';
        iconType = 'building';
        subtext = `Customer • Outstanding: ${formatInr(acc.currentBalance || 0)} • ${voucherCount} transactions`;
      } else if (isCreditor) {
        const isMsme = !!acc.msmeRegistered;
        queryText = isMsme
          ? `Show statement of account, pending invoices, and Section 43B(h) MSME 45-day payment status for ${acc.partyName}`
          : `Show statement of account and pending bills for ${acc.partyName}`;
        badge = isMsme ? 'MSME Creditor' : 'Sundry Creditor';
        badgeStyle = isMsme
          ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200'
          : 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-200';
        iconType = isMsme ? 'scale' : 'building';
        subtext = `Supplier • ${isMsme ? 'MSME Registered (45-day limit)' : 'Regular Creditor'} • Balance: ${formatInr(acc.currentBalance || 0)}`;
      } else if (isBank) {
        queryText = `Show all bank vouchers, cheques, deposits and current ledger balance for ${acc.partyName}`;
        badge = 'Bank / Cash';
        badgeStyle = 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200';
        iconType = 'landmark';
        subtext = `Bank & Cash Ledger • ${voucherCount} entries`;
      }

      items.push({
        id: `party-${acc.partyName}`,
        type: 'party',
        categoryLabel: isDebtor ? 'Sundry Debtors (Customers)' : isCreditor ? 'Sundry Creditors (Suppliers)' : 'Bank & Cash Accounts',
        title: `${acc.partyName}`,
        query: queryText,
        subtext,
        badge,
        badgeStyle,
        iconType,
        keywords: [acc.partyName.toLowerCase(), acc.partyType.toLowerCase(), acc.msmeRegistered ? 'msme' : '', 'ledger', 'balance', 'statement'],
      });
    });

    // 2. Extra unique parties found in vouchers not in accounts
    vouchers.forEach((v) => {
      const partyKey = v.partyName.toLowerCase().trim();
      if (!partyKey || seenParties.has(partyKey)) return;
      seenParties.add(partyKey);

      items.push({
        id: `voucher-party-${v.partyName}`,
        type: 'party',
        categoryLabel: 'Party Ledgers',
        title: v.partyName,
        query: `Show all voucher records, GST details, and transaction history for ${v.partyName}`,
        subtext: `Party Ledger • Last seen in ${v.voucherType} ${v.voucherNumber} • ${formatInr(v.amount)}`,
        badge: v.isMsme ? 'MSME Party' : 'Party Ledger',
        badgeStyle: 'bg-slate-100 text-slate-800 border-slate-300',
        iconType: 'building',
        keywords: [v.partyName.toLowerCase(), v.voucherType.toLowerCase(), 'party', 'voucher'],
      });
    });

    return items;
  }, [accounts, vouchers]);

  // Combined autocomplete items with predictive matching
  const suggestions = useMemo<AutoCompleteItem[]>(() => {
    const rawSearch = query.trim().toLowerCase();
    const allCandidates: AutoCompleteItem[] = [
      ...partyItems,
      ...COMMON_ACCOUNTING_TERMS.map((term, idx) => ({
        id: `term-${idx}`,
        type: term.type,
        categoryLabel: term.categoryLabel,
        title: term.title,
        query: term.query,
        subtext: term.subtext,
        badge: term.badge,
        badgeStyle: term.badgeStyle,
        iconType: term.iconType,
        keywords: term.keywords,
      })),
    ];

    // Filter by category if user selected a category tab
    const filteredByCategory = allCandidates.filter((item) => {
      if (activeCategoryFilter === 'all') return true;
      if (activeCategoryFilter === 'party') return item.type === 'party';
      if (activeCategoryFilter === 'statutory') return item.type === 'statutory';
      if (activeCategoryFilter === 'gst') return item.type === 'gst';
      if (activeCategoryFilter === 'audit') return item.type === 'audit' || item.type === 'tax';
      return true;
    });

    // If query is empty, return top starter recommendations + recent searches
    if (!rawSearch) {
      const topStarters = filteredByCategory.slice(0, 6);
      return topStarters;
    }

    // Rank by match quality
    const scored = filteredByCategory
      .map((item) => {
        let score = 0;
        const titleLower = item.title.toLowerCase();
        const queryLower = item.query.toLowerCase();
        const subtextLower = (item.subtext || '').toLowerCase();

        // Exact prefix match in title
        if (titleLower.startsWith(rawSearch)) {
          score += 100;
        } else if (titleLower.includes(rawSearch)) {
          score += 60;
        }

        // Match in keywords
        if (item.keywords.some((kw) => kw === rawSearch)) {
          score += 80;
        } else if (item.keywords.some((kw) => kw.includes(rawSearch) || rawSearch.includes(kw))) {
          score += 40;
        }

        // Match in subtext / query
        if (queryLower.includes(rawSearch)) score += 20;
        if (subtextLower.includes(rawSearch)) score += 15;

        // Multi-word token matching
        const searchTokens = rawSearch.split(/\s+/).filter(Boolean);
        if (searchTokens.length > 1) {
          const allTokensMatch = searchTokens.every(
            (token) =>
              titleLower.includes(token) ||
              queryLower.includes(token) ||
              item.keywords.some((kw) => kw.includes(token))
          );
          if (allTokensMatch) score += 50;
        }

        return { item, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((s) => s.item);

    return scored.slice(0, 8);
  }, [query, partyItems, activeCategoryFilter]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(-1);
  }, [query, activeCategoryFilter]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  // Execute RAG query against server or local fallback
  const handleExecuteQuery = async (queryText: string, title?: string) => {
    if (!queryText.trim()) return;
    saveRecentQuery(queryText);
    setLoading(true);
    setIsDropdownOpen(false);
    setActiveQueryTitle(title || queryText);

    const chunks = buildIndexChunks(vouchers, accounts);
    const retrieved = retrieveTopChunks(queryText, chunks, 10);

    try {
      // 1. Call server-side RAG endpoint
      const res = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          documents: retrieved.map((r) => ({
            id: r.id,
            type: r.type,
            party: r.partyName,
            voucherNumber: r.voucherNumber,
            date: r.date,
            amount: r.amount,
            text: r.text,
          })),
          companyContext: {
            name: company.name,
            gstin: company.gstin,
            financialYear: company.financialYear,
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.summary) {
          setCurrentResponse(json.data);
          setLoading(false);
          return;
        }
      }

      // If server returned non-ok or error, use high-precision local fallback
      const localResult = executeLocalFallbackRag(queryText, retrieved, vouchers, accounts, company);
      setCurrentResponse(localResult);
    } catch {
      // Fallback
      const localResult = executeLocalFallbackRag(queryText, retrieved, vouchers, accounts, company);
      setCurrentResponse(localResult);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDropdownOpen(false);
    handleExecuteQuery(query);
  };

  const handleSelectSuggestion = (item: AutoCompleteItem) => {
    setQuery(item.query);
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
    handleExecuteQuery(item.query, item.title);
  };

  const handleInsertSuggestionText = (e: React.MouseEvent, itemQuery: string) => {
    e.stopPropagation();
    setQuery(itemQuery);
    inputRef.current?.focus();
  };

  // Keyboard navigation for predictive dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown') {
        setIsDropdownOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[selectedIndex]);
      }
    } else if (e.key === 'Tab') {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        e.preventDefault();
        setQuery(suggestions[selectedIndex].query);
      } else if (suggestions.length > 0) {
        e.preventDefault();
        setQuery(suggestions[0].query);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setSelectedIndex(-1);
    }
  };

  // Highlight matched substrings
  const renderHighlighted = (text: string, search: string) => {
    if (!search.trim()) return <span>{text}</span>;
    const tokens = search.trim().split(/\s+/).filter(Boolean);
    const escaped = tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    if (!escaped) return <span>{text}</span>;

    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark
              key={i}
              className={`font-semibold rounded px-0.5 ${
                isBahi ? 'bg-amber-200/90 text-stone-900' : 'bg-teal-100 text-teal-900'
              }`}
            >
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  const handleCopyAnswer = () => {
    if (!currentResponse) return;
    const textToCopy = `*Bahi-Khata Tally RAG Query Report*\n\nQuery: ${activeQueryTitle || query}\n\nSummary:\n${currentResponse.summary}\n\nDetailed Analysis:\n${currentResponse.detailedAnswer}\n\nCompany: ${company.name} | GSTIN: ${company.gstin}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Find voucher object from citation
  const findVoucherByCitation = (citation: RagCitation): TallyVoucher | undefined => {
    return vouchers.find(
      (v) =>
        v.voucherNumber.toLowerCase() === citation.voucherNumber.toLowerCase() ||
        v.id.toLowerCase() === citation.voucherNumber.toLowerCase() ||
        v.partyName.toLowerCase() === citation.party.toLowerCase()
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Bar & Financial Console Controls */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border shadow-lg transition-all ${
          isBahi
            ? 'bg-[#fffdfa] border-amber-200/90 text-stone-900 shadow-amber-950/5 ring-1 ring-amber-300/30'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-950/5 ring-1 ring-slate-200/60'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${isBahi ? 'bg-amber-600' : 'bg-teal-500'}`} />
            <div>
              <h2 className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 uppercase">
                Tally ERP 9 / Prime Financial RAG Intelligence Desk
              </h2>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Predictive natural-language retrieval with double-entry cross-referencing &amp; statutory party indexing
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] px-2.5 py-1 rounded-lg font-mono font-bold bg-teal-50 text-teal-700 border border-teal-200/80 shadow-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              <span>Scope: {company.tradeName}</span>
            </span>
          </div>
        </div>

        {/* Predictive Autocomplete Search Bar Container */}
        <div ref={containerRef} className="relative">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-600 transition-colors pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder={`Search party names (Ramesh, Balaji...), MSME 43B(h), GSTR-3B ITC, cash limits...`}
                className={`w-full pl-12 pr-32 py-3.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 shadow-inner ${
                  isBahi
                    ? 'border border-amber-300 focus:border-red-700 focus:ring-red-700/20 bg-amber-50/20 placeholder:text-stone-400'
                    : 'border border-slate-300 focus:border-teal-600 focus:ring-teal-600/20 bg-slate-50/60 focus:bg-white placeholder:text-slate-400'
                }`}
                autoComplete="off"
                spellCheck="false"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setIsDropdownOpen(false);
                    inputRef.current?.focus();
                  }}
                  className="absolute right-30 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1.5 py-0.5 rounded cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className={`absolute right-2 px-5 py-2.5 rounded-lg text-xs font-bold text-white flex items-center gap-2 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                isBahi
                  ? 'bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 shadow-red-950/20'
                  : 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 shadow-teal-900/30'
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Scanning...</span>
                </span>
              ) : (
                <>
                  <span>Search RAG</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Predictive Autocomplete Dropdown Popover */}
          {isDropdownOpen && (
            <div
              className={`absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border shadow-2xl backdrop-blur-md overflow-hidden transition-all duration-150 animate-in fade-in slide-in-from-top-1 ${
                isBahi
                  ? 'bg-[#fffefb]/98 border-amber-300 text-stone-900 shadow-amber-950/15'
                  : 'bg-white/98 border-slate-200 text-slate-900 shadow-slate-900/15'
              }`}
            >
              {/* Category Filter Tabs inside Dropdown */}
              <div
                className={`px-4 py-2.5 border-b flex items-center justify-between gap-2 flex-wrap text-xs ${
                  isBahi ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50/80 border-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span className="font-semibold uppercase tracking-wider text-[10px]">
                    Predictive Financial Queries
                  </span>
                </div>
                <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                  {[
                    { key: 'all', label: 'All Suggestions' },
                    { key: 'party', label: 'Parties & Debtors' },
                    { key: 'statutory', label: 'MSME 43B(h)' },
                    { key: 'gst', label: 'GST & ITC' },
                    { key: 'audit', label: 'Audit & BRS' },
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setActiveCategoryFilter(filter.key as any);
                      }}
                      className={`px-2.5 py-0.5 text-[11px] font-medium rounded-full border transition-all ${
                        activeCategoryFilter === filter.key
                          ? isBahi
                            ? 'bg-red-800 text-white border-red-800 shadow-xs'
                            : 'bg-teal-600 text-white border-teal-600 shadow-xs'
                          : 'bg-white/80 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Suggestions List */}
              <ul
                ref={listRef}
                className="max-h-80 overflow-y-auto divide-y divide-slate-100/80 p-1.5 focus:outline-none"
                role="listbox"
              >
                {suggestions.length > 0 ? (
                  suggestions.map((item, index) => {
                    const isSelected = selectedIndex === index;
                    return (
                      <li
                        key={item.id}
                        role="option"
                        aria-selected={isSelected}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectSuggestion(item);
                        }}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`group p-2.5 rounded-xl cursor-pointer transition-all flex items-start justify-between gap-3 ${
                          isSelected
                            ? isBahi
                              ? 'bg-amber-100/80 ring-1 ring-amber-300/80'
                              : 'bg-teal-50/90 ring-1 ring-teal-200'
                            : 'hover:bg-slate-50/90'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div
                            className={`p-2 rounded-lg shrink-0 mt-0.5 transition-colors ${
                              isSelected
                                ? isBahi
                                  ? 'bg-amber-200 text-stone-900'
                                  : 'bg-teal-600 text-white shadow-xs'
                                : isBahi
                                ? 'bg-amber-100/70 text-stone-700'
                                : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                            }`}
                          >
                            {item.iconType === 'building' && <Building2 className="w-4 h-4" />}
                            {item.iconType === 'scale' && <Scale className="w-4 h-4" />}
                            {item.iconType === 'receipt' && <Receipt className="w-4 h-4" />}
                            {item.iconType === 'landmark' && <Landmark className="w-4 h-4" />}
                            {item.iconType === 'file' && <FileText className="w-4 h-4" />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <span className="text-xs font-bold text-slate-900 leading-snug">
                                {renderHighlighted(item.title, query)}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${item.badgeStyle}`}
                              >
                                {item.badge}
                              </span>
                            </div>
                            {item.subtext && (
                              <p className="text-[11px] text-slate-500 leading-relaxed truncate">
                                {renderHighlighted(item.subtext, query)}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action buttons on the right */}
                        <div className="flex items-center gap-1.5 shrink-0 pt-1">
                          <button
                            type="button"
                            title="Insert query text into search bar"
                            onMouseDown={(e) => handleInsertSuggestionText(e, item.query)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                          <div
                            className={`px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-colors ${
                              isSelected
                                ? isBahi
                                  ? 'bg-red-800 text-white'
                                  : 'bg-teal-600 text-white'
                                : 'text-slate-400 group-hover:text-slate-700 group-hover:bg-slate-200/50'
                            }`}
                          >
                            <span>Run</span>
                            <CornerDownLeft className="w-3 h-3" />
                          </div>
                        </div>
                      </li>
                    );
                  })
                ) : (
                  <li className="p-6 text-center text-slate-500 space-y-2">
                    <p className="text-xs font-semibold">No direct party or statutory template matches found</p>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                      Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border text-slate-600 text-[10px]">Enter</kbd> to search the entire financial corpus with semantic RAG document retrieval.
                    </p>
                  </li>
                )}
              </ul>

              {/* Popover Footer with Keyboard navigation shortcuts */}
              <div
                className={`px-4 py-2 border-t flex items-center justify-between text-[11px] text-slate-500 ${
                  isBahi ? 'bg-amber-50/40 border-amber-200/60' : 'bg-slate-50 border-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono shadow-2xs">↑↓</kbd>
                    <span>navigate</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono shadow-2xs">↵</kbd>
                    <span>execute</span>
                  </span>
                  <span className="flex items-center gap-1 hidden sm:flex">
                    <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono shadow-2xs">Tab</kbd>
                    <span>autocomplete</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono shadow-2xs">Esc</kbd>
                    <span>close</span>
                  </span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">
                  {suggestions.length} suggestions
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Sample Query Buttons */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Inquiries:
          </span>
          {queriesToDisplay.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(item.query);
                handleExecuteQuery(item.query, item.title);
              }}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all text-left flex items-center gap-1.5 hover:scale-[1.01] ${
                isBahi
                  ? 'bg-amber-50/70 hover:bg-amber-100 text-stone-800 border-amber-200/80'
                  : 'bg-slate-50 hover:bg-slate-100 hover:border-teal-300 text-slate-700 border-slate-200'
              }`}
            >
              <span className="font-medium">{item.title}</span>
            </button>
          ))}
        </div>

        {/* Recent Queries Section (Persisted Last 5) */}
        {recentQueries.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100/80 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap flex-1">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 shrink-0">
                <History className="w-3.5 h-3.5 text-teal-600" />
                <span>Recent Searches:</span>
              </span>
              {recentQueries.map((rq, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(rq);
                    handleExecuteQuery(rq);
                  }}
                  title={rq}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-all text-left flex items-center gap-1 max-w-xs sm:max-w-sm truncate ${
                    isBahi
                      ? 'bg-white hover:bg-amber-100/70 text-stone-800 border-amber-200'
                      : 'bg-white hover:bg-teal-50 text-slate-700 border-slate-200 hover:border-teal-400'
                  }`}
                >
                  <span className="truncate">{rq}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleClearHistory}
              title="Clear search history"
              className="text-[11px] text-slate-400 hover:text-red-600 flex items-center gap-1 py-1 px-1.5 rounded transition-colors shrink-0"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>

      {/* Loading state indicator */}
      {loading && (
        <div
          className={`p-10 rounded-2xl border text-center space-y-4 animate-pulse shadow-sm ${
            isBahi ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="w-12 h-12 mx-auto rounded-full border-3 border-teal-500/20 border-t-teal-600 animate-spin" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-900">
              Retrieving Vouchers &amp; Calculating Double-Entry Financial State...
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Cross-referencing Daybook transactions, analyzing Section 43B(h) MSME compliance timelines, and verifying ledger balances for {company.name}.
            </p>
          </div>
        </div>
      )}

      {/* RAG Response Section */}
      {!loading && currentResponse && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Executive Summary Card */}
          <div
            className={`p-6 sm:p-7 rounded-2xl border shadow-lg relative overflow-hidden ${
              isBahi
                ? 'bg-[#fffefb] border-amber-300/80 ring-1 ring-amber-300/30'
                : 'bg-white border-slate-200 ring-1 ring-slate-200/60'
            }`}
          >
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-5 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>CA Audit Intelligence &amp; Ledger Verification</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                      Verified
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Source: {company.tradeName} Daybook XML &amp; Partitioned Ledgers
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={handleCopyAnswer}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs font-medium"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Report</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs font-medium"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Print / PDF</span>
                </button>
              </div>
            </div>

            {/* Direct Executive Summary */}
            <div className={`text-base font-semibold text-slate-900 leading-relaxed p-4 sm:p-5 rounded-xl border-l-4 mb-6 ${
              isBahi
                ? 'bg-amber-50/70 border-amber-600 text-amber-950'
                : 'bg-teal-50/70 border-teal-600 text-slate-900'
            }`}>
              <div className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-1">
                Executive Finding:
              </div>
              {currentResponse.summary}
            </div>

            {/* Calculated Metrics Cards */}
            {currentResponse.calculatedMetrics && currentResponse.calculatedMetrics.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
                {currentResponse.calculatedMetrics.map((metric, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all ${
                      metric.type === 'negative'
                        ? 'bg-red-50/60 border-red-200/80 text-red-950 shadow-xs'
                        : metric.type === 'positive'
                        ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-950 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-900 shadow-xs'
                    }`}
                  >
                    <span className="text-xs text-slate-600 font-semibold block uppercase tracking-wider">
                      {metric.label}
                    </span>
                    <span className="text-xl font-bold font-mono tracking-tight block mt-1.5 tabular-nums">
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Detailed Answer Breakdown */}
            <div className="text-sm text-slate-800 space-y-3 leading-relaxed whitespace-pre-line border-t border-slate-100 pt-5">
              {currentResponse.detailedAnswer}
            </div>

            {/* Audit Observations & Warnings */}
            {currentResponse.auditObservations && currentResponse.auditObservations.length > 0 && (
              <div className="mt-6 p-4.5 rounded-xl bg-amber-50/90 border border-amber-300 space-y-2.5 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Statutory CA Compliance Alerts &amp; Section 43B(h) Observations:</span>
                </div>
                <ul className="text-xs text-amber-950 space-y-1.5 list-disc list-inside">
                  {currentResponse.auditObservations.map((obs, idx) => (
                    <li key={idx} className="leading-relaxed">{obs}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Citations & Evidence Panel */}
          {currentResponse.citations && currentResponse.citations.length > 0 && (
            <div
              className={`p-6 rounded-2xl border shadow-lg ${
                isBahi ? 'bg-[#fdfbf7] border-amber-200' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Source Document Citations ({currentResponse.citations.length} Verified Records)
                  </h4>
                </div>
                <span className="text-xs text-slate-500">
                  Click 'Inspect' to open full voucher breakdown
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {currentResponse.citations.map((citation, idx) => {
                  const linkedVoucher = findVoucherByCitation(citation);
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-500 hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 group-hover:bg-teal-50 group-hover:text-teal-900 px-2.5 py-0.5 rounded-md transition-colors">
                            {citation.voucherNumber}
                          </span>
                          <span className="text-xs font-bold text-slate-900 font-mono tabular-nums">
                            {citation.amount}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-800 mt-1">
                          {citation.party}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {citation.context}
                        </p>
                      </div>

                      <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-mono">
                          Date: {citation.date} · {citation.type}
                        </span>
                        {linkedVoucher && (
                          <button
                            onClick={() => onInspectVoucher(linkedVoucher)}
                            className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 group-hover:translate-x-0.5 transition-all"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Follow-up Prompts */}
          {currentResponse.suggestedFollowUps && currentResponse.suggestedFollowUps.length > 0 && (
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/80 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-3">
                Recommended Accounting Audit Follow-Ups:
              </span>
              <div className="flex flex-col sm:flex-row gap-2.5 flex-wrap">
                {currentResponse.suggestedFollowUps.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(q);
                      handleExecuteQuery(q);
                    }}
                    className="text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-teal-50/60 hover:border-teal-300 text-slate-800 text-left transition-all flex items-center justify-between gap-2 shadow-xs group"
                  >
                    <span className="font-medium">{q}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Initial welcome banner if no query executed yet */}
      {!loading && !currentResponse && (
        <div
          className={`p-8 sm:p-10 rounded-2xl border text-center max-w-3xl mx-auto space-y-6 shadow-lg ${
            isBahi
              ? 'bg-[#fdfbf7] border-amber-200/90 text-stone-800'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <div
            className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center border shadow-sm ${
              isBahi
                ? 'bg-gradient-to-br from-amber-100 to-amber-200 text-red-900 border-amber-300 text-2xl font-serif font-bold'
                : 'bg-gradient-to-br from-teal-50 to-teal-100 text-teal-700 border-teal-200 text-2xl font-bold'
            }`}
          >
            ₹
          </div>
          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Bahi-Khata Tally Multi-Company Intelligence
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              Query accounting records across isolated company vaults. Instant double-entry verification, debtor aging, Section 43B(h) compliance, and GST matching.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left pt-2">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all">
              <span className="text-xs font-bold text-slate-900 block mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                Debtors &amp; Aging
              </span>
              <p className="text-xs text-slate-500 leading-relaxed">
                Track customer balances, calculate days overdue beyond 45 days, and compose 1-click WhatsApp reminders.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all">
              <span className="text-xs font-bold text-slate-900 block mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                GST Reconciliation
              </span>
              <p className="text-xs text-slate-500 leading-relaxed">
                Compare GSTR-1 outward turnover with GSTR-3B ITC claims, check reverse charge and tax liabilities.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all">
              <span className="text-xs font-bold text-slate-900 block mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                43B(h) &amp; 40A(3) Audit
              </span>
              <p className="text-xs text-slate-500 leading-relaxed">
                Automated statutory audit alerts for MSME supplier 45-day limits and cash disbursements &gt; ₹10k.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
