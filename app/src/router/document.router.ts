import { Router } from "express";
import {
  createDocument,
  deleteDocument,
  getDocument,
  listDocuments,
  updateDocument,
} from "../controller/document.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);
router.get("/", listDocuments);
router.post("/", createDocument);
router.get("/:id", getDocument);
router.patch("/:id", updateDocument);
router.delete("/:id", deleteDocument);

export default router;
