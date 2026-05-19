import { Router } from "express";
import { checkQPayPayment, createQPayPayment, qpayCallback, } from "../controller/payment.controller";
import { requireAuth } from "../middleware/auth.middleware";
const router = Router();
router.post("/qpay/invoices", requireAuth, createQPayPayment);
router.get("/qpay/check/:invoiceId", checkQPayPayment);
router.post("/qpay/callback", qpayCallback);
router.get("/qpay/callback", qpayCallback);
export default router;
