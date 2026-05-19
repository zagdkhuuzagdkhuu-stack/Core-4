import { Router } from "express";
import {
  createContract,
  deleteContract,
  getContract,
  listContracts,
  updateContract,
} from "../controller/contract.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);
router.get("/", listContracts);
router.post("/", createContract);
router.get("/:id", getContract);
router.patch("/:id", updateContract);
router.delete("/:id", deleteContract);

export default router;
