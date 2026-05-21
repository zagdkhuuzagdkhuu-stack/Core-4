import { ArrowRight, Check, FileSignature, Fingerprint, Languages, Minus, Scale, Search, Sparkles, Zap } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const partners = ["Core", "Legal", "Gov", "Docs", "AI", "Pay", "Risk", "Cloud"];

const actionCardKeys = ["home.action.government", "home.action.service", "home.action.training"];

const features = [
  { icon: Zap, title: "home.feature.fast.title", body: "home.feature.fast.body" },
  { icon: Scale, title: "home.feature.legal.title", body: "home.feature.legal.body" },
  { icon: Fingerprint, title: "home.feature.manage.title", body: "home.feature.manage.body" },
  { icon: FileSignature, title: "home.feature.approval.title", body: "home.feature.approval.body" },
];

const plans = [
  { name: "pricing.individual", price: "197,000₮", docs: "60", users: "-", features: [true, false, false, false, false, false] },
  { name: "pricing.organization", price: "1,997,000₮", docs: "pricing.upTo500", users: "5", features: [true, true, true, true, false, false] },
  { name: "pricing.corporate", price: "7,190,000₮", docs: "pricing.unlimited", users: "30", features: [true, true, true, true, true, true] },
];

const rows = [
  "pricing.row.documents",
  "pricing.row.users",
  "pricing.row.reusable",
  "pricing.row.bulk",
  "pricing.row.api",
  "pricing.row.translate",
  "pricing.row.contract",
  "pricing.row.legalCheck",
];

export default function LandingPage({ t }) {
  useEffect(() => {
    if (window.location.hash === "#pricing") {
      window.requestAnimationFrame(() => {
        document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, []);

  return (
    <div className="website-home">
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="eyebrow">{t("hero.kicker")}</p>
          <h1>{t("hero.title")}</h1>
          <p>{t("hero.body")}</p>
          <div className="hero-actions">
            <Link className="primary-action" to="/register">
              {t("hero.primary")}
            </Link>
            <Link className="secondary-action" to="/dashboard">
              {t("hero.secondary")}
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>

        <div className="hero-tool-panel">
          <div className="hero-tool-row">
            <Search size={17} />
            <span>{t("hero.tool.search")}</span>
          </div>
          <div className="hero-tool-row strong">
            <Sparkles size={17} />
            <span>{t("hero.tool.risk")}</span>
          </div>
          <div className="hero-tool-row">
            <Languages size={17} />
            <span>{t("hero.tool.language")}</span>
          </div>
        </div>
      </section>

      <section className="partner-section">
        <p>{t("home.partners")}</p>
        <div className="partner-track">
          {partners.map((partner) => (
            <span key={partner}>{partner}</span>
          ))}
        </div>
      </section>

      <section className="home-action-grid">
        {actionCardKeys.map((key) => (
          <article key={key}>
            <h2>{t(key)}</h2>
            <Link to="/dashboard">{t("hero.secondary")}</Link>
          </article>
        ))}
      </section>

      <section className="feature-grid">
        {features.map(({ icon: Icon, title, body }) => (
          <article key={title}>
            <div>
              <Icon size={20} />
              <h3>{t(title)}</h3>
            </div>
            <p>{t(body)}</p>
          </article>
        ))}
      </section>

      <section className="pricing-section" id="pricing">
        <div className="section-heading compact">
          <p className="eyebrow">{t("pricing.kicker")}</p>
          <h2>{t("pricing.title")}</h2>
        </div>

        <div className="pricing-table">
          <div className="pricing-cell blank" />
          {plans.map((plan) => (
            <div className="pricing-cell plan-head" key={plan.name}>
              <h3>{t(plan.name)}</h3>
              <span>{t("pricing.yearly")}</span>
              <strong>{plan.price}</strong>
              <small>{t("pricing.freeMonth")}</small>
              <button type="button">{t("pricing.buy")}</button>
            </div>
          ))}

          {rows.map((row, rowIndex) => (
            <div className="pricing-row-fragment" key={row}>
              <div className="pricing-cell row-title">{t(row)}</div>
              {plans.map((plan) => {
                const value = rowIndex === 0 ? plan.docs : rowIndex === 1 ? plan.users : plan.features[rowIndex - 2];
                return (
                  <div className="pricing-cell value" key={`${plan.name}-${row}`}>
                    {typeof value === "boolean" ? value ? <Check size={18} /> : <Minus size={18} /> : value.startsWith("pricing.") ? t(value) : value}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      <footer className="site-home-footer">
        <div>
          <strong>{t("app.name")}.</strong>
          <span>{t("footer.developed")}</span>
          <span>{t("footer.copyright")}</span>
        </div>
        <div>
          <strong>{t("footer.company")}</strong>
          <span>{t("footer.about")}</span>
          <span>{t("footer.guide")}</span>
        </div>
        <div>
          <strong>{t("footer.contact")}</strong>
          <span>{t("footer.address")}</span>
          <span>info@draftly.mn</span>
          <span>+976 77071777</span>
        </div>
        <div>
          <strong>{t("footer.extra")}</strong>
          <span>{t("footer.terms")}</span>
          <span>{t("footer.privacy")}</span>
          <span>{t("footer.faq")}</span>
        </div>
      </footer>
    </div>
  );
}
