import { GoogleGenerativeAI } from "@google/generative-ai";
import { LegalContext } from "./lawService";

let genAI: GoogleGenerativeAI | null = null;

/** Override via GEMINI_MODEL in .env (e.g. gemini-2.5-flash). */
const DEFAULT_GEMINI_MODEL =
  process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";

const GEMINI_MODEL_FALLBACKS = [
  DEFAULT_GEMINI_MODEL,
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-2.5-flash",
].filter((model, index, list) => list.indexOf(model) === index);

const GEMINI_RETRY_DELAYS_MS = [800, 1800, 3500];

export class GeminiQuotaError extends Error {
  readonly statusCode = 429;

  constructor(message?: string) {
    super(message ?? geminiQuotaHelpMessage());
    this.name = "GeminiQuotaError";
  }
}

class GeminiJsonParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiJsonParseError";
  }
}

export function geminiQuotaHelpMessage(): string {
  return (
    "Gemini API quota exceeded. Add or refresh GEMINI_API_KEY from https://aistudio.google.com/apikey. " +
    "Set GEMINI_MODEL=gemini-2.5-flash in .env if needed. " +
    'If the error shows "limit: 0", link billing in Google AI Studio (Settings → Billing) — free-tier limits still apply — or wait until daily quota resets.'
  );
}

function isGeminiJsonParseError(error: unknown): boolean {
  return error instanceof GeminiJsonParseError || error instanceof SyntaxError;
}

function isGeminiQuotaError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("429") ||
    message.includes("Too Many Requests") ||
    message.includes("Quota exceeded") ||
    message.includes("quota")
  );
}

function isGeminiTransientError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    isGeminiJsonParseError(error) ||
    message.includes("503") ||
    message.includes("500") ||
    message.includes("Service Unavailable") ||
    message.includes("high demand") ||
    message.includes("overloaded") ||
    message.includes("UNAVAILABLE")
  );
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
  }
  genAI ??= new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI;
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

interface ExtractionAgentResult {
  contractType: string;
  parties: string[];
  effectiveDate: string | null;
  contractValue: string | null;
  signatures: string[];
  obligations: string[];
  missingSections: string[];
  clauses: ClauseResult[];
}

interface AnalysisAgentResult {
  summary: string;
  risks: string[];
  missingClauses: string[];
  riskyTerms: string[];
  inconsistentWording: string[];
}

interface LegalComplianceAgentResult {
  complianceWarnings: string[];
  mandatoryMissingClauses: string[];
  legalReferences: LegalReference[];
}

