import { QrCode, RefreshCcw } from "lucide-react";
import { useState } from "react";
import api from "../lib/api";

export default function PaymentsPage({ t }) {
  const [form, setForm] = useState({
    amount: "1000",
    description: "Contract payment",
    contractId: "",
    receiverCode: "",
  });
  const [invoiceId, setInvoiceId] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function createInvoice(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("/payments/qpay/invoices", {
        amount: Number(form.amount),
        description: form.description,
        contractId: form.contractId || undefined,
        receiverCode: form.receiverCode || undefined,
      });

      setResult(response.data);
      setInvoiceId(response.data.invoice_id || "");
    } catch (paymentError) {
      setError(paymentError.response?.data?.message || t("auth.error"));
    } finally {
      setIsLoading(false);
    }
  }

  async function checkPayment() {
    if (!invoiceId) return;
    setError("");
    setIsLoading(true);

    try {
      const response = await api.get(`/payments/qpay/check/${invoiceId}`);
      setResult(response.data);
    } catch (paymentError) {
      setError(paymentError.response?.data?.message || t("auth.error"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="page-grid two-column">
      <div className="section-heading">
        <p className="eyebrow">QPay</p>
        <h1>{t("payments.title")}</h1>
        <p>{t("payments.subtitle")}</p>
      </div>

      <form className="payment-form panel" onSubmit={createInvoice}>
        <label>
          <span>{t("payments.amount")}</span>
          <input min="1" name="amount" onChange={updateField} required type="number" value={form.amount} />
        </label>
        <label>
          <span>{t("payments.description")}</span>
          <input name="description" onChange={updateField} value={form.description} />
        </label>
        <label>
          <span>{t("payments.contractId")}</span>
          <input name="contractId" onChange={updateField} value={form.contractId} />
        </label>
        <label>
          <span>{t("payments.receiverCode")}</span>
          <input name="receiverCode" onChange={updateField} value={form.receiverCode} />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button className="primary-action wide" disabled={isLoading} type="submit">
          <QrCode size={17} />
          {isLoading ? t("common.loading") : t("payments.create")}
        </button>
      </form>

      <aside className="payment-result panel">
        <label>
          <span>{t("payments.invoiceId")}</span>
          <input onChange={(event) => setInvoiceId(event.target.value)} value={invoiceId} />
        </label>
        <button className="secondary-action wide" disabled={!invoiceId || isLoading} onClick={checkPayment} type="button">
          <RefreshCcw size={16} />
          {t("payments.check")}
        </button>

        {result?.qr_image && <img alt="QPay QR code" className="qr-image" src={`data:image/png;base64,${result.qr_image}`} />}

        {result?.urls?.length > 0 && (
          <div className="payment-links">
            {result.urls.map((item) => (
              <a href={item.link} key={item.link} rel="noreferrer" target="_blank">
                {item.name || item.description || item.link}
              </a>
            ))}
          </div>
        )}

        <div className="response-box">
          <strong>{t("payments.result")}</strong>
          <pre>{result ? JSON.stringify(result, null, 2) : "{}"}</pre>
        </div>
      </aside>
    </section>
  );
}
