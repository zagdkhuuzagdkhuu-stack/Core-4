import { GoogleGenerativeAI } from "@google/generative-ai";
let genAI = null;
/** Override via GEMINI_MODEL in .env (e.g. gemini-2.5-flash). */
const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
const GEMINI_MODEL_FALLBACKS = [
    DEFAULT_GEMINI_MODEL,
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-2.5-flash",
].filter((model, index, list) => list.indexOf(model) === index);
const GEMINI_RETRY_DELAYS_MS = [800, 1800, 3500];
export class GeminiQuotaError extends Error {
    statusCode = 429;
    constructor(message) {
        super(message ?? geminiQuotaHelpMessage());
        this.name = "GeminiQuotaError";
    }
}
export function geminiQuotaHelpMessage() {
    return ("Gemini API quota exceeded. Add or refresh GEMINI_API_KEY from https://aistudio.google.com/apikey. " +
        "Set GEMINI_MODEL=gemini-2.5-flash in .env if needed. " +
        'If the error shows "limit: 0", link billing in Google AI Studio (Settings → Billing) — free-tier limits still apply — or wait until daily quota resets.');
}
function isGeminiQuotaError(error) {
    const message = error instanceof Error ? error.message : String(error);
    return (message.includes("429") ||
        message.includes("Too Many Requests") ||
        message.includes("Quota exceeded") ||
        message.includes("quota"));
}
function isGeminiTransientError(error) {
    const message = error instanceof Error ? error.message : String(error);
    return (message.includes("503") ||
        message.includes("500") ||
        message.includes("Service Unavailable") ||
        message.includes("high demand") ||
        message.includes("overloaded") ||
        message.includes("UNAVAILABLE"));
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function getGeminiClient() {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set in environment variables.");
    }
    genAI ??= new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    return genAI;
}
const CHARS_LIMIT = 15000;
const MONGOLIAN_OUTPUT_RULE = "IMPORTANT: All human-readable text values in the JSON response MUST be written in Mongolian Cyrillic. Keep only enum/code values such as LOW, MEDIUM, HIGH, DIRECT, RELATED, and MNT in English exactly as specified. Do not return English summaries, risks, clause titles, missing clause names, warnings, explanations, or breakdown items.";
function buildUserMessage(text, legalCtx) {
    const parts = [`=== CONTRACT TEXT ===\n${text}`];
    if (legalCtx.relevantLaws.length > 0) {
        parts.push(`\n=== RELEVANT LAWS ===\n${legalCtx.relevantLaws
            .map((l) => `- ${l.title}${l.category ? ` (${l.category})` : ""}`)
            .join("\n")}`);
    }
    if (legalCtx.relevantArticles.length > 0) {
        parts.push(`\n=== RELEVANT LAW ARTICLES ===\n${legalCtx.relevantArticles
            .map((a) => `- [${a.lawTitle}]${a.articleNumber ? ` Art.${a.articleNumber}` : ""}${a.title ? ` ${a.title}` : ""}: ${a.content.slice(0, 500)}`)
            .join("\n")}`);
    }
    if (legalCtx.relevantTemplates.length > 0) {
        parts.push(`\n=== RELEVANT CLAUSE TEMPLATES ===\n${legalCtx.relevantTemplates
            .map((t) => `- ${t.title}${t.contractType ? ` (${t.contractType})` : ""}${t.riskLevel ? ` [${t.riskLevel}]` : ""}: ${t.content.slice(0, 300)}`)
            .join("\n")}`);
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
async function callGeminiWithModel(modelName, systemPrompt, userContent) {
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
    return JSON.parse(text);
}
async function callGemini(systemPrompt, userContent) {
    let lastError;
    for (const modelName of GEMINI_MODEL_FALLBACKS) {
        for (let attempt = 0; attempt <= GEMINI_RETRY_DELAYS_MS.length; attempt += 1) {
            try {
                return await callGeminiWithModel(modelName, systemPrompt, userContent);
            }
            catch (error) {
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
function analyzeLocally(text) {
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
        summary: "Gemini API is temporarily unavailable, so Draftly generated a basic local risk check. Retry analysis later for full AI clause extraction and legal references.",
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
export async function analyzeWithCrewAI(text, legalCtx) {
    const userMsg = buildUserMessage(text, legalCtx);
    const [clauseRes, riskRes, legalRefRes, costRes] = await Promise.all([
        callGemini(CLAUSE_SYSTEM_PROMPT, userMsg),
        callGemini(RISK_SYSTEM_PROMPT, userMsg),
        callGemini(LEGAL_REFERENCE_SYSTEM_PROMPT, userMsg),
        callGemini(COST_SYSTEM_PROMPT, userMsg),
    ]);
    const clauses = (clauseRes.clauses || []).map((c, i) => ({
        title: c.title || "Unknown Clause",
        content: c.content || "",
        clauseType: c.clauseType || "General",
        riskLevel: ["LOW", "MEDIUM", "HIGH"].includes(c.riskLevel)
            ? c.riskLevel
            : "MEDIUM",
        explanation: c.explanation || "",
        orderNo: c.orderNo ?? i + 1,
    }));
    const legalReferences = (legalRefRes.legalReferences || []).map((r) => ({
        clauseTitle: r.clauseTitle || "",
        lawTitle: r.lawTitle || "",
        articleNumber: r.articleNumber || null,
        relevance: r.relevance || "RELATED",
        reasoning: r.reasoning || "",
    }));
    const costEstimate = {
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
export async function analyzeWithSingleCall(text, legalCtx) {
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
    const clauses = (raw.clauses || []).map((c, i) => ({
        title: c.title || "Unknown Clause",
        content: c.content || "",
        clauseType: c.clauseType || "General",
        riskLevel: ["LOW", "MEDIUM", "HIGH"].includes(c.riskLevel)
            ? c.riskLevel
            : "MEDIUM",
        explanation: c.explanation || "",
        orderNo: c.orderNo ?? i + 1,
    }));
    const legalReferences = (raw.legalReferences || []).map((r) => ({
        clauseTitle: r.clauseTitle || "",
        lawTitle: r.lawTitle || "",
        articleNumber: r.articleNumber || null,
        relevance: r.relevance || "RELATED",
        reasoning: r.reasoning || "",
    }));
    const costEstimate = {
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
export async function analyzeContract(text, legalCtx, mode = "single") {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set in environment variables.");
    }
    try {
        return await (mode === "crew"
            ? analyzeWithCrewAI(text, legalCtx)
            : analyzeWithSingleCall(text, legalCtx));
    }
    catch (error) {
        if (isGeminiTransientError(error)) {
            return analyzeLocally(text);
        }
        throw error;
    }
}
