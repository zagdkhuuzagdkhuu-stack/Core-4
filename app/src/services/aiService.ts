import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in environment variables.");
  }

  openaiClient ??= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return openaiClient;
}

export interface ClauseResult {
  title: string;
  content: string;
  clauseType: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  explanation: string;
  orderNo: number;
}

export interface AnalysisResult {
  summary: string;
  riskScore: number;
  risks: string[];
  missingClauses: string[];
  riskyTerms: string[];
  complianceWarnings: string[];
  estimatedCost: number | null;
  inconsistentWording: string[];
  clauses: ClauseResult[];
}

const ANALYSIS_SYSTEM_PROMPT = `You are a senior contract analysis AI. Analyze the contract text and return a JSON object.

Extract all individual clauses from the contract. For each clause determine:
- title: clause name
- content: the full clause text
- clauseType: category (e.g. "Payment", "Termination", "Confidentiality", "Liability", "Governing Law", "Delivery", "Warranty", "Indemnification", "General")
- riskLevel: "LOW", "MEDIUM", or "HIGH" based on how risky the clause is for the signing party
- explanation: why this clause has that risk level
- orderNo: sequential number

Then provide the overall analysis:
- summary: 2-3 sentence executive summary
- riskScore: integer 0-100
- risks: array of identified risk descriptions
- missingClauses: array of important missing clause types (e.g. "termination", "confidentiality", "liability", "payment terms", "dispute resolution")
- riskyTerms: array of specific risky terms/phrases found
- complianceWarnings: array of compliance/regulatory concerns
- estimatedCost: estimated contract value in MNT (number or null)
- inconsistentWording: array of inconsistent or contradictory terms found`;

const CLAUSE_SYSTEM_PROMPT = `You are a contract clause extraction specialist. Extract every individual clause from the contract. For each clause return:
- title: clause name
- content: the full clause text
- clauseType: category
- riskLevel: "LOW", "MEDIUM", or "HIGH"
- explanation: why this clause has that risk level
- orderNo: sequential number

Return ONLY a JSON array of clauses.`;

const RISK_SYSTEM_PROMPT = `You are a contract risk analyst. Analyze the contract text and return a JSON object with:
- summary: 2-3 sentence executive summary
- riskScore: integer 0-100
- risks: array of identified risk descriptions
- missingClauses: array of important missing clause types
- riskyTerms: array of specific risky terms/phrases found
- complianceWarnings: array of compliance concerns
- estimatedCost: estimated contract value in MNT (number or null)
- inconsistentWording: array of inconsistent or contradictory terms found`;

export async function analyzeWithCrewAI(text: string): Promise<AnalysisResult> {
  const trimmed = text.slice(0, 50000);
  const openai = getOpenAIClient();

  const [analysisRes, clausesRes] = await Promise.all([
    openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: RISK_SYSTEM_PROMPT },
        { role: "user", content: trimmed },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    }),
    openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: CLAUSE_SYSTEM_PROMPT },
        { role: "user", content: trimmed },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    }),
  ]);

  const analysis = JSON.parse(analysisRes.choices[0]?.message?.content || "{}");
  const clauseData = JSON.parse(clausesRes.choices[0]?.message?.content || "{}");

  const clauses: ClauseResult[] = (clauseData.clauses || clauseData || []).map(
    (c: any, i: number) => ({
      title: c.title || "Unknown Clause",
      content: c.content || "",
      clauseType: c.clauseType || "General",
      riskLevel: ["LOW", "MEDIUM", "HIGH"].includes(c.riskLevel)
        ? c.riskLevel
        : "MEDIUM",
      explanation: c.explanation || "",
      orderNo: c.orderNo ?? i + 1,
    })
  );

  return {
    summary: analysis.summary || "",
    riskScore: Math.min(100, Math.max(0, Number(analysis.riskScore) || 0)),
    risks: Array.isArray(analysis.risks) ? analysis.risks : [],
    missingClauses: Array.isArray(analysis.missingClauses)
      ? analysis.missingClauses
      : [],
    riskyTerms: Array.isArray(analysis.riskyTerms) ? analysis.riskyTerms : [],
    complianceWarnings: Array.isArray(analysis.complianceWarnings)
      ? analysis.complianceWarnings
      : [],
    estimatedCost: analysis.estimatedCost
      ? Number(analysis.estimatedCost)
      : null,
    inconsistentWording: Array.isArray(analysis.inconsistentWording)
      ? analysis.inconsistentWording
      : [],
    clauses,
  };
}

export async function analyzeWithSingleCall(text: string): Promise<AnalysisResult> {
  const trimmed = text.slice(0, 50000);
  const openai = getOpenAIClient();

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
      { role: "user", content: trimmed },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const raw = JSON.parse(res.choices[0]?.message?.content || "{}");

  const clauses: ClauseResult[] = (raw.clauses || []).map((c: any, i: number) => ({
    title: c.title || "Unknown Clause",
    content: c.content || "",
    clauseType: c.clauseType || "General",
    riskLevel: ["LOW", "MEDIUM", "HIGH"].includes(c.riskLevel)
      ? c.riskLevel
      : "MEDIUM",
    explanation: c.explanation || "",
    orderNo: c.orderNo ?? i + 1,
  }));

  return {
    summary: raw.summary || "",
    riskScore: Math.min(100, Math.max(0, Number(raw.riskScore) || 0)),
    risks: Array.isArray(raw.risks) ? raw.risks : [],
    missingClauses: Array.isArray(raw.missingClauses) ? raw.missingClauses : [],
    riskyTerms: Array.isArray(raw.riskyTerms) ? raw.riskyTerms : [],
    complianceWarnings: Array.isArray(raw.complianceWarnings)
      ? raw.complianceWarnings
      : [],
    estimatedCost: raw.estimatedCost ? Number(raw.estimatedCost) : null,
    inconsistentWording: Array.isArray(raw.inconsistentWording)
      ? raw.inconsistentWording
      : [],
    clauses,
  };
}

export async function analyzeContract(
  text: string,
  mode: "crew" | "single" = "crew"
): Promise<AnalysisResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in environment variables.");
  }
  return mode === "crew"
    ? analyzeWithCrewAI(text)
    : analyzeWithSingleCall(text);
}
