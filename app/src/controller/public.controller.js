import fs from "fs/promises";
import path from "path";
import { extractText } from "../utils/textExtractor";
import { analyzeContract, GeminiQuotaError } from "../services/aiService";
import { getLegalContext } from "../services/lawService";
const MAX_TEXT_LENGTH = 15000;
const emptyLegalContext = {
    relevantLaws: [],
    relevantArticles: [],
    relevantTemplates: [],
};
async function loadTemplateFile() {
    const templatePath = path.resolve("app/src/data/template.json");
    const raw = await fs.readFile(templatePath, "utf8");
    return JSON.parse(raw);
}
export async function listPublicTemplates(_req, res) {
    try {
        const templates = await loadTemplateFile();
        const categories = [...new Set(templates.map((template) => template.category))].map((category) => ({
            name: category,
            items: templates
                .filter((template) => template.category === category)
                .map((template) => template.name),
        }));
        return res.json({
            categories,
            templates: templates.map((template, index) => ({
                id: String(index + 1),
                name: template.name,
                category: template.category,
                description: template.description || "",
                content: template.content,
                variables: template.variables || [],
            })),
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to load templates.",
            error: error instanceof Error ? error.message : String(error),
        });
    }
}
export async function uploadPublicAnalysis(req, res) {
    const file = req.file;
    try {
        if (!file) {
            return res.status(400).json({ message: "No file uploaded. Upload a PDF, DOCX, or TXT file." });
        }
        let text = await extractText(file.path, file.mimetype);
        if (!text.trim()) {
            return res.status(422).json({ message: "Could not extract any text from the file." });
        }
        if (text.length > MAX_TEXT_LENGTH) {
            text = text.slice(0, MAX_TEXT_LENGTH);
        }
        let legalContext = emptyLegalContext;
        try {
            legalContext = await getLegalContext(text);
        }
        catch {
            legalContext = emptyLegalContext;
        }
        const mode = req.body.mode === "crew" ? "crew" : "single";
        const result = await analyzeContract(text, legalContext, mode);
        return res.status(201).json({
            document: {
                title: req.body.title || file.originalname.replace(/\.[^/.]+$/, ""),
                fileName: file.originalname,
                fileUrl: `/uploads/${file.filename}`,
                extractedText: text,
            },
            analysis: {
                summary: result.summary,
                riskScore: result.riskScore,
                risks: result.risks,
                missingClauses: result.missingClauses,
                riskyTerms: result.riskyTerms,
                inconsistentWording: result.inconsistentWording,
                complianceWarnings: result.complianceWarnings,
                estimatedCost: result.estimatedCost,
                legalReferences: result.legalReferences,
                costEstimate: result.costEstimate,
            },
            clauses: result.clauses,
            mode,
        });
    }
    catch (error) {
        if (error instanceof GeminiQuotaError) {
            return res.status(429).json({
                message: error.message,
                code: "GEMINI_QUOTA_EXCEEDED",
            });
        }
        return res.status(500).json({
            message: "Failed to analyze uploaded file.",
            error: error instanceof Error ? error.message : String(error),
        });
    }
    finally {
        if (file) {
            fs.unlink(file.path).catch(() => { });
        }
    }
}
