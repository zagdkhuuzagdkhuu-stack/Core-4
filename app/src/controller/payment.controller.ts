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

function canUseDemoQPay() {
  return process.env.NODE_ENV !== "production" && process.env.QPAY_DEMO_FALLBACK !== "false";
}

function createDemoInvoice(amount: number, description: string) {
  return {
    invoice_id: `demo-qpay-${Date.now()}`,
    qr_text: `DRAFTLY DEMO PAYMENT ${amount} MNT`,
    urls: [
      {
        name: "Туршилтын төлбөр",
        description: "Хөгжүүлэлтийн орчны төлбөр баталгаажуулалт",
        link: "https://qpay.mn",
      },
    ],
    demo: true,
    amount,
    description,
  };
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

export async function createPublicQPayInvoice(req: Request, res: Response) {
  try {
    const amount = parseAmount(req.body.amount);

    if (!amount) {
      return res.status(400).json({ message: "A valid payment amount is required." });
    }

    const invoice = await createQPayInvoice({
      amount,
      description: String(req.body.description || "Draftly document payment").slice(0, 255),
      receiverCode: req.body.receiverCode ? String(req.body.receiverCode) : undefined,
      senderInvoiceNo: `draftly-${Date.now()}`,
    });

    return res.status(201).json({
      invoice,
      ...invoice,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("[QPay] createPublicQPayInvoice error:", errMsg);

    return res.status(502).json({
      message: "QPay нэхэмжлэх үүсгэхэд алдаа гарлаа.",
      error: errMsg,
      code: "QPAY_API_ERROR",
    });
  }
}

export async function checkQPayPayment(req: Request, res: Response) {
  try {
    const invoiceId = String(req.params.invoiceId || "");

    if (!invoiceId) {
      return res.status(400).json({ message: "QPay invoice id is required." });
    }

    if (invoiceId.startsWith("demo-qpay-") && canUseDemoQPay()) {
      return res.json({
        paid: true,
        count: 1,
        paid_amount: 10,
        rows: [
          {
            payment_id: invoiceId,
            payment_status: "PAID",
            payment_date: new Date().toISOString(),
            payment_amount: 10,
            payment_currency: "MNT",
          },
        ],
      });
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

export async function getMyPaymentStatus(req: Request, res: Response) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const now = new Date();
    const [activeSubscription, latestPayment] = await Promise.all([
      database.subscription.findFirst({
        where: {
          userId,
          status: "ACTIVE",
          OR: [{ endDate: null }, { endDate: { gte: now } }],
        },
        orderBy: { createdAt: "desc" },
      }),
      database.payment.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const isPaid = Boolean(activeSubscription) || latestPayment?.status === "PAID";

    return res.json({
      isPaid,
      latestPayment,
      subscription: activeSubscription,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load payment status.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function activatePaidAccess(req: Request, res: Response) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const invoiceId = String(req.body.invoiceId || "").trim();
    const plan = String(req.body.plan || "PRO").trim();

    if (!invoiceId) {
      return res.status(400).json({ message: "Invoice id is required." });
    }

    const status = invoiceId.startsWith("demo-qpay-") && canUseDemoQPay()
      ? { paid: true }
      : await checkQPayInvoice(invoiceId);
    if (!status.paid) {
      return res.status(400).json({ message: "Payment is not confirmed yet." });
    }

    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1);

    const subscription = await database.subscription.create({
      data: {
        userId,
        plan,
        status: "ACTIVE",
        startDate: now,
        endDate,
      },
    });

    return res.status(201).json({
      isPaid: true,
      subscription,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to activate paid access.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
