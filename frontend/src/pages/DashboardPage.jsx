import { Bell, Building2, FileText, Layers3, ShieldCheck, UploadCloud } from "lucide-react";
import CapabilityCard from "../components/CapabilityCard";

const nextTargets = [
  { icon: FileText, label: "Contracts API", detail: "CRUD for Contract, Document, Parties, and Clauses" },
  { icon: ShieldCheck, label: "Risk analysis API", detail: "Create and read RiskAnalysis rows for documents/contracts" },
  { icon: Building2, label: "Company workspace", detail: "Company and UserCompany membership screens" },
  { icon: UploadCloud, label: "File upload", detail: "Connect FileUpload model to storage and document records" },
  { icon: Bell, label: "Notifications", detail: "Unread/read states using Notification model" },
  { icon: Layers3, label: "Templates", detail: "Template categories and reusable contract content" },
];

export default function DashboardPage({ session, t }) {
  const user = session?.user;

  return (
    <section className="page-grid">
      <div className="section-heading">
        <p className="eyebrow">{t("common.currentUser")}</p>
        <h1>{t("dashboard.title")}</h1>
        <p>{t("dashboard.subtitle")}</p>
      </div>

      {user && (
        <div className="user-banner">
          <div>
            <strong>{[user.firstName, user.lastName].filter(Boolean).join(" ") || user.email}</strong>
            <span>{user.email}</span>
          </div>
          <span>{user.role || "USER"}</span>
        </div>
      )}

      <div className="card-grid">
        <CapabilityCard eyebrow="Live" title={t("dashboard.auth")}>
          <span>{t("dashboard.auth.body")}</span>
        </CapabilityCard>
        <CapabilityCard eyebrow="Live" title={t("dashboard.payments")}>
          <span>{t("dashboard.payments.body")}</span>
        </CapabilityCard>
        <CapabilityCard eyebrow="Schema" title={t("dashboard.data")}>
          <span>{t("dashboard.data.body")}</span>
        </CapabilityCard>
      </div>

      <div className="roadmap-panel">
        <div className="section-heading compact">
          <p className="eyebrow">Prisma</p>
          <h2>{t("dashboard.next")}</h2>
        </div>
        <div className="roadmap-grid">
          {nextTargets.map(({ icon: Icon, label, detail }) => (
            <article className="roadmap-item" key={label}>
              <Icon size={20} />
              <div>
                <strong>{label}</strong>
                <span>{detail}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
