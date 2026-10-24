import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Building2,
  Sparkles,
  KeyRound,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  X,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types/auth';
import { sampleUsers } from '../data/sampleUsers';

interface LoginPageProps {
  onLogin: (user: UserProfile) => void;
  themeMode: 'tally' | 'bahikhata';
  onToggleTheme: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  themeMode,
  onToggleTheme,
}) => {
  const isBahi = themeMode === 'bahikhata';

  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('patilvikas7892@gmail.com');
  const [password, setPassword] = useState('tallySecure#2024');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Senior Tally Accountant');
  const [regPassword, setRegPassword] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both user email and password.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      // Find matching user or fallback to a generated user profile
      const matched = sampleUsers.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (matched) {
        onLogin(matched);
      } else {
        // Construct user profile for custom credentials
        const customUser: UserProfile = {
          id: `usr-${Date.now().toString().slice(-4)}`,
          name: email.split('@')[0].replace(/[\._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          email: email.trim(),
          phone: '+91 98200 00000',
          role: 'Senior Tally Accountant',
          designation: 'Accounts Executive & Tally Operator',
          department: 'Accounts & Finance',
          employeeId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
          initials: email.slice(0, 2).toUpperCase(),
          tallyUserGuid: `TALLY-USER-GUID-${Math.floor(100000 + Math.random() * 900000)}`,
          permissions: [
            'Day Book Voucher Ingestion',
            'Sales & Purchase Invoicing (F8 / F9)',
            'RAG Document Query Engine',
            'Ledger Balancing & Reconciliations',
          ],
          twoFactorEnabled: false,
          lastLogin: 'Just now',
          loginDevice: 'Web Browser / Desktop Terminal',
          ipAddress: '103.212.145.82',
          joinedDate: 'October 2024',
          auditTrailLogs: [
            {
              id: `log-${Date.now()}`,
              action: 'Authenticated via portal login credentials',
              module: 'Authentication',
              timestamp: 'Just now',
              ipAddress: '103.212.145.82',
              device: 'Web Client',
              status: 'Success',
            },
          ],
        };
        onLogin(customUser);
      }
      setIsSubmitting(false);
    }, 400);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage('Please fill in your name, email, and password.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newUser: UserProfile = {
        id: `usr-${Date.now().toString().slice(-4)}`,
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim() || '+91 98200 12345',
        role: regRole,
        designation:
          regRole === 'Director & Owner'
            ? 'Executive Director'
            : regRole === 'Statutory Auditor (CA)'
            ? 'Chartered Accountant Auditor'
            : 'Tally Accounts Specialist',
        department: 'Accounts & Finance',
        employeeId: `EMP-SG-${Math.floor(200 + Math.random() * 800)}`,
        initials: regName
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase(),
        tallyUserGuid: `TALLY-USER-GUID-${Math.floor(100000 + Math.random() * 900000)}`,
        permissions: [
          'Tally Prime Daybook Ingestion',
          'Sales (F8) & Purchase (F9) Entry',
          'AI RAG Document Query Access',
          'GST Tax Liability Verification',
        ],
        twoFactorEnabled: false,
        lastLogin: 'Just now',
        loginDevice: 'Web Browser / Desktop Terminal',
        ipAddress: '103.212.145.82',
        joinedDate: 'October 2024',
        auditTrailLogs: [
          {
            id: `log-${Date.now()}`,
            action: 'Account registered and authenticated',
            module: 'Authentication',
            timestamp: 'Just now',
            ipAddress: '103.212.145.82',
            device: 'Web Client',
            status: 'Success',
          },
        ],
      };
      onLogin(newUser);
      setIsSubmitting(false);
    }, 400);
  };

  const handleQuickLogin = (user: UserProfile) => {
    setEmail(user.email);
    setPassword('tallySecure#2024');
    onLogin(user);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
    setTimeout(() => {
      setForgotSent(false);
      setShowForgotPassword(false);
      setForgotEmail('');
    }, 2500);
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between transition-colors duration-200 ${
        isBahi ? 'bg-[#faf7f2] bg-grid-amber text-stone-900' : 'bg-slate-950 bg-grid-slate text-slate-100'
      }`}
    >
      {/* Top Bar with Brand & Theme Switcher */}
      <header
        className={`border-b px-4 sm:px-8 py-3.5 flex items-center justify-between backdrop-blur-md ${
          isBahi
            ? 'bg-[#5c131a]/95 text-amber-50 border-amber-900/60 shadow-md'
            : 'bg-slate-950/95 text-slate-100 border-slate-800/80 shadow-md'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-base border ${
              isBahi
                ? 'bg-amber-100 text-red-950 border-amber-300 font-serif'
                : 'bg-teal-950 text-teal-400 border-teal-800 font-mono'
            }`}
          >
            {isBahi ? 'BK' : 'T9'}
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
              <span>Bahi-Khata Tally RAG</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-amber-300 font-mono">
                Enterprise v2.4
              </span>
            </div>
            <div className="text-[11px] text-white/70">
              SME Accounting &amp; Ledger Document Intelligence
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isBahi
                ? 'bg-amber-100/10 hover:bg-amber-100/20 text-amber-100 border-amber-300/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isBahi ? 'Switch: Tally Prime Theme' : 'Switch: Classic Ledger Theme'}</span>
          </button>
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Context & Feature Highlights */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                  isBahi
                    ? 'bg-amber-200 text-red-950 border border-amber-300'
                    : 'bg-teal-950 text-teal-300 border border-teal-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Statutory MCA Rule 3 Compliant</span>
              </div>
              <h1
                className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                  isBahi ? 'text-red-950 font-serif' : 'text-white'
                }`}
              >
                Sign In to SME Financial Desk
              </h1>
              <p
                className={`text-xs sm:text-sm leading-relaxed ${
                  isBahi ? 'text-stone-700' : 'text-slate-400'
                }`}
              >
                Access double-entry Tally Daybooks, automated GST tax audits, Section 43B(h) MSME compliance checks, and natural language RAG intelligence.
              </p>
            </div>

            {/* Quick Demo Logins Section */}
            <div
              className={`p-4 rounded-xl border ${
                isBahi
                  ? 'bg-[#fffefb] border-amber-200 shadow-xs'
                  : 'bg-slate-800/80 border-slate-700 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 mb-3">
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isBahi ? 'text-red-900' : 'text-teal-400'
                  }`}
                >
                  1-Click Quick Demo Sign In
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Select Role</span>
              </div>

              <div className="space-y-2">
                {sampleUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleQuickLogin(user)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between group ${
                      isBahi
                        ? 'bg-amber-50/70 hover:bg-amber-100/80 border-amber-200 text-stone-900'
                        : 'bg-slate-900/80 hover:bg-slate-900 border-slate-700 text-slate-200 hover:border-teal-500'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          user.role === 'Director & Owner'
                            ? 'bg-amber-500 text-slate-950'
                            : user.role === 'Statutory Auditor (CA)'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-teal-600 text-white'
                        }`}
                      >
                        {user.initials}
                      </div>
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <span>{user.name}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                              user.role === 'Director & Owner'
                                ? 'bg-amber-100 text-amber-900'
                                : user.role === 'Statutory Auditor (CA)'
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-blue-100 text-blue-900'
                            }`}
                          >
                            {user.role}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>

            {/* Compliance Guarantee Badges */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div
                className={`p-2.5 rounded-lg border flex items-center gap-2 text-xs ${
                  isBahi
                    ? 'bg-amber-100/60 border-amber-200 text-stone-800'
                    : 'bg-slate-800/50 border-slate-700/80 text-slate-300'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-[11px]">256-Bit TLS Audit Vault</span>
              </div>
              <div
                className={`p-2.5 rounded-lg border flex items-center gap-2 text-xs ${
                  isBahi
                    ? 'bg-amber-100/60 border-amber-200 text-stone-800'
                    : 'bg-slate-800/50 border-slate-700/80 text-slate-300'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="text-[11px]">Tally ERP 9 / Prime Sync</span>
              </div>
            </div>
          </div>

          {/* Right Column: Form Container */}
          <div className="lg:col-span-7">
            <div
              className={`rounded-2xl border p-6 sm:p-8 shadow-xl ${
                isBahi
                  ? 'bg-[#fffefb] border-amber-300 text-stone-900'
                  : 'bg-slate-800/90 border-slate-700 text-white'
              }`}
            >
              {/* Tabs: Sign In vs Register */}
              <div className="flex border-b border-slate-200/20 mb-6 pb-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signin');
                    setErrorMessage('');
                  }}
                  className={`text-sm font-bold pb-2 border-b-2 transition-colors ${
                    activeTab === 'signin'
                      ? isBahi
                        ? 'border-red-900 text-red-950'
                        : 'border-teal-400 text-teal-300'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign In to Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMessage('');
                  }}
                  className={`text-sm font-bold pb-2 border-b-2 transition-colors ${
                    activeTab === 'register'
                      ? isBahi
                        ? 'border-red-900 text-red-950'
                        : 'border-teal-400 text-teal-300'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Register New Operator
                </button>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form 1: Sign In */}
              {activeTab === 'signin' && (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label
                      className={`block text-xs font-semibold mb-1.5 ${
                        isBahi ? 'text-stone-700' : 'text-slate-300'
                      }`}
                    >
                      Official Business Email / Operator ID
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. patilvikas7892@gmail.com"
                        required
                        className={`w-full pl-9 pr-3 py-2.5 rounded-lg text-xs font-medium border focus:outline-none focus:ring-2 ${
                          isBahi
                            ? 'bg-white border-amber-300 text-stone-900 focus:ring-red-800'
                            : 'bg-slate-900 border-slate-700 text-white focus:ring-teal-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        className={`text-xs font-semibold ${
                          isBahi ? 'text-stone-700' : 'text-slate-300'
                        }`}
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className={`text-[11px] font-medium hover:underline ${
                          isBahi ? 'text-red-900' : 'text-teal-400'
                        }`}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your secret key"
                        required
                        className={`w-full pl-9 pr-10 py-2.5 rounded-lg text-xs font-mono border focus:outline-none focus:ring-2 ${
                          isBahi
                            ? 'bg-white border-amber-300 text-stone-900 focus:ring-red-800'
                            : 'bg-slate-900 border-slate-700 text-white focus:ring-teal-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-600 text-teal-600 focus:ring-teal-500"
                      />
                      <span className={isBahi ? 'text-stone-600' : 'text-slate-400'}>
                        Keep me signed in on this workstation
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
                      isBahi
                        ? 'bg-red-900 hover:bg-red-800 text-amber-50 shadow-red-950/20'
                        : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-900/30'
                    } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? (
                      <span>Verifying Credentials...</span>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Sign In to Financial Workspace</span>
                      </>
                    )}
                  </button>

                  <div
                    className={`text-[11px] text-center pt-2 border-t ${
                      isBahi
                        ? 'border-amber-200 text-stone-600'
                        : 'border-slate-700/60 text-slate-400'
                    }`}
                  >
                    Default firm: <strong>M/s Shree Ganesh Spices &amp; Textile Traders</strong> (FY 2024-25)
                  </div>
                </form>
              )}

              {/* Form 2: Register New Operator */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div>
                    <label
                      className={`block text-xs font-semibold mb-1 ${
                        isBahi ? 'text-stone-700' : 'text-slate-300'
                      }`}
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Vikas Patil"
                        required
                        className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs font-medium border focus:outline-none focus:ring-2 ${
                          isBahi
                            ? 'bg-white border-amber-300 text-stone-900 focus:ring-red-800'
                            : 'bg-slate-900 border-slate-700 text-white focus:ring-teal-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        className={`block text-xs font-semibold mb-1 ${
                          isBahi ? 'text-stone-700' : 'text-slate-300'
                        }`}
                      >
                        Official Email Address
                      </label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="operator@firm.com"
                        required
                        className={`w-full px-3 py-2 rounded-lg text-xs font-medium border focus:outline-none focus:ring-2 ${
                          isBahi
                            ? 'bg-white border-amber-300 text-stone-900 focus:ring-red-800'
                            : 'bg-slate-900 border-slate-700 text-white focus:ring-teal-500'
                        }`}
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-xs font-semibold mb-1 ${
                          isBahi ? 'text-stone-700' : 'text-slate-300'
                        }`}
                      >
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+91 98200 12345"
                        className={`w-full px-3 py-2 rounded-lg text-xs font-medium border focus:outline-none focus:ring-2 ${
                          isBahi
                            ? 'bg-white border-amber-300 text-stone-900 focus:ring-red-800'
                            : 'bg-slate-900 border-slate-700 text-white focus:ring-teal-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-xs font-semibold mb-1 ${
                        isBahi ? 'text-stone-700' : 'text-slate-300'
                      }`}
                    >
                      Assigned Role &amp; Permission Tier
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                      className={`w-full px-3 py-2 rounded-lg text-xs font-medium border focus:outline-none focus:ring-2 ${
                        isBahi
                          ? 'bg-white border-amber-300 text-stone-900 focus:ring-red-800'
                          : 'bg-slate-900 border-slate-700 text-white focus:ring-teal-500'
                      }`}
                    >
                      <option value="Senior Tally Accountant">Senior Tally Accountant (Entries &amp; Day Book)</option>
                      <option value="Director & Owner">Director &amp; Owner (Full Super Admin &amp; Approvals)</option>
                      <option value="Statutory Auditor (CA)">Statutory Auditor (CA Verification &amp; Tax Audit)</option>
                      <option value="Tax Consultant">Tax Consultant (GST &amp; Returns)</option>
                      <option value="Billing Clerk">Billing Clerk (Invoice &amp; Receipts)</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className={`block text-xs font-semibold mb-1 ${
                        isBahi ? 'text-stone-700' : 'text-slate-300'
                      }`}
                    >
                      Security Password
                    </label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      required
                      className={`w-full px-3 py-2 rounded-lg text-xs font-mono border focus:outline-none focus:ring-2 ${
                        isBahi
                          ? 'bg-white border-amber-300 text-stone-900 focus:ring-red-800'
                          : 'bg-slate-900 border-slate-700 text-white focus:ring-teal-500'
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
                      isBahi
                        ? 'bg-red-900 hover:bg-red-800 text-amber-50 shadow-red-950/20'
                        : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-900/30'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Create Operator &amp; Sign In</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer bar */}
      <footer
        className={`border-t py-3 text-xs text-center ${
          isBahi
            ? 'bg-[#450a0a] border-red-950 text-amber-200/80'
            : 'bg-slate-950 border-slate-800 text-slate-400'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Bahi-Khata Tally RAG Platform</span>
            <span>·</span>
            <span>Section 43B(h) Audit &amp; Tally XML Connector</span>
          </div>
          <div className="text-[11px] text-white/60">
            Compliant with Ministry of Corporate Affairs (MCA) Audit Trail Guidelines
          </div>
        </div>
      </footer>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-xl border p-6 shadow-2xl relative ${
              isBahi
                ? 'bg-[#fffefb] border-amber-300 text-stone-900'
                : 'bg-slate-900 border-slate-700 text-white'
            }`}
          >
            <button
              onClick={() => setShowForgotPassword(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
              <KeyRound className="w-4 h-4 text-teal-400" />
              <span>Reset Your Tally Access Password</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your registered business email. A secure 6-digit one-time authorization link will be generated.
            </p>

            {forgotSent ? (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Reset OTP link sent! Check your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@shreeganeshspices.in"
                  required
                  className={`w-full px-3 py-2 rounded-lg text-xs font-medium border focus:outline-none focus:ring-2 ${
                    isBahi
                      ? 'bg-white border-amber-300 text-stone-900 focus:ring-red-800'
                      : 'bg-slate-800 border-slate-700 text-white focus:ring-teal-500'
                  }`}
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white"
                >
                  Send Reset Authorization
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
