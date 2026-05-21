import { ArrowRight, BriefcaseBusiness, FileText, Landmark, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  { name: "templates.category.contract", count: "templates.count.24", icon: FileText },
  { name: "templates.category.letter", count: "templates.count.18", icon: Landmark },
  { name: "templates.category.business", count: "templates.count.12", icon: BriefcaseBusiness },
];

const templates = [
  { title: "templates.item.employment.title", description: "templates.item.employment.body", tags: ["HR", "templates.category.contract"] },
  { title: "templates.item.service.title", description: "templates.item.service.body", tags: ["Service", "Payment"] },
  { title: "templates.item.nda.title", description: "templates.item.nda.body", tags: ["NDA", "Legal"] },
  { title: "templates.item.lease.title", description: "templates.item.lease.body", tags: ["Rent", "Property"] },
  { title: "templates.item.request.title", description: "templates.item.request.body", tags: ["Letter", "Office"] },
  { title: "templates.item.proposal.title", description: "templates.item.proposal.body", tags: ["Proposal", "Business"] },
];

export default function TemplatesPage({ t }) {
  return (
    <section className="templates-page">
      <div className="templates-hero">
        <div>
          <p className="eyebrow">{t("templates.kicker")}</p>
          <h1>{t("templates.title")}</h1>
          <p>{t("templates.body")}</p>
        </div>

        <div className="template-search">
          <Search size={18} />
          <input placeholder={t("templates.search")} />
        </div>
      </div>

      <div className="template-category-row">
        {categories.map(({ icon: Icon, name, count }) => (
          <article key={name}>
            <Icon size={22} />
            <div>
              <strong>{t(name)}</strong>
              <span>{t(count)}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="template-workspace">
        <aside className="template-sidebar">
          <strong>{t("templates.sidebar.title")}</strong>
          <button className="active" type="button">{t("templates.sidebar.all")}</button>
          <button type="button">{t("templates.category.contract")}</button>
          <button type="button">{t("templates.category.letter")}</button>
          <button type="button">{t("templates.sidebar.company")}</button>
          <button type="button">{t("templates.sidebar.risk")}</button>
        </aside>

        <div className="template-grid">
          {templates.map((template) => (
            <article className="template-card" key={template.title}>
              <div className="template-card-icon">
                <Sparkles size={18} />
              </div>
              <h2>{t(template.title)}</h2>
              <p>{t(template.description)}</p>
              <div className="template-tags">
                {template.tags.map((tag) => (
                  <span key={tag}>{tag.startsWith("templates.") ? t(tag) : tag}</span>
                ))}
              </div>
              <Link to="/register">
                {t("templates.use")}
                <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
