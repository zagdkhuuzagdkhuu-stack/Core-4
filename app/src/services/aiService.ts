import OpenAI from "openai";
import { LegalContext } from "./lawService";

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

export interface LegalReference {
  clauseTitle: string;
  lawTitle: string;
  articleNumber: string | null;
  relevance: string;
  reasoning: string;
}

export interface CostEstimate {
  estimatedCost: number | null;
  currency: string;
  breakdown: string[];
  confidence: "LOW" | "MEDIUM" | "HIGH";
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
  legalReferences: LegalReference[];
  costEstimate: CostEstimate;
}

const CHARS_LIMIT = 45000;

function buildUserMessage(text: string, legalCtx: LegalContext): string {
  const parts = [`=== CONTRACT TEXT ===\n${text}`];

  if (legalCtx.relevantLaws.length > 0) {
    parts.push(
      `\n=== RELEVANT LAWS ===\n${legalCtx.relevantLaws
        .map((l) => `- ${l.title}${l.category ? ` (${l.category})` : ""}`)
        .join("\n")}`
    );
  }

  if (legalCtx.relevantArticles.length > 0) {
    parts.push(
      `\n=== RELEVANT LAW ARTICLES ===\n${legalCtx.relevantArticles
        .map(
          (a) =>
            `- [${a.lawTitle}]${a.articleNumber ? ` Art.${a.articleNumber}` : ""}${a.title ? ` ${a.title}` : ""}: ${a.content.slice(0, 500)}`
        )
        .join("\n")}`
    );
  }

  if (legalCtx.relevantTemplates.length > 0) {
    parts.push(
      `\n=== RELEVANT CLAUSE TEMPLATES ===\n${legalCtx.relevantTemplates
        .map(
          (t) =>
            `- ${t.title}${t.contractType ? ` (${t.contractType})` : ""}${t.riskLevel ? ` [${t.riskLevel}]` : ""}: ${t.content.slice(0, 300)}`
        )
        .join("\n")}`
    );
  }

  return parts.join("\n\n").slice(0, CHARS_LIMIT);
}

const CLAUSE_SYSTEM_PROMPT = `You are a contract clause extraction specialist. Extract every individual clause from the contract. For each clause return:
- title: clause name
- content: the full clause text
- clauseType: category (e.g. "Payment", "Termination", "Confidentiality", "Liability", "Governing Law", "Delivery", "Warranty", "Indemnification", "General")
- riskLevel: "LOW", "MEDIUM", or "HIGH"
- explanation: why this clause has that risk level
- orderNo: sequential number

Consider the provided legal context (laws, articles, clause templates) when determining risk levels and clause types.

Return ONLY a JSON object with a "clauses" array.`;

const RISK_SYSTEM_PROMPT = `You are a contract risk analyst. Analyze the contract text and return a JSON object with:
- summary: 2-3 sentence executive summary
- riskScore: integer 0-100
- risks: array of identified risk descriptions
- missingClauses: array of important missing clause types
- riskyTerms: array of specific risky terms/phrases found
- complianceWarnings: array of compliance concerns referencing relevant laws
- estimatedCost: estimated contract value in MNT (number or null)
- inconsistentWording: array of inconsistent or contradictory terms found

Use the provided legal context (laws, articles, clause templates) to ground your analysis in actual legal requirements.`;

const LEGAL_REFERENCE_SYSTEM_PROMPT = `You are a legal reference specialist. Given a contract text and relevant legal resources (laws, articles, clause templates), identify which specific legal provisions apply to each clause in the contract.

For each clause in the contract, find matching legal references. Return a JSON object with a "legalReferences" array where each item has:
- clauseTitle: the name of the clause in the contract
- lawTitle: the title of the relevant law
- articleNumber: the specific article number (or null)
- relevance: "DIRECT" if the article directly governs this clause, "RELATED" if tangentially related
- reasoning: brief explanation of why this legal provision applies

If no law articles match a clause, still note it as missing legal coverage.`;

const COST_SYSTEM_PROMPT = `You are a contract cost estimation specialist. Analyze the contract text along with relevant clause templates to estimate the contract's financial value.

Return a JSON object with:
- estimatedCost: estimated total contract value in MNT (number or null if not determinable)
- currency: "MNT"
- breakdown: array of cost factors or components considered (e.g. "Base contract value", "Penalty clauses", "Service fees", "Inflation adjustment")
- confidence: "LOW", "MEDIUM", or "HIGH" based on how clearly the contract states financial terms

Use any clause templates provided as reference benchmarks for typical costs in similar contracts.`;

async function callGPT(systemPrompt: string, userContent: string): Promise<any> {
  const openai = getOpenAIClient();
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });
  return JSON.parse(res.choices[0]?.message?.content || "{}");
}

