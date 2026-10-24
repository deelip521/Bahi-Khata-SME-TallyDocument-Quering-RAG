import React, { useState } from 'react';
import { TallyVoucher, VoucherType } from '../types/tally';
import { Search, Eye, Filter, ArrowUpDown } from 'lucide-react';
import { formatInr } from '../services/ragEngine';

interface DayBookViewProps {
  vouchers: TallyVoucher[];
  themeMode: 'tally' | 'bahikhata';
  selectedPartyFilter: string | null;
  onClearPartyFilter: () => void;
  onInspectVoucher: (voucher: TallyVoucher) => void;
}

export const DayBookView: React.FC<DayBookViewProps> = ({
  vouchers,
  themeMode,
  selectedPartyFilter,
  onClearPartyFilter,
  onInspectVoucher,
}) => {
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const isBahi = themeMode === 'bahikhata';

  const voucherTypes: Array<string> = [
    'All',
    'Sales',
    'Purchase',
    'Receipt',
    'Payment',
    'Contra',
    'Journal',
    'Credit Note',
  ];

  // Filtering
  const filteredVouchers = vouchers.filter((v) => {
    if (selectedType !== 'All' && v.voucherType !== selectedType) return false;
    if (
      selectedPartyFilter &&
      v.partyName.toLowerCase() !== selectedPartyFilter.toLowerCase()
    ) {
      return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        v.voucherNumber.toLowerCase().includes(q) ||
        v.partyName.toLowerCase().includes(q) ||
        v.narration.toLowerCase().includes(q) ||
        v.debitEntries.some((e) => e.ledger.toLowerCase().includes(q)) ||
        v.creditEntries.some((e) => e.ledger.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Calculate totals
  const totalAmount = filteredVouchers.reduce((sum, v) => sum + v.amount, 0);
  const totalSales = filteredVouchers
    .filter((v) => v.voucherType === 'Sales')
    .reduce((sum, v) => sum + v.amount, 0);
  const totalPurchases = filteredVouchers
    .filter((v) => v.voucherType === 'Purchase')
    .reduce((sum, v) => sum + v.amount, 0);

  return (
    <div className="space-y-5">
      {/* Active party filter banner if filtered from ledger */}
      {selectedPartyFilter && (
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between text-xs text-teal-900 shadow-xs">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-600" />
            <span>Showing Daybook records filtered for: <strong>{selectedPartyFilter}</strong></span>
          </span>
          <button
            onClick={onClearPartyFilter}
            className="text-teal-700 underline font-bold hover:text-teal-900 transition-colors"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Top 3 Quick Turnover Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className={`p-4 rounded-xl border shadow-xs ${
          isBahi ? 'bg-[#fffefb] border-amber-200' : 'bg-white border-slate-200'
        }`}>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Filtered Sales (Outward)
          </span>
          <span className="text-xl font-bold font-mono text-blue-700 mt-1 block tabular-nums">
            {formatInr(totalSales)}
          </span>
        </div>

        <div className={`p-4 rounded-xl border shadow-xs ${
          isBahi ? 'bg-[#fffefb] border-amber-200' : 'bg-white border-slate-200'
        }`}>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Filtered Purchases (Inward)
          </span>
          <span className="text-xl font-bold font-mono text-purple-700 mt-1 block tabular-nums">
            {formatInr(totalPurchases)}
          </span>
        </div>

        <div className={`p-4 rounded-xl border shadow-xs ${
          isBahi ? 'bg-[#fffefb] border-amber-200' : 'bg-white border-slate-200'
        }`}>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Total Transacted Value
          </span>
          <span className="text-xl font-bold font-mono text-slate-900 mt-1 block tabular-nums">
            {formatInr(totalAmount)}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm ${
          isBahi ? 'bg-[#fdfbf7] border-amber-200/90' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto w-full md:w-auto shadow-inner">
          {voucherTypes.map((vt) => (
            <button
              key={vt}
              onClick={() => setSelectedType(vt)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                selectedType === vt
                  ? isBahi
                    ? 'bg-red-800 text-white shadow-xs'
                    : 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {vt === 'All' ? 'All Vouchers' : vt}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Vch No, Party, Narration..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 bg-slate-50/50 focus:bg-white transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Day Book Grid Table */}
      <div
        className={`rounded-2xl border overflow-hidden shadow-md ${
          isBahi ? 'bg-[#fffefb] border-amber-200/90' : 'bg-white border-slate-200'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Type</th>
                <th className="px-4 py-3.5">Vch No.</th>
                <th className="px-4 py-3.5">Particulars / Party</th>
                <th className="px-4 py-3.5 hidden md:table-cell">Account Heads</th>
                <th className="px-4 py-3.5 text-right">Amount (₹)</th>
                <th className="px-4 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredVouchers.map((voucher) => (
                <tr
                  key={voucher.id}
                  className="hover:bg-teal-50/40 transition-colors cursor-pointer group"
                  onClick={() => onInspectVoucher(voucher)}
                >
                  <td className="px-4 py-3.5 font-mono text-slate-600 whitespace-nowrap">
                    {voucher.date}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono uppercase tracking-tight shadow-xs ${
                        voucher.voucherType === 'Sales'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : voucher.voucherType === 'Purchase'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : voucher.voucherType === 'Receipt'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {voucher.voucherType}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {voucher.voucherNumber}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-900">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 group-hover:text-teal-900">{voucher.partyName}</span>
                      <span className="text-[11px] text-slate-500 truncate max-w-xs italic mt-0.5">
                        "{voucher.narration}"
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell text-slate-600 text-[11px]">
                    <div className="flex flex-col gap-0.5 max-w-xs truncate">
                      <span className="text-red-700 font-mono">
                        Dr: {voucher.debitEntries.map((e) => e.ledger).join(', ')}
                      </span>
                      <span className="text-emerald-700 font-mono">
                        Cr: {voucher.creditEntries.map((e) => e.ledger).join(', ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap text-sm tabular-nums">
                    {formatInr(voucher.amount)}
                  </td>
                  <td className="px-4 py-3.5 text-center whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onInspectVoucher(voucher);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-teal-700 group-hover:bg-teal-50 transition-colors"
                      title="Inspect Voucher"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredVouchers.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    No vouchers matching the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Totals */}
        <div className="p-4 bg-slate-100/90 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs font-mono font-bold gap-3">
          <span className="text-slate-600 uppercase text-[11px]">
            Total {filteredVouchers.length} Vouchers Listed
          </span>
          <div className="flex items-center gap-4 flex-wrap justify-end">
            {totalSales > 0 && (
              <span className="text-blue-900 font-medium">
                Sales: {formatInr(totalSales)}
              </span>
            )}
            {totalPurchases > 0 && (
              <span className="text-purple-900 font-medium">
                Purchases: {formatInr(totalPurchases)}
              </span>
            )}
            <span className="text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-xs">
              Filter Total: {formatInr(totalAmount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
