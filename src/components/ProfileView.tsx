import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  ShieldCheck,
  Edit3,
  Check,
  Save,
  RotateCcw,
  FileText,
  Briefcase,
  QrCode,
  Landmark,
  CheckCircle2,
  FolderLock,
  PlusCircle,
  ChevronRight,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { CompanyProfile, EntityType } from '../types/tally';

interface ProfileViewProps {
  company: CompanyProfile;
  companies: CompanyProfile[];
  onUpdateCompany: (updated: CompanyProfile) => void;
  onSelectCompany: (companyId: string) => void;
  onOpenRegisterCompany: () => void;
  onOpenCompanyDocuments: () => void;
  themeMode: 'tally' | 'bahikhata';
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  company,
  companies,
  onUpdateCompany,
  onSelectCompany,
  onOpenRegisterCompany,
  onOpenCompanyDocuments,
  themeMode,
}) => {
  const isBahi = themeMode === 'bahikhata';

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CompanyProfile>(company);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync formData when company prop changes
  React.useEffect(() => {
    setFormData(company);
    setIsEditing(false);
  }, [company.id]);

  const handleChange = (field: keyof CompanyProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBankChange = (field: keyof CompanyProfile['bankDetails'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [field]: value,
      },
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCompany(formData);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCancel = () => {
    setFormData(company);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner: Active Entity Card */}
      <div
        className={`p-6 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isBahi ? 'bg-[#fffefb] border-amber-300' : 'bg-white border-slate-200'
        } shadow-xs`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl shrink-0 border ${
              isBahi
                ? 'bg-amber-100 text-red-950 border-amber-300 font-serif'
                : 'bg-teal-50 text-teal-700 border-teal-200 font-mono'
            }`}
          >
            {company.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {company.name}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                GST Active
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {company.entityType || 'Registered SME'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
                Vault: {company.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Trade Name: <strong>{company.tradeName}</strong> · GSTIN:{' '}
              <span className="font-mono">{company.gstin}</span> · FY {company.financialYear} · {company.industryType || 'Trading'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {savedSuccess && (
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 animate-in fade-in">
              <Check className="w-4 h-4" /> Changes Saved
            </span>
          )}

          <button
            onClick={onOpenCompanyDocuments}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
          >
            <FolderLock className="w-3.5 h-3.5 text-teal-600" />
            <span>Document Vault</span>
          </button>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Company</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Company</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sister Entities Portfolio Overview */}
      <div
        className={`p-6 rounded-xl border ${
          isBahi ? 'bg-[#fffefb] border-amber-200' : 'bg-white border-slate-200'
        } shadow-xs space-y-4`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Sister Companies Portfolio ({companies.length} Entities)
            </h3>
          </div>

          <button
            onClick={onOpenRegisterCompany}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Register New Sister Entity</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {companies.map((c) => {
            const isActive = c.id === company.id;
            return (
              <div
                key={c.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isActive
                    ? 'bg-teal-50/50 border-teal-300 ring-1 ring-teal-500/20'
                    : 'bg-slate-50/60 hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded font-mono bg-white border border-slate-200 text-slate-700">
                      {c.entityType ? c.entityType.split(' ')[0] : 'Entity'}
                    </span>
                    {isActive ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-600 text-white flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <button
                        onClick={() => onSelectCompany(c.id)}
                        className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-0.5"
                      >
                        <span>Switch</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{c.name}</h4>
                  <div className="text-[11px] text-slate-500 font-mono mt-1">GSTIN: {c.gstin}</div>
                  <div className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                    {c.industryType || 'General SME Trading'}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{c.city}, {c.state}</span>
                  <span className="font-mono text-teal-700 font-medium">Vault: {c.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Profile Details (View / Edit Form) */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Business Identity & Tax Registration */}
        <div
          className={`p-6 rounded-xl border ${
            isBahi ? 'bg-[#fffefb] border-amber-200' : 'bg-white border-slate-200'
          } shadow-xs space-y-4`}
        >
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Business Identity &amp; Tax Registration
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-500 font-medium block mb-1">Legal Company Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-teal-500"
                />
              ) : (
                <span className="font-semibold text-slate-900 block">{company.name}</span>
              )}
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">Trade / Display Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.tradeName}
                  onChange={(e) => handleChange('tradeName', e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-teal-500"
                />
              ) : (
                <span className="font-semibold text-slate-900 block">{company.tradeName}</span>
              )}
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">Entity Structure</label>
              {isEditing ? (
                <select
                  value={formData.entityType || 'Private Limited'}
                  onChange={(e) => handleChange('entityType', e.target.value as EntityType)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Private Limited">Private Limited</option>
                  <option value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</option>
                  <option value="Partnership Firm">Partnership Firm</option>
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                  <option value="Public Limited">Public Limited</option>
                </select>
              ) : (
                <span className="font-semibold text-slate-900 block">{company.entityType || 'Partnership'}</span>
              )}
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">Industry Sector</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.industryType || ''}
                  onChange={(e) => handleChange('industryType', e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                />
              ) : (
                <span className="font-medium text-slate-900 block">{company.industryType || 'General SME'}</span>
              )}
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">GSTIN Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-teal-500"
                />
              ) : (
                <span className="font-mono font-bold text-slate-900 block">{company.gstin}</span>
              )}
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">Income Tax PAN</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.pan}
                  onChange={(e) => handleChange('pan', e.target.value.toUpperCase())}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-teal-500"
                />
              ) : (
                <span className="font-mono font-bold text-slate-900 block">{company.pan}</span>
              )}
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">MSME Udyam Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.udyamNumber}
                  onChange={(e) => handleChange('udyamNumber', e.target.value.toUpperCase())}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-teal-500"
                />
              ) : (
                <span className="font-mono font-semibold text-slate-900 block">{company.udyamNumber}</span>
              )}
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">GST Registration Type</label>
              {isEditing ? (
                <select
                  value={formData.gstRegistrationType}
                  onChange={(e) => handleChange('gstRegistrationType', e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Regular Taxpayer">Regular Taxpayer</option>
                  <option value="Composition Scheme">Composition Scheme</option>
                  <option value="Special Economic Zone (SEZ)">SEZ Unit</option>
                </select>
              ) : (
                <span className="font-semibold text-slate-900 block">{company.gstRegistrationType}</span>
              )}
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">CIN / LLPIN</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.cinNumber || ''}
                  onChange={(e) => handleChange('cinNumber', e.target.value)}
                  placeholder="e.g. U01110GJ2022PTC132984"
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-teal-500"
                />
              ) : (
                <span className="font-mono text-slate-900 block">{company.cinNumber || 'N/A'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Contact Details & Place of Business */}
        <div
          className={`p-6 rounded-xl border ${
            isBahi ? 'bg-[#fffefb] border-amber-200' : 'bg-white border-slate-200'
          } shadow-xs space-y-4`}
        >
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <MapPin className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Registered Place of Business &amp; Contact
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="text-slate-500 font-medium block mb-1">Registered Address</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                />
              ) : (
                <span className="font-medium text-slate-900 block">{company.address}</span>
              )}
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">City, State &amp; Pincode</label>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="City"
                    className="p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                  />
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => handleChange('pincode', e.target.value)}
                    placeholder="Pincode"
                    className="p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              ) : (
                <span className="font-semibold text-slate-900 block">
                  {company.city}, {company.state} - {company.pincode} (Code: {company.stateCode})
                </span>
              )}
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">Official Phone Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-teal-500"
                />
              ) : (
                <div className="flex items-center gap-1.5 font-mono text-slate-900 font-semibold">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{company.phone}</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">Registered Business Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                />
              ) : (
                <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{company.email}</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">Authorized Signatory</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.authorizedSignatory}
                  onChange={(e) => handleChange('authorizedSignatory', e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                />
              ) : (
                <span className="font-semibold text-slate-900 block">{company.authorizedSignatory}</span>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Bank & Settlement Information */}
        <div
          className={`p-6 rounded-xl border ${
            isBahi ? 'bg-[#fffefb] border-amber-200' : 'bg-white border-slate-200'
          } shadow-xs space-y-4`}
        >
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Landmark className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Bank Account &amp; Settlement Details (For Invoices &amp; Reminders)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="text-slate-500 font-medium block mb-1">Bank Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.bankDetails.bankName}
                  onChange={(e) => handleBankChange('bankName', e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                />
              ) : (
                <span className="font-bold text-slate-900 block">{company.bankDetails.bankName}</span>
              )}
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">Current Account Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.bankDetails.accountNumber}
                  onChange={(e) => handleBankChange('accountNumber', e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-teal-500"
                />
              ) : (
                <span className="font-mono font-bold text-slate-900 block">{company.bankDetails.accountNumber}</span>
              )}
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">IFSC Code</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.bankDetails.ifsc}
                  onChange={(e) => handleBankChange('ifsc', e.target.value.toUpperCase())}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-teal-500"
                />
              ) : (
                <span className="font-mono font-bold text-slate-900 block">{company.bankDetails.ifsc}</span>
              )}
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">UPI VPA (QR ID)</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.upiId}
                  onChange={(e) => handleChange('upiId', e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-teal-500"
                />
              ) : (
                <span className="font-mono font-bold text-teal-800 block">{company.upiId}</span>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Chartered Accountant & Tally ERP Settings */}
        <div
          className={`p-6 rounded-xl border ${
            isBahi ? 'bg-[#fffefb] border-amber-200' : 'bg-white border-slate-200'
          } shadow-xs space-y-4`}
        >
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Briefcase className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Statutory Auditor &amp; Tally Prime Integration Setup
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-500 font-medium block mb-1">Statutory Auditor (CA Firm)</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.caFirm}
                  onChange={(e) => handleChange('caFirm', e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                />
              ) : (
                <span className="font-semibold text-slate-900 block">{company.caFirm}</span>
              )}
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">CA Membership Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.caMembershipNumber}
                  onChange={(e) => handleChange('caMembershipNumber', e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-teal-500"
                />
              ) : (
                <span className="font-mono font-bold text-slate-900 block">{company.caMembershipNumber}</span>
              )}
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">Tally Prime Port &amp; Sync Status</label>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900">Port 9000</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Ready
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Save button if editing */}
        {isEditing && (
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-sm flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Company Profile Changes</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
