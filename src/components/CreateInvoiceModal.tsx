import React, { useState } from 'react';
import { X, Plus, Receipt, CheckCircle2, Calculator } from 'lucide-react';
import { TallyVoucher, BahiKhataAccount, CompanyProfile } from '../types/tally';
import { formatInr } from '../services/ragEngine';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveInvoice: (voucher: TallyVoucher) => void;
  accounts: BahiKhataAccount[];
  company: CompanyProfile;
  themeMode: 'tally' | 'bahikhata';
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  onClose,
  onSaveInvoice,
  accounts,
  company,
  themeMode,
}) => {
  if (!isOpen) return null;
  const isBahi = themeMode === 'bahikhata';

  const debtors = accounts.filter((a) => a.partyType === 'Sundry Debtor');

  const [partyName, setPartyName] = useState(debtors[0]?.partyName || 'Ramesh Enterprises');
  const [customParty, setCustomParty] = useState('');
  const [isNewParty, setIsNewParty] = useState(false);
  const [voucherNumber, setVoucherNumber] = useState(`SAL/24-25/${Math.floor(115 + Math.random() * 50)}`);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [taxableAmount, setTaxableAmount] = useState<number>(50000);
  const [gstRate, setGstRate] = useState<number>(5);
  const [isInterState, setIsInterState] = useState<boolean>(false);
  const [hsnCode, setHsnCode] = useState('0909');
  const [narration, setNarration] = useState('Sales of premium spices against customer purchase order. Credit 30 days.');

  // Calculations
  const taxAmount = (taxableAmount * gstRate) / 100;
  const cgst = isInterState ? 0 : taxAmount / 2;
  const sgst = isInterState ? 0 : taxAmount / 2;
  const igst = isInterState ? taxAmount : 0;
  const totalInvoiceAmount = taxableAmount + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPartyName = isNewParty && customParty.trim() ? customParty.trim() : partyName;

    const newVoucher: TallyVoucher = {
      id: `VCH-SAL-${Date.now()}`,
      voucherNumber,
      date,
      voucherType: 'Sales',
      partyName: finalPartyName,
      amount: totalInvoiceAmount,
      narration: narration || `Sales invoice ${voucherNumber} to ${finalPartyName}`,
      docSource: 'Tally_Manual_Invoice_Entry.xml',
      debitEntries: [
        {
          ledger: `${finalPartyName} (Debtor)`,
          amount: totalInvoiceAmount,
          type: 'Dr',
          isParty: true,
        },
      ],
      creditEntries: [
        {
          ledger: `Sales Account (${gstRate}%)`,
          amount: taxableAmount,
          type: 'Cr',
        },
        ...(isInterState
          ? [{ ledger: `Output IGST @ ${gstRate}%`, amount: igst, type: 'Cr' as const }]
          : [
              { ledger: `Output CGST @ ${gstRate / 2}%`, amount: cgst, type: 'Cr' as const },
              { ledger: `Output SGST @ ${gstRate / 2}%`, amount: sgst, type: 'Cr' as const },
            ]),
      ],
      gst: {
        cgst,
        sgst,
        igst,
        ratePercent: gstRate,
        hsnCode,
        eWayBillNo: totalInvoiceAmount >= 50000 ? `2418${Math.floor(10000000 + Math.random() * 90000000)}` : undefined,
      },
      paymentStatus: 'Unpaid',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      daysOverdue: 0,
      isMsme: false,
    };

    onSaveInvoice(newVoucher);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className={`w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl border shadow-xl flex flex-col ${
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
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">
              Create Tally Sales Invoice (Sales - F8)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 flex-1 text-xs">
          {/* Voucher No & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Invoice / Voucher No.
              </label>
              <input
                type="text"
                required
                value={voucherNumber}
                onChange={(e) => setVoucherNumber(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Invoice Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>
          </div>

          {/* Party Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700">
                Customer / Debtor Party
              </label>
              <button
                type="button"
                onClick={() => setIsNewParty(!isNewParty)}
                className="text-teal-700 hover:underline font-medium"
              >
                {isNewParty ? 'Select Existing' : '+ Add New Party'}
              </button>
            </div>

            {isNewParty ? (
              <input
                type="text"
                required
                placeholder="Enter new customer party name (e.g. Mahavir Textiles, Surat)"
                value={customParty}
                onChange={(e) => setCustomParty(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 bg-white"
              />
            ) : (
              <select
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 bg-white"
              >
                {debtors.map((d) => (
                  <option key={d.partyName} value={d.partyName}>
                    {d.partyName} ({d.city || 'Gujarat'}) — Bal: {formatInr(d.currentBalance)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Taxable Amount, GST Rate, Inter-State */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Taxable Goods Value (₹)
              </label>
              <input
                type="number"
                min="100"
                step="100"
                required
                value={taxableAmount}
                onChange={(e) => setTaxableAmount(Number(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                GST Tax Rate Slab
              </label>
              <select
                value={gstRate}
                onChange={(e) => setGstRate(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value={0}>0% (Exempt)</option>
                <option value={5}>5% (Textiles / Spices)</option>
                <option value={12}>12% (Processed Goods)</option>
                <option value={18}>18% (Standard / Services)</option>
                <option value={28}>28% (Luxury)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                HSN / SAC Code
              </label>
              <input
                type="text"
                value={hsnCode}
                onChange={(e) => setHsnCode(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>
          </div>

          {/* Inter-State Supply Checkbox */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <input
              type="checkbox"
              id="interStateCheck"
              checked={isInterState}
              onChange={(e) => setIsInterState(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
            />
            <label htmlFor="interStateCheck" className="text-slate-800 font-medium cursor-pointer">
              Inter-State Supply (Apply IGST instead of CGST + SGST)
            </label>
          </div>

          {/* Tax Summary Calculation Box */}
          <div className="p-3.5 rounded-lg bg-teal-50/60 border border-teal-200 space-y-1.5 font-mono">
            <div className="flex justify-between text-slate-600">
              <span>Taxable Value:</span>
              <span>{formatInr(taxableAmount)}</span>
            </div>
            {!isInterState ? (
              <>
                <div className="flex justify-between text-slate-600">
                  <span>Output CGST ({gstRate / 2}%):</span>
                  <span>{formatInr(cgst)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Output SGST ({gstRate / 2}%):</span>
                  <span>{formatInr(sgst)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-slate-600">
                <span>Output IGST ({gstRate}%):</span>
                <span>{formatInr(igst)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-slate-900 pt-1.5 border-t border-teal-200 text-sm">
              <span>Total Gross Invoice:</span>
              <span className="text-teal-900">{formatInr(totalInvoiceAmount)}</span>
            </div>
          </div>

          {/* Narration */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Narration / Remarks
            </label>
            <input
              type="text"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 bg-white"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Post Invoice to Daybook</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
