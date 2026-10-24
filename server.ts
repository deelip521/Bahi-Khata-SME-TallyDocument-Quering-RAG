import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Server-side Gemini client utility as per gemini-api guidelines
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Primary RAG query endpoint for SME Tally & Bahi-Khata
app.post('/api/rag/query', async (req: Request, res: Response) => {
  try {
    const { query, documents, companyContext, language } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server. Please check the Secrets panel.',
      });
    }

    // Build specialized prompt for Indian SME Chartered Accountant & Tally Specialist
    const systemPrompt = `You are "Bahi-Khata AI", a senior Chartered Accountant (CA) and Tally Prime specialist for Indian Small & Medium Enterprises (SMEs).
You are equipped with high-precision Retrieval-Augmented Generation (RAG) over the SME's actual Tally Daybook, Ledgers, Invoices, and GST records.

CORE ACCOUNTING PRINCIPLES TO UPHOLD:
1. Double Entry Bookkeeping: Total Debit must always equal Total Credit.
2. Classification of Accounts: Personal Accounts (Debit receiver, Credit giver), Real Accounts (Debit what comes in, Credit what goes out), Nominal Accounts (Debit expenses/losses, Credit incomes/gains).
3. Indian GST Rules: CGST + SGST for Intra-State supplies, IGST for Inter-State supplies. Tax slabs: 0%, 5%, 12%, 18%, 28%. Input Tax Credit (ITC) eligibility.
4. MSME Compliance: Payments to Micro & Small Enterprises must be settled within 45 days (Section 43B(h) of Income Tax Act) to be tax-deductible in that fiscal year.
5. Section 40A(3): Disallowance of cash payments exceeding ₹10,000 in a single day to a single person.
6. Currency Format: Represent Indian currency using the Rupee symbol and Indian numbering system (e.g., ₹1,25,000.00).

ANSWER FORMAT INSTRUCTIONS:
- Respond strictly in professional English. Do not mix Hindi, Hinglish, or bilingual phrasing. Maintain a crisp, formal Chartered Accountant reporting style.
- Directly answer the query with exact numbers, dates, parties, and voucher numbers.
- Provide clear references/citations using the format [VCH-XXX] or [LEDGER: Party Name].
- Return response in valid JSON with the following structure:
{
  "summary": "Direct executive summary of the answer",
  "detailedAnswer": "Comprehensive markdown explanation with tables/bullet points if applicable",
  "calculatedMetrics": [
    { "label": "Total Amount / Outstanding", "value": "₹XX,XXX", "type": "neutral|positive|negative" }
  ],
  "citations": [
    {
      "voucherNumber": "VCH-2024-001",
      "date": "2024-10-15",
      "party": "Party Name",
      "amount": "₹50,000.00",
      "type": "Sales|Purchase|Payment|Receipt|Journal|Contra",
      "context": "Brief note why this record is relevant to the question"
    }
  ],
  "auditObservations": [
    "Any statutory warning or observation e.g. 45-day MSME overdue, high cash payment, GST rate check"
  ],
  "suggestedFollowUps": [
    "3 relevant follow-up accounting questions the user might ask next"
  ]
}`;

    const contextPayload = `Company: ${companyContext?.name || 'M/s Shree Ganesh Spices & Textile Traders'} (GSTIN: ${companyContext?.gstin || '24AABCS1429B1Z2'})
Financial Year: ${companyContext?.financialYear || '2024-2025'}

RELEVANT RETRIEVED TALLY VOUCHERS AND LEDGER RECORDS:
${JSON.stringify(documents || [], null, 2)}

USER INQUIRY:
"${query}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contextPayload,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const responseText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      parsedData = {
        summary: responseText,
        detailedAnswer: responseText,
        citations: [],
        calculatedMetrics: [],
        auditObservations: [],
        suggestedFollowUps: [],
      };
    }

    res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Error processing RAG query:', error);
    res.status(500).json({
      error: error.message || 'Failed to process RAG query',
    });
  }
});

// Document parsing & extraction endpoint using Gemini
app.post('/api/rag/parse-document', async (req: Request, res: Response) => {
  try {
    const { content, fileType, fileName } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'File content is required' });
    }

    if (!ai) {
      return res.status(503).json({ error: 'Gemini API not configured' });
    }

    const extractionPrompt = `You are a Tally ERP & Indian GST document parser.
Analyze the following raw accounting document content (${fileName || 'document'}) and extract all accounting vouchers and ledgers.
Map them into clean structured JSON:
{
  "docTitle": "Title or company header",
  "detectedFormat": "Tally XML / Daybook CSV / Invoice / Bahi-Khata Register",
  "vouchers": [
    {
      "voucherNumber": "string",
      "date": "YYYY-MM-DD",
      "voucherType": "Sales|Purchase|Payment|Receipt|Contra|Journal|Credit Note|Debit Note",
      "partyName": "string",
      "partyGstin": "string or null",
      "amount": number,
      "narration": "string",
      "debitLedgers": [{"ledger": "string", "amount": number}],
      "creditLedgers": [{"ledger": "string", "amount": number}],
      "gstDetails": {
        "cgst": number,
        "sgst": number,
        "igst": number,
        "hsnCode": "string"
      }
    }
  ],
  "summaryNotes": "Key points extracted"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `${extractionPrompt}\n\nDOCUMENT CONTENT:\n${content.slice(0, 30000)}`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, result: parsed });
  } catch (error: any) {
    console.error('Error parsing document:', error);
    res.status(500).json({ error: error.message || 'Document parsing failed' });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Bahi-Khata Tally RAG Server running on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
