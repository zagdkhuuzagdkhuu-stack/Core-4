import { Router } from "express";
import {
  checkQPayPayment,
  createQPayPayment,
  qpayCallback,
} from "../controller/payment.controller";

const router = Router();

router.post("/qpay/invoices", createQPayPayment);
router.get("/qpay/check/:invoiceId", checkQPayPayment);
router.post("/qpay/callback", qpayCallback);
router.get("/qpay/callback", qpayCallback);

export default router;
