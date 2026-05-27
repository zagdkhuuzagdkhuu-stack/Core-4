import { Router } from "express";
import {
  activatePaidAccess,
  checkQPayPayment,
  createPublicQPayInvoice,
  createQPayPayment,
  getMyPaymentStatus,
  qpayCallback,
} from "../controller/payment.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/qpay/invoices", requireAuth, createQPayPayment);
router.post("/qpay/public-invoices", createPublicQPayInvoice);
router.get("/qpay/check/:invoiceId", checkQPayPayment);
router.post("/qpay/callback", qpayCallback);
router.get("/qpay/callback", qpayCallback);
router.get("/status/me", requireAuth, getMyPaymentStatus);
router.post("/qpay/activate-access", requireAuth, activatePaidAccess);

export default router;