export async function analyzeWithCrewAI(
  text: string,
  legalCtx: LegalContext
): Promise<AnalysisResult> {
  const userMsg = buildUserMessage(text, legalCtx);

  const [clauseRes, riskRes, legalRefRes, costRes] = await Promise.all([
    callGPT(CLAUSE_SYSTEM_PROMPT, userMsg),
    callGPT(RISK_SYSTEM_PROMPT, userMsg),
    callGPT(LEGAL_REFERENCE_SYSTEM_PROMPT, userMsg),
    callGPT(COST_SYSTEM_PROMPT, userMsg),
  ]);

  const clauses: ClauseResult[] = (clauseRes.clauses || []).map(
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

  const legalReferences: LegalReference[] = (
    legalRefRes.legalReferences || []
  ).map((r: any) => ({
    clauseTitle: r.clauseTitle || "",
    lawTitle: r.lawTitle || "",
    articleNumber: r.articleNumber || null,
    relevance: r.relevance || "RELATED",
    reasoning: r.reasoning || "",
  }));

  const costEstimate: CostEstimate = {
    estimatedCost: costRes.estimatedCost ? Number(costRes.estimatedCost) : null,
    currency: costRes.currency || "MNT",
    breakdown: Array.isArray(costRes.breakdown) ? costRes.breakdown : [],
    confidence: ["LOW", "MEDIUM", "HIGH"].includes(costRes.confidence)
      ? costRes.confidence
      : "LOW",
  };

  return {
    summary: riskRes.summary || "",
    riskScore: Math.min(100, Math.max(0, Number(riskRes.riskScore) || 0)),
    risks: Array.isArray(riskRes.risks) ? riskRes.risks : [],
    missingClauses: Array.isArray(riskRes.missingClauses)
      ? riskRes.missingClauses
      : [],
    riskyTerms: Array.isArray(riskRes.riskyTerms) ? riskRes.riskyTerms : [],
    complianceWarnings: Array.isArray(riskRes.complianceWarnings)
      ? riskRes.complianceWarnings
      : [],
    estimatedCost: costEstimate.estimatedCost,
    inconsistentWording: Array.isArray(riskRes.inconsistentWording)
      ? riskRes.inconsistentWording
      : [],
    clauses,
    legalReferences,
    costEstimate,
  };
}

export async function analyzeWithSingleCall(
  text: string,
  legalCtx: LegalContext
): Promise<AnalysisResult> {
  const userMsg = buildUserMessage(text, legalCtx);

  const ANALYSIS_SYSTEM_PROMPT = `You are a senior contract analysis AI. Analyze the contract text and return a JSON object.

Extract all individual clauses from the contract. For each clause determine:
- title: clause name
- content: the full clause text
- clauseType: category
- riskLevel: "LOW", "MEDIUM", or "HIGH"
- explanation: why this clause has that risk level
- orderNo: sequential number

Then provide the overall analysis:
- summary: 2-3 sentence executive summary
- riskScore: integer 0-100
- risks: array of identified risk descriptions
- missingClauses: array of important missing clause types
- riskyTerms: array of specific risky terms/phrases found
- complianceWarnings: array of compliance/regulatory concerns
- estimatedCost: estimated contract value in MNT (number or null)
- inconsistentWording: array of inconsistent or contradictory terms found
- legalReferences: array of { clauseTitle, lawTitle, articleNumber, relevance, reasoning }
- costEstimate: { estimatedCost, currency: "MNT", breakdown: string[], confidence: "LOW"|"MEDIUM"|"HIGH" }

Use the provided legal context (laws, articles, clause templates) to ground your analysis.`;

  const raw = await callGPT(ANALYSIS_SYSTEM_PROMPT, userMsg);

  const clauses: ClauseResult[] = (raw.clauses || []).map(
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

  const legalReferences: LegalReference[] = (
    raw.legalReferences || []
  ).map((r: any) => ({
    clauseTitle: r.clauseTitle || "",
    lawTitle: r.lawTitle || "",
    articleNumber: r.articleNumber || null,
    relevance: r.relevance || "RELATED",
    reasoning: r.reasoning || "",
  }));

  const costEstimate: CostEstimate = {
    estimatedCost: raw.costEstimate?.estimatedCost
      ? Number(raw.costEstimate.estimatedCost)
      : null,
    currency: raw.costEstimate?.currency || "MNT",
    breakdown: Array.isArray(raw.costEstimate?.breakdown)
      ? raw.costEstimate.breakdown
      : [],
    confidence: ["LOW", "MEDIUM", "HIGH"].includes(raw.costEstimate?.confidence)
      ? raw.costEstimate.confidence
      : "LOW",
  };

  return {
    summary: raw.summary || "",
    riskScore: Math.min(100, Math.max(0, Number(raw.riskScore) || 0)),
    risks: Array.isArray(raw.risks) ? raw.risks : [],
    missingClauses: Array.isArray(raw.missingClauses) ? raw.missingClauses : [],
    riskyTerms: Array.isArray(raw.riskyTerms) ? raw.riskyTerms : [],
    complianceWarnings: Array.isArray(raw.complianceWarnings)
      ? raw.complianceWarnings
      : [],
    estimatedCost: costEstimate.estimatedCost,
    inconsistentWording: Array.isArray(raw.inconsistentWording)
      ? raw.inconsistentWording
      : [],
    clauses,
    legalReferences,
    costEstimate,
  };
}

export async function analyzeContract(
  text: string,
  legalCtx: LegalContext,
  mode: "crew" | "single" = "crew"
): Promise<AnalysisResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in environment variables.");
  }
  return mode === "crew"
    ? analyzeWithCrewAI(text, legalCtx)
    : analyzeWithSingleCall(text, legalCtx);
}
