import React, { useState } from 'react';
import {
  FileText,
  Upload,
  ShieldCheck,
  CheckCircle2,
  X,
  FileSpreadsheet,
  Calendar,
  Lock,
  Layers,
  Sparkles,
  Download,
  Trash2,
  FolderLock,
  Building2,
} from 'lucide-react';
import { CompanyProfile, RegisteredDocument } from '../types/tally';

interface CompanyDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyProfile;
  documents: RegisteredDocument[];
  onUploadNew: () => void;
  onDeleteDocument: (docId: string) => void;
  themeMode: 'tally' | 'bahikhata';
}

export const CompanyDocumentsModal: React.FC<CompanyDocumentsModalProps> = ({
  isOpen,
  onClose,
  company,
  documents,
  onUploadNew,
  onDeleteDocument,
  themeMode,
}) => {
  const isBahi = themeMode === 'bahikhata';

  if (!isOpen) return null;

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
                isBahi ? 'bg-amber-200 text-red-950 border-amber-300' : 'bg-teal-950 text-teal-400 border-teal-800'
              }`}
            >
              <FolderLock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Vault ID: {company.id}
                </span>
                <span className="text-xs text-slate-400">
                  GSTIN: <strong className="font-mono text-white">{company.gstin}</strong>
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
                Separate Document Vault: {company.tradeName}
              </h2>
              <p className="text-xs text-slate-400">
                Accounting source files stored and indexed exclusively for this entity.
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

        {/* Security & Isolation Banner */}
        <div
          className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
            isBahi ? 'bg-amber-50/70 border-amber-200 text-stone-800' : 'bg-slate-800/40 border-slate-800 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white">Strict Multi-Tenant Isolation Active</span>
              <p className="text-[11px] text-slate-400">
                Documents in this vault are strictly separated. The RAG engine will never cross-query or leak records into sister companies.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              onUploadNew();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 ${
              isBahi
                ? 'bg-red-900 hover:bg-red-800 text-amber-50'
                : 'bg-teal-600 hover:bg-teal-500 text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Ingest Document</span>
          </button>
        </div>

        {/* Documents Table */}
        <div className="p-6">
          {documents.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-700/60 rounded-xl space-y-3">
              <FileText className="w-10 h-10 text-slate-500 mx-auto" />
              <div className="text-sm font-bold text-slate-300">
                No Documents Ingested for {company.tradeName} Yet
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Upload your Tally ERP 9 Daybook XML, GST Invoice CSV, or Bank Statement to index records into this company's isolated RAG knowledge base.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onUploadNew();
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white inline-flex items-center gap-2"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload First Document</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                <span>{documents.length} Isolated Source Documents in Vault</span>
                <span className="font-mono">Total Indexed Vouchers: {documents.reduce((acc, d) => acc + d.voucherCount, 0)}</span>
              </div>

              <div className="space-y-2.5">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      isBahi
                        ? 'bg-white border-amber-200 hover:border-amber-300'
                        : 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                          doc.fileType === 'Tally XML'
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white">{doc.fileName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-white/10 text-slate-300">
                            {doc.fileType}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {doc.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{doc.parsedSummary}</p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1 font-mono">
                          <span>Uploaded: {doc.uploadDate}</span>
                          <span>·</span>
                          <span>Size: {doc.fileSize}</span>
                          <span>·</span>
                          <span className="text-teal-400 font-semibold">{doc.voucherCount} Vouchers Extracted</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => onDeleteDocument(doc.id)}
                        title="Delete document from vault"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t flex items-center justify-between text-xs ${
            isBahi ? 'bg-amber-100/30 border-amber-200' : 'bg-slate-950/60 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[11px]">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Vault Partition Key: <strong>{company.id}</strong> (Encrypted at rest)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
          >
            Close Vault
          </button>
        </div>
      </div>
    </div>
  );
};
