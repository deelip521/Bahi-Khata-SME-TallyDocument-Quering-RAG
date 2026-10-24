export type UserRole =
  | 'Director & Owner'
  | 'Senior Tally Accountant'
  | 'Statutory Auditor (CA)'
  | 'Tax Consultant'
  | 'Billing Clerk';

export interface AuditLogItem {
  id: string;
  action: string;
  module: string;
  timestamp: string;
  ipAddress: string;
  device: string;
  status: 'Success' | 'Warning' | 'Security';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  designation: string;
  department: string;
  employeeId: string;
  avatarUrl?: string;
  initials: string;
  tallyUserGuid: string;
  permissions: string[];
  twoFactorEnabled: boolean;
  lastLogin: string;
  loginDevice: string;
  ipAddress: string;
  auditTrailLogs: AuditLogItem[];
  joinedDate: string;
}
