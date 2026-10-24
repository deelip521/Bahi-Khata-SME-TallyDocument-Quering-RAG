import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Landmark,
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Briefcase,
  AlertCircle,
  HelpCircle,
  FolderLock,
  Layers,
} from 'lucide-react';
import { CompanyProfile, EntityType } from '../types/tally';

interface CompanyRegistrationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCompanyRegistered: (newCompany: CompanyProfile) => void;
  themeMode: 'tally' | 'bahikhata';
}

export const CompanyRegistrationWizard: React.FC<CompanyRegistrationWizardProps> = ({
  isOpen,
  onClose,
  onCompanyRegistered,
  themeMode,
}) => {
  const isBahi = themeMode === 'bahikhata';

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Legal Identity
    name: '',
    tradeName: '',
    entityType: 'Private Limited' as EntityType,
    industryType: 'Trading & Manufacturing',
    cinNumber: '',

    // Step 2: Tax Registration
    gstin: '',
    pan: '',
    udyamNumber: '',
    gstRegistrationType: 'Regular Taxpayer',

    // Step 3: Address & Contact
    address: '',
    city: 'Ahmedabad',
    state: 'Gujarat',
    stateCode: '24',
    pincode: '380001',
    phone: '+91 79 ',
    email: '',
    authorizedSignatory: '',

    // Step 4: Banking & Auditor
    bankName: 'HDFC Bank Ltd',
    accountNumber: '',
    ifsc: 'HDFC0000006',
    branch: 'Main Commercial Branch',
    upiId: '',
    caFirm: 'M/s Chartered & Associates',
    caMembershipNumber: 'FCA-',

    // Step 5: Tally Prime & Accounting Defaults
    financialYear: '2024-2025',
    booksBeginningDate: '2024-04-01',
    createStarterLedgers: true,
  });

  if (!isOpen) return null;

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-extract PAN from GSTIN if 15 chars (chars 3 to 12)
      if (field === 'gstin' && value.length === 15) {
        updated.pan = value.slice(2, 12).toUpperCase();
        updated.stateCode = value.slice(0, 2);
      }
      return updated;
    });
    setErrorMessage('');
  };

  const handleFillSample = () => {
    const randomId = Math.floor(100 + Math.random() * 900);
    setFormData({
      name: `Ganesh Cotton & Agro Exports Pvt Ltd (Unit ${randomId})`,
      tradeName: `Ganesh Agro Exports ${randomId}`,
      entityType: 'Private Limited',
      industryType: 'Textile Processing & Agricultural Export',
      cinNumber: `U17120GJ2023PTC${randomId}42`,
      gstin: `24AAGCG${randomId}K1Z8`,
      pan: `AAGCG${randomId}K`,
      udyamNumber: `UDYAM-GJ-01-00${randomId}12`,
      gstRegistrationType: 'Regular Taxpayer',
      address: `Plot ${randomId}, Agro Processing Zone, Sanand Industrial Area`,
      city: 'Ahmedabad',
      state: 'Gujarat',
      stateCode: '24',
      pincode: '382110',
      phone: '+91 79 2656 4420',
      email: `finance@ganeshagro${randomId}.in`,
      authorizedSignatory: 'Vikas Patil (Director)',
      bankName: 'Axis Bank Ltd',
      accountNumber: `9230200${randomId}8914`,
      ifsc: 'UTIB0000042',
      branch: 'Sanand Branch, Ahmedabad',
      upiId: `ganeshagro${randomId}@axisbank`,
      caFirm: 'M/s N.K. Doshi & Co (Chartered Accountants)',
      caMembershipNumber: `FCA-0${randomId}20`,
      financialYear: '2024-2025',
      booksBeginningDate: '2024-04-01',
      createStarterLedgers: true,
    });
    setErrorMessage('');
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!formData.name.trim()) {
        setErrorMessage('Legal company name is required.');
        return false;
      }
      if (!formData.tradeName.trim()) {
        setErrorMessage('Trade / display name is required.');
        return false;
      }
    } else if (step === 2) {
      if (!formData.gstin.trim() || formData.gstin.trim().length !== 15) {
        setErrorMessage('A valid 15-character Indian GSTIN is required (e.g. 24AABCS1429B1Z2).');
        return false;
      }
      if (!formData.pan.trim() || formData.pan.trim().length !== 10) {
        setErrorMessage('A valid 10-character PAN is required.');
        return false;
      }
    } else if (step === 3) {
      if (!formData.address.trim()) {
        setErrorMessage('Registered address is required for invoicing compliance.');
        return false;
      }
      if (!formData.city.trim() || !formData.pincode.trim()) {
        setErrorMessage('City and pincode are required.');
        return false;
      }
    } else if (step === 4) {
      if (!formData.bankName.trim() || !formData.accountNumber.trim()) {
        setErrorMessage('Bank name and account number are required for settlement.');
        return false;
      }
      if (!formData.ifsc.trim()) {
        setErrorMessage('Bank IFSC code is required.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setErrorMessage('');
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setErrorMessage('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    const newCompanyId = `comp-${Date.now().toString().slice(-6)}`;
    const newCompany: CompanyProfile = {
      id: newCompanyId,
      name: formData.name.trim(),
      tradeName: formData.tradeName.trim(),
      entityType: formData.entityType,
      industryType: formData.industryType,
      cinNumber: formData.cinNumber.trim() || undefined,
      gstin: formData.gstin.trim().toUpperCase(),
      pan: formData.pan.trim().toUpperCase(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      stateCode: formData.stateCode.trim(),
      pincode: formData.pincode.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      financialYear: formData.financialYear,
      booksBeginningDate: formData.booksBeginningDate,
      udyamNumber: formData.udyamNumber.trim() || 'NOT-REGISTERED',
      gstRegistrationType: formData.gstRegistrationType,
      authorizedSignatory: formData.authorizedSignatory.trim() || 'Authorized Signatory',
      caFirm: formData.caFirm.trim() || 'Statutory Auditor Not Assigned',
      caMembershipNumber: formData.caMembershipNumber.trim() || 'N/A',
      upiId: formData.upiId.trim() || `${formData.tradeName.toLowerCase().replace(/\s+/g, '')}@upi`,
      bankDetails: {
        bankName: formData.bankName.trim(),
        accountNumber: formData.accountNumber.trim(),
        ifsc: formData.ifsc.trim().toUpperCase(),
        branch: formData.branch.trim(),
      },
      createdDate: new Date().toISOString().split('T')[0],
    };

    onCompanyRegistered(newCompany);
    onClose();
  };

  const steps = [
    { num: 1, title: 'Legal Identity', desc: 'Name & Entity Type' },
    { num: 2, title: 'Tax & GSTIN', desc: 'GST, PAN & MSME' },
    { num: 3, title: 'Business Place', desc: 'Address & Contact' },
    { num: 4, title: 'Bank & Auditor', desc: 'Settlement & CA' },
    { num: 5, title: 'Tally Vault', desc: 'Isolated RAG Store' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div
        className={`w-full max-w-3xl rounded-2xl border shadow-2xl relative my-auto animate-in fade-in zoom-in-95 ${
          isBahi ? 'bg-[#fffefb] border-amber-300 text-stone-900' : 'bg-slate-900 border-slate-700 text-white'
        }`}
      >
        {/* Header */}
        <div
          className={`p-5 sm:p-6 border-b flex items-start justify-between ${
            isBahi ? 'bg-amber-100/50 border-amber-200' : 'bg-slate-950/80 border-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                  isBahi ? 'bg-red-900 text-amber-100' : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                }`}
              >
                Multi-Tenant SME Architecture
              </span>
              <span className="text-xs text-slate-400">Step {currentStep} of 5</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              Register New Sister Company &amp; Isolated Vault
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Each company receives completely segregated vouchers, daybooks, documents, and RAG knowledge bases.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFillSample}
              className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium flex items-center gap-1 transition-colors ${
                isBahi
                  ? 'bg-amber-200/80 hover:bg-amber-200 text-red-950 border-amber-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-teal-300 border-slate-700'
              }`}
              title="Prefill with realistic sample sister company"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prefill Demo Sister Entity</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stepper Progression Bar */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-200/20">
          <div className="grid grid-cols-5 gap-2">
            {steps.map((s) => {
              const isPassed = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              return (
                <div
                  key={s.num}
                  className={`text-center pb-2 border-b-2 transition-all ${
                    isCurrent
                      ? isBahi
                        ? 'border-red-900 text-red-950 font-bold'
                        : 'border-teal-400 text-teal-300 font-bold'
                      : isPassed
                      ? 'border-emerald-500 text-emerald-500 font-semibold'
                      : 'border-slate-300/30 text-slate-400'
                  }`}
                >
                  <div className="text-xs flex items-center justify-center gap-1">
                    {isPassed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <span>{s.num}.</span>
                    )}
                    <span className="truncate">{s.title}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* STEP 1: Legal Identity */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200/30">
                <Building2 className="w-4 h-4 text-teal-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Step 1: Legal Entity Identity &amp; Industry Classification
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-medium mb-1">
                    Legal Entity Name (As registered with MCA / Registrar)
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g. Ganesh Cold Chain Logistics LLP"
                    required
                    className={`w-full p-2.5 rounded-lg border font-medium focus:ring-2 ${
                      isBahi
                        ? 'bg-white border-amber-300 text-stone-900 focus:ring-red-800'
                        : 'bg-slate-800 border-slate-700 text-white focus:ring-teal-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Trade / Display Name (Used in Daybook &amp; Bills)
                  </label>
                  <input
                    type="text"
                    value={formData.tradeName}
                    onChange={(e) => handleChange('tradeName', e.target.value)}
                    placeholder="e.g. Ganesh Cold Chain"
                    required
                    className={`w-full p-2.5 rounded-lg border font-medium focus:ring-2 ${
                      isBahi
                        ? 'bg-white border-amber-300 text-stone-900 focus:ring-red-800'
                        : 'bg-slate-800 border-slate-700 text-white focus:ring-teal-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Entity Structure / Constitution
                  </label>
                  <select
                    value={formData.entityType}
                    onChange={(e) => handleChange('entityType', e.target.value as EntityType)}
                    className={`w-full p-2.5 rounded-lg border font-medium focus:ring-2 ${
                      isBahi
                        ? 'bg-white border-amber-300 text-stone-900 focus:ring-red-800'
                        : 'bg-slate-800 border-slate-700 text-white focus:ring-teal-500'
                    }`}
                  >
                    <option value="Private Limited">Private Limited (Pvt Ltd)</option>
                    <option value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</option>
                    <option value="Partnership Firm">Partnership Firm</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                    <option value="Public Limited">Public Limited</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Industry Sector &amp; Business Type
                  </label>
                  <input
                    type="text"
                    value={formData.industryType}
                    onChange={(e) => handleChange('industryType', e.target.value)}
                    placeholder="e.g. Cold Chain Warehousing & Reefer Transport"
                    className={`w-full p-2.5 rounded-lg border font-medium focus:ring-2 ${
                      isBahi
                        ? 'bg-white border-amber-300 text-stone-900 focus:ring-red-800'
                        : 'bg-slate-800 border-slate-700 text-white focus:ring-teal-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    CIN / LLPIN / Registration Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.cinNumber}
                    onChange={(e) => handleChange('cinNumber', e.target.value)}
                    placeholder="e.g. U01110GJ2022PTC132984 or AAH-8810"
                    className={`w-full p-2.5 rounded-lg border font-mono focus:ring-2 ${
                      isBahi
                        ? 'bg-white border-amber-300 text-stone-900 focus:ring-red-800'
                        : 'bg-slate-800 border-slate-700 text-white focus:ring-teal-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Tax & Compliance */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200/30">
                <FileCheck2 className="w-4 h-4 text-teal-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Step 2: Statutory Tax Registrations (GSTIN &amp; MSME)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    GSTIN Number (15 Digits)
                  </label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
                    placeholder="e.g. 24AAHFG8810K1ZX"
                    maxLength={15}
                    required
                    className={`w-full p-2.5 rounded-lg border font-mono font-bold focus:ring-2 ${
                      isBahi
                        ? 'bg-white border-amber-300 text-stone-900 focus:ring-red-800'
                        : 'bg-slate-800 border-slate-700 text-white focus:ring-teal-500'
                    }`}
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    First 2 digits: State Code (24 = Gujarat), Next 10: PAN
                  </span>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Income Tax PAN (Permanent Account Number)
                  </label>
                  <input
                    type="text"
                    value={formData.pan}
                    onChange={(e) => handleChange('pan', e.target.value.toUpperCase())}
                    placeholder="e.g. AAHFG8810K"
                    maxLength={10}
                    required
                    className={`w-full p-2.5 rounded-lg border font-mono font-bold focus:ring-2 ${
                      isBahi
                        ? 'bg-white border-amber-300 text-stone-900 focus:ring-red-800'
                        : 'bg-slate-800 border-slate-700 text-white focus:ring-teal-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    MSME Udyam Registration (Section 43B(h) Audit Compliance)
                  </label>
                  <input
                    type="text"
                    value={formData.udyamNumber}
                    onChange={(e) => handleChange('udyamNumber', e.target.value.toUpperCase())}
                    placeholder="e.g. UDYAM-GJ-01-0089214"
                    className={`w-full p-2.5 rounded-lg border font-mono focus:ring-2 ${
                      isBahi
                        ? 'bg-white border-amber-300 text-stone-900 focus:ring-red-800'
                        : 'bg-slate-800 border-slate-700 text-white focus:ring-teal-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    GST Registration Scheme
                  </label>
                  <select
                    value={formData.gstRegistrationType}
                    onChange={(e) => handleChange('gstRegistrationType', e.target.value)}
                    className={`w-full p-2.5 rounded-lg border font-medium focus:ring-2 ${
                      isBahi
                        ? 'bg-white border-amber-300 text-stone-900 focus:ring-red-800'
                        : 'bg-slate-800 border-slate-700 text-white focus:ring-teal-500'
                    }`}
                  >
                    <option value="Regular Taxpayer">Regular Taxpayer (Monthly / QRMP)</option>
                    <option value="Composition Scheme">Composition Scheme</option>
                    <option value="Special Economic Zone (SEZ)">SEZ Unit</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Business Place & Address */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200/30">
                <MapPin className="w-4 h-4 text-teal-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Step 3: Registered Place of Business &amp; Invoicing Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-3">
                  <label className="block text-slate-400 font-medium mb-1">
                    Registered Office / Factory / Warehouse Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Plot / Survey No, GIDC / Industrial Zone / Bazar"
                    required
                    className={`w-full p-2.5 rounded-lg border focus:ring-2 ${
                      isBahi
                        ? 'bg-white border-amber-300 text-stone-900 focus:ring-red-800'
                        : 'bg-slate-800 border-slate-700 text-white focus:ring-teal-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="City"
                    required
                    className={`w-full p-2.5 rounded-lg border focus:ring-2 ${
                      isBahi
                        ? 'bg-white border-amber-300 text-stone-900 focus:ring-red-800'
                        : 'bg-slate-800 border-slate-700 text-white focus:ring-teal-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">State &amp; Code</label>
                  <div className="grid grid-cols-3 gap-1">
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      placeholder="State"
                      className={`col-span-2 p-2.5 rounded-lg border focus:ring-2 ${
                        isBahi
                          ? 'bg-white border-amber-300 text-stone-900 focus:ring-red-800'
                          : 'bg-slate-800 border-slate-700 text-white focus:ring-teal-500'
                      }`}
                    />
                    <input
                      type="text"
                      value={formData.stateCode}
                      onChange={(e) => handleChange('stateCode', e.target.value)}
                      placeholder="24"
                      className={`p-2.5 rounded-lg border font-mono text-center focus:ring-2 ${
                        isBahi
                          ? 'bg-white border-amber-300 text-stone-900 focus:ring-red-800'
                          : 'bg-slate-800 border-slate-700 text-white focus:ring-teal-500'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Pincode</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => handleChange('pincode', e.target.value)}
                    placeholder="380001"
                    maxLength={6}
                    required
                    className={`w-full p-2.5 rounded-lg border font-mono focus:ring-2 ${
                      isBahi
                        ? 'bg-white border-amber-300 text-stone-900 focus:ring-red-800'
                        : 'bg-slate-800 border-slate-700 text-white focus:ring-teal-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Official Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+91 79 0000 0000"
                    className={`w-full p-2.5 rounded-lg border font-mono focus:ring-2 ${
                      isBahi
                        ? 'bg-white border-amber-300 text-stone-900 focus:ring-red-800'
                        : 'bg-slate-800 border-slate-700 text-white focus:ring-teal-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Official Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="accounts@sistercompany.in"
                    className={`w-full p-2.5 rounded-lg border focus:ring-2 ${
                      isBahi
                        ? 'bg-white border-amber-300 text-stone-900 focus:ring-red-800'
                        : 'bg-slate-800 border-slate-700 text-white focus:ring-teal-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Authorized Signatory</label>
                  <input
                    type="text"
                    value={formData.authorizedSignatory}
                    onChange={(e) => handleChange('authorizedSignatory', e.target.value)}
                    placeholder="Name (Director / Partner)"
                    className={`w-full p-2.5 rounded-lg border focus:ring-2 ${
                      isBahi
                        ? 'bg-white border-amber-300 text-stone-900 focus:ring-red-800'
                        : 'bg-slate-800 border-slate-700 text-white focus:ring-teal-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Bank Details & Auditor */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200/30">
                <Landmark className="w-4 h-4 text-teal-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Step 4: Bank Account &amp; Statutory CA Auditor
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => handleChange('bankName', e.target.value)}
                    placeholder="e.g. ICICI Bank Ltd"
                    required
                    className={`w-full p-2.5 rounded-lg border focus:ring-2 ${
                      isBahi
                        ? 'bg-white border-amber-300 text-stone-900 focus:ring-red-800'
                        : 'bg-slate-800 border-slate-700 text-white focus:ring-teal-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Current Account Number</label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => handleChange('accountNumber', e.target.value)}
                    placeholder="e.g. 028905008912"
                    required
                    className={`w-full p-2.5 rounded-lg border font-mono font-bold focus:ring-2 ${
                      isBahi
                        ? 'bg-white border-amber-300 text-stone-900 focus:ring-red-800'
                        : 'bg-slate-800 border-slate-700 text-white focus:ring-teal-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={formData.ifsc}
                    onChange={(e) => handleChange('ifsc', e.target.value.toUpperCase())}
                    placeholder="e.g. ICIC0000289"
                    required
                    className={`w-full p-2.5 rounded-lg border font-mono font-bold focus:ring-2 ${
                      isBahi
                        ? 'bg-white border-amber-300 text-stone-900 focus:ring-red-800'
                        : 'bg-slate-800 border-slate-700 text-white focus:ring-teal-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">UPI VPA (QR ID)</label>
                  <input
                    type="text"
                    value={formData.upiId}
                    onChange={(e) => handleChange('upiId', e.target.value)}
                    placeholder="e.g. ganeshcold@icici"
                    className={`w-full p-2.5 rounded-lg border font-mono focus:ring-2 ${
                      isBahi
                        ? 'bg-white border-amber-300 text-stone-900 focus:ring-red-800'
                        : 'bg-slate-800 border-slate-700 text-white focus:ring-teal-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Statutory Auditor (CA Firm)</label>
                  <input
                    type="text"
                    value={formData.caFirm}
                    onChange={(e) => handleChange('caFirm', e.target.value)}
                    placeholder="e.g. M/s V.B. Thakkar & Co"
                    className={`w-full p-2.5 rounded-lg border focus:ring-2 ${
                      isBahi
                        ? 'bg-white border-amber-300 text-stone-900 focus:ring-red-800'
                        : 'bg-slate-800 border-slate-700 text-white focus:ring-teal-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">CA Membership Number</label>
                  <input
                    type="text"
                    value={formData.caMembershipNumber}
                    onChange={(e) => handleChange('caMembershipNumber', e.target.value)}
                    placeholder="e.g. FCA-039104"
                    className={`w-full p-2.5 rounded-lg border font-mono focus:ring-2 ${
                      isBahi
                        ? 'bg-white border-amber-300 text-stone-900 focus:ring-red-800'
                        : 'bg-slate-800 border-slate-700 text-white focus:ring-teal-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Tally Vault & Data Isolation Confirmation */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200/30">
                <FolderLock className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Step 5: Isolated Document Vault &amp; RAG Knowledge Base Initialization
                </h3>
              </div>

              <div
                className={`p-4 rounded-xl border space-y-3 ${
                  isBahi ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-800/60 border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Zero-Leakage Multi-Company Isolation Guaranteed</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upon registration, Bahi-Khata will provision an independent document vault and double-entry database partition for <strong>{formData.tradeName || 'New Entity'}</strong>. Vouchers, ledgers, and RAG accounting responses will be strictly isolated from your other sister companies.
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-2.5 rounded-lg bg-black/20 border border-white/10">
                    <span className="text-[10px] text-slate-400 block">Financial Year</span>
                    <span className="font-mono font-bold text-white">FY {formData.financialYear}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/20 border border-white/10">
                    <span className="text-[10px] text-slate-400 block">Tally Prime Sync Port</span>
                    <span className="font-mono font-bold text-white">Port 9000 (XML Server)</span>
                  </div>
                </div>

                <label className="flex items-center gap-2 pt-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={formData.createStarterLedgers}
                    onChange={(e) => handleChange('createStarterLedgers', e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-slate-300 font-medium">
                    Pre-populate default chart of accounts (Bank, Cash, Sales 5%/18%, Input/Output GST, Hamali &amp; Freight)
                  </span>
                </label>
              </div>

              {/* Review Summary */}
              <div className="p-3 rounded-lg border border-slate-700/80 bg-slate-950/40 text-xs space-y-1">
                <div className="text-[11px] font-semibold text-slate-400 uppercase">
                  Entity Verification Summary
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Legal Name:</span>
                    <span className="font-bold truncate block">{formData.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">GSTIN:</span>
                    <span className="font-mono font-bold text-amber-300 block">{formData.gstin}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Location:</span>
                    <span className="font-medium block">{formData.city}, {formData.state}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Bank Account:</span>
                    <span className="font-mono block">{formData.bankName}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200/20">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-600 hover:bg-slate-800 text-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className={`px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                  isBahi
                    ? 'bg-red-900 hover:bg-red-800 text-amber-50'
                    : 'bg-teal-600 hover:bg-teal-500 text-white'
                }`}
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 shadow-lg shadow-emerald-950/40"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Registration &amp; Open Workspace</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
