import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  KeyRound,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Clock,
  Laptop,
  CheckCircle2,
  Save,
  Edit3,
  LogOut,
  AlertCircle,
  FileSpreadsheet,
  Lock,
  History,
  ShieldAlert,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types/auth';
import { sampleUsers } from '../data/sampleUsers';

interface LoginerProfileViewProps {
  currentUser: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onLogout: () => void;
  onSwitchUser: (newUser: UserProfile) => void;
  themeMode: 'tally' | 'bahikhata';
}

export const LoginerProfileView: React.FC<LoginerProfileViewProps> = ({
  currentUser,
  onUpdateUser,
  onLogout,
  onSwitchUser,
  themeMode,
}) => {
  const isBahi = themeMode === 'bahikhata';

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(currentUser);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Security change password state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMessage, setPwdMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser(formData);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleCancel = () => {
    setFormData(currentUser);
    setIsEditing(false);
  };

  const handleToggle2FA = () => {
    const updated = {
      ...formData,
      twoFactorEnabled: !formData.twoFactorEnabled,
    };
    setFormData(updated);
    onUpdateUser(updated);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      setPwdMessage({ type: 'error', text: 'All password fields are required.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setPwdMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setPwdMessage({ type: 'success', text: 'Password successfully updated! MCA Audit Trail recorded.' });
    setTimeout(() => {
      setShowPasswordModal(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPwdMessage(null);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner: User Identity Card */}
      <div
        className={`p-6 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isBahi ? 'bg-[#fffefb] border-amber-300' : 'bg-white border-slate-200'
        } shadow-xs`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl shrink-0 shadow-sm border ${
              currentUser.role === 'Director & Owner'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-serif'
                : currentUser.role === 'Statutory Auditor (CA)'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-teal-600 text-white border-teal-500'
            }`}
          >
            {currentUser.initials}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {currentUser.name}
              </h2>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                  currentUser.role === 'Director & Owner'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : currentUser.role === 'Statutory Auditor (CA)'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-teal-100 text-teal-900 border-teal-300'
                }`}
              >
                {currentUser.role}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Workstation
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
              <span>{currentUser.designation}</span>
              <span>·</span>
              <span className="font-mono text-slate-600">{currentUser.email}</span>
              <span>·</span>
              <span className="font-mono">ID: {currentUser.employeeId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {saveSuccess && (
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> Profile Updated
            </span>
          )}
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          )}

          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-300 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-slate-500" />
            <span>Password</span>
          </button>

          <button
            onClick={onLogout}
            title="Sign out of this session and return to Login Screen"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-700 hover:bg-red-50 border border-red-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-red-600" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          className={`p-4 rounded-xl border ${
            isBahi ? 'bg-[#fffefb] border-amber-200' : 'bg-white border-slate-200'
          } shadow-xs`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Tally Prime User GUID
          </div>
          <div className="text-xs font-mono font-bold text-slate-900 mt-1 truncate">
            {currentUser.tallyUserGuid}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">MCA Rule 3 Compliant</div>
        </div>

        <div
          className={`p-4 rounded-xl border ${
            isBahi ? 'bg-[#fffefb] border-amber-200' : 'bg-white border-slate-200'
          } shadow-xs`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Assigned Department
          </div>
          <div className="text-xs font-bold text-slate-900 mt-1 truncate">
            {currentUser.department}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Member since {currentUser.joinedDate}</div>
        </div>

        <div
          className={`p-4 rounded-xl border ${
            isBahi ? 'bg-[#fffefb] border-amber-200' : 'bg-white border-slate-200'
          } shadow-xs`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            2-Factor Authentication
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-xs font-bold ${
                currentUser.twoFactorEnabled ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {currentUser.twoFactorEnabled ? 'Enabled (TOTP)' : 'Disabled'}
            </span>
            <button
              onClick={handleToggle2FA}
              className="text-[10px] text-teal-600 hover:underline font-semibold"
            >
              {currentUser.twoFactorEnabled ? 'Turn Off' : 'Enable 2FA'}
            </button>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Secured with OTP token</div>
        </div>

        <div
          className={`p-4 rounded-xl border ${
            isBahi ? 'bg-[#fffefb] border-amber-200' : 'bg-white border-slate-200'
          } shadow-xs`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Last Sign-In Session
          </div>
          <div className="text-xs font-bold text-slate-900 mt-1 truncate">
            {currentUser.lastLogin}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-mono truncate">
            IP: {currentUser.ipAddress}
          </div>
        </div>
      </div>

      {/* Switch Demo Operator Profile Quick Bar */}
      <div
        className={`p-4 rounded-xl border ${
          isBahi ? 'bg-[#fffefb] border-amber-200' : 'bg-slate-50 border-slate-200'
        } shadow-xs`}
      >
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200/60">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Switch Logged-in Operator Profile</span>
          </div>
          <span className="text-[11px] text-slate-500">Instant test switcher</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {sampleUsers.map((user) => {
            const isCurrent = user.id === currentUser.id;
            return (
              <button
                key={user.id}
                onClick={() => onSwitchUser(user)}
                disabled={isCurrent}
                className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                  isCurrent
                    ? 'bg-teal-50 border-teal-300 ring-1 ring-teal-500/20'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-[11px] ${
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
                    <div className="text-xs font-bold text-slate-900">{user.name}</div>
                    <div className="text-[10px] text-slate-500">{user.role}</div>
                  </div>
                </div>
                {isCurrent ? (
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded">
                    Current
                  </span>
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form: Loginer Details */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Personal & Contact Information */}
        <div
          className={`p-6 rounded-xl border ${
            isBahi ? 'bg-[#fffefb] border-amber-200' : 'bg-white border-slate-200'
          } shadow-xs space-y-4`}
        >
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Personal Information &amp; Contact
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-500 font-medium block mb-1">Full Legal Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-teal-500"
                />
              ) : (
                <span className="font-semibold text-slate-900 block">{currentUser.name}</span>
              )}
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">Business Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-teal-500"
                />
              ) : (
                <div className="flex items-center gap-1.5 font-medium text-slate-900">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentUser.email}</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">Contact Phone</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-teal-500"
                />
              ) : (
                <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-900">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentUser.phone}</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">Assigned Role</label>
              {isEditing ? (
                <select
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value as UserRole)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Director & Owner">Director &amp; Owner</option>
                  <option value="Senior Tally Accountant">Senior Tally Accountant</option>
                  <option value="Statutory Auditor (CA)">Statutory Auditor (CA)</option>
                  <option value="Tax Consultant">Tax Consultant</option>
                  <option value="Billing Clerk">Billing Clerk</option>
                </select>
              ) : (
                <span className="font-semibold text-slate-900 block">{currentUser.role}</span>
              )}
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">Official Designation</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => handleChange('designation', e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                />
              ) : (
                <span className="font-semibold text-slate-900 block">{currentUser.designation}</span>
              )}
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">Employee / Operator Code</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => handleChange('employeeId', e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-teal-500"
                />
              ) : (
                <span className="font-mono font-bold text-slate-900 block">{currentUser.employeeId}</span>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Granted Permissions & Accounting Capabilities */}
        <div
          className={`p-6 rounded-xl border ${
            isBahi ? 'bg-[#fffefb] border-amber-200' : 'bg-white border-slate-200'
          } shadow-xs space-y-4`}
        >
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Role Permissions &amp; System Capabilities
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentUser.permissions.map((perm, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">{perm}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: MCA Rule 3 Audit Trail Logs for this User */}
        <div
          className={`p-6 rounded-xl border ${
            isBahi ? 'bg-[#fffefb] border-amber-200' : 'bg-white border-slate-200'
          } shadow-xs space-y-4`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-teal-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Statutory Audit Trail Activity Logs (MCA Rule 3)
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Immutable Log</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                  <th className="py-2 px-3 font-semibold">Timestamp</th>
                  <th className="py-2 px-3 font-semibold">Module</th>
                  <th className="py-2 px-3 font-semibold">Action Description</th>
                  <th className="py-2 px-3 font-semibold">Workstation / IP</th>
                  <th className="py-2 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentUser.auditTrailLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 text-slate-500 font-mono whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                      {log.module}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{log.action}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {log.ipAddress}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          log.status === 'Success'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.status === 'Warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              <span>Save Loginer Profile Changes</span>
            </button>
          </div>
        )}
      </form>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-xl border p-6 shadow-2xl relative ${
              isBahi ? 'bg-[#fffefb] border-amber-300' : 'bg-white border-slate-200'
            }`}
          >
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
              <KeyRound className="w-4 h-4 text-teal-600" />
              <span>Update Security Password</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your current password and establish a new secret key for operator {currentUser.name}.
            </p>

            {pwdMessage && (
              <div
                className={`p-3 rounded-lg text-xs mb-4 flex items-center gap-2 ${
                  pwdMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {pwdMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{pwdMessage.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
