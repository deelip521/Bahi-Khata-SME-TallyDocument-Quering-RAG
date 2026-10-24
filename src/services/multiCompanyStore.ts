import {
  CompanyProfile,
  TallyVoucher,
  BahiKhataAccount,
  GstSummary,
  RegisteredDocument,
} from '../types/tally';
import { initialCompaniesDataset, CompanyDataset } from '../data/sampleCompanies';

const STORAGE_COMPANIES_KEY = 'bahi_khata_companies_v2';
const STORAGE_ACTIVE_COMPANY_ID_KEY = 'bahi_khata_active_company_id_v2';

export class MultiCompanyStore {
  // Retrieve list of all companies
  static getCompanies(): CompanyProfile[] {
    try {
      const stored = localStorage.getItem(STORAGE_COMPANIES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load companies from localStorage', e);
    }
    // Default: Return the 3 sister entities
    const defaults = Object.values(initialCompaniesDataset).map((d) => d.company);
    MultiCompanyStore.saveCompanies(defaults);
    return defaults;
  }

  // Save list of companies
  static saveCompanies(companies: CompanyProfile[]): void {
    try {
      localStorage.setItem(STORAGE_COMPANIES_KEY, JSON.stringify(companies));
    } catch (e) {
      console.warn('Failed to save companies to localStorage', e);
    }
  }

  // Active Company ID
  static getActiveCompanyId(): string {
    try {
      const stored = localStorage.getItem(STORAGE_ACTIVE_COMPANY_ID_KEY);
      if (stored) {
        const companies = MultiCompanyStore.getCompanies();
        if (companies.some((c) => c.id === stored)) {
          return stored;
        }
      }
    } catch (e) {
      console.warn('Failed to get active company ID', e);
    }
    return 'comp-001';
  }

  static setActiveCompanyId(companyId: string): void {
    try {
      localStorage.setItem(STORAGE_ACTIVE_COMPANY_ID_KEY, companyId);
    } catch (e) {
      console.warn('Failed to set active company ID', e);
    }
  }

  // Get active company profile
  static getActiveCompany(): CompanyProfile {
    const activeId = MultiCompanyStore.getActiveCompanyId();
    const companies = MultiCompanyStore.getCompanies();
    return companies.find((c) => c.id === activeId) || companies[0];
  }

  // Isolated Vouchers
  static getVouchers(companyId: string): TallyVoucher[] {
    try {
      const key = `bahi_khata_vouchers_${companyId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn(`Failed to load vouchers for company ${companyId}`, e);
    }
    // Fallback to sample dataset if present
    const dataset = initialCompaniesDataset[companyId];
    if (dataset) {
      MultiCompanyStore.saveVouchers(companyId, dataset.vouchers);
      return dataset.vouchers;
    }
    return [];
  }

  static saveVouchers(companyId: string, vouchers: TallyVoucher[]): void {
    try {
      const key = `bahi_khata_vouchers_${companyId}`;
      localStorage.setItem(key, JSON.stringify(vouchers));
    } catch (e) {
      console.warn(`Failed to save vouchers for company ${companyId}`, e);
    }
  }

  // Isolated Accounts / Ledgers
  static getAccounts(companyId: string): BahiKhataAccount[] {
    try {
      const key = `bahi_khata_accounts_${companyId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn(`Failed to load accounts for company ${companyId}`, e);
    }
    const dataset = initialCompaniesDataset[companyId];
    if (dataset) {
      MultiCompanyStore.saveAccounts(companyId, dataset.accounts);
      return dataset.accounts;
    }
    return [];
  }

  static saveAccounts(companyId: string, accounts: BahiKhataAccount[]): void {
    try {
      const key = `bahi_khata_accounts_${companyId}`;
      localStorage.setItem(key, JSON.stringify(accounts));
    } catch (e) {
      console.warn(`Failed to save accounts for company ${companyId}`, e);
    }
  }

  // Isolated Documents Vault
  static getDocuments(companyId: string): RegisteredDocument[] {
    try {
      const key = `bahi_khata_docs_${companyId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn(`Failed to load documents for company ${companyId}`, e);
    }
    const dataset = initialCompaniesDataset[companyId];
    if (dataset) {
      MultiCompanyStore.saveDocuments(companyId, dataset.documents);
      return dataset.documents;
    }
    return [];
  }

  static saveDocuments(companyId: string, docs: RegisteredDocument[]): void {
    try {
      const key = `bahi_khata_docs_${companyId}`;
      localStorage.setItem(key, JSON.stringify(docs));
    } catch (e) {
      console.warn(`Failed to save documents for company ${companyId}`, e);
    }
  }

  static addDocument(companyId: string, doc: RegisteredDocument): void {
    const existing = MultiCompanyStore.getDocuments(companyId);
    MultiCompanyStore.saveDocuments(companyId, [doc, ...existing]);
  }

  // Isolated GST Summary
  static getGstSummary(companyId: string): GstSummary {
    try {
      const key = `bahi_khata_gst_${companyId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn(`Failed to load GST summary for company ${companyId}`, e);
    }
    const dataset = initialCompaniesDataset[companyId];
    if (dataset) {
      return dataset.gstSummary;
    }
    return {
      taxPeriod: 'Current Fiscal Period',
      grossSales: 0,
      grossPurchases: 0,
      outputCgst: 0,
      outputSgst: 0,
      outputIgst: 0,
      totalOutputTax: 0,
      inputCgst: 0,
      inputSgst: 0,
      inputIgst: 0,
      totalInputTax: 0,
      netTaxPayable: 0,
      itcAvailable: 0,
    };
  }

  // Register a new company with isolation
  static registerCompany(
    newCompany: CompanyProfile,
    initialVouchers: TallyVoucher[] = [],
    initialAccounts: BahiKhataAccount[] = [],
    initialDocs: RegisteredDocument[] = []
  ): void {
    const companies = MultiCompanyStore.getCompanies();
    const updated = [...companies, newCompany];
    MultiCompanyStore.saveCompanies(updated);

    // Save isolated data
    MultiCompanyStore.saveVouchers(newCompany.id, initialVouchers);
    MultiCompanyStore.saveAccounts(newCompany.id, initialAccounts);
    MultiCompanyStore.saveDocuments(newCompany.id, initialDocs);

    // Set as active company
    MultiCompanyStore.setActiveCompanyId(newCompany.id);
  }

  // Update existing company profile
  static updateCompany(updated: CompanyProfile): void {
    const companies = MultiCompanyStore.getCompanies();
    const updatedList = companies.map((c) => (c.id === updated.id ? updated : c));
    MultiCompanyStore.saveCompanies(updatedList);
  }

  // Delete company and wipe its isolated keys
  static deleteCompany(companyId: string): void {
    const companies = MultiCompanyStore.getCompanies();
    if (companies.length <= 1) {
      throw new Error('At least one company must remain in Bahi-Khata.');
    }
    const filtered = companies.filter((c) => c.id !== companyId);
    MultiCompanyStore.saveCompanies(filtered);

    // Wipe isolated data keys
    localStorage.removeItem(`bahi_khata_vouchers_${companyId}`);
    localStorage.removeItem(`bahi_khata_accounts_${companyId}`);
    localStorage.removeItem(`bahi_khata_docs_${companyId}`);
    localStorage.removeItem(`bahi_khata_gst_${companyId}`);

    // If active company was deleted, switch to first remaining
    if (MultiCompanyStore.getActiveCompanyId() === companyId) {
      MultiCompanyStore.setActiveCompanyId(filtered[0].id);
    }
  }

  // Reset all companies and their data back to fresh defaults
  static resetAllToDefaults(): void {
    const defaultCompanies = Object.values(initialCompaniesDataset).map((d) => d.company);
    MultiCompanyStore.saveCompanies(defaultCompanies);
    MultiCompanyStore.setActiveCompanyId('comp-001');

    Object.entries(initialCompaniesDataset).forEach(([id, dataset]) => {
      MultiCompanyStore.saveVouchers(id, dataset.vouchers);
      MultiCompanyStore.saveAccounts(id, dataset.accounts);
      MultiCompanyStore.saveDocuments(id, dataset.documents);
    });
  }
}
