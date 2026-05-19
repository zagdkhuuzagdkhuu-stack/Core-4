import { Request, Response } from "express";
import database from "../database";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
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
    const userId = (req as AuthenticatedRequest).userId;
    const amount = parseAmount(req.body.amount);
    const contractId = String(req.body.contractId || "");

    if (!amount) {
      return res.status(400).json({ message: "A valid payment amount is required." });
    }

    if (!contractId) {
      return res.status(400).json({ message: "Contract id is required." });
    }

    const contract = await database.contract.findFirst({
      where: {
        id: contractId,
        createdById: userId,
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (!contract) {
      return res.status(404).json({ message: "Contract not found." });
    }

    const invoice = await createQPayInvoice({
      amount,
      description: String(req.body.description || `${contract.title} payment`).slice(0, 255),
      receiverCode: req.body.receiverCode ? String(req.body.receiverCode) : undefined,
      senderInvoiceNo: `pay-${Date.now()}-${contractId.slice(0, 8)}`,
    });

    const payment = await database.payment.create({
      data: {
        contractId,
        userId,
        amount,
        currency: "MNT",
        status: "PENDING",
        paymentMethod: "QPAY",
        invoiceUrl: invoice.invoice_id,
      },
    });

    return res.status(201).json({
      payment,
      invoice,
      ...invoice,
    });
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
    const payment = await database.payment.findFirst({
      where: {
        invoiceUrl: invoiceId,
      },
    });

    const updatedPayment = payment && paymentStatus.paid
      ? await database.payment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            paidAt: new Date(),
          },
        })
      : payment;

    return res.json({
      ...paymentStatus,
      payment: updatedPayment,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to check QPay payment.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

function findCallbackInvoiceId(payload: Record<string, unknown>) {
  const candidates = [
    payload.invoice_id,
    payload.invoiceId,
    payload.object_id,
    payload.objectId,
    payload.payment_id,
  ];

  const value = candidates.find((item) => typeof item === "string" && item.trim());
  return value ? String(value) : "";
}

export async function qpayCallback(req: Request, res: Response) {
  try {
    const payload = {
      ...(req.query as Record<string, unknown>),
      ...(req.body as Record<string, unknown>),
    };
    const invoiceId = findCallbackInvoiceId(payload);

    if (!invoiceId) {
      return res.status(400).json({ message: "QPay callback invoice id was not found." });
    }

    const payment = await database.payment.findFirst({
      where: { invoiceUrl: invoiceId },
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found for callback invoice." });
    }

    const paymentStatus = await checkQPayInvoice(invoiceId);
    const updatedPayment = paymentStatus.paid
      ? await database.payment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            paidAt: new Date(),
          },
        })
      : payment;

    return res.json({
      received: true,
      paid: paymentStatus.paid,
      payment: updatedPayment,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to process QPay callback.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
