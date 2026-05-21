import {
  Archive,
  Binoculars,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Home,
  Lightbulb,
  Menu,
  QrCode,
  Scale,
  Search,
  Settings,
  Shield,
  Sparkles,
  Sun,
  Trash2,
  UserCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { themeNames, useTheme } from "../theme/useTheme";

const themeLabels = {
  pastelLight: "Pastel Light",
  pastelDark: "Pastel Dark",
  neoNature: "Neo Nature",
  dreamySky: "Dreamy Sky",
};

const templates = Array.from({ length: 10 }, (_, index) => ({
  id: index + 1,
  title: "Зээлийн гэрээ",
  subtitle: "Иргэн хоорондын зээлийн гэрээ",
  updated: "2026-01-01",
  price: "17,999₮",
  used: "148ш",
}));

const wizardSteps = [
  { title: "Мэдээлэл", detail: "Хувийн мэдээлэл" },
  { title: "Нэмэлт", detail: "Төрлөө сонгоно уу" },
  { title: "Төлбөр", detail: "Төлбөр баталгаажуулалт" },
  { title: "Үүсгэх", detail: "Төрлөө сонгоно уу" },
  { title: "Дуусгах", detail: "Төрлөө сонгоно уу" },
];

function getUserName(user) {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  return fullName || user?.email?.split("@")[0] || "Anya";
}

function DashboardShell({ children, session, activeView, setActiveView, language, setLanguage }) {
  const { themeName, setThemeName } = useTheme();
  const user = session?.user;
  const email = user?.email || "ariunaa1314@gmail.com";

  const navItems = [
    { id: "home", label: "Нүүр", icon: Home },
    { id: "templates", label: "Гэрээ үүсгүүлэх", icon: Scale },
    { id: "review", label: "Гэрээ хянуулах", icon: Lightbulb },
    { id: "settings", label: "Тохиргоо", icon: Settings },
  ];

  return (
    <section className="draft-dashboard">
      <aside className="draft-sidebar">
        <div className="draft-brand-row">
          <strong>DraftLy.</strong>
          <Menu size={20} />
        </div>

        <div className="draft-user-row">
          <span>
            <UserCircle size={18} />
          </span>
          <strong>{email}</strong>
        </div>

        <nav className="draft-side-nav">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button className={activeView === id ? "active" : ""} key={id} onClick={() => setActiveView(id)} type="button">
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="draft-main">
        <div className="draft-topbar">
          <label className="draft-search">
            <Binoculars size={22} />
            <input placeholder="Гэрээний нэрээр хайх..." />
          </label>
          <div className="draft-tools">
            <label className="draft-tool-select" title="Theme">
              <Sun size={18} />
              <select aria-label="Theme" value={themeName} onChange={(event) => setThemeName(event.target.value)}>
                {themeNames.map((name) => (
                  <option key={name} value={name}>
                    {themeLabels[name] ?? name}
                  </option>
                ))}
              </select>
            </label>
            <label className="draft-tool-select draft-language" title="Language">
              <span>{language.toUpperCase()}</span>
              <select aria-label="Language" value={language} onChange={(event) => setLanguage(event.target.value)}>
                <option value="mn">MN</option>
                <option value="en">EN</option>
              </select>
            </label>
          </div>
        </div>

        <div className="draft-content">{children}</div>
      </section>
    </section>
  );
}

function DashboardHome({ session, openTemplates }) {
  const userName = getUserName(session?.user);

  return (
    <div className="draft-home">
      <div className="draft-welcome">
        <h1>Welcome back, {userName}</h1>
        <p>Here`s what`s happening with your contracts</p>
      </div>

      <button className="draft-hero-card" onClick={openTemplates} type="button">
        <div>
          <span className="ai-pill">
            <Sparkles size={16} />
            AI-Powered
          </span>
          <h2>Create Service Agreement</h2>
          <p>Generate a professional service contract in minutes with AI assistance</p>
          <strong>Get Started</strong>
        </div>
        <span className="draft-file-icon">
          <FileText size={58} />
        </span>
      </button>

      <div className="draft-metrics">
        <article>
          <FileText size={18} />
          <strong>24</strong>
          <span>Active Contracts</span>
        </article>
        <article>
          <Search size={18} />
          <strong>5</strong>
          <span>Pending Review</span>
        </article>
        <article>
          <Shield size={18} />
          <strong>8.7</strong>
          <span>Avg Risk Score</span>
        </article>
      </div>
    </div>
  );
}

function TemplateChooser({ startWizard }) {
  return (
    <div className="draft-template-grid">
      {templates.map((template) => (
        <button className="draft-template-card" key={template.id} onClick={startWizard} type="button">
          <div>
            <h2>{template.title}</h2>
            <strong>{template.subtitle}</strong>
            <span>Баримт бичиг шинэчилсэн огноо : {template.updated}</span>
          </div>
          <footer>
            <strong>{template.price}</strong>
            <strong>Ашигласан тоо : {template.used}</strong>
          </footer>
        </button>
      ))}
    </div>
  );
}

function Stepper({ currentStep }) {
  return (
    <div className="draft-stepper">
      {wizardSteps.map((step, index) => {
        const number = index + 1;
        return (
          <div className={`draft-step ${number === currentStep ? "active" : ""}`} key={step.title}>
            <div>
              <span>{number}</span>
              {number < wizardSteps.length && <i />}
            </div>
            <strong>{step.title}</strong>
            <small>{step.detail}</small>
          </div>
        );
      })}
    </div>
  );
}

function TextField({ label, placeholder, type = "text" }) {
  return (
    <label className="draft-field">
      <span>{label}</span>
      <input placeholder={placeholder} type={type} />
    </label>
  );
}

function PartyForm({ title, organization }) {
  return (
    <article className="draft-form-card">
      <h2>{title}</h2>
      {organization ? (
        <>
          <TextField label="Байгууллагын нэр" placeholder="Жишээ нь: Монгол банк" />
          <TextField label="Хаяг" placeholder="Жишээ нь: Сүхбаатар дүүрэг, 1-р хороо" />
          <TextField label="Утасны дугаар" placeholder="Жишээ нь: 88001234" />
        </>
      ) : (
        <>
          <TextField label="Овог" placeholder="Жишээ нь: Бат" />
          <TextField label="Нэр" placeholder="Жишээ нь: Болд" />
          <TextField label="Иргэний бүртгэлийн дугаар" placeholder="12 оронтой дугаар" />
        </>
      )}
      <div className="draft-register-row">
        <div className="letter-pair">
          <button type="button">К</button>
          <button type="button">А</button>
        </div>
        <input placeholder="8 оронтой тоо" />
        {!organization && (
          <>
            <span className="mini-stat">Эм <b>☻</b></span>
            <span className="mini-stat">Нас <b>19</b></span>
          </>
        )}
      </div>
    </article>
  );
}

function InfoStep() {
  return (
    <div className="draft-form-pair">
      <PartyForm title="Хувь хүн" />
      <PartyForm organization title="Байгууллага" />
    </div>
  );
}

function ListBox({ title, items }) {
  return (
    <label className="draft-list-box">
      <span>{title}</span>
      <div>
        {items.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
    </label>
  );
}

function DetailsStep() {
  return (
    <article className="draft-detail-card">
      <ListBox title="Шалтгаан:" items={["Барилга байгууламж барих", "Үйлчилгээний зориулалтаар ашиглах", "Газрыг үр ашигтай ашиглах"]} />
      <div className="draft-detail-columns">
        <ListBox title="Нөхцөл:" items={["Газрын эзэмшигчийн зөвшөөрөлтэй", "Нотариатаар баталгаажсан гэрээтэй", "Барилгын зориулалтын дагуу ашиглах"]} />
        <ListBox title="Үндэслэл:" items={["Иргэний хуулийн холбогдох заалт", "Газрын эзэмшигчтэй байгуулсан гэрээ", "Барилга барих зөвшөөрөл"]} />
      </div>
      <div className="draft-date-row">
        <TextField label="Эхлэх огноо" type="date" />
        <TextField label="Дуусах огноо" type="date" />
      </div>
    </article>
  );
}

function PaymentStep({ nextStep }) {
  return (
    <div className="draft-payment-step">
      <div className="draft-qr-box">
        <QrCode size={96} />
        <span>QR код энд харагдана</span>
      </div>
      <button className="draft-gradient-button" onClick={nextStep} type="button">
        Төлбөр шалгах
      </button>
      <p>QR кодыг уншуулан төлбөрөө баталгаажуулна уу</p>
    </div>
  );
}

function GenerateStep({ nextStep, showMenu, setShowMenu }) {
  return (
    <div className="draft-generate-step">
      <div className="draft-doc-preview">
        {[1, 2, 3].map((item) => (
          <article key={item}>
            <FileText size={24} />
            <div>
              <strong>Гэрээний баримт {item}</strong>
              <span>Бэлэн болсон</span>
            </div>
          </article>
        ))}
        <h2>Бэлэн болсон баримтууд</h2>
      </div>

      {!showMenu && (
        <aside className="draft-downloads">
          <h3>Татаж авах сонголтууд</h3>
          <button className="blue" type="button">
            PDF файл <Download size={18} />
          </button>
          <button className="purple" type="button">
            Word файл <Download size={18} />
          </button>
          <button type="button">
            PDF файл <Download size={18} />
          </button>
        </aside>
      )}

      {showMenu && (
        <aside className="draft-finish-menu">
          <button type="button">
            <Archive size={20} />
            <span>
              <strong>Архивлах</strong>
              Баримтыг архив руу шилжүүлэх
            </span>
          </button>
          <button type="button">
            <Trash2 size={20} />
            <span>
              <strong>Устгах</strong>
              Баримтыг бүрмөсөн устгах
            </span>
          </button>
        </aside>
      )}

      <button className="draft-finish-button" onClick={() => (showMenu ? nextStep() : setShowMenu(true))} type="button">
        Дуусгах {showMenu ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
    </div>
  );
}

function DoneStep({ reset }) {
  return (
    <div className="draft-done-step">
      <Sparkles size={42} />
      <h2>Гэрээ үүсгэлт дууслаа</h2>
      <p>Баримтуудаа татаж авах, архивлах эсвэл дахин template сонгох боломжтой.</p>
      <button onClick={reset} type="button">Template рүү буцах</button>
    </div>
  );
}

function Wizard({ currentStep, setCurrentStep, resetWizard }) {
  const [showFinishMenu, setShowFinishMenu] = useState(false);

  const content = useMemo(() => {
    if (currentStep === 1) return <InfoStep />;
    if (currentStep === 2) return <DetailsStep />;
    if (currentStep === 3) return <PaymentStep nextStep={() => setCurrentStep(4)} />;
    if (currentStep === 4) {
      return (
        <GenerateStep
          nextStep={() => setCurrentStep(5)}
          setShowMenu={setShowFinishMenu}
          showMenu={showFinishMenu}
        />
      );
    }
    return <DoneStep reset={resetWizard} />;
  }, [currentStep, resetWizard, setCurrentStep, showFinishMenu]);

  return (
    <div className="draft-wizard">
      <Stepper currentStep={currentStep} />
      {content}
      {currentStep < 3 && (
        <button className="draft-next-button" onClick={() => setCurrentStep((step) => Math.min(step + 1, 5))} type="button">
          Үргэлжлүүлэх
        </button>
      )}
    </div>
  );
}

export default function DashboardPage({ language, session, setLanguage }) {
  const [activeView, setActiveView] = useState("home");
  const [currentStep, setCurrentStep] = useState(0);

  function openTemplates() {
    setCurrentStep(0);
    setActiveView("templates");
  }

  function startWizard() {
    setCurrentStep(1);
    setActiveView("templates");
  }

  function resetWizard() {
    setCurrentStep(0);
    setActiveView("templates");
  }

  return (
    <DashboardShell activeView={activeView} language={language} session={session} setActiveView={(view) => {
      setCurrentStep(0);
      setActiveView(view);
    }} setLanguage={setLanguage}>
      {activeView === "home" && <DashboardHome openTemplates={openTemplates} session={session} />}
      {activeView === "templates" && currentStep === 0 && <TemplateChooser startWizard={startWizard} />}
      {activeView === "templates" && currentStep > 0 && (
        <Wizard currentStep={currentStep} resetWizard={resetWizard} setCurrentStep={setCurrentStep} />
      )}
      {activeView === "review" && (
        <div className="draft-empty-panel">
          <Lightbulb size={36} />
          <h2>Гэрээ хянуулах</h2>
          <p>Энэ хэсэгт гэрээний эрсдэл, алдаатай заалт, дутуу нөхцөлүүдийг хянуулах урсгал байрлана.</p>
        </div>
      )}
      {activeView === "settings" && (
        <div className="draft-empty-panel">
          <Settings size={36} />
          <h2>Тохиргоо</h2>
          <p>Хэрэглэгчийн мэдээлэл, хэл, theme болон workspace тохиргоо энд харагдана.</p>
        </div>
      )}
    </DashboardShell>
  );
}