interface RiskScoringAgentResult {
  riskScore: number;
  risks: string[];
  riskyTerms: string[];
  missingClauses: string[];
  explanation: string;
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

const CHARS_LIMIT = 15000;
const MONGOLIAN_OUTPUT_RULE =
  "IMPORTANT: All human-readable text values in the JSON response MUST be written in Mongolian Cyrillic. Keep only enum/code values such as LOW, MEDIUM, HIGH, DIRECT, RELATED, and MNT in English exactly as specified. Do not return English summaries, risks, clause titles, missing clause names, warnings, explanations, or breakdown items.";

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

const CLAUSE_SYSTEM_PROMPT = `You are a Mongolian contract clause extraction specialist. Extract every individual clause from the contract. For each clause return:
- title: clause name
- content: the full clause text
- clauseType: category (e.g. "Payment", "Termination", "Confidentiality", "Liability", "Governing Law", "Delivery", "Warranty", "Indemnification", "General")
- riskLevel: "LOW", "MEDIUM", or "HIGH"
- explanation: why this clause has that risk level
- orderNo: sequential number

Consider the provided legal context (laws, articles, clause templates) when determining risk levels and clause types.
${MONGOLIAN_OUTPUT_RULE}

Return ONLY a JSON object with a "clauses" array.`;

const RISK_SYSTEM_PROMPT = `You are a Mongolian contract risk analyst. Analyze the contract text and return a JSON object with:
- summary: 2-3 sentence executive summary
- riskScore: integer 0-100
- risks: array of identified risk descriptions
- missingClauses: array of important missing clause types
- riskyTerms: array of specific risky terms/phrases found
- complianceWarnings: array of compliance concerns referencing relevant laws
- estimatedCost: estimated contract value in MNT (number or null)
- inconsistentWording: array of inconsistent or contradictory terms found

Use the provided legal context (laws, articles, clause templates) to ground your analysis in actual legal requirements.
${MONGOLIAN_OUTPUT_RULE}`;

const LEGAL_REFERENCE_SYSTEM_PROMPT = `You are a Mongolian legal reference specialist. Given a contract text and relevant legal resources (laws, articles, clause templates), identify which specific legal provisions apply to each clause in the contract.

For each clause in the contract, find matching legal references. Return a JSON object with a "legalReferences" array where each item has:
- clauseTitle: the name of the clause in the contract
- lawTitle: the title of the relevant law
- articleNumber: the specific article number (or null)
- relevance: "DIRECT" if the article directly governs this clause, "RELATED" if tangentially related
- reasoning: brief explanation of why this legal provision applies

If no law articles match a clause, still note it as missing legal coverage.
${MONGOLIAN_OUTPUT_RULE}`;

const COST_SYSTEM_PROMPT = `You are a Mongolian contract cost estimation specialist. Analyze the contract text along with relevant clause templates to estimate the contract's financial value.

Return a JSON object with:
- estimatedCost: estimated total contract value in MNT (number or null if not determinable)
- currency: "MNT"
- breakdown: array of cost factors or components considered (e.g. "Base contract value", "Penalty clauses", "Service fees", "Inflation adjustment")
- confidence: "LOW", "MEDIUM", or "HIGH" based on how clearly the contract states financial terms

Use any clause templates provided as reference benchmarks for typical costs in similar contracts.
${MONGOLIAN_OUTPUT_RULE}`;

const EXTRACTION_AGENT_PROMPT = `You are Draftly's Extraction Agent. Your job is to read the uploaded contract and extract structured facts before any other agent reasons about the document.

Return ONLY a JSON object with:
- contractType: likely contract type
- parties: array of party names or roles
- effectiveDate: date string or null
- contractValue: detected financial value as text or null
- signatures: array of signature blocks or signatory names
- obligations: array of key obligations
- missingSections: array of obvious missing contract sections
- clauses: array of extracted clauses. Each clause must have title, content, clauseType, riskLevel, explanation, orderNo

Do not make legal conclusions beyond extraction and obvious missing sections.
${MONGOLIAN_OUTPUT_RULE}`;

const ANALYSIS_AGENT_PROMPT = `You are Draftly's Contract Analysis Agent. Use the original contract and the Extraction Agent output to analyze structure, clause quality, ambiguity, and missing sections.

Return ONLY a JSON object with:
- summary: 2-3 sentence executive summary
- risks: array of concrete contract risks
- missingClauses: array of missing or weak clauses
- riskyTerms: array of risky words, terms, or phrases
- inconsistentWording: array of contradictions or unclear wording

Focus on contract analysis, not statutory compliance. The Legal Compliance Agent handles law/RAG checks.
${MONGOLIAN_OUTPUT_RULE}`;

const LEGAL_COMPLIANCE_AGENT_PROMPT = `You are Draftly's Legal Compliance Agent. Use the provided RAG legal context, law articles, and clause templates to compare the contract against Mongolian legal and compliance requirements.

Return ONLY a JSON object with:
- complianceWarnings: array of legal/compliance warnings grounded in the provided legal context
- mandatoryMissingClauses: array of legally or operationally important missing clauses
- legalReferences: array where each item has clauseTitle, lawTitle, articleNumber, relevance, reasoning

If the RAG context is sparse, say what cannot be verified instead of inventing legal citations.
${MONGOLIAN_OUTPUT_RULE}`;

const RISK_SCORING_AGENT_PROMPT = `You are Draftly's Risk Scoring Agent. Use the original contract plus outputs from the Extraction, Analysis, and Legal Compliance agents to calculate the final risk profile.

Return ONLY a JSON object with:
- riskScore: integer 0-100
- risks: array of the most important final risk reasons
- riskyTerms: array of risky terms that influenced the score
- missingClauses: array of missing clauses that influenced the score
- explanation: one concise explanation of why this score was assigned

Scoring guide: 0-30 low risk, 31-65 medium risk, 66-100 high risk. Increase score for missing mandatory clauses, unclear payment/termination/liability, conflicting wording, and legal compliance gaps.
${MONGOLIAN_OUTPUT_RULE}`;

async function callGeminiWithModel(
  modelName: string,
  systemPrompt: string,
  userContent: string
): Promise<any> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({
    model: modelName,
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
    },
  });
  const result = await model.generateContent(userContent);
  const text = result.response.text();
  return parseGeminiJson(text);
}

