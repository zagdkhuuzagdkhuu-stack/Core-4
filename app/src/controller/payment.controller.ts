import { Request, Response } from "express";
import { checkQPayInvoice, createQPayInvoice } from "../utils/qpay";

function parseAmount(value: unknown) {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return Math.round(amount);
}

export async function createQPayPayment(req: Request, res: Response) {
  try {
    const amount = parseAmount(req.body.amount);

    if (!amount) {
      return res.status(400).json({ message: "A valid payment amount is required." });
    }

    const invoice = await createQPayInvoice({
      amount,
      description: String(req.body.description || "Contract payment").slice(0, 255),
      receiverCode: req.body.receiverCode ? String(req.body.receiverCode) : undefined,
      senderInvoiceNo: req.body.contractId ? `contract-${req.body.contractId}-${Date.now()}` : undefined,
    });

    return res.status(201).json(invoice);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create QPay invoice.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function checkQPayPayment(req: Request, res: Response) {
  try {
    const invoiceId = String(req.params.invoiceId || "");

    if (!invoiceId) {
      return res.status(400).json({ message: "QPay invoice id is required." });
    }

    const paymentStatus = await checkQPayInvoice(invoiceId);

    return res.json(paymentStatus);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to check QPay payment.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export function qpayCallback(req: Request, res: Response) {
  console.log("QPay callback:", req.body || req.query);
  return res.json({ received: true });
}
