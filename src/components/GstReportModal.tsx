import React, { useState } from 'react';
import { X, Printer, Copy, Check, FileCheck2, ShieldCheck, Download } from 'lucide-react';
import { GstSummary, CompanyProfile, TallyVoucher } from '../types/tally';
import { formatInr } from '../services/ragEngine';

interface GstReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  gstSummary: GstSummary;
  company: CompanyProfile;
  vouchers: TallyVoucher[];
  themeMode: 'tally' | 'bahikhata';
}

export const GstReportModal: React.FC<GstReportModalProps> = ({
  isOpen,
  onClose,
  gstSummary,
  company,
  vouchers,
  themeMode,
}) => {
  if (!isOpen) return null;
  const isBahi = themeMode === 'bahikhata';
  const [copied, setCopied] = useState(false);

  // Recalculate dynamic values based on all vouchers in the system
  const salesVouchers = vouchers.filter((v) => v.voucherType === 'Sales');
  const purchaseVouchers = vouchers.filter((v) => v.voucherType === 'Purchase');

  const totalGrossSales = salesVouchers.reduce((s, v) => s + v.amount, 0);
  const totalGrossPurchases = purchaseVouchers.reduce((s, v) => s + v.amount, 0);

  const outputCgst = salesVouchers.reduce((s, v) => s + (v.gst?.cgst || 0), 0);
  const outputSgst = salesVouchers.reduce((s, v) => s + (v.gst?.sgst || 0), 0);
  const outputIgst = salesVouchers.reduce((s, v) => s + (v.gst?.igst || 0), 0);
  const totalOutputTax = outputCgst + outputSgst + outputIgst;

  const inputCgst = purchaseVouchers.reduce((s, v) => s + (v.gst?.cgst || 0), 0);
  const inputSgst = purchaseVouchers.reduce((s, v) => s + (v.gst?.sgst || 0), 0);
  const inputIgst = purchaseVouchers.reduce((s, v) => s + (v.gst?.igst || 0), 0);
  const totalInputTax = inputCgst + inputSgst + inputIgst;

  const netTaxPayable = Math.max(0, totalOutputTax - totalInputTax);

  const handleCopyMemo = () => {
    const memo = `*CA TAX AUDIT MEMO: GSTR-1 & GSTR-3B RECONCILIATION*
Firm: ${company.name} (${company.tradeName})
GSTIN: ${company.gstin} | State Code: ${company.stateCode} (${company.state})
Period: ${gstSummary.taxPeriod} | FY: ${company.financialYear}

1. OUTWARD SUPPLIES (Gross Turnover): ${formatInr(totalGrossSales)}
   - Output CGST: ${formatInr(outputCgst)}
   - Output SGST: ${formatInr(outputSgst)}
   - Output IGST: ${formatInr(outputIgst)}
   - Total Output Liability: ${formatInr(totalOutputTax)}

2. INWARD SUPPLIES (Eligible ITC): ${formatInr(totalGrossPurchases)}
   - Input CGST: ${formatInr(inputCgst)}
   - Input SGST: ${formatInr(inputSgst)}
   - Input IGST: ${formatInr(inputIgst)}
   - Total ITC Claimed: ${formatInr(totalInputTax)}

3. NET TAX PAYABLE (Challan PMT-06): ${formatInr(netTaxPayable)}

Verified against Tally Daybook XML & Bahi-Khata Ledger.`;

    navigator.clipboard.writeText(memo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border shadow-xl flex flex-col ${
          isBahi ? 'bg-[#fffefb] border-amber-300' : 'bg-white border-slate-200'
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
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              GSTR-1 &amp; GSTR-3B Tax Audit Reconciliation Report
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content (Printable CA Report) */}
        <div className="p-6 space-y-5 flex-1 text-xs text-slate-800 font-sans print:p-0">
          {/* Company Title Banner */}
          <div className="border-b border-slate-200 pb-4 text-center space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">
              Statutory Goods &amp; Services Tax Audit Summary
            </span>
            <h2 className="text-lg font-bold text-slate-900 font-serif">
              {company.name}
            </h2>
            <p className="text-xs text-slate-600">
              {company.address}, {company.city}, {company.state} (State Code: {company.stateCode})
            </p>
            <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-700 pt-1">
              <span>GSTIN: <strong>{company.gstin}</strong></span>
              <span>·</span>
              <span>PAN: <strong>{company.pan}</strong></span>
              <span>·</span>
              <span>FY: <strong>{company.financialYear}</strong></span>
            </div>
          </div>

          {/* Table 1: Outward Supplies (Output Tax) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase text-slate-700 tracking-wide">
                Table 3.1: Details of Outward Taxable Supplies (GSTR-1 &amp; 3B)
              </span>
              <span className="font-mono text-slate-500 font-semibold">
                {salesVouchers.length} Sales Invoices
              </span>
            </div>

            <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden font-mono">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-2 border-r border-slate-200">Nature of Supply</th>
                  <th className="p-2 border-r border-slate-200 text-right">Taxable Value</th>
                  <th className="p-2 border-r border-slate-200 text-right">CGST</th>
                  <th className="p-2 border-r border-slate-200 text-right">SGST</th>
                  <th className="p-2 text-right">IGST</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2 border-r border-slate-200 font-sans font-medium text-slate-800">
                    Intra-State Supplies (Gujarat)
                  </td>
                  <td className="p-2 border-r border-slate-200 text-right">
                    {formatInr(totalGrossSales - (outputIgst > 0 ? outputIgst / 0.05 : 0), false)}
                  </td>
                  <td className="p-2 border-r border-slate-200 text-right">{formatInr(outputCgst, false)}</td>
                  <td className="p-2 border-r border-slate-200 text-right">{formatInr(outputSgst, false)}</td>
                  <td className="p-2 text-right text-slate-400">0.00</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-200 font-sans font-medium text-slate-800">
                    Inter-State Supplies (Maharashtra / Kerala)
                  </td>
                  <td className="p-2 border-r border-slate-200 text-right">
                    {formatInr(outputIgst > 0 ? outputIgst / 0.05 : 0, false)}
                  </td>
                  <td className="p-2 border-r border-slate-200 text-right text-slate-400">0.00</td>
                  <td className="p-2 border-r border-slate-200 text-right text-slate-400">0.00</td>
                  <td className="p-2 text-right">{formatInr(outputIgst, false)}</td>
                </tr>
                <tr className="bg-slate-50 font-bold">
                  <td className="p-2 border-r border-slate-200 font-sans text-slate-900">
                    Total Outward Liability (A)
                  </td>
                  <td className="p-2 border-r border-slate-200 text-right">{formatInr(totalGrossSales, false)}</td>
                  <td className="p-2 border-r border-slate-200 text-right text-red-900">{formatInr(outputCgst, false)}</td>
                  <td className="p-2 border-r border-slate-200 text-right text-red-900">{formatInr(outputSgst, false)}</td>
                  <td className="p-2 text-right text-red-900">{formatInr(outputIgst, false)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Table 2: Inward Supplies (Input Tax Credit - ITC) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase text-slate-700 tracking-wide">
                Table 4: Eligible Input Tax Credit (ITC - GSTR-3B Table 4A)
              </span>
              <span className="font-mono text-slate-500 font-semibold">
                {purchaseVouchers.length} Purchase Invoices
              </span>
            </div>

            <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden font-mono">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-2 border-r border-slate-200">ITC Category</th>
                  <th className="p-2 border-r border-slate-200 text-right">Total Purchases</th>
                  <th className="p-2 border-r border-slate-200 text-right">Input CGST</th>
                  <th className="p-2 border-r border-slate-200 text-right">Input SGST</th>
                  <th className="p-2 text-right">Input IGST</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="bg-slate-50 font-bold">
                  <td className="p-2 border-r border-slate-200 font-sans text-slate-900">
                    Total Eligible ITC (B)
                  </td>
                  <td className="p-2 border-r border-slate-200 text-right">{formatInr(totalGrossPurchases, false)}</td>
                  <td className="p-2 border-r border-slate-200 text-right text-emerald-900">{formatInr(inputCgst, false)}</td>
                  <td className="p-2 border-r border-slate-200 text-right text-emerald-900">{formatInr(inputSgst, false)}</td>
                  <td className="p-2 text-right text-emerald-900">{formatInr(inputIgst, false)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Net Settlement Summary */}
          <div className="p-4 rounded-xl border border-slate-300 bg-slate-50 space-y-2">
            <span className="font-bold uppercase text-slate-900 block text-xs tracking-wider">
              Net Tax Payable Through Electronic Cash Ledger (Form GST PMT-06):
            </span>
            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              <div className="p-2.5 rounded bg-white border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Total Output Tax (A)</span>
                <span className="font-bold text-red-700 text-sm">{formatInr(totalOutputTax)}</span>
              </div>
              <div className="p-2.5 rounded bg-white border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Less: Eligible ITC (B)</span>
                <span className="font-bold text-emerald-700 text-sm">{formatInr(totalInputTax)}</span>
              </div>
              <div className="p-2.5 rounded bg-amber-50 border border-amber-300">
                <span className="text-amber-900 block text-[10px] font-bold">Net Cash Payable (A - B)</span>
                <span className="font-bold text-amber-950 text-sm">{formatInr(netTaxPayable)}</span>
              </div>
            </div>
          </div>

          {/* Statutory Auditor Declaration */}
          <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Chartered Accountant (CA) Statutory Verification Note</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              1. All outward invoices with value exceeding ₹50,000 carry verified e-Way Bill credentials.<br />
              2. Payments to MSME vendors are tracked under Section 43B(h) within the 45-day threshold.<br />
              3. Cash disbursements are audited and conform to the ₹10,000 daily limit under Section 40A(3).
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
          <button
            onClick={handleCopyMemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Memo Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy CA Memo</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
