import React, { useState, useEffect } from 'react';
import {
  Plus,
  X,
  Receipt,
  WalletCards,
  FileCheck2,
  Sparkles,
  Zap,
} from 'lucide-react';

interface FloatingQuickActionsProps {
  onTriggerCreateInvoice: () => void;
  onTriggerAddExpense: () => void;
  onTriggerGenerateGstReport: () => void;
  themeMode: 'tally' | 'bahikhata';
}

export const FloatingQuickActions: React.FC<FloatingQuickActionsProps> = ({
  onTriggerCreateInvoice,
  onTriggerAddExpense,
  onTriggerGenerateGstReport,
  themeMode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isBahi = themeMode === 'bahikhata';

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleAction = (callback: () => void) => {
    setIsOpen(false);
    callback();
  };

  return (
    <>
      {/* Backdrop overlay when speed-dial is expanded */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-2xs transition-opacity"
        />
      )}

      {/* Floating Speed-Dial Container */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {/* Expanded Action Menu Items */}
        {isOpen && (
          <div className="mb-3 flex flex-col items-end space-y-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
            {/* Action 1: Create Invoice */}
            <button
              onClick={() => handleAction(onTriggerCreateInvoice)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border shadow-lg transition-all text-left group hover:scale-[1.02] ${
                isBahi
                  ? 'bg-[#fffefb] border-amber-300 text-stone-900 hover:border-red-600'
                  : 'bg-white border-slate-200 text-slate-900 hover:border-teal-500'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold flex items-center gap-1.5 text-slate-900">
                  <span>Create Invoice</span>
                  <span className="font-mono text-[10px] px-1 py-0.2 bg-blue-100 text-blue-800 rounded">
                    Sales F8
                  </span>
                </span>
                <span className="text-[11px] text-slate-500">
                  Generate customer GST tax invoice
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Receipt className="w-4 h-4" />
              </div>
            </button>

            {/* Action 2: Add Expense */}
            <button
              onClick={() => handleAction(onTriggerAddExpense)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border shadow-lg transition-all text-left group hover:scale-[1.02] ${
                isBahi
                  ? 'bg-[#fffefb] border-amber-300 text-stone-900 hover:border-red-600'
                  : 'bg-white border-slate-200 text-slate-900 hover:border-teal-500'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold flex items-center gap-1.5 text-slate-900">
                  <span>Add Expense</span>
                  <span className="font-mono text-[10px] px-1 py-0.2 bg-amber-100 text-amber-800 rounded">
                    Payment F5
                  </span>
                </span>
                <span className="text-[11px] text-slate-500">
                  Record cash/bank trade payment
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <WalletCards className="w-4 h-4" />
              </div>
            </button>

            {/* Action 3: Generate GST Report */}
            <button
              onClick={() => handleAction(onTriggerGenerateGstReport)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border shadow-lg transition-all text-left group hover:scale-[1.02] ${
                isBahi
                  ? 'bg-[#fffefb] border-amber-300 text-stone-900 hover:border-red-600'
                  : 'bg-white border-slate-200 text-slate-900 hover:border-teal-500'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold flex items-center gap-1.5 text-slate-900">
                  <span>Generate GST Report</span>
                  <span className="font-mono text-[10px] px-1 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                    CA Audit
                  </span>
                </span>
                <span className="text-[11px] text-slate-500">
                  GSTR-1 &amp; 3B reconciliation report
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <FileCheck2 className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}

        {/* Primary FAB Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Quick Actions Menu"
          aria-expanded={isOpen}
          className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-xl transition-all duration-200 font-semibold text-xs active:scale-95 ${
            isOpen
              ? 'bg-slate-900 hover:bg-slate-800 text-white'
              : isBahi
              ? 'bg-[#b91c1c] hover:bg-[#991b1b] text-amber-100 ring-2 ring-amber-300/60 shadow-red-950/30'
              : 'bg-teal-600 hover:bg-teal-700 text-white ring-2 ring-teal-400/40 shadow-teal-900/30'
          }`}
        >
          {isOpen ? (
            <>
              <X className="w-4 h-4" />
              <span>Close</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Quick Actions</span>
            </>
          )}
        </button>
      </div>
    </>
  );
};
