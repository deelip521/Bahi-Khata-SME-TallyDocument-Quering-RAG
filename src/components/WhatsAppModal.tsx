import React, { useState, useEffect } from 'react';
import { X, Copy, Check, MessageCircle, ExternalLink, AlertTriangle, ShieldAlert, Sparkles, Edit3 } from 'lucide-react';
import { BahiKhataAccount, CompanyProfile, TallyVoucher } from '../types/tally';
import { generateWhatsAppReminder, formatInr } from '../services/ragEngine';

interface WhatsAppModalProps {
  account: BahiKhataAccount | null;
  company: CompanyProfile;
  vouchers?: TallyVoucher[];
  isOpen: boolean;
  onClose: () => void;
  themeMode: 'tally' | 'bahikhata';
}

type ReminderTemplateType = 'standard' | 'overdue' | 'credit_limit' | 'urgent';

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  account,
  company,
  vouchers = [],
  isOpen,
  onClose,
  themeMode,
}) => {
  if (!isOpen || !account) return null;
  const isBahi = themeMode === 'bahikhata';

  // Debtor analysis
  const creditLimit = account.creditLimit || 200000;
  const isCreditLimitExceeded = account.currentBalance > creditLimit;
  const excessCredit = Math.max(0, account.currentBalance - creditLimit);

  // Vouchers for this party
  const partyVouchers = vouchers.filter(
    (v) => v.partyName.toLowerCase() === account.partyName.toLowerCase()
  );
  const overdueSalesVouchers = partyVouchers.filter(
    (v) =>
      v.voucherType === 'Sales' &&
      (v.paymentStatus === 'Unpaid' || v.paymentStatus === 'Partially Paid') &&
      ((v.daysOverdue && v.daysOverdue > 0) || (v.dueDate && new Date(v.dueDate) < new Date()))
  );
  const maxOverdueDays = Math.max(0, ...partyVouchers.map((v) => v.daysOverdue || 0));
  const oldestOverdueBill = overdueSalesVouchers.sort(
    (a, b) => (b.daysOverdue || 0) - (a.daysOverdue || 0)
  )[0];

  // Determine initial template based on debtor flags
  const initialTemplate: ReminderTemplateType = isCreditLimitExceeded
    ? 'credit_limit'
    : maxOverdueDays > 0
    ? 'overdue'
    : 'standard';

  const [selectedTemplate, setSelectedTemplate] = useState<ReminderTemplateType>(initialTemplate);
  const [reminderText, setReminderText] = useState('');
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Regenerate message whenever account, company, or selected template changes
  useEffect(() => {
    const text = generateWhatsAppReminder(account, company, selectedTemplate, {
      overdueDays: maxOverdueDays,
      creditLimit: creditLimit,
      overdueBillNo: oldestOverdueBill?.voucherNumber,
      excessAmount: excessCredit,
    });
    setReminderText(text);
  }, [account, company, selectedTemplate, maxOverdueDays, creditLimit, excessCredit, oldestOverdueBill]);

  const handleCopy = () => {
    navigator.clipboard.writeText(reminderText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const cleanPhone = account.phone ? account.phone.replace(/[^0-9]/g, '') : '';
    const encodedText = encodeURIComponent(reminderText);
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodedText}`
      : `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl rounded-2xl border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden ${
          isBahi ? 'bg-[#fdfbf7] border-amber-300' : 'bg-white border-slate-200'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700/80 flex items-center justify-center border border-emerald-600">
              <MessageCircle className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                WhatsApp Payment Reminder
                {(isCreditLimitExceeded || maxOverdueDays > 0) && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/90 text-white">
                    Flagged Debtor
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-emerald-200/90 font-medium">
                Munimji Collection Desk &amp; Instant Dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-emerald-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Debtor Profile Bar with Flag Highlights */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-start justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Party Name</span>
                <span className="font-bold text-slate-800 text-sm">{account.partyName}</span>
                {account.phone && (
                  <span className="text-slate-600 font-mono block text-[11px] mt-0.5">
                    📱 {account.phone}
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[11px]">Total Outstanding (Receivable)</span>
                <span className="font-bold font-mono text-red-700 text-base tabular-nums">
                  {formatInr(account.currentBalance)}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Limit: {formatInr(creditLimit)}
                </span>
              </div>
            </div>

            {/* Violation warnings */}
            {(isCreditLimitExceeded || maxOverdueDays > 0) && (
              <div className="pt-2 border-t border-slate-200/80 flex flex-wrap gap-2 text-[11px]">
                {isCreditLimitExceeded && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-100 text-red-800 font-semibold border border-red-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    Credit Limit Exceeded by {formatInr(excessCredit)}
                  </span>
                )}
                {maxOverdueDays > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 font-semibold border border-amber-200">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                    {maxOverdueDays} Days Past Due Date
                    {oldestOverdueBill && ` (Bill: ${oldestOverdueBill.voucherNumber})`}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Template Selector Segment */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Select Notification Template:
              </span>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-[11px] text-teal-700 hover:text-teal-900 font-medium flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                {isEditing ? 'Done Editing' : 'Edit Message'}
              </button>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSelectedTemplate('standard')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                  selectedTemplate === 'standard'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Polite Reminder
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('overdue')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                  selectedTemplate === 'overdue'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                }`}
              >
                Overdue Notice {maxOverdueDays > 0 ? `(${maxOverdueDays}d)` : ''}
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('credit_limit')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                  selectedTemplate === 'credit_limit'
                    ? 'bg-red-700 text-white border-red-700 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-red-50'
                }`}
              >
                Credit Limit Hold
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('urgent')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                  selectedTemplate === 'urgent'
                    ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-purple-50'
                }`}
              >
                Final Notice
              </button>
            </div>
          </div>

          {/* Formatted Text Preview / Editor */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              WhatsApp Message Preview
            </label>
            {isEditing ? (
              <textarea
                value={reminderText}
                onChange={(e) => setReminderText(e.target.value)}
                rows={9}
                className="w-full p-3.5 rounded-xl border border-slate-300 bg-white text-xs font-mono text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 shadow-inner resize-y"
              />
            ) : (
              <div className="p-3.5 rounded-xl border border-emerald-200/80 bg-emerald-50/40 text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto shadow-inner select-text">
                {reminderText}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          <button
            onClick={handleSendWhatsApp}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md hover:scale-[1.02]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Send via WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
