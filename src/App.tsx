import React, { useState, useEffect } from 'react';
import { initialCompaniesDataset } from './data/sampleCompanies';
import { sampleUsers } from './data/sampleUsers';
import {
  TallyVoucher,
  BahiKhataAccount,
  CompanyProfile,
  RegisteredDocument,
  GstSummary,
} from './types/tally';
import { UserProfile } from './types/auth';
import { MultiCompanyStore } from './services/multiCompanyStore';
import { Header } from './components/Header';
import { NavigationTabs, ActiveTab } from './components/NavigationTabs';
import { RagQueryDesk } from './components/RagQueryDesk';
import { BahiKhataView } from './components/BahiKhataView';
import { DayBookView } from './components/DayBookView';
import { GstAuditView } from './components/GstAuditView';
import { VoucherDetailModal } from './components/VoucherDetailModal';
import { DocumentUploadModal } from './components/DocumentUploadModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { FloatingQuickActions } from './components/FloatingQuickActions';
import { CreateInvoiceModal } from './components/CreateInvoiceModal';
import { AddExpenseModal } from './components/AddExpenseModal';
import { GstReportModal } from './components/GstReportModal';
import { ProfileView } from './components/ProfileView';
import { LoginerProfileView } from './components/LoginerProfileView';
import { LoginPage } from './components/LoginPage';
import { CompanyRegistrationWizard } from './components/CompanyRegistrationWizard';
import { CompanyDocumentsModal } from './components/CompanyDocumentsModal';
import { MultiCompanyGuideModal } from './components/MultiCompanyGuideModal';
import { exportToTallyXml } from './services/ragEngine';

const AUTH_STORAGE_KEY = 'bahi_khata_auth_user';

