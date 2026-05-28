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

export type QPayInvoiceResponse = {
  invoice_id: string;
  qr_text?: string;
  qr_image?: string;
  urls?: {
    name?: string;
    description?: string;
    link?: string;
  }[];
};

export type QPayCheckResponse = {
  paid: boolean;
  count?: number;
  paid_amount?: number;
};

export type AuthUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthMeResponse = {
  user: AuthUser;
  profile: {
    isComplete: boolean;
    missingFields: string[];
  };
  access: {
    isPaid: boolean;
    subscription: {
      id: string;
      plan: string;
      status: string;
      startDate: string;
      endDate: string | null;
    } | null;
  };
};

export type AuthPayload = {
  token: string;
  user: AuthUser;
};

export type PaymentStatusResponse = {
  isPaid: boolean;
  latestPayment?: unknown;
  subscription?: unknown;
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

function withAuthHeaders(token: string, extras?: HeadersInit): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    ...(extras || {}),
  };
}

export async function fetchTemplates() {
  const response = await fetch(`${API_BASE_URL}/api/public/templates`);
  return parseJsonResponse<{ categories: TemplateCategory[]; templates: TemplateSummary[] }>(response);
}

export async function uploadDocumentForAnalysis(file: File, mode: AnalysisResponse["mode"] = "crew") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mode", mode);

  const response = await fetch(`${API_BASE_URL}/api/public/upload-analysis`, {
    method: "POST",
    body: formData,
  });

  return parseJsonResponse<AnalysisResponse>(response);
}

export async function createPublicQPayInvoice(input: { amount: number; description: string }) {
  const response = await fetch(`${API_BASE_URL}/api/payments/qpay/public-invoices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return parseJsonResponse<QPayInvoiceResponse>(response);
}

export async function checkQPayInvoice(invoiceId: string) {
  const response = await fetch(`${API_BASE_URL}/api/payments/qpay/check/${encodeURIComponent(invoiceId)}`);
  return parseJsonResponse<QPayCheckResponse>(response);
}

export async function loginWithGoogle(idToken: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken }),
  });

  return parseJsonResponse<AuthPayload>(response);
}

export async function fetchMe(token: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: withAuthHeaders(token),
  });

  return parseJsonResponse<AuthMeResponse>(response);
}

export async function updateMyProfile(
  token: string,
  payload: { firstName?: string; lastName?: string; fullName?: string; avatarUrl?: string },
) {
  const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
    method: "PATCH",
    headers: withAuthHeaders(token, {
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<AuthMeResponse>(response);
}

export async function listMyDocuments(token: string) {
  const response = await fetch(`${API_BASE_URL}/api/documents`, {
    headers: withAuthHeaders(token),
  });
  return parseJsonResponse<{ documents: Array<any> }>(response);
}

export async function listMyContracts(token: string) {
  const response = await fetch(`${API_BASE_URL}/api/contracts`, {
    headers: withAuthHeaders(token),
  });
  return parseJsonResponse<{ contracts: Array<any> }>(response);
}

export async function saveAnalyzedDocument(
  token: string,
  payload: {
    title: string;
    content: string;
    fileName?: string;
    fileUrl?: string;
    fileType?: string;
  },
) {
  const response = await fetch(`${API_BASE_URL}/api/documents`, {
    method: "POST",
    headers: withAuthHeaders(token, {
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });
  return parseJsonResponse<{ document: any }>(response);
}

export async function saveGeneratedContract(
  token: string,
  payload: {
    title: string;
    content: string;
    contractType?: string;
    value?: number;
  },
) {
  const response = await fetch(`${API_BASE_URL}/api/contracts`, {
    method: "POST",
    headers: withAuthHeaders(token, {
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });
  return parseJsonResponse<{ contract: any }>(response);
}

export async function fetchMyPaymentStatus(token: string) {
  const response = await fetch(`${API_BASE_URL}/api/payments/status/me`, {
    headers: withAuthHeaders(token),
  });
  return parseJsonResponse<PaymentStatusResponse>(response);
}

export async function activatePaidAccess(token: string, invoiceId: string) {
  const response = await fetch(`${API_BASE_URL}/api/payments/qpay/activate-access`, {
    method: "POST",
    headers: withAuthHeaders(token, {
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ invoiceId }),
  });
  return parseJsonResponse<{ isPaid: boolean }>(response);
}
