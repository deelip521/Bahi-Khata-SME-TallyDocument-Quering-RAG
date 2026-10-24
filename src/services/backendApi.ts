const API_BASE_URL = 'http://127.0.0.1:8000';

export interface BackendCompany {
  id: string;
  name: string;
  email: string;
  industry: string;
}

export interface BackendDocument {
  id: string;
  filename: string;
  content_type: string;
}

export interface AskResponse {
  company_id: string;
  question: string;
  answer: string;
  sources: Array<{
    filename: string;
    line: number;
    text: string;
  }>;
  search_type?: string;
  note?: string;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`API error ${response.status}: ${message}`);
  }

  return response.json() as Promise<T>;
}

export const backendApi = {
  async listCompanies(): Promise<BackendCompany[]> {
    const result = await request<{ companies: BackendCompany[] }>(
      '/companies',
    );
    return result.companies;
  },

  async registerCompany(data: {
    name: string;
    email: string;
    industry: string;
  }): Promise<BackendCompany> {
    const result = await request<{
      company: BackendCompany;
    }>('/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    return result.company;
  },

  async uploadDocument(
    companyId: string,
    file: File,
  ): Promise<{
    message: string;
    document_id: string;
    company_id: string;
    filename: string;
    extracted_characters: number;
    text_preview: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    return request(
      `/companies/${encodeURIComponent(companyId)}/documents`,
      {
        method: 'POST',
        body: formData,
      },
    );
  },

  async listDocuments(
    companyId: string,
  ): Promise<BackendDocument[]> {
    const result = await request<{
      company_id: string;
      documents: BackendDocument[];
    }>(
      `/companies/${encodeURIComponent(companyId)}/documents`,
    );

    return result.documents;
  },

  async ask(
    companyId: string,
    question: string,
  ): Promise<AskResponse> {
    return request<AskResponse>('/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_id: companyId,
        question,
      }),
    });
  },
};