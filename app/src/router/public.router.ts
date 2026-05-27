import { Router } from "express";
import { listPublicTemplates, uploadPublicAnalysis } from "../controller/public.controller";
import { upload } from "../utils/fileUpload";

const router = Router();

router.get("/templates", listPublicTemplates);
router.post("/upload-analysis", upload.single("file"), uploadPublicAnalysis);

export default router;
