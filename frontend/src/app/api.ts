export type TemplateVariable = {
  key: string;
  label: string;
  type: string;
  required?: boolean;
};

export type TemplateSummary = {
  id: string;
  name: string;
  category: string;
  description: string;
  content: string;
  variables: TemplateVariable[];
};

export type TemplateCategory = {
  name: string;
  items: string[];
};

export type AnalysisResponse = {
  document: {
    title: string;
    fileName: string;
    fileUrl: string;
    extractedText: string;
  };
  analysis: {
    summary: string;
    riskScore: number;
    risks: string[];
    missingClauses: string[];
    riskyTerms: string[];
    inconsistentWording: string[];
    complianceWarnings: string[];
    estimatedCost: number | null;
    legalReferences: unknown[];
    costEstimate?: unknown;
  };
  clauses: {
    title: string;
    content: string;
    clauseType: string;
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
    explanation: string;
    orderNo: number;
  }[];
  mode: "crew" | "single";
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = typeof data.message === "string" ? data.message : "Request failed.";
    if (data.code === "GEMINI_QUOTA_EXCEEDED") {
      throw new Error(message);
    }
    const detail = typeof data.error === "string" ? ` ${data.error}` : "";
    throw new Error(`${message}${detail}`);
  }

  return data as T;
}

export async function fetchTemplates() {
  const response = await fetch(`${API_BASE_URL}/api/public/templates`);
  return parseJsonResponse<{ categories: TemplateCategory[]; templates: TemplateSummary[] }>(response);
}

export async function uploadDocumentForAnalysis(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mode", "single");

  const response = await fetch(`${API_BASE_URL}/api/public/upload-analysis`, {
    method: "POST",
    body: formData,
  });

  return parseJsonResponse<AnalysisResponse>(response);
}
