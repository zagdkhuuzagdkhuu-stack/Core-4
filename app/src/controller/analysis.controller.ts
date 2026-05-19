import { Request, Response } from "express";
import database from "../database";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

function analyzeContractText(text: string, value?: unknown) {
  const normalized = text.toLowerCase();
  const missingClauses = [
    { label: "payment terms", keywords: ["payment", "fee", "amount", "төлбөр"] },
    { label: "termination", keywords: ["terminate", "termination", "цуцлах"] },
    { label: "confidentiality", keywords: ["confidential", "нууц"] },
    { label: "liability", keywords: ["liability", "хариуцлага"] },
  ].filter((clause) => !clause.keywords.some((keyword) => normalized.includes(keyword)));

  const riskyTerms = [
    { label: "Unlimited liability", matched: normalized.includes("unlimited liability") },
    { label: "No termination notice", matched: normalized.includes("without notice") },
    { label: "Undefined payment date", matched: normalized.includes("payment") && !/\b\d{1,2}\s*(day|хоног)|\b\d{4}-\d{2}-\d{2}/i.test(text) },
  ].filter((item) => item.matched);

  const numericValue = Number(value || 0);
  const valueRisk = Number.isFinite(numericValue) && numericValue > 10_000_000 ? 12 : 0;
  const lengthRisk = text.length < 600 ? 18 : 0;
  const riskScore = Math.min(100, 25 + missingClauses.length * 10 + riskyTerms.length * 12 + valueRisk + lengthRisk);

  return {
    riskScore,
    summary: riskScore >= 70
      ? "High risk contract. Several important clauses need review."
      : riskScore >= 45
        ? "Medium risk contract. Review the highlighted clauses before signing."
        : "Low risk contract. Only minor checks are suggested.",
    risks: [
      ...missingClauses.map((item) => `Missing ${item.label} clause`),
      ...riskyTerms.map((item) => item.label),
    ],
    missingClauses: missingClauses.map((item) => item.label),
    riskyTerms: riskyTerms.map((item) => item.label),
    complianceWarnings: riskScore >= 70 ? ["Legal review recommended before signing"] : [],
    estimatedCost: Number.isFinite(numericValue) && numericValue > 0 ? numericValue : null,
  };
}

export async function analyzeContract(req: Request, res: Response) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const contractId = String(req.params.contractId || "");
    const contract = await database.contract.findFirst({
      where: {
        id: contractId,
        createdById: userId,
      },
      include: {
        document: true,
      },
    });

    if (!contract) {
      return res.status(404).json({ message: "Contract not found." });
    }

    const contractDocument = (contract as any).document;
    const text = [contract.title, contract.contractType, contractDocument?.content].filter(Boolean).join("\n");
    const result = analyzeContractText(text, contract.value);

    const analysis = await database.riskAnalysis.upsert({
      where: { contractId: contract.id },
      create: {
        contractId: contract.id,
        documentId: contract.documentId,
        summary: result.summary,
        riskScore: result.riskScore,
        risks: result.risks,
        missingClauses: result.missingClauses,
        riskyTerms: result.riskyTerms,
        complianceWarnings: result.complianceWarnings,
        estimatedCost: result.estimatedCost,
      },
      update: {
        summary: result.summary,
        riskScore: result.riskScore,
        risks: result.risks,
        missingClauses: result.missingClauses,
        riskyTerms: result.riskyTerms,
        complianceWarnings: result.complianceWarnings,
        estimatedCost: result.estimatedCost,
      },
    });

    return res.json({ analysis });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to analyze contract.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function analyzeDocument(req: Request, res: Response) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const documentId = String(req.params.documentId || "");
    const document = await database.document.findFirst({
      where: {
        id: documentId,
        ownerId: userId,
      },
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }

    const result = analyzeContractText([document.title, document.content].filter(Boolean).join("\n"));

    const analysis = await database.riskAnalysis.upsert({
      where: { documentId: document.id },
      create: {
        documentId: document.id,
        summary: result.summary,
        riskScore: result.riskScore,
        risks: result.risks,
        missingClauses: result.missingClauses,
        riskyTerms: result.riskyTerms,
        complianceWarnings: result.complianceWarnings,
        estimatedCost: result.estimatedCost,
      },
      update: {
        summary: result.summary,
        riskScore: result.riskScore,
        risks: result.risks,
        missingClauses: result.missingClauses,
        riskyTerms: result.riskyTerms,
        complianceWarnings: result.complianceWarnings,
        estimatedCost: result.estimatedCost,
      },
    });

    return res.json({ analysis });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to analyze document.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
