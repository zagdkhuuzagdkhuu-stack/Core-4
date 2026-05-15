type QPayUrl = {
  name?: string;
  description?: string;
  link?: string;
};

type CreateInvoiceInput = {
  amount: number;
  description: string;
  receiverCode?: string;
  senderInvoiceNo?: string;
  callbackUrl?: string;
};

type QPayInvoiceResponse = {
  invoice_id: string;
  qr_text?: string;
  qr_image?: string;
  urls?: QPayUrl[];
};

type QPayPaymentCheckResponse = {
  count?: number;
  paid_amount?: number;
  rows?: Array<{
    payment_id?: string;
    payment_status?: string;
    payment_date?: string;
    payment_amount?: string | number;
    payment_currency?: string;
  }>;
};

const QPAY_BASE_URL = process.env.QPAY_BASE_URL || "https://merchant-sandbox.qpay.mn/v2";

function getQPayCredentials() {
  const username = process.env.QPAY_MERCHANT_USERNAME;
  const password = process.env.QPAY_MERCHANT_PASSWORD;
  const invoiceCode = process.env.QPAY_INVOICE_CODE || "TEST_INVOICE";

  if (!username || !password) {
    throw new Error("QPay credentials are missing. Set QPAY_MERCHANT_USERNAME and QPAY_MERCHANT_PASSWORD.");
  }

  return { username, password, invoiceCode };
}

async function parseQPayResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = typeof data?.message === "string" ? data.message : "QPay request failed";
    throw new Error(message);
  }

  return data as T;
}

export async function fetchQPayToken() {
  const { username, password } = getQPayCredentials();
  const credentials = Buffer.from(`${username}:${password}`).toString("base64");

  const response = await fetch(`${QPAY_BASE_URL}/auth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });

  const data = await parseQPayResponse<{ access_token?: string }>(response);

  if (!data.access_token) {
    throw new Error("QPay token response did not include an access token.");
  }

  return data.access_token;
}

export async function createQPayInvoice(input: CreateInvoiceInput) {
  const { invoiceCode } = getQPayCredentials();
  const accessToken = await fetchQPayToken();
  const senderInvoiceNo = input.senderInvoiceNo || `contract-${Date.now()}`;
  const callbackUrl = input.callbackUrl || process.env.QPAY_CALLBACK_URL || "http://localhost:3000/api/payments/qpay/callback";

  const response = await fetch(`${QPAY_BASE_URL}/invoice`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      invoice_code: invoiceCode,
      sender_invoice_no: senderInvoiceNo,
      invoice_receiver_code: input.receiverCode || "web-customer",
      invoice_description: input.description,
      amount: input.amount,
      callback_url: callbackUrl,
    }),
  });

  return parseQPayResponse<QPayInvoiceResponse>(response);
}

export async function checkQPayInvoice(invoiceId: string) {
  const accessToken = await fetchQPayToken();

  const response = await fetch(`${QPAY_BASE_URL}/payment/check`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      object_type: "INVOICE",
      object_id: invoiceId,
      offset: {
        page_number: 1,
        page_limit: 100,
      },
    }),
  });

  const data = await parseQPayResponse<QPayPaymentCheckResponse>(response);
  const paid = (data.rows || []).some((row) => row.payment_status === "PAID");

  return {
    ...data,
    paid,
  };
}
