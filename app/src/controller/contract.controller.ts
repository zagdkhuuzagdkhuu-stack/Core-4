import { Request, Response } from "express";
import database from "../database";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const contractStatuses = new Set(["DRAFT", "REVIEW", "APPROVED", "SIGNED", "ARCHIVED"]);

function parseContractValue(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

export async function listContracts(req: Request, res: Response) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const contracts = await database.contract.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: "desc" },
      include: {
        document: true,
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        riskAnalysis: true,
      },
    });

    return res.json({ contracts });
  } catch (error) {
    return res.status(500).json({ message: "Failed to list contracts." });
  }
}

export async function getContract(req: Request, res: Response) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const contractId = String(req.params.id || "");
    const contract = await database.contract.findFirst({
      where: {
        id: contractId,
        createdById: userId,
      },
      include: {
        document: true,
        payments: {
          orderBy: { createdAt: "desc" },
        },
        riskAnalysis: true,
      },
    });

    if (!contract) {
      return res.status(404).json({ message: "Contract not found." });
    }

    return res.json({ contract });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load contract." });
  }
}

export async function createContract(req: Request, res: Response) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const title = String(req.body.title || "").trim();
    const content = req.body.content ? String(req.body.content) : null;
    const value = parseContractValue(req.body.value);

    if (!title) {
      return res.status(400).json({ message: "Contract title is required." });
    }

    if (value === null) {
      return res.status(400).json({ message: "Contract value must be a number." });
    }

    const contract = await database.$transaction(async (tx) => {
      const document = await tx.document.create({
        data: {
          title,
          content,
          ownerId: userId,
          rawInput: req.body.rawInput || undefined,
        },
      });

      return tx.contract.create({
        data: {
          title,
          contractType: req.body.contractType ? String(req.body.contractType) : undefined,
          parties: req.body.parties || undefined,
          value,
          currency: req.body.currency ? String(req.body.currency) : "MNT",
          startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
          endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
          documentId: document.id,
          createdById: userId,
        },
        include: {
          document: true,
        },
      });
    });

    return res.status(201).json({ contract });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create contract.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function updateContract(req: Request, res: Response) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const contractId = String(req.params.id || "");
    const contract = await database.contract.findFirst({
      where: {
        id: contractId,
        createdById: userId,
      },
    });

    if (!contract) {
      return res.status(404).json({ message: "Contract not found." });
    }

    const value = parseContractValue(req.body.value);
    const status = req.body.status ? String(req.body.status) : undefined;

    if (value === null) {
      return res.status(400).json({ message: "Contract value must be a number." });
    }

    if (status && !contractStatuses.has(status)) {
      return res.status(400).json({ message: "Invalid contract status." });
    }

    const updated = await database.contract.update({
      where: { id: contract.id },
      data: {
        title: req.body.title ? String(req.body.title).trim() : undefined,
        contractType: req.body.contractType ? String(req.body.contractType) : undefined,
        parties: req.body.parties || undefined,
        value,
        currency: req.body.currency ? String(req.body.currency) : undefined,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
        status: status as any,
        signedAt: status === "SIGNED" ? new Date() : undefined,
      },
      include: {
        document: true,
      },
    });

    if (req.body.content !== undefined) {
      await database.document.update({
        where: { id: updated.documentId },
        data: {
          content: String(req.body.content),
          title: updated.title,
        },
      });
    }

    return res.json({ contract: updated });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update contract." });
  }
}

export async function deleteContract(req: Request, res: Response) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const contractId = String(req.params.id || "");
    const contract = await database.contract.findFirst({
      where: {
        id: contractId,
        createdById: userId,
      },
    });

    if (!contract) {
      return res.status(404).json({ message: "Contract not found." });
    }

    await database.contract.delete({
      where: { id: contract.id },
    });

    return res.json({ deleted: true });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete contract." });
  }
}
