import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Copy, CreditCard, Download, ExternalLink, FilePenLine, QrCode, RefreshCw, Trash2 } from "lucide-react";
import AppShell from "../components/AppShell.jsx";
import api from "../lib/api.js";
import { contracts } from "../data/mockContracts.js";

function getContractAmount(value) {
  const amount = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(amount) && amount > 0 ? amount : 1000;
}

export default function ContractDetails() {
  const { id } = useParams();
  const contract = contracts.find((item) => item.id === id) || contracts[0];
  const [invoice, setInvoice] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentError, setPaymentError] = useState("");
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const amount = getContractAmount(contract.value);

  async function createInvoice() {
    try {
      setPaymentError("");
      setPaymentStatus(null);
      setIsCreatingInvoice(true);

      const response = await api.post("/payments/qpay/invoices", {
        contractId: contract.id,
        amount,
        description: `${contract.title} payment`,
        receiverCode: "web-customer",
      });

      setInvoice(response.data);
    } catch (error) {
      setPaymentError(error.response?.data?.error || error.response?.data?.message || "QPay invoice could not be created.");
    } finally {
      setIsCreatingInvoice(false);
    }
  }

  async function checkPayment() {
    if (!invoice?.invoice_id) return;

    try {
      setPaymentError("");
      setIsCheckingPayment(true);

      const response = await api.get(`/payments/qpay/check/${invoice.invoice_id}`);
      setPaymentStatus(response.data);
    } catch (error) {
      setPaymentError(error.response?.data?.error || error.response?.data?.message || "Payment status could not be checked.");
    } finally {
      setIsCheckingPayment(false);
    }
  }

  const qrImage = invoice?.qr_image?.startsWith("data:")
    ? invoice.qr_image
    : invoice?.qr_image
      ? `data:image/png;base64,${invoice.qr_image}`
      : "";

  return (
    <AppShell
      eyebrow={contract.type}
      title={contract.title}
      description={contract.summary}
      action={<button className="primary-button hidden sm:inline-flex"><Download size={16} /> Татах</button>}
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="surface-panel p-7">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/42">Бүтэн гэрээ</p>
              <h2 className="mt-2 text-2xl font-semibold">Ноорог урьдчилан харах</h2>
            </div>
            <span className="status-chip">{contract.status}</span>
          </div>
          <div className="contract-paper">
            <h3>{contract.title}</h3>
            <p>
              Энэхүү гэрээ нь DraftLy ажлын орчин болон {contract.party} хооронд байгуулагдсан. Талууд хавсралтад дурдсан ажлын хүрээ, төлбөрийн нөхцөл, нууцлалын үүрэг болон үйл ажиллагааны үүргийг зөвшөөрнө.
            </p>
            <p>
              Гэрээ {contract.date}-нд эхэлнэ. Төлбөр, сунгалт, цуцлалт, хариуцлага болон маргааны нөхцөлийг батлахаас өмнө хуулийн эцсийн хяналт шаардлагатай.
            </p>
            <p>
              Гарын үсэг зурах эсвэл төлбөр боловсруулахын өмнө AI хяналтын онцолсон эрсдэлийг хариуцсан хэрэглэгч баталгаажуулна.
            </p>
          </div>
        </section>

        <aside className="grid gap-6">
          <section className="surface-panel p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/42">QPay</p>
                <h2 className="mt-2 text-xl font-semibold">Pay by QR</h2>
              </div>
              <span className="status-chip">{paymentStatus?.paid ? "Paid" : "Pending"}</span>
            </div>

            <div className="mt-5 rounded-md bg-black p-5 text-white">
              <p className="text-sm text-white/58">Payment amount</p>
              <strong className="mt-2 block text-2xl">MNT {amount.toLocaleString()}</strong>
            </div>

            {qrImage ? (
              <div className="mt-5 grid gap-4">
                <div className="grid place-items-center rounded-md border border-black/10 bg-white p-4">
                  <img className="h-48 w-48 object-contain" src={qrImage} alt="QPay QR code" />
                </div>
                <div className="grid gap-2">
                  {(invoice.urls || []).slice(0, 4).map((url) => (
                    <a
                      key={url.link}
                      className="secondary-button justify-between"
                      href={url.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span className="inline-flex items-center gap-2">
                        <ExternalLink size={16} />
                        {url.name || url.description || "Bank app"}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-5 grid min-h-48 place-items-center rounded-md border border-dashed border-black/20 bg-white p-5 text-center text-sm font-semibold text-black/52">
                <div className="grid justify-items-center gap-3">
                  <QrCode size={34} />
                  QPay QR will appear here
                </div>
              </div>
            )}

            {paymentStatus?.paid && (
              <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
                Payment received.
              </div>
            )}

            {paymentError && (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                {paymentError}
              </div>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button className="primary-button" type="button" onClick={createInvoice} disabled={isCreatingInvoice}>
                <CreditCard size={16} />
                {isCreatingInvoice ? "Creating..." : "Create invoice"}
              </button>
              <button className="secondary-button" type="button" onClick={checkPayment} disabled={!invoice || isCheckingPayment}>
                <RefreshCw size={16} />
                {isCheckingPayment ? "Checking..." : "Check payment"}
              </button>
            </div>
          </section>

          <section className="surface-panel p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/42">Эрсдэлийн шинжилгээ</p>
            <div className="mt-4 flex items-end gap-3">
              <span className="font-serif text-7xl leading-none">{contract.riskScore}</span>
              <span className="pb-3 text-sm font-semibold text-black/50">/ 100</span>
            </div>
            <div className="mt-5 grid gap-3">
              {contract.risks.map((risk) => (
                <div key={risk} className="risk-row">{risk}</div>
              ))}
            </div>
          </section>

          <section className="surface-panel p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/42">Үйлдлүүд</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button className="secondary-button"><FilePenLine size={16} /> Засах</button>
              <button className="secondary-button"><Copy size={16} /> Хуулах</button>
              <button className="secondary-button"><RefreshCw size={16} /> Сунгах</button>
              <button className="danger-button"><Trash2 size={16} /> Устгах</button>
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
