import database from "../database";
const documentStatuses = new Set(["DRAFT", "FINAL", "ARCHIVED"]);
const documentInclude = {
    contract: true,
    riskAnalysis: {
        select: {
            id: true,
            contractId: true,
            documentId: true,
            summary: true,
            riskScore: true,
            risks: true,
            missingClauses: true,
            riskyTerms: true,
            inconsistentWording: true,
            complianceWarnings: true,
            estimatedCost: true,
            createdAt: true,
            updatedAt: true,
        },
    },
    fileUploads: true,
};
function serializeBigInt(value) {
    if (typeof value === "bigint") {
        return value.toString();
    }
    if (Array.isArray(value)) {
        return value.map(serializeBigInt);
    }
    if (value && typeof value === "object") {
        return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, serializeBigInt(item)]));
    }
    return value;
}
export async function listDocuments(req, res) {
    try {
        const userId = req.userId;
        const documents = await database.document.findMany({
            where: { ownerId: userId },
            orderBy: { createdAt: "desc" },
            include: documentInclude,
        });
        return res.json({ documents: serializeBigInt(documents) });
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to list documents." });
    }
}
export async function getDocument(req, res) {
    try {
        const userId = req.userId;
        const documentId = String(req.params.id || "");
        const document = await database.document.findFirst({
            where: {
                id: documentId,
                ownerId: userId,
            },
            include: documentInclude,
        });
        if (!document) {
            return res.status(404).json({ message: "Document not found." });
        }
        return res.json({ document: serializeBigInt(document) });
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to load document." });
    }
}
export async function createDocument(req, res) {
    try {
        const userId = req.userId;
        const title = String(req.body.title || "").trim();
        if (!title) {
            return res.status(400).json({ message: "Document title is required." });
        }
        const document = await database.document.create({
            data: {
                title,
                content: req.body.content ? String(req.body.content) : null,
                rawInput: req.body.rawInput || undefined,
                fileUrl: req.body.fileUrl ? String(req.body.fileUrl) : undefined,
                fileType: req.body.fileType ? String(req.body.fileType) : undefined,
                ownerId: userId,
            },
        });
        if (req.body.fileName && req.body.fileUrl) {
            await database.fileUpload.create({
                data: {
                    userId,
                    documentId: document.id,
                    fileName: String(req.body.fileName),
                    fileUrl: String(req.body.fileUrl),
                    mimeType: req.body.mimeType ? String(req.body.mimeType) : undefined,
                    size: req.body.size ? BigInt(req.body.size) : undefined,
                },
            });
        }
        return res.status(201).json({ document });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to create document.",
            error: error instanceof Error ? error.message : String(error),
        });
    }
}
export async function updateDocument(req, res) {
    try {
        const userId = req.userId;
        const documentId = String(req.params.id || "");
        const status = req.body.status ? String(req.body.status) : undefined;
        if (status && !documentStatuses.has(status)) {
            return res.status(400).json({ message: "Invalid document status." });
        }
        const existing = await database.document.findFirst({
            where: {
                id: documentId,
                ownerId: userId,
            },
        });
        if (!existing) {
            return res.status(404).json({ message: "Document not found." });
        }
        const document = await database.document.update({
            where: { id: existing.id },
            data: {
                title: req.body.title ? String(req.body.title).trim() : undefined,
                content: req.body.content !== undefined ? String(req.body.content) : undefined,
                rawInput: req.body.rawInput || undefined,
                fileUrl: req.body.fileUrl ? String(req.body.fileUrl) : undefined,
                fileType: req.body.fileType ? String(req.body.fileType) : undefined,
                status: status,
            },
        });
        return res.json({ document });
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to update document." });
    }
}
export async function deleteDocument(req, res) {
    try {
        const userId = req.userId;
        const documentId = String(req.params.id || "");
        const document = await database.document.findFirst({
            where: {
                id: documentId,
                ownerId: userId,
            },
        });
        if (!document) {
            return res.status(404).json({ message: "Document not found." });
        }
        await database.document.delete({
            where: { id: document.id },
        });
        return res.json({ deleted: true });
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to delete document." });
    }
}
