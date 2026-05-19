import { Router } from "express";
import { analyzeContract, analyzeDocument } from "../controller/analysis.controller";
import { requireAuth } from "../middleware/auth.middleware";
const router = Router();
router.use(requireAuth);
router.post("/contracts/:contractId", analyzeContract);
router.post("/documents/:documentId", analyzeDocument);
export default router;
