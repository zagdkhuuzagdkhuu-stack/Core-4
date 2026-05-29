import { Router } from "express";
import { analyzeContract, analyzeDocument, saveAnalysisResults, updateAnalysis } from "../controller/analysis.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);
router.post("/contracts/:contractId", analyzeContract);
router.post("/documents/:documentId", analyzeDocument);
router.post("/save", saveAnalysisResults);
router.patch("/:documentId", updateAnalysis);

export default router;
