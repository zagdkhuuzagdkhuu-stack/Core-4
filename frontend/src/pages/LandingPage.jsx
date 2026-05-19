import { ArrowRight, Database, ShieldCheck, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import CapabilityCard from "../components/CapabilityCard";

export default function LandingPage({ t }) {
  return (
    <section className="page-grid hero-layout">
      <div className="hero-copy">
        <p className="eyebrow">{t("hero.kicker")}</p>
        <h1>{t("hero.title")}</h1>
        <p>{t("hero.body")}</p>
        <div className="hero-actions">
          <Link className="primary-action" to="/register">
            {t("hero.primary")}
            <ArrowRight size={17} />
          </Link>
          <Link className="secondary-action" to="/login">
            {t("hero.secondary")}
          </Link>
        </div>
      </div>

      <div className="backend-map">
        <CapabilityCard eyebrow="01" title={t("dashboard.auth")}>
          <ShieldCheck size={22} />
          <span>{t("dashboard.auth.body")}</span>
        </CapabilityCard>
        <CapabilityCard eyebrow="02" title={t("dashboard.payments")}>
          <WalletCards size={22} />
          <span>{t("dashboard.payments.body")}</span>
        </CapabilityCard>
        <CapabilityCard eyebrow="03" title={t("dashboard.data")}>
          <Database size={22} />
          <span>{t("dashboard.data.body")}</span>
        </CapabilityCard>
      </div>
    </section>
  );
}
