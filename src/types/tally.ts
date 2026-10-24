export type VoucherType =
  | 'Sales'
  | 'Purchase'
  | 'Payment'
  | 'Receipt'
  | 'Contra'
  | 'Journal'
  | 'Credit Note'
  | 'Debit Note';

export type EntityType =
  | 'Sole Proprietorship'
  | 'Partnership Firm'
  | 'Private Limited'
  | 'Limited Liability Partnership (LLP)'
  | 'Public Limited';

export interface LedgerEntry {
  ledger: string;
  amount: number;
  type: 'Dr' | 'Cr';
  isParty?: boolean;
}

export interface GstDetail {
  cgst: number;
  sgst: number;
  igst: number;
  ratePercent: number;
  hsnCode: string;
  eWayBillNo?: string;
  isRcm?: boolean;
}

export interface TallyVoucher {
  id: string;
  companyId?: string;
  voucherNumber: string;
  date: string; // YYYY-MM-DD
  voucherType: VoucherType;
  partyName: string;
  partyGstin?: string;
  amount: number;
  narration: string;
  debitEntries: LedgerEntry[];
  creditEntries: LedgerEntry[];
  gst?: GstDetail;
  paymentStatus?: 'Paid' | 'Partially Paid' | 'Unpaid';
  dueDate?: string;
  daysOverdue?: number;
  isMsme?: boolean;
  docSource: string;
}

export interface BahiKhataAccount {
  companyId?: string;
  partyName: string;
  partyType: 'Sundry Debtor' | 'Sundry Creditor' | 'Bank' | 'Cash' | 'Expense' | 'Revenue';
  contactPerson?: string;
  phone?: string;
  city?: string;
  state?: string;
  gstin?: string;
  msmeRegistered?: boolean;
  creditPeriodDays?: number;
  creditLimit?: number; // Sanctioned credit limit in INR (receivables cap)
  openingBalance: number; // positive = Dr / Udhaar (receivable), negative = Cr / Jama (payable)
  currentBalance: number;
  totalUdhaar: number; // Total Debits
  totalJama: number;   // Total Credits
  lastTransactionDate: string;
}

export interface RegisteredDocument {
  id: string;
  companyId: string;
  fileName: string;
  fileType: 'Tally XML' | 'Daybook CSV' | 'Tax Invoice' | 'Bank Statement';
  uploadDate: string;
  voucherCount: number;
  fileSize: string;
  status: 'Indexed' | 'Verified' | 'Archived';
  parsedSummary: string;
}

export interface RagCitation {
  voucherNumber: string;
  date: string;
  party: string;
  amount: string;
  type: string;
  context: string;
}

export interface RagMetric {
  label: string;
  value: string;
  type?: 'neutral' | 'positive' | 'negative';
}

export interface RagResponseData {
  summary: string;
  detailedAnswer: string;
  calculatedMetrics?: RagMetric[];
  citations?: RagCitation[];
  auditObservations?: string[];
  suggestedFollowUps?: string[];
}

export interface CompanyProfile {
  id: string;
  name: string;
  tradeName: string;
  entityType?: EntityType;
  industryType?: string;
  cinNumber?: string;
  gstin: string;
  pan: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  phone: string;
  email: string;
  financialYear: string;
  booksBeginningDate: string;
  udyamNumber: string;
  gstRegistrationType: string;
  authorizedSignatory: string;
  caFirm: string;
  caMembershipNumber: string;
  upiId: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    ifsc: string;
    branch: string;
  };
  createdDate?: string;
}

export interface GstSummary {
  taxPeriod: string;
  grossSales: number;
  grossPurchases: number;
  outputCgst: number;
  outputSgst: number;
  outputIgst: number;
  totalOutputTax: number;
  inputCgst: number;
  inputSgst: number;
  inputIgst: number;
  totalInputTax: number;
  netTaxPayable: number;
  itcAvailable: number;
}
