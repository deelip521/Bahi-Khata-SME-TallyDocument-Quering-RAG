import React, { useState } from 'react';
import { X, WalletCards, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { TallyVoucher, CompanyProfile } from '../types/tally';
import { formatInr } from '../services/ragEngine';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExpense: (voucher: TallyVoucher) => void;
  company: CompanyProfile;
  themeMode: 'tally' | 'bahikhata';
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSaveExpense,
  company,
  themeMode,
}) => {
  if (!isOpen) return null;
  const isBahi = themeMode === 'bahikhata';

  const expenseCategories = [
    'Freight, Hamali & Cartage Expenses',
    'Godown Power & Electricity Expense',
    'Shop & Office Rent Expense',
    'Packaging & Corrugated Boxes Expense',
    'Staff Wages & Refreshments',
    'Vehicle Fuel & Delivery Logistics',
    'Printing, Stationery & Postage',
    'Audit & Legal Consultation Fees',
    'Miscellaneous Trade Expenses',
  ];

  const [category, setCategory] = useState(expenseCategories[0]);
  const [payeeName, setPayeeName] = useState('Local Transport / Vendor');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Bank'>('Cash');
  const [amount, setAmount] = useState<number>(4500);
  const [voucherNumber, setVoucherNumber] = useState(`PAY/24-25/${Math.floor(70 + Math.random() * 40)}`);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [narration, setNarration] = useState('Paid in cash towards daily trade logistics and cartage.');

  // Section 40A(3) detection: Cash payments over ₹10,000 to a single person/day
  const isSection40aViolation = paymentMode === 'Cash' && amount > 10000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const creditLedger =
      paymentMode === 'Cash'
        ? 'Cash in Hand (तिजोरी / रोकड़)'
        : 'HDFC Bank Current Account';

    const newVoucher: TallyVoucher = {
      id: `VCH-PAY-${Date.now()}`,
      voucherNumber,
      date,
      voucherType: 'Payment',
      partyName: payeeName || category,
      amount,
      narration: narration || `Paid ${formatInr(amount)} for ${category}`,
      docSource: 'Tally_Manual_Payment_Entry.xml',
      debitEntries: [
        {
          ledger: category,
          amount,
          type: 'Dr',
        },
      ],
      creditEntries: [
        {
          ledger: creditLedger,
          amount,
          type: 'Cr',
        },
      ],
      paymentStatus: 'Paid',
    };

    onSaveExpense(newVoucher);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border shadow-xl flex flex-col ${
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
            <WalletCards className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              Record Business Expense (Payment - F5)
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
                Voucher No.
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
                Payment Date
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

          {/* Expense Head */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Expense Account Head
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 bg-white"
            >
              {expenseCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Payee Name */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Paid To (Payee Name)
            </label>
            <input
              type="text"
              required
              value={payeeName}
              onChange={(e) => setPayeeName(e.target.value)}
              placeholder="e.g. Maruti Transporters, Ramu Hamali, Torrent Power"
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 bg-white"
            />
          </div>

          {/* Amount & Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                min="10"
                step="10"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Payment Source
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as 'Cash' | 'Bank')}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 bg-white font-medium"
              >
                <option value="Cash">Cash in Hand</option>
                <option value="Bank">HDFC Bank Current Account</option>
              </select>
            </div>
          </div>

          {/* Section 40A(3) Warning Alert */}
          {isSection40aViolation ? (
            <div className="p-3 rounded-lg bg-red-50 border border-red-300 text-red-950 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">
                  Statutory Alert: Section 40A(3) Breach!
                </span>
                <p className="text-[11px] text-red-900 mt-0.5">
                  Cash payment of {formatInr(amount)} exceeds the statutory ₹10,000 threshold. Under
                  Section 40A(3) of the Income Tax Act, this entire expense will be disallowed during
                  tax audit unless paid via Account Payee Cheque / NEFT / RTGS.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-between">
              <span>Section 40A(3) Compliance:</span>
              <span className="font-bold text-emerald-700 font-mono">
                {paymentMode === 'Cash' ? 'Cash < ₹10k (OK)' : 'Bank Transfer (Exempt)'}
              </span>
            </div>
          )}

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
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Expense (F5)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
