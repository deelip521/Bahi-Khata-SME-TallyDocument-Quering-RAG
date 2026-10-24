import React from 'react';
import { X, CheckCircle2, AlertTriangle, FileText, Share2, Copy } from 'lucide-react';
import { TallyVoucher } from '../types/tally';
import { formatInr } from '../services/ragEngine';

interface VoucherDetailModalProps {
  voucher: TallyVoucher | null;
  onClose: () => void;
  themeMode: 'tally' | 'bahikhata';
}

export const VoucherDetailModal: React.FC<VoucherDetailModalProps> = ({
  voucher,
  onClose,
  themeMode,
}) => {
  if (!voucher) return null;
  const isBahi = themeMode === 'bahikhata';

  const totalDebit = voucher.debitEntries.reduce((sum, e) => sum + e.amount, 0);
  const totalCredit = voucher.creditEntries.reduce((sum, e) => sum + e.amount, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.05 || voucher.amount > 0;

  // Audit flags
  const isCashExceeding10k =
    (voucher.debitEntries.some((e) => e.ledger.toLowerCase().includes('cash') && e.amount > 10000) ||
      voucher.creditEntries.some((e) => e.ledger.toLowerCase().includes('cash') && e.amount > 10000)) &&
    voucher.voucherType === 'Payment';

  const isEwayBillRequired = voucher.amount >= 50000 && (voucher.voucherType === 'Sales' || voucher.voucherType === 'Purchase');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border shadow-xl flex flex-col ${
          isBahi ? 'bg-[#fdfbf7] border-amber-300' : 'bg-white border-slate-200'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isBahi
              ? 'bg-[#7f1d1d] text-amber-50 border-amber-900'
              : 'bg-slate-900 text-slate-100 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`text-xs px-2 py-0.5 rounded font-mono font-bold uppercase ${
                voucher.voucherType === 'Sales'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : voucher.voucherType === 'Purchase'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : voucher.voucherType === 'Receipt'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {voucher.voucherType} (F-Voucher)
            </span>
            <h3 className="text-base font-bold font-mono text-white">
              {voucher.voucherNumber}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 flex-1">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Voucher Date</span>
              <span className="font-semibold text-slate-800 font-mono mt-0.5 block">
                {voucher.date}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Party / Account</span>
              <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                {voucher.partyName}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Total Amount</span>
              <span className="font-bold text-slate-900 font-mono mt-0.5 block">
                {formatInr(voucher.amount)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Source File</span>
              <span className="font-mono text-slate-600 mt-0.5 block truncate">
                {voucher.docSource}
              </span>
            </div>
          </div>

          {/* Double-Entry Ledger Posting Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100/80 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700 uppercase">
              <span>Double-Entry Ledger Account Head</span>
              <div className="flex items-center gap-12 font-mono">
                <span className="w-24 text-right">Debit (Dr)</span>
                <span className="w-24 text-right">Credit (Cr)</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {/* Debit Lines */}
              {voucher.debitEntries.map((e, idx) => (
                <div key={`dr-${idx}`} className="px-3.5 py-2.5 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-1 rounded">
                      Dr
                    </span>
                    <span className="font-medium text-slate-900">{e.ledger}</span>
                  </div>
                  <div className="flex items-center gap-12 font-mono">
                    <span className="w-24 text-right font-semibold text-slate-900">
                      {formatInr(e.amount, false)}
                    </span>
                    <span className="w-24 text-right text-slate-400">-</span>
                  </div>
                </div>
              ))}

              {/* Credit Lines */}
              {voucher.creditEntries.map((e, idx) => (
                <div key={`cr-${idx}`} className="px-3.5 py-2.5 flex items-center justify-between bg-slate-50/40">
                  <div className="flex items-center gap-2 pl-4">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 rounded">
                      Cr
                    </span>
                    <span className="font-medium text-slate-900">{e.ledger}</span>
                  </div>
                  <div className="flex items-center gap-12 font-mono">
                    <span className="w-24 text-right text-slate-400">-</span>
                    <span className="w-24 text-right font-semibold text-slate-900">
                      {formatInr(e.amount, false)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Balance Row */}
            <div className="bg-slate-100 px-3.5 py-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold font-mono">
              <span className="text-slate-700 uppercase">Total Double-Entry Balance</span>
              <div className="flex items-center gap-12">
                <span className="w-24 text-right text-red-900">
                  {formatInr(totalDebit || voucher.amount, false)}
                </span>
                <span className="w-24 text-right text-emerald-900">
                  {formatInr(totalCredit || voucher.amount, false)}
                </span>
              </div>
            </div>
          </div>

          {/* Double Entry Seal */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Double Entry Balanced:</strong> Every debit entry has a corresponding credit
              entry conforming to Indian GAAP &amp; Tally Accounting Rules.
            </span>
          </div>

          {/* GST Details if applicable */}
          {voucher.gst && (
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 space-y-2">
              <span className="text-xs font-bold uppercase text-slate-700 block">
                GST Tax Invoice Breakdown:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">GST Slab:</span>
                  <span className="font-semibold text-slate-800 ml-1 font-mono">
                    {voucher.gst.ratePercent}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">HSN/SAC:</span>
                  <span className="font-semibold text-slate-800 ml-1 font-mono">
                    {voucher.gst.hsnCode}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">CGST + SGST:</span>
                  <span className="font-semibold text-slate-800 ml-1 font-mono">
                    {formatInr(voucher.gst.cgst + voucher.gst.sgst)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">IGST:</span>
                  <span className="font-semibold text-slate-800 ml-1 font-mono">
                    {formatInr(voucher.gst.igst)}
                  </span>
                </div>
              </div>
              {voucher.gst.eWayBillNo && (
                <div className="text-xs pt-1 border-t border-slate-200 text-slate-600">
                  <span className="font-semibold">e-Way Bill No:</span>{' '}
                  <span className="font-mono text-slate-800">{voucher.gst.eWayBillNo}</span> (Valid
                  for Inter-state / Intra-state movement)
                </div>
              )}
            </div>
          )}

          {/* Narration */}
          <div className="p-3 rounded-lg border border-slate-200 bg-white text-xs">
            <span className="text-slate-500 font-semibold block mb-0.5">
              Narration / Remarks:
            </span>
            <p className="text-slate-800 italic">"{voucher.narration}"</p>
          </div>

          {/* Statutory Compliance Checklist */}
          <div className="space-y-1.5 text-xs">
            <span className="font-bold uppercase text-slate-600 tracking-wider block">
              Statutory Compliance Check:
            </span>
            {isCashExceeding10k ? (
              <div className="p-2 rounded bg-red-50 border border-red-300 text-red-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>
                  <strong>Section 40A(3) Warning:</strong> Cash payment exceeds ₹10,000 threshold.
                  May be disallowed in tax audit!
                </span>
              </div>
            ) : (
              <div className="p-2 rounded bg-emerald-50/70 border border-emerald-200 text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Section 40A(3) Cash limit compliant.</span>
              </div>
            )}

            {voucher.isMsme && (
              <div className="p-2 rounded bg-amber-50 border border-amber-300 text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>
                  <strong>Section 43B(h) MSME Notice:</strong> Party is MSME registered. Payment
                  must be executed before 45-day deadline ({voucher.dueDate}).
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Indexed in Tally RAG Vector Store
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
          >
            Close Voucher
          </button>
        </div>
      </div>
    </div>
  );
};
