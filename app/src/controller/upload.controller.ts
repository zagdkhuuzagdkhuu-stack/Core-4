import { Request, Response } from "express";
import fs from "fs/promises";
import database from "../database";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { extractText } from "../utils/textExtractor";
import { analyzeContract, GeminiQuotaError } from "../services/aiService";
import { getLegalContext } from "../services/lawService";

const MAX_TEXT_LENGTH = 15000;

export async function uploadAndAnalyze(req: Request, res: Response) {
  const file = req.file;

  try {
    const userId = (req as AuthenticatedRequest).userId;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded. Upload a PDF or DOCX file." });
    }

    const analysisMode = req.body.mode === "crew" ? "crew" : "single";

    let text = await extractText(file.path, file.mimetype);

    if (!text.trim()) {
      return res.status(422).json({ message: "Could not extract any text from the file." });
    }

    if (text.length > MAX_TEXT_LENGTH) {
      text = text.slice(0, MAX_TEXT_LENGTH);
    }

    const legalCtx = await getLegalContext(text);
    const result = await analyzeContract(text, legalCtx, analysisMode);

    const contractTitle = req.body.title || file.originalname.replace(/\.[^/.]+$/, "");

    const { document, contract, analysis } = await database.$transaction(async (tx) => {
      const doc = await tx.document.create({
        data: {
          title: contractTitle,
          content: text,
          fileUrl: `/uploads/${file.filename}`,
          fileType: file.mimetype,
          ownerId: userId,
          status: "DRAFT",
        },
      });

      await tx.fileUpload.create({
        data: {
          userId,
          documentId: doc.id,
          fileName: file.originalname,
          fileUrl: `/uploads/${file.filename}`,
          mimeType: file.mimetype,
          size: BigInt(file.size),
        },
      });

      const ctr = await tx.contract.create({
        data: {
          title: contractTitle,
          documentId: doc.id,
          createdById: userId,
          status: "DRAFT",
        },
      });

      const ra = await tx.riskAnalysis.create({
        data: {
          documentId: doc.id,
          contractId: ctr.id,
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

      if (result.clauses.length > 0) {
        await tx.clause.createMany({
          data: result.clauses.map((clause) => ({
            contractId: ctr.id,
            title: clause.title,
            content: clause.content,
            clauseType: clause.clauseType,
            riskLevel: clause.riskLevel,
            explanation: clause.explanation,
            orderNo: clause.orderNo,
          })),
        });
      }

      return { document: doc, contract: ctr, analysis: ra };
    });

    return res.status(201).json({
      document: {
        id: document.id,
        title: document.title,
        fileUrl: document.fileUrl,
        fileType: document.fileType,
        status: document.status,
        createdAt: document.createdAt,
      },
      contract: {
        id: contract.id,
        title: contract.title,
        status: contract.status,
      },
      analysis: {
        id: analysis.id,
        summary: analysis.summary,
        riskScore: analysis.riskScore,
        risks: analysis.risks,
        missingClauses: analysis.missingClauses,
        riskyTerms: analysis.riskyTerms,
        complianceWarnings: analysis.complianceWarnings,
        estimatedCost: analysis.estimatedCost,
        inconsistentWording: analysis.inconsistentWording,
        legalReferences: result.legalReferences as any,
        costEstimate: result.costEstimate,
      },
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
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({
      message: "Failed to upload and analyze file.",
      error: message,
    });
  } finally {
    if (file) {
      fs.unlink(file.path).catch(() => {});
    }
  }
}

export async function analyzeDocumentText(req: Request, res: Response) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const documentId = String(req.params.documentId || "");
    const analysisMode = req.body.mode === "crew" ? "crew" : "single";

    const document = await database.document.findFirst({
      where: { id: documentId, ownerId: userId },
      include: { contract: true },
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }

    const text = [document.title, document.content].filter(Boolean).join("\n\n");
    if (!text.trim()) {
      return res.status(422).json({ message: "Document has no text content to analyze." });
    }

    const legalCtx = await getLegalContext(text);
    const result = await analyzeContract(text, legalCtx, analysisMode);
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

    if (result.clauses.length > 0 && contractId) {
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

    return res.json({
      document: { id: document.id },
      analysis: {
        ...analysis,
        legalReferences: result.legalReferences,
        costEstimate: result.costEstimate,
      },
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
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({
      message: "Failed to analyze document.",
      error: message,
    });
  }
}
