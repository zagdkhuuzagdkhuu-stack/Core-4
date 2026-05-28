import { Request, Response } from "express";
import database from "../database";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { analyzeContract as analyzeContractWithAI, GeminiQuotaError } from "../services/aiService";
import { getLegalContext } from "../services/lawService";

function getAnalysisMode(req: Request): "crew" | "single" {
  return req.body.mode === "single" ? "single" : "crew";
}

function formatAnalysisResponse(analysis: any, result: Awaited<ReturnType<typeof analyzeContractWithAI>>) {
  return {
    ...analysis,
    legalReferences: result.legalReferences,
    costEstimate: result.costEstimate,
  };
}

async function replaceContractClauses(contractId: string, result: Awaited<ReturnType<typeof analyzeContractWithAI>>) {
  if (result.clauses.length === 0) return;

  await database.clause.deleteMany({ where: { contractId } });
  await database.clause.createMany({
    data: result.clauses.map((clause) => ({
      contractId,
      title: clause.title,
      content: clause.content,
      clauseType: clause.clauseType,
      riskLevel: clause.riskLevel,
      explanation: clause.explanation,
      orderNo: clause.orderNo,
    })),
  });
}

export async function analyzeContract(req: Request, res: Response) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const contractId = String(req.params.contractId || "");
    const analysisMode = getAnalysisMode(req);
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

    const text = [contract.title, contract.contractType, contract.document?.content].filter(Boolean).join("\n");
    if (!text.trim()) {
      return res.status(422).json({ message: "Contract has no text content to analyze." });
    }

    const legalCtx = await getLegalContext(text);
    const result = await analyzeContractWithAI(text, legalCtx, analysisMode);

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
        inconsistentWording: result.inconsistentWording,
        complianceWarnings: result.complianceWarnings,
        estimatedCost: result.estimatedCost,
        legalReferences: result.legalReferences as any,
      },
      update: {
        summary: result.summary,
        riskScore: result.riskScore,
        risks: result.risks,
        missingClauses: result.missingClauses,
        riskyTerms: result.riskyTerms,
        inconsistentWording: result.inconsistentWording,
        complianceWarnings: result.complianceWarnings,
        estimatedCost: result.estimatedCost,
        legalReferences: result.legalReferences as any,
      },
    });

    await replaceContractClauses(contract.id, result);

    return res.json({
      analysis: formatAnalysisResponse(analysis, result),
      clauses: result.clauses,
      mode: analysisMode,
    });
  } catch (error) {
    if (error instanceof GeminiQuotaError) {
      return res.status(429).json({
        message: error.message,
        code: "GEMINI_QUOTA_EXCEEDED",
      });
    }
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
    const analysisMode = getAnalysisMode(req);
    const document = await database.document.findFirst({
      where: {
        id: documentId,
        ownerId: userId,
      },
      include: {
        contract: true,
      },
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }

    const text = [document.title, document.content].filter(Boolean).join("\n");
    if (!text.trim()) {
      return res.status(422).json({ message: "Document has no text content to analyze." });
    }

    const legalCtx = await getLegalContext(text);
    const result = await analyzeContractWithAI(text, legalCtx, analysisMode);
    const contractId = document.contract?.id;

    const analysis = await database.riskAnalysis.upsert({
      where: { documentId: document.id },
      create: {
        documentId: document.id,
        contractId,
        summary: result.summary,
        riskScore: result.riskScore,
        risks: result.risks,
        missingClauses: result.missingClauses,
        riskyTerms: result.riskyTerms,
        inconsistentWording: result.inconsistentWording,
        complianceWarnings: result.complianceWarnings,
        estimatedCost: result.estimatedCost,
        legalReferences: result.legalReferences as any,
      },
      update: {
        summary: result.summary,
        riskScore: result.riskScore,
        risks: result.risks,
        missingClauses: result.missingClauses,
        riskyTerms: result.riskyTerms,
        inconsistentWording: result.inconsistentWording,
        complianceWarnings: result.complianceWarnings,
        estimatedCost: result.estimatedCost,
        legalReferences: result.legalReferences as any,
      },
    });

    if (contractId) {
      await replaceContractClauses(contractId, result);
    }

    return res.json({
      analysis: formatAnalysisResponse(analysis, result),
      clauses: result.clauses,
      mode: analysisMode,
    });
  } catch (error) {
    if (error instanceof GeminiQuotaError) {
      return res.status(429).json({
        message: error.message,
        code: "GEMINI_QUOTA_EXCEEDED",
      });
    }
    return res.status(500).json({
      message: "Failed to analyze document.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
