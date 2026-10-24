import React from 'react';
import {
  Building2,
  FileSpreadsheet,
  FolderLock,
  Search,
  ShieldCheck,
  CheckCircle2,
  X,
  ArrowRight,
  BookOpen,
  Layers,
  Sparkles,
  Lock,
} from 'lucide-react';

interface MultiCompanyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
  themeMode: 'tally' | 'bahikhata';
}

export const MultiCompanyGuideModal: React.FC<MultiCompanyGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenRegister,
  themeMode,
}) => {
  const isBahi = themeMode === 'bahikhata';

  if (!isOpen) return null;

  const guideSteps = [
    {
      step: '1',
      title: 'Company Registration & Entity Structuring',
      badge: 'Legal & Tax Setup',
      icon: <Building2 className="w-5 h-5 text-teal-400" />,
      summary: 'Register multiple sister entities, LLPs, or proprietorships under your business group.',
      details: [
        'Each entity has its own legal name, trade name, and constitution (Pvt Ltd, LLP, Partnership, Sole Proprietorship).',
        'State-specific GSTIN (e.g. 24 for Gujarat, 27 for Maharashtra) and 10-digit PAN are automatically validated.',
        'MSME Udyam registration is recorded to automate Section 43B(h) 45-day payment tracking for supplier payments.',
        'Independent bank accounts, IFSC codes, and UPI VPAs ensure invoicing settlements do not co-mingle.',
      ],
    },
    {
      step: '2',
      title: 'Separate Document Vaults per Company',
      badge: 'Independent Ingestion',
      icon: <FileSpreadsheet className="w-5 h-5 text-blue-400" />,
      summary: 'Store and organize accounting source documents separately for every company.',
      details: [
        'Every company has its own isolated vault (e.g., comp-001, comp-002) storing Tally XML files, CSV Daybooks, and invoices.',
        'When you upload a Tally XML export, all extracted vouchers are stamped with the active company ID.',
        'Source documents can be audited, re-indexed, or removed independently without affecting any sister firm.',
        'Full compatibility with Tally ERP 9, Tally Prime Gold, and standard accounting spreadsheets.',
      ],
    },
    {
      step: '3',
      title: 'Strict Data Isolation & Zero-Leakage Architecture',
      badge: 'Statutory Segregation',
      icon: <FolderLock className="w-5 h-5 text-emerald-400" />,
      summary: 'Guaranteed accounting partition preventing any accidental cross-entity ledger spillover.',
      details: [
        'Under Indian MCA Rule 3 and GST laws, sister companies cannot co-mingle double-entry daybooks.',
        'Bahi-Khata enforces partition keys on local and server databases: Daybooks, ledgers, vouchers, and receivables/payables are strictly isolated.',
        'Switching from Company A to Company B completely unloads Company A’s ledgers from active memory.',
        'Separate audit logs, cash balances, and GST GSTR-1/3B calculations are maintained per company.',
      ],
    },
    {
      step: '4',
      title: 'Company-Scoped RAG Intelligence Engine',
      badge: 'Targeted Retrieval',
      icon: <Search className="w-5 h-5 text-purple-400" />,
      summary: 'Natural language queries over Tally documents strictly bound to the active company.',
      details: [
        'When you ask an accounting question, the hybrid BM25 lexical + semantic search only indexes the active company’s documents.',
        'Gemini RAG receives the company’s specific GSTIN, trade name, and isolated voucher records in its context window.',
        'Citations reference only vouchers belonging to the selected company (e.g. [SAL/CS/24-25/081]).',
        'Audit observations highlight entity-specific statutory risks (Section 43B(h) MSME overdues, Section 40A(3) cash limit breaches).',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div
        className={`w-full max-w-4xl rounded-2xl border shadow-2xl relative my-auto animate-in fade-in zoom-in-95 ${
          isBahi ? 'bg-[#fffefb] border-amber-300 text-stone-900' : 'bg-slate-900 border-slate-700 text-white'
        }`}
      >
        {/* Header */}
        <div
          className={`p-5 sm:p-6 border-b flex items-start justify-between ${
            isBahi ? 'bg-amber-100/50 border-amber-200' : 'bg-slate-950/80 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl border ${
                isBahi ? 'bg-amber-200 text-red-950 border-amber-300 font-serif' : 'bg-teal-950 text-teal-400 border-teal-800'
              }`}
            >
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                    isBahi ? 'bg-red-900 text-amber-100' : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  }`}
                >
                  Step-by-Step Architecture Guide
                </span>
                <span className="text-xs text-slate-400">MCA &amp; GST Compliant</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
                Multi-Company Bahi-Khata Architecture
              </h2>
              <p className="text-xs text-slate-400">
                How company registration, separate document vaults, data isolation, and RAG function together.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Quick Summary Pill */}
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 ${
              isBahi ? 'bg-amber-50/70 border-amber-200 text-stone-800' : 'bg-slate-800/60 border-slate-700 text-slate-300'
            }`}
          >
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div className="text-xs leading-relaxed">
              <strong className="text-white block mb-0.5">Zero-Leakage Multi-Entity Security Guarantee</strong>
              Each sister company operates in a strictly isolated data chamber. When you switch companies in the top navigation, Bahi-Khata switches the active document vault, isolated daybooks, and RAG knowledge base in real-time.
            </div>
          </div>

          {/* 4 Interactive Guide Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {guideSteps.map((step) => (
              <div
                key={step.step}
                className={`p-4 rounded-xl border space-y-2.5 transition-all ${
                  isBahi
                    ? 'bg-white border-amber-200 shadow-xs'
                    : 'bg-slate-800/80 border-slate-700 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 font-bold text-xs flex items-center justify-center border border-teal-500/30">
                      {step.step}
                    </span>
                    <span className="text-xs font-bold text-white">{step.title}</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                    {step.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-400 font-medium">{step.summary}</p>

                <ul className="space-y-1.5 pt-1 text-[11px] text-slate-300">
                  {step.details.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
            isBahi ? 'bg-amber-100/30 border-amber-200' : 'bg-slate-950/60 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[11px]">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Partition Protocol: MCA Rule 3 Immutability &amp; Tenant Partitioning</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
            >
              Close Guide
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenRegister();
              }}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-1.5 shadow-md shadow-teal-950/40"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Register New Sister Entity</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