function parseGeminiJson(text: string): any {
  const candidates = [
    text,
    text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, ""),
    text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1),
  ].filter((candidate) => candidate.trim().length > 0);

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // Try the next candidate.
    }
  }

  const preview = text.slice(0, 300).replace(/\s+/g, " ");
  throw new GeminiJsonParseError(`Gemini returned malformed JSON. Preview: ${preview}`);
}

async function callGemini(systemPrompt: string, userContent: string): Promise<any> {
  let lastError: unknown;

  for (const modelName of GEMINI_MODEL_FALLBACKS) {
    for (let attempt = 0; attempt <= GEMINI_RETRY_DELAYS_MS.length; attempt += 1) {
      try {
        return await callGeminiWithModel(modelName, systemPrompt, userContent);
      } catch (error) {
        lastError = error;

        if (isGeminiQuotaError(error)) {
          break;
        }

        if (!isGeminiTransientError(error)) {
          throw error;
        }

        const delay = GEMINI_RETRY_DELAYS_MS[attempt];
        if (delay !== undefined) {
          await sleep(delay);
        }
      }
    }
  }

  if (isGeminiQuotaError(lastError)) {
    throw new GeminiQuotaError();
  }

  throw lastError;
}

function analyzeLocally(text: string): AnalysisResult {
  const normalized = text.toLowerCase();
  const clauseChecks = [
    { label: "Payment terms", keywords: ["payment", "fee", "amount", "төлбөр", "үнэ"] },
    { label: "Termination", keywords: ["terminate", "termination", "цуцлах", "дуусгавар"] },
    { label: "Confidentiality", keywords: ["confidential", "нууц"] },
    { label: "Liability", keywords: ["liability", "хариуцлага", "алданги", "торгууль"] },
    { label: "Dispute resolution", keywords: ["dispute", "маргаан", "арбитр", "шүүх"] },
    { label: "Force majeure", keywords: ["force majeure", "давагдашгүй"] },
  ];
  const missingClauses = clauseChecks
    .filter((check) => !check.keywords.some((keyword) => normalized.includes(keyword)))
    .map((check) => check.label);
  const riskyTerms = [
    { label: "Unlimited liability", matched: normalized.includes("unlimited liability") },
    { label: "No notice termination", matched: normalized.includes("without notice") },
    { label: "Undefined payment date", matched: normalized.includes("төлбөр") && !/\d{4}-\d{2}-\d{2}|\d+\s*(хоног|өдөр|day)/i.test(text) },
  ].filter((term) => term.matched).map((term) => term.label);
  const riskScore = Math.min(100, 30 + missingClauses.length * 8 + riskyTerms.length * 12 + (text.length < 700 ? 12 : 0));

  return {
    summary:
      "Gemini API is temporarily unavailable, so Draftly generated a basic local risk check. Retry analysis later for full AI clause extraction and legal references.",
    riskScore,
    risks: [...missingClauses.map((clause) => `Missing ${clause} clause`), ...riskyTerms],
    missingClauses,
    riskyTerms,
    complianceWarnings: ["Full AI legal reference analysis was skipped because Gemini returned a temporary service error."],
    estimatedCost: null,
    inconsistentWording: [],
    clauses: [],
    legalReferences: [],
    costEstimate: {
      estimatedCost: null,
      currency: "MNT",
      breakdown: [],
      confidence: "LOW",
    },
  };
}

function hasLegalContext(legalCtx: LegalContext): boolean {
  return (
    legalCtx.relevantLaws.length > 0 ||
    legalCtx.relevantArticles.length > 0 ||
    legalCtx.relevantTemplates.length > 0
  );
}