export default function App() {
  const [themeMode, setThemeMode] = useState<'tally' | 'bahikhata'>('tally');
  const [activeTab, setActiveTab] = useState<ActiveTab>('rag-query');

  // Multi-Company State (Strictly isolated per company)
  const [companies, setCompanies] = useState<CompanyProfile[]>(() => MultiCompanyStore.getCompanies());
  const [activeCompanyId, setActiveCompanyId] = useState<string>(() => MultiCompanyStore.getActiveCompanyId());

  // Derive active company object
  const company = companies.find((c) => c.id === activeCompanyId) || companies[0];

  // Isolated data partitions for the active company
  const [vouchers, setVouchers] = useState<TallyVoucher[]>(() => MultiCompanyStore.getVouchers(activeCompanyId));
  const [accounts, setAccounts] = useState<BahiKhataAccount[]>(() => MultiCompanyStore.getAccounts(activeCompanyId));
  const [documents, setDocuments] = useState<RegisteredDocument[]>(() => MultiCompanyStore.getDocuments(activeCompanyId));
  const [gstSummary, setGstSummary] = useState<GstSummary>(() => MultiCompanyStore.getGstSummary(activeCompanyId));

  // Dynamic predefined queries tailored to active company
  const predefinedQueries = initialCompaniesDataset[activeCompanyId]?.predefinedQueries || [];

  // Multi-Company Wizard & Vault Modals
  const [isRegisterCompanyOpen, setIsRegisterCompanyOpen] = useState(false);
  const [isCompanyDocsOpen, setIsCompanyDocsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Switch active company and load its isolated partition
  const handleSelectCompany = (newCompanyId: string) => {
    setActiveCompanyId(newCompanyId);
    MultiCompanyStore.setActiveCompanyId(newCompanyId);

    // Load isolated datasets
    const isolatedVouchers = MultiCompanyStore.getVouchers(newCompanyId);
    const isolatedAccounts = MultiCompanyStore.getAccounts(newCompanyId);
    const isolatedDocs = MultiCompanyStore.getDocuments(newCompanyId);
    const isolatedGst = MultiCompanyStore.getGstSummary(newCompanyId);

    setVouchers(isolatedVouchers);
    setAccounts(isolatedAccounts);
    setDocuments(isolatedDocs);
    setGstSummary(isolatedGst);
    setSelectedPartyFilter(null);
  };

  // Register new sister company
  const handleCompanyRegistered = (newCompany: CompanyProfile) => {
    // Generate default starter ledgers for the new company
    const starterAccounts: BahiKhataAccount[] = [
      {
        companyId: newCompany.id,
        partyName: `${newCompany.bankDetails.bankName} Current Account`,
        partyType: 'Bank',
        city: newCompany.city,
        openingBalance: 500000,
        currentBalance: 500000,
        totalUdhaar: 0,
        totalJama: 0,
        lastTransactionDate: newCompany.booksBeginningDate,
      },
      {
        companyId: newCompany.id,
        partyName: 'Cash in Hand (रोकड़ तिजोरी)',
        partyType: 'Cash',
        city: newCompany.city,
        openingBalance: 25000,
        currentBalance: 25000,
        totalUdhaar: 0,
        totalJama: 0,
        lastTransactionDate: newCompany.booksBeginningDate,
      },
    ];

    const starterDocs: RegisteredDocument[] = [
      {
        id: `doc-init-${newCompany.id}`,
        companyId: newCompany.id,
        fileName: `${newCompany.tradeName.replace(/\s+/g, '_')}_Master_Ledgers.xml`,
        fileType: 'Tally XML',
        uploadDate: new Date().toISOString().split('T')[0],
        voucherCount: 0,
        fileSize: '18 KB',
        status: 'Indexed',
        parsedSummary: 'Initial chart of accounts & statutory tax ledgers provisioned.',
      },
    ];

    MultiCompanyStore.registerCompany(newCompany, [], starterAccounts, starterDocs);

    const updatedList = MultiCompanyStore.getCompanies();
    setCompanies(updatedList);
    handleSelectCompany(newCompany.id);
  };

  // Update existing company profile
  const handleUpdateCompany = (updated: CompanyProfile) => {
    MultiCompanyStore.updateCompany(updated);
    setCompanies((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  // Ingest document into company vault
  const handleAddDocument = (newDoc: RegisteredDocument) => {
    MultiCompanyStore.addDocument(activeCompanyId, newDoc);
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleDeleteDocument = (docId: string) => {
    const updated = documents.filter((d) => d.id !== docId);
    setDocuments(updated);
    MultiCompanyStore.saveDocuments(activeCompanyId, updated);
  };

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored user auth', e);
    }
    return sampleUsers[0];
  });

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to save user auth', e);
    }
    setActiveTab('rag-query');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear user auth', e);
    }
  };

  const handleUpdateCurrentUser = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
    } catch (e) {
      console.warn('Failed to update user auth', e);
    }
  };

  const handleSwitchUser = (newUser: UserProfile) => {
    handleLogin(newUser);
  };

  // Modals & Navigation state
  const [selectedVoucher, setSelectedVoucher] = useState<TallyVoucher | null>(null);
  const [selectedPartyFilter, setSelectedPartyFilter] = useState<string | null>(null);
  const [accountForWhatsApp, setAccountForWhatsApp] = useState<BahiKhataAccount | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Quick Action Modal states
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isGstReportOpen, setIsGstReportOpen] = useState(false);

  // Handlers
  const handleToggleTheme = () => {
    setThemeMode((prev) => (prev === 'tally' ? 'bahikhata' : 'tally'));
  };

  const handleResetData = () => {
    MultiCompanyStore.resetAllToDefaults();
    const defaultCompanies = MultiCompanyStore.getCompanies();
    setCompanies(defaultCompanies);
    handleSelectCompany('comp-001');
  };

  const handleExportTallyXml = () => {
    const xmlContent = exportToTallyXml(vouchers, company);
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${company.tradeName.replace(/\s+/g, '_')}_Tally_Vouchers.xml`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddVouchers = (newVouchers: TallyVoucher[]) => {
    const stamped = newVouchers.map((nv) => ({ ...nv, companyId: activeCompanyId }));
    const updatedVouchers = [...stamped, ...vouchers];
    setVouchers(updatedVouchers);
    MultiCompanyStore.saveVouchers(activeCompanyId, updatedVouchers);

    // Record audit log for current user
    if (currentUser) {
      const auditLog = {
        id: `log-${Date.now()}`,
        action: `Added ${newVouchers.length} vouchers to ${company.tradeName} Day Book`,
        module: 'Day Book Ingestion',
        timestamp: 'Just now',
        ipAddress: currentUser.ipAddress,
        device: currentUser.loginDevice,
        status: 'Success' as const,
      };
      handleUpdateCurrentUser({
        ...currentUser,
        auditTrailLogs: [auditLog, ...currentUser.auditTrailLogs],
      });
    }

    // Ensure parties exist in isolated accounts
    stamped.forEach((nv) => {
      setAccounts((prev) => {
        const existing = prev.find((a) => a.partyName.toLowerCase() === nv.partyName.toLowerCase());
        let nextAccounts: BahiKhataAccount[];
        if (existing) {
          const isDr = nv.voucherType === 'Sales';
          nextAccounts = prev.map((a) =>
            a.partyName.toLowerCase() === nv.partyName.toLowerCase()
              ? {
                  ...a,
                  currentBalance: isDr
                    ? a.currentBalance + nv.amount
                    : a.currentBalance - nv.amount,
                  totalUdhaar: isDr ? a.totalUdhaar + nv.amount : a.totalUdhaar,
                  totalJama: !isDr ? a.totalJama + nv.amount : a.totalJama,
                  lastTransactionDate: nv.date,
                }
              : a
          );
        } else {
          nextAccounts = [
            ...prev,
            {
              companyId: activeCompanyId,
              partyName: nv.partyName,
              partyType: nv.voucherType === 'Purchase' ? 'Sundry Creditor' : 'Sundry Debtor',
              city: company.city,
              gstin: nv.partyGstin,
              openingBalance: 0,
              currentBalance: nv.voucherType === 'Purchase' ? -nv.amount : nv.amount,
              totalUdhaar: nv.voucherType === 'Sales' ? nv.amount : 0,
              totalJama: nv.voucherType === 'Purchase' ? nv.amount : 0,
              lastTransactionDate: nv.date,
            },
          ];
        }
        MultiCompanyStore.saveAccounts(activeCompanyId, nextAccounts);
        return nextAccounts;
      });
    });
  };

  const handleSelectPartyFromLedger = (partyName: string) => {
    setSelectedPartyFilter(partyName);
    setActiveTab('day-book');
  };

  const handleSaveInvoice = (invoiceVoucher: TallyVoucher) => {
    handleAddVouchers([invoiceVoucher]);
    setSelectedVoucher(invoiceVoucher);
  };

  const handleSaveExpense = (expenseVoucher: TallyVoucher) => {
    handleAddVouchers([expenseVoucher]);
    setSelectedVoucher(expenseVoucher);
  };

  // If user is not logged in, render Login Page
  if (!currentUser) {
    return (
      <LoginPage
        onLogin={handleLogin}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  // Counts for tabs
  const overdueCount = accounts.filter(
    (a) => a.partyType === 'Sundry Debtor' && a.currentBalance > 0
  ).length;

  const msmePendingCount = vouchers.filter(
    (v) => v.isMsme && v.voucherType === 'Purchase'
  ).length;

  const isBahi = themeMode === 'bahikhata';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isBahi ? 'bg-[#faf7f2] bg-grid-amber text-stone-900' : 'bg-slate-900/3 bg-grid-slate text-slate-900'
      }`}
    >
      {/* Header with Multi-Company Switcher */}
      <Header
        company={company}
        companies={companies}
        onSelectCompany={handleSelectCompany}
        onOpenRegisterCompany={() => setIsRegisterCompanyOpen(true)}
        onOpenCompanyDocuments={() => setIsCompanyDocsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        currentUser={currentUser}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
        onOpenUpload={() => setIsUploadOpen(true)}
        onExportTally={handleExportTallyXml}
        onResetData={handleResetData}
        onOpenCompanyProfile={() => setActiveTab('profile')}
        onOpenLoginerProfile={() => setActiveTab('loginer-profile')}
        onLogout={handleLogout}
        voucherCount={vouchers.length}
        accountCount={accounts.length}
        documentCount={documents.length}
      />

      {/* Tabs */}
      <NavigationTabs
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        themeMode={themeMode}
        overdueCount={overdueCount}
        msmePendingCount={msmePendingCount}
        currentUser={currentUser}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'rag-query' && (
          <RagQueryDesk
            vouchers={vouchers}
            accounts={accounts}
            company={company}
            predefinedQueries={predefinedQueries}
            themeMode={themeMode}
            onInspectVoucher={(v) => setSelectedVoucher(v)}
          />
        )}

        {activeTab === 'bahi-khata' && (
          <BahiKhataView
            accounts={accounts}
            vouchers={vouchers}
            company={company}
            themeMode={themeMode}
            onSelectParty={handleSelectPartyFromLedger}
            onOpenWhatsApp={(acc) => setAccountForWhatsApp(acc)}
          />
        )}

        {activeTab === 'day-book' && (
          <DayBookView
            vouchers={vouchers}
            themeMode={themeMode}
            selectedPartyFilter={selectedPartyFilter}
            onClearPartyFilter={() => setSelectedPartyFilter(null)}
            onInspectVoucher={(v) => setSelectedVoucher(v)}
          />
        )}

        {activeTab === 'gst-audit' && (
          <GstAuditView
            gstSummary={gstSummary}
            vouchers={vouchers}
            accounts={accounts}
            company={company}
            themeMode={themeMode}
            onInspectVoucher={(v) => setSelectedVoucher(v)}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            company={company}
            companies={companies}
            onUpdateCompany={handleUpdateCompany}
            onSelectCompany={handleSelectCompany}
            onOpenRegisterCompany={() => setIsRegisterCompanyOpen(true)}
            onOpenCompanyDocuments={() => setIsCompanyDocsOpen(true)}
            themeMode={themeMode}
          />
        )}

        {activeTab === 'loginer-profile' && (
          <LoginerProfileView
            currentUser={currentUser}
            onUpdateUser={handleUpdateCurrentUser}
            onLogout={handleLogout}
            onSwitchUser={handleSwitchUser}
            themeMode={themeMode}
          />
        )}
      </main>

      {/* Executive Footer */}
      <footer
        className={`border-t py-4 text-xs transition-colors backdrop-blur-md ${
          isBahi
            ? 'bg-[#3b0b11] border-red-950/80 text-amber-200/80'
            : 'bg-slate-950 border-slate-800 text-slate-400'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="font-bold text-white tracking-tight flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Bahi-Khata Tally Multi-Company RAG
            </span>
            <span className="text-white/30">·</span>
            <span>Active: <strong className="text-white/90">{company.tradeName}</strong> ({company.gstin})</span>
            <span className="text-white/30">·</span>
            <span className="font-mono text-white/70">Vault: {company.id}</span>
            <span className="text-white/30">·</span>
            <span className="text-white/70">{companies.length} Sister Entities Indexed</span>
          </div>
          <div className="text-[11px] text-white/60 font-mono">
            Zero-Leakage Data Isolation · Operator: {currentUser.name} ({currentUser.role})
          </div>
        </div>
      </footer>

      {/* Floating Quick Action Speed Dial */}
      <FloatingQuickActions
        onTriggerCreateInvoice={() => setIsCreateInvoiceOpen(true)}
        onTriggerAddExpense={() => setIsAddExpenseOpen(true)}
        onTriggerGenerateGstReport={() => setIsGstReportOpen(true)}
        themeMode={themeMode}
      />

      {/* Modals */}
      <VoucherDetailModal
        voucher={selectedVoucher}
        onClose={() => setSelectedVoucher(null)}
        themeMode={themeMode}
      />

      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        company={company}
        onAddVouchers={handleAddVouchers}
        onAddDocument={handleAddDocument}
        themeMode={themeMode}
      />

      <WhatsAppModal
        account={accountForWhatsApp}
        company={company}
        vouchers={vouchers}
        isOpen={!!accountForWhatsApp}
        onClose={() => setAccountForWhatsApp(null)}
        themeMode={themeMode}
      />

      {/* Quick Action Triggered Modals */}
      <CreateInvoiceModal
        isOpen={isCreateInvoiceOpen}
        onClose={() => setIsCreateInvoiceOpen(false)}
        onSaveInvoice={handleSaveInvoice}
        accounts={accounts}
        company={company}
        themeMode={themeMode}
      />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onSaveExpense={handleSaveExpense}
        company={company}
        themeMode={themeMode}
      />

      <GstReportModal
        isOpen={isGstReportOpen}
        onClose={() => setIsGstReportOpen(false)}
        gstSummary={gstSummary}
        company={company}
        vouchers={vouchers}
        themeMode={themeMode}
      />

      {/* Multi-Company Modals */}
      <CompanyRegistrationWizard
        isOpen={isRegisterCompanyOpen}
        onClose={() => setIsRegisterCompanyOpen(false)}
        onCompanyRegistered={handleCompanyRegistered}
        themeMode={themeMode}
      />

      <CompanyDocumentsModal
        isOpen={isCompanyDocsOpen}
        onClose={() => setIsCompanyDocsOpen(false)}
        company={company}
        documents={documents}
        onUploadNew={() => setIsUploadOpen(true)}
        onDeleteDocument={handleDeleteDocument}
        themeMode={themeMode}
      />

      <MultiCompanyGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onOpenRegister={() => setIsRegisterCompanyOpen(true)}
        themeMode={themeMode}
      />
    </div>
  );
}
