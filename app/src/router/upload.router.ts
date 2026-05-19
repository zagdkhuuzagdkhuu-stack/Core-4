import { Router } from "express";
import { upload } from "../utils/fileUpload";
import { uploadAndAnalyze, analyzeDocumentText } from "../controller/upload.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);
router.post("/", upload.single("file"), uploadAndAnalyze);
router.post("/analyze/:documentId", analyzeDocumentText);

export default router;