function shouldEstimateCost(text: string): boolean {
  return /(\d[\d\s,.'’]*\s*(₮|mnt|төгрөг|төг|сая|million|billion)|₮|үнэ|төлбөр|fee|amount|price|salary|цалин)/i.test(text);
}

function emptyCostEstimate(): CostEstimate {
  return {
    estimatedCost: null,
    currency: "MNT",
    breakdown: [],
    confidence: "LOW",
  };
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

function uniqueStrings(items: string[]): string[] {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

function buildCrewAgentMessage(
  text: string,
  legalCtx: LegalContext,
  memory?: Record<string, unknown>
): string {
  const parts = [buildUserMessage(text, legalCtx)];

  if (memory && Object.keys(memory).length > 0) {
    parts.push(`\n=== CREW MEMORY ===\n${JSON.stringify(memory, null, 2)}`);
  }

  return parts.join("\n\n").slice(0, CHARS_LIMIT);
}

function normalizeClauses(value: unknown): ClauseResult[] {
  return Array.isArray(value)
    ? value.map((c: any, i: number) => ({
      title: typeof c.title === "string" && c.title.trim() ? c.title : "Unknown Clause",
      content: typeof c.content === "string" ? c.content : "",
      clauseType: typeof c.clauseType === "string" && c.clauseType.trim() ? c.clauseType : "General",
      riskLevel: ["LOW", "MEDIUM", "HIGH"].includes(c.riskLevel) ? c.riskLevel : "MEDIUM",
      explanation: typeof c.explanation === "string" ? c.explanation : "",
      orderNo: Number.isFinite(Number(c.orderNo)) ? Number(c.orderNo) : i + 1,
    }))
    : [];
}

function normalizeLegalReferences(value: unknown): LegalReference[] {
  return Array.isArray(value)
    ? value.map((r: any) => ({
      clauseTitle: typeof r.clauseTitle === "string" ? r.clauseTitle : "",
      lawTitle: typeof r.lawTitle === "string" ? r.lawTitle : "",
      articleNumber: r.articleNumber ? String(r.articleNumber) : null,
      relevance: typeof r.relevance === "string" && r.relevance.trim() ? r.relevance : "RELATED",
      reasoning: typeof r.reasoning === "string" ? r.reasoning : "",
    }))
    : [];
}

function normalizeExtractionAgentResult(raw: any): ExtractionAgentResult {
  return {
    contractType: typeof raw?.contractType === "string" ? raw.contractType : "Unknown",
    parties: asStringArray(raw?.parties),
    effectiveDate: raw?.effectiveDate ? String(raw.effectiveDate) : null,
    contractValue: raw?.contractValue ? String(raw.contractValue) : null,
    signatures: asStringArray(raw?.signatures),
    obligations: asStringArray(raw?.obligations),
    missingSections: asStringArray(raw?.missingSections),
    clauses: normalizeClauses(raw?.clauses),
  };
}

function normalizeAnalysisAgentResult(raw: any): AnalysisAgentResult {
  return {
    summary: typeof raw?.summary === "string" ? raw.summary : "",
    risks: asStringArray(raw?.risks),
    missingClauses: asStringArray(raw?.missingClauses),
    riskyTerms: asStringArray(raw?.riskyTerms),
    inconsistentWording: asStringArray(raw?.inconsistentWording),
  };
}

function normalizeLegalComplianceAgentResult(raw: any): LegalComplianceAgentResult {
  return {
    complianceWarnings: asStringArray(raw?.complianceWarnings),
    mandatoryMissingClauses: asStringArray(raw?.mandatoryMissingClauses),
    legalReferences: normalizeLegalReferences(raw?.legalReferences),
  };
}

function normalizeRiskScoringAgentResult(raw: any): RiskScoringAgentResult {
  return {
    riskScore: Math.min(100, Math.max(0, Number(raw?.riskScore) || 0)),
    risks: asStringArray(raw?.risks),
    riskyTerms: asStringArray(raw?.riskyTerms),
    missingClauses: asStringArray(raw?.missingClauses),
    explanation: typeof raw?.explanation === "string" ? raw.explanation : "",
  };
}

export async function analyzeWithCrewAI(
  text: string,
  legalCtx: LegalContext
): Promise<AnalysisResult> {
  const extraction = normalizeExtractionAgentResult(
    await callGemini(EXTRACTION_AGENT_PROMPT, buildCrewAgentMessage(text, legalCtx))
  );
  const analysis = normalizeAnalysisAgentResult(
    await callGemini(ANALYSIS_AGENT_PROMPT, buildCrewAgentMessage(text, legalCtx, { extraction }))
  );
  const legalCompliance = hasLegalContext(legalCtx)
    ? normalizeLegalComplianceAgentResult(
      await callGemini(LEGAL_COMPLIANCE_AGENT_PROMPT, buildCrewAgentMessage(text, legalCtx, { extraction, analysis }))
    )
    : {
      complianceWarnings: ["RAG knowledge base-ээс тохирох хууль, заалт олдоогүй тул хууль зүйн нийцлийг бүрэн баталгаажуулах боломжгүй."],
      mandatoryMissingClauses: [],
      legalReferences: [],
    };
  const riskScoring = normalizeRiskScoringAgentResult(
    await callGemini(RISK_SCORING_AGENT_PROMPT, buildCrewAgentMessage(text, legalCtx, {
      extraction,
      analysis,
      legalCompliance,
    }))
  );
  const shouldRunCostAgent = shouldEstimateCost(text) || Boolean(extraction.contractValue);
  const costRes = shouldRunCostAgent
    ? await callGemini(COST_SYSTEM_PROMPT, buildCrewAgentMessage(text, legalCtx, { extraction }))
    : emptyCostEstimate();

  const costEstimate: CostEstimate = {
    estimatedCost: costRes.estimatedCost ? Number(costRes.estimatedCost) : null,
    currency: costRes.currency || "MNT",
    breakdown: Array.isArray(costRes.breakdown) ? costRes.breakdown : [],
    confidence: ["LOW", "MEDIUM", "HIGH"].includes(costRes.confidence)
      ? costRes.confidence
      : "LOW",
  };

  const missingClauses = uniqueStrings([
    ...extraction.missingSections,
    ...analysis.missingClauses,
    ...legalCompliance.mandatoryMissingClauses,
    ...riskScoring.missingClauses,
  ]);
  const risks = uniqueStrings([
    ...analysis.risks,
    ...riskScoring.risks,
    ...legalCompliance.complianceWarnings,
  ]);
  const riskyTerms = uniqueStrings([...analysis.riskyTerms, ...riskScoring.riskyTerms]);
  const summary = analysis.summary || riskScoring.explanation || "CrewAI workflow completed the contract review.";

  return {
    summary,
    riskScore: riskScoring.riskScore,
    risks,
    missingClauses,
    riskyTerms,
    complianceWarnings: legalCompliance.complianceWarnings,
    estimatedCost: costEstimate.estimatedCost,
    inconsistentWording: analysis.inconsistentWording,
    clauses: extraction.clauses,
    legalReferences: legalCompliance.legalReferences,
    costEstimate,
  };
}

export async function analyzeWithSingleCall(
  text: string,
  legalCtx: LegalContext
): Promise<AnalysisResult> {
  const userMsg = buildUserMessage(text, legalCtx);

  const ANALYSIS_SYSTEM_PROMPT = `You are a senior Mongolian contract analysis AI. Analyze the contract text and return a JSON object.

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

Use the provided legal context (laws, articles, clause templates) to ground your analysis.
${MONGOLIAN_OUTPUT_RULE}`;

  const raw = await callGemini(ANALYSIS_SYSTEM_PROMPT, userMsg);

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
  mode: "crew" | "single" = "single"
): Promise<AnalysisResult> {
  if (!process.env.GEMINI_API_KEY) {
    return analyzeLocally(text);
  }
  try {
    return await (mode === "crew"
      ? analyzeWithCrewAI(text, legalCtx)
      : analyzeWithSingleCall(text, legalCtx));
  } catch (error) {
    if (isGeminiQuotaError(error) || isGeminiTransientError(error)) {
      return analyzeLocally(text);
    }
    throw error;
  }
}
