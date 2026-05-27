import { useState, useEffect, useRef } from "react";
import type { ReactNode, RefObject } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText, ArrowRight, ArrowLeft, Twitter, Linkedin,
  Instagram, Facebook, Phone, Mail, MapPin, Sun, Moon, UploadCloud,
  LoaderCircle, Check, Archive, Download, Trash2, Search, QrCode, Menu, X,
  BriefcaseBusiness, Handshake, Home, Landmark, ShieldCheck, AlertTriangle,
  ChevronDown, Info, ZoomIn, ZoomOut, Maximize2, CircleUserRound, LogOut, CreditCard, Settings,
} from "lucide-react";
import enContent from "./content/en.json";
import mnContent from "./content/mn.json";
import {
  activatePaidAccess,
  checkQPayInvoice,
  createPublicQPayInvoice,
  fetchMe,
  fetchMyPaymentStatus,
  fetchTemplates,
  listMyContracts,
  listMyDocuments,
  loginWithGoogle,
  saveAnalyzedDocument,
  saveGeneratedContract,
  updateMyProfile,
  uploadDocumentForAnalysis,
} from "./api";
import type {
  AnalysisResponse,
  AuthMeResponse,
  AuthUser,
  QPayInvoiceResponse,
  TemplateSummary,
  TemplateVariable,
} from "./api";

type Locale = "mn" | "en";
type HeaderTab = "Home" | "Template" | "Analysis" | "Contact us";
type AppPage = "home" | "template" | "analysis";
type AnalysisStep = "upload" | "processing" | "result";
type TemplateStep = "template" | "details" | "verification" | "payment" | "result";
type FolderNavControls = {
  isDark: boolean;
  languageLabel: string;
  loginLabel: string;
  isAuthenticated: boolean;
  userAvatarUrl?: string | null;
  onThemeToggle: () => void;
  onLanguageToggle: () => void;
  onLoginClick: () => void;
  onProfileClick: () => void;
};

const LOCALES = {
  mn: mnContent,
  en: enContent,
};
type UiContent = typeof enContent.ui;

type AccessState = {
  isPaid: boolean;
  profileComplete: boolean;
  missingFields: string[];
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (resp: { credential?: string }) => void;
            auto_select?: boolean;
            ux_mode?: "popup" | "redirect";
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const ORBIT_FEATURES = [
  {
    num: "01",
    title: "Template Creation",
    desc: "Choose from AI-powered legal templates.",
  },
  {
    num: "02",
    title: "Analysis",
    desc: "AI checks risks and missing clauses.",
  },
  {
    num: "03",
    title: "Smart Editing",
    desc: "Rewrite and improve documents.",
  },
  {
    num: "04",
    title: "Risk Detection",
    desc: "Detect unclear conditions.",
  },
  {
    num: "05",
    title: "Contract Generation",
    desc: "Generate complete agreements.",
  },
  {
    num: "06",
    title: "Recommendations",
    desc: "Receive AI suggestions.",
  },
  {
    num: "07",
    title: "Export Options",
    desc: "Download as PDF, DOCX, PPT.",
  },
  {
    num: "08",
    title: "Archive System",
    desc: "Store and manage documents.",
  },
];

const ORBIT_ANGLES = [18, 64, 109, 154, 205, 250, 298, 336];
const ORBIT_RADII = [28, 36, 44, 52, 60, 68, 76, 84];
const ORBIT_PARTICLES = [
  { left: "17%", top: "22%" },
  { left: "31%", top: "76%" },
  { left: "45%", top: "13%" },
  { left: "62%", top: "82%" },
  { left: "74%", top: "28%" },
  { left: "86%", top: "61%" },
  { left: "22%", top: "54%" },
  { left: "56%", top: "39%" },
  { left: "39%", top: "91%" },
  { left: "79%", top: "8%" },
];

const SECTION_REVEAL = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: "easeOut",
      staggerChildren: 0.08,
      when: "beforeChildren",
    },
  },
};

const REVEAL_ITEM = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const STACK_EASE = [0.22, 1, 0.36, 1] as const;
const STACK_TRANSITION = { duration: 0.82, ease: STACK_EASE };

const stackedPageVariants = {
  enter: (direction: number) => ({
    y: direction >= 0 ? "100%" : 0,
    scale: direction >= 0 ? 1 : 0.98,
    opacity: direction >= 0 ? 1 : 0.9,
    filter: direction >= 0 ? "blur(0px)" : "blur(2px)",
    zIndex: direction >= 0 ? 30 : 10,
  }),
  center: {
    y: ["0%", "-1.2%", "0%"],
    scale: 1,
    opacity: 1,
    filter: "blur(0px)",
    zIndex: 20,
    transition: STACK_TRANSITION,
  },
  exit: (direction: number) => ({
    y: direction < 0 ? "100%" : 0,
    scale: direction < 0 ? 1 : 0.98,
    opacity: direction < 0 ? 1 : 0.9,
    filter: direction < 0 ? "blur(0px)" : "blur(2px)",
    zIndex: direction < 0 ? 30 : 10,
    transition: STACK_TRANSITION,
  }),
};

const stackedStepVariants = {
  enter: (direction: number) => ({
    y: direction >= 0 ? "100%" : 0,
    scale: direction >= 0 ? 1.015 : 0.98,
    opacity: direction >= 0 ? 1 : 0.9,
    filter: direction >= 0 ? "blur(0px)" : "blur(2px)",
    zIndex: direction >= 0 ? 30 : 10,
  }),
  center: {
    y: ["0%", "-1.2%", "0%"],
    scale: [1.015, 0.995, 1],
    opacity: 1,
    filter: "blur(0px)",
    zIndex: 20,
    transition: STACK_TRANSITION,
  },
  exit: (direction: number) => ({
    y: direction < 0 ? "100%" : 0,
    scale: direction < 0 ? 1 : 0.98,
    opacity: direction < 0 ? 1 : 0.9,
    filter: direction < 0 ? "blur(0px)" : "blur(2px)",
    zIndex: direction < 0 ? 30 : 10,
    transition: STACK_TRANSITION,
  }),
};

const STEP_LABELS: { key: AnalysisStep; label: string }[] = [
  { key: "upload", label: "Upload" },
  { key: "processing", label: "Analysing" },
  { key: "result", label: "Result" },
];

const TEMPLATE_STEPS: { key: TemplateStep; label: string }[] = [
  { key: "template", label: "Template" },
  { key: "details", label: "Details" },
  { key: "verification", label: "Verification" },
  { key: "payment", label: "Payment" },
  { key: "result", label: "Result" },
];

const TEMPLATE_CATEGORIES = [
  { name: "Employment", items: ["Employment Agreement", "Internship Agreement", "Temporary Contract", "Freelance Agreement"] },
  { name: "Business", items: ["Partnership Agreement", "Purchase Agreement", "Sales Agreement"] },
  { name: "Rental", items: ["Lease Agreement", "Sublease Agreement", "Property Use Agreement"] },
  { name: "Financial", items: ["Loan Agreement", "Payment Agreement", "Investment Agreement"] },
  { name: "Government", items: ["Service Request", "Compliance Letter", "Public Procurement"] },
  { name: "Personal", items: ["Personal Loan", "Gift Agreement", "Power of Attorney"] },
  { name: "Legal", items: ["NDA Agreement", "Settlement Agreement", "Legal Notice"] },
];

const TEMPLATE_CARDS = [
  { name: "Employment Agreement", desc: "A clear employment contract with role, salary, and duties." },
  { name: "Partnership Agreement", desc: "Define ownership, decisions, contributions, and exits." },
  { name: "Lease Agreement", desc: "Rental terms, deposits, use rules, and maintenance duties." },
  { name: "NDA Agreement", desc: "Protect confidential information before collaboration starts." },
  { name: "Loan Agreement", desc: "Repayment schedule, interest, penalties, and guarantees." },
  { name: "Sales Agreement", desc: "Document sale terms, delivery, warranties, and payment." },
];

const TEMPLATE_GROUPS = [
  {
    key: "commerce",
    name: "",
    desc: "",
    keywords: ["худалда", "санхүү", "зээл", "барьца", "валют", "үнэт цаас", "хөрөнгө оруулалт", "бараа", "тээврийн хэрэгсэл", "sales", "purchase", "loan", "payment", "investment"],
    Icon: Landmark,
  },
  {
    key: "service",
    name: "",
    desc: "",
    keywords: ["үйлчилгээ", "ажил", "хөлсөөр", "барилга", "засвар", "уул уурхай", "үйлдвэрлэл", "боловсруулалт", "service", "employment", "freelance"],
    Icon: BriefcaseBusiness,
  },
  {
    key: "property",
    name: "",
    desc: "",
    keywords: ["түрээс", "хөрөнгө", "үл хөдлөх", "тоног төхөөрөмж", "талбай", "ажлын байр", "өмч", "lease", "rental", "property"],
    Icon: Home,
  },
  {
    key: "business",
    name: "",
    desc: "",
    keywords: ["франчайз", "хамтар", "хамтын", "компанийн эрх", "борлуулалт", "дистрибьютор", "partnership", "business"],
    Icon: Handshake,
  },
  {
    key: "special",
    name: "",
    desc: "",
    keywords: ["тээвэр", "ложистик", "нууц", "оюуны", "даатгал", "хадгал", "бэлэг", "олон улсын", "nda", "confidential"],
    Icon: ShieldCheck,
  },
];

// â”€â”€â”€ Hooks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function loadGoogleIdentityScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-google-identity="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Google Identity script failed to load.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Identity script failed to load."));
    document.head.appendChild(script);
  });
}

async function requestGoogleIdToken(clientId: string) {
  await loadGoogleIdentityScript();

  return new Promise<string>((resolve, reject) => {
    let done = false;
    const finish = (value?: string, error?: Error) => {
      if (done) return;
      done = true;
      if (error) reject(error);
      else if (value) resolve(value);
      else reject(new Error("Google login cancelled."));
    };

    try {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        ux_mode: "popup",
        callback: (response) => {
          if (response.credential) {
            finish(response.credential);
            return;
          }
          finish(undefined, new Error("Google login failed."));
        },
      });
      window.google?.accounts.id.prompt();
      window.setTimeout(() => finish(undefined, new Error("Google login timed out. Please try again.")), 20000);
    } catch (error) {
      finish(undefined, error instanceof Error ? error : new Error(String(error)));
    }
  });
}

function ProfilePanel({
  isOpen,
  user,
  locale,
  ui,
  access,
  documents,
  contracts,
  onClose,
  onLogout,
  onLanguageToggle,
  onProfileSave,
}: {
  isOpen: boolean;
  user: AuthUser | null;
  locale: Locale;
  ui: UiContent;
  access: AccessState;
  documents: Array<any>;
  contracts: Array<any>;
  onClose: () => void;
  onLogout: () => void;
  onLanguageToggle: () => void;
  onProfileSave: (payload: { firstName: string; lastName: string }) => Promise<void>;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    setError("");
  }, [isOpen, user]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await onProfileSave({ firstName, lastName });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-end justify-center bg-background/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="max-h-[86vh] w-full overflow-y-auto rounded-t-[1.8rem] border border-border bg-card p-5 shadow-[0_-24px_70px_rgba(0,0,0,0.24)] sm:max-w-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-2xl font-bold text-foreground">Profile</h3>
              <button type="button" onClick={onClose} className="rounded-full border border-border bg-secondary p-2">
                <X size={16} />
              </button>
            </div>
            <div className="mb-6 rounded-xl border border-border/70 bg-secondary/60 p-4">
              <p className="text-sm font-semibold text-foreground">{user?.email || "-"}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {access.isPaid ? ui.profile.paidAccessActive : ui.profile.paymentRequired}
              </p>
              {!access.profileComplete && (
                <p className="mt-2 text-xs text-red-600">{ui.profile.incompletePrefix} {access.missingFields.join(", ")}</p>
              )}
            </div>

            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-muted-foreground">
                First name
                <input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>
              <label className="text-xs font-semibold text-muted-foreground">
                Last name
                <input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>
            </div>
            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
            <div className="mb-6 flex flex-wrap gap-2">
              <button type="button" onClick={handleSave} disabled={saving} className="rounded-full bg-button px-5 py-2 text-sm font-semibold text-button-text disabled:opacity-60">
                {saving ? "Saving..." : ui.profile.saveSettings}
              </button>
              <button type="button" onClick={onLanguageToggle} className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm font-semibold text-foreground">
                <Settings size={14} /> {locale === "mn" ? "Switch to ENG" : "MN руу шилжих"}
              </button>
              <button type="button" onClick={onLogout} className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm font-semibold text-foreground">
                <LogOut size={14} /> Logout
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-border/70 bg-secondary/50 p-4">
                <p className="mb-3 text-sm font-bold text-foreground">{ui.profile.savedDocuments}</p>
                <div className="space-y-2">
                  {documents.slice(0, 6).map((doc) => (
                    <div key={doc.id} className="rounded-md border border-border bg-background px-3 py-2">
                      <p className="truncate text-xs font-semibold text-foreground">{doc.title}</p>
                    </div>
                  ))}
                  {documents.length === 0 && <p className="text-xs text-muted-foreground">{ui.profile.emptyDocuments}</p>}
                </div>
              </div>
              <div className="rounded-xl border border-border/70 bg-secondary/50 p-4">
                <p className="mb-3 text-sm font-bold text-foreground">{ui.profile.savedContracts}</p>
                <div className="space-y-2">
                  {contracts.slice(0, 6).map((contract) => (
                    <div key={contract.id} className="rounded-md border border-border bg-background px-3 py-2">
                      <p className="truncate text-xs font-semibold text-foreground">{contract.title}</p>
                    </div>
                  ))}
                  {contracts.length === 0 && <p className="text-xs text-muted-foreground">{ui.profile.emptyContracts}</p>}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NavActionButtons({
  controls,
  className = "",
}: {
  controls: FolderNavControls;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center justify-end gap-2 ${className}`}>
      <button
        type="button"
        onClick={controls.onThemeToggle}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border/20 bg-button text-button-text shadow-[0_10px_24px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:border-highlight"
        aria-label="Toggle dark mode"
      >
        {controls.isDark ? <Sun size={15} /> : <Moon size={15} />}
      </button>
      <button
        type="button"
        onClick={controls.onLanguageToggle}
        className="flex min-w-[4.5rem] justify-center rounded-full border border-border/20 bg-button px-3 py-2.5 text-sm font-semibold text-button-text shadow-[0_10px_24px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:border-highlight sm:min-w-[6.25rem] sm:px-4"
        aria-label="Switch language"
      >
        {controls.languageLabel}
      </button>
      {controls.isAuthenticated ? (
        <button
          type="button"
          onClick={controls.onProfileClick}
          className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border/20 bg-button text-button-text shadow-[0_10px_26px_rgba(0,0,0,0.22)]"
          aria-label="Open profile"
        >
          {controls.userAvatarUrl ? (
            <img src={controls.userAvatarUrl} alt="Profile avatar" className="h-full w-full object-cover" />
          ) : (
            <CircleUserRound size={18} />
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={controls.onLoginClick}
          className="rounded-full bg-button px-4 py-2.5 text-sm font-semibold text-button-text shadow-[0_10px_26px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_26px_rgba(207,157,123,0.32)] sm:min-w-[8.5rem] sm:px-6"
        >
          {controls.loginLabel}
        </button>
      )}
    </div>
  );
}

function OpeningSplash({ onComplete }: { onComplete: () => void }) {
  const letters = "Draftly.".split("");

  useEffect(() => {
    const timer = window.setTimeout(onComplete, 2850);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 1, 0] }}
      transition={{ duration: 2.85, times: [0, 0.86, 1], ease: "easeInOut" }}
      aria-hidden="true"
    >
      <motion.div
        className="font-display text-5xl font-black tracking-normal text-foreground sm:text-6xl md:text-7xl"
        initial={{ x: 0, y: 0, scale: 1 }}
        animate={{
          x: ["0vw", "0vw", "clamp(-42vw, calc(-50vw + 5rem), -28vw)"],
          y: ["0vh", "0vh", "clamp(-46vh, calc(-50vh + 4.5rem), -38vh)"],
          scale: [1, 1, 0.52],
          textShadow: [
            "0 0 0 rgba(207,157,123,0)",
            "0 0 28px rgba(207,157,123,0.36)",
            "0 0 12px rgba(207,157,123,0.18)",
          ],
        }}
        transition={{ duration: 2.55, times: [0, 0.66, 1], ease: [0.22, 1, 0.36, 1] }}
      >
        {letters.map((letter, index) => (
          <motion.span
            key={`${letter}-${index}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 + index * 0.085, duration: 0.28, ease: "easeOut" }}
          >
            {letter}
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
}

function FolderTabs({
  activeTab,
  onSelect,
  controls,
  ui,
  homeGlobal = false,
  scrollContainerRef,
}: {
  activeTab: HeaderTab;
  onSelect: (tab: HeaderTab) => void;
  controls: FolderNavControls;
  ui: UiContent;
  homeGlobal?: boolean;
  scrollContainerRef?: RefObject<HTMLElement>;
}) {
  const navItems: HeaderTab[] = ["Home", "Template", "Analysis", "Contact us"];
  const navLabels: Record<HeaderTab, string> = {
    Home: ui.nav.home,
    Template: ui.nav.template,
    Analysis: ui.nav.analysis,
    "Contact us": ui.nav.contact,
  };
  const [isHidden, setIsHidden] = useState(false);
  const [isSimpleHomeNav, setIsSimpleHomeNav] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollElement = scrollContainerRef?.current;
      const currentScrollY = scrollElement ? scrollElement.scrollTop : window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY.current;
      const simpleThreshold = (scrollElement?.clientHeight ?? window.innerHeight) * 0.55;

      setIsHidden(scrollingDown && currentScrollY > 90);
      setIsSimpleHomeNav(homeGlobal && currentScrollY > simpleThreshold);
      lastScrollY.current = currentScrollY;
    };

    const scrollTarget = scrollContainerRef?.current ?? window;
    onScroll();
    scrollTarget.addEventListener("scroll", onScroll, { passive: true });
    return () => scrollTarget.removeEventListener("scroll", onScroll);
  }, [homeGlobal, scrollContainerRef]);

  const handleNavSelect = (tab: HeaderTab) => {
    setMobileMenuOpen(false);
    onSelect(tab);
  };

  return (
    <motion.header
      className={`top-0 z-50 w-full transition-all duration-300 ${
        homeGlobal ? "fixed left-0 right-0" : "sticky"
      } ${
        isSimpleHomeNav
          ? "bg-navbar/96 px-4 py-3 shadow-[0_14px_34px_rgba(12,21,25,0.10)] backdrop-blur-md sm:px-8"
          : `bg-transparent ${
              homeGlobal ? "px-3 pt-3 sm:pr-7" : "-mb-[2px] pl-0 pr-3 pt-0 sm:pr-7"
            }`
      }`}
      animate={{ y: isHidden ? -120 : 0, opacity: isHidden ? 0 : 1 }}
      transition={{ duration: 0.36, ease: "easeOut" }}
    >
      <div
        className={`mx-auto flex w-full max-w-[100rem] flex-col gap-3 text-foreground lg:flex-row lg:items-start lg:gap-4 ${
          isSimpleHomeNav ? "" : "lg:max-w-[920px]"
        }`}
      >
        <div className={`relative min-w-0 flex-1 ${isSimpleHomeNav ? "max-w-none" : ""}`}>
          <motion.div
            className={`relative z-10 flex min-w-0 items-center gap-2 transition-all duration-300 sm:gap-4 ${
              isSimpleHomeNav
                ? "min-h-12 rounded-none border-0 bg-transparent px-0 py-0 shadow-none"
                : "-mb-[2px] min-h-14 rounded-t-[1.75rem] border border-border/55 border-b-0 bg-secondary px-4 py-3 shadow-none sm:min-h-20 sm:rounded-t-[2.1rem] sm:px-7 sm:py-4 md:px-9"
            }`}
            animate={{ y: 0 }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <button
              type="button"
              onClick={() => handleNavSelect("Home")}
              className="mr-1 shrink-0 font-display text-2xl font-black leading-none text-foreground transition-transform duration-300 hover:-translate-y-0.5 sm:mr-3 sm:text-3xl"
            >
              Draftly.
            </button>
            <span className="hidden h-6 w-px shrink-0 bg-button/30 sm:block" />
            <nav className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-2 [&::-webkit-scrollbar]:hidden">
              {navItems.map(label => {
                const active = activeTab === label;

                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleNavSelect(label)}
                    className={`group relative flex shrink-0 justify-center rounded-full px-3 py-2 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_22px_rgba(207,157,123,0.28)] sm:px-4 sm:text-sm md:min-w-[6.5rem] lg:min-w-[7.25rem] lg:px-5 ${
                      active ? "text-button-text" : "text-foreground/82 hover:text-foreground"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="folder-nav-active-pill"
                        className="absolute inset-0 rounded-full bg-button"
                        transition={{ duration: 0.32, ease: "easeOut" }}
                      />
                    )}
                    <span className="relative z-10 whitespace-nowrap">{navLabels[label]}</span>
                    {!active && <span className="absolute bottom-1.5 left-3 right-3 hidden h-px scale-x-0 bg-button transition-transform duration-300 group-hover:scale-x-100 sm:block" />}
                  </button>
                );
              })}
            </nav>
            <button
              type="button"
              className="ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/25 bg-secondary text-foreground lg:hidden"
              onClick={() => setMobileMenuOpen(open => !open)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </motion.div>
        </div>

        <NavActionButtons
          controls={controls}
          className={`hidden shrink-0 lg:flex ${isSimpleHomeNav ? "pt-0" : "pt-2 lg:pt-4"}`}
        />
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border/40 bg-navbar/98 px-4 py-4 shadow-lg backdrop-blur-md lg:hidden"
          >
            <NavActionButtons controls={controls} className="justify-start" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function HomeSimpleNav({
  onSelect,
  controls,
  ui,
  scrollContainerRef,
}: {
  onSelect: (tab: HeaderTab) => void;
  controls: FolderNavControls;
  ui: UiContent;
  scrollContainerRef: RefObject<HTMLElement>;
}) {
  const navItems: HeaderTab[] = ["Home", "Template", "Analysis", "Contact us"];
  const navLabels: Record<HeaderTab, string> = {
    Home: ui.nav.home,
    Template: ui.nav.template,
    Analysis: ui.nav.analysis,
    "Contact us": ui.nav.contact,
  };
  const [isVisible, setIsVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const scrollElement = scrollContainerRef.current;
    if (!scrollElement) return;

    const onScroll = () => {
      setIsVisible(scrollElement.scrollTop > scrollElement.clientHeight * 0.55);
    };

    onScroll();
    scrollElement.addEventListener("scroll", onScroll, { passive: true });
    return () => scrollElement.removeEventListener("scroll", onScroll);
  }, [scrollContainerRef]);

  const handleNavSelect = (tab: HeaderTab) => {
    setMobileMenuOpen(false);
    onSelect(tab);
  };

  return (
    <motion.header
      className="fixed left-0 right-0 top-0 z-50 bg-navbar/96 shadow-[0_14px_34px_rgba(12,21,25,0.10)] backdrop-blur-md"
      animate={{ y: isVisible ? 0 : -120, opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      style={{ pointerEvents: isVisible ? "auto" : "none" }}
    >
      <div className="flex items-center gap-2 px-3 py-3 sm:gap-4 sm:px-6">
        <button
          type="button"
          onClick={() => handleNavSelect("Home")}
          className="mr-1 shrink-0 font-display text-2xl font-black leading-none text-foreground transition-transform duration-300 hover:-translate-y-0.5 sm:mr-3 sm:text-3xl"
        >
          Draftly.
        </button>
        <span className="hidden h-6 w-px shrink-0 bg-button/30 sm:block" />
        <nav className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-2 [&::-webkit-scrollbar]:hidden">
          {navItems.map(label => (
            <button
              key={label}
              type="button"
              onClick={() => handleNavSelect(label)}
              className={`group relative flex shrink-0 justify-center rounded-full px-2 py-2 text-[11px] font-semibold transition-all duration-300 hover:-translate-y-0.5 sm:px-4 sm:text-sm sm:min-w-[6.5rem] ${
                label === "Home"
                  ? "text-button-text"
                  : "text-foreground/82 hover:text-foreground"
              } ${label === "Contact us" ? "hidden sm:flex" : ""}`}
            >
              {label === "Home" && <span className="absolute inset-0 rounded-full bg-button" />}
              <span className="relative z-10 whitespace-nowrap">{navLabels[label]}</span>
            </button>
          ))}
        </nav>
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/25 bg-secondary text-foreground lg:hidden"
          onClick={() => setMobileMenuOpen(open => !open)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <NavActionButtons controls={controls} className="hidden lg:flex" />
      </div>
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border/40 px-4 py-4 lg:hidden"
          >
            <NavActionButtons controls={controls} className="justify-start" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function AnalysisStepper({ step, ui }: { step: AnalysisStep; ui: UiContent }) {
  const currentIndex = STEP_LABELS.findIndex(item => item.key === step);
  const stepLabels: Record<AnalysisStep, string> = {
    upload: ui.steps.upload,
    processing: ui.steps.processing,
    result: ui.steps.result,
  };

  return (
    <div className="flex gap-2 lg:flex-col">
      {STEP_LABELS.map((item, index) => {
        const active = item.key === step;
        const completed = index < currentIndex;
        const color = active ? "var(--button)" : completed ? "var(--highlight)" : "var(--border)";

        return (
          <motion.div
            key={item.key}
            className="flex items-center gap-3"
            animate={{ opacity: active || completed ? 1 : 0.58 }}
            transition={{ duration: 0.3 }}
          >
            <motion.span
              className="h-2.5 w-16 rounded-full lg:h-14 lg:w-2.5"
              animate={{ backgroundColor: color, scale: active ? 1.08 : 1 }}
              transition={{ duration: 0.35 }}
            />
            <span className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground/70 dark:text-foreground/70 lg:block">
              {stepLabels[item.key]}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

function AnalysisWorkflow({
  onBack,
  onTabSelect,
  navControls,
  ui,
  step,
  setStep,
  analysisResult,
  setAnalysisResult,
  analysisError,
  setAnalysisError,
  onSaveAnalysis,
  onExportAnalysis,
}: {
  onBack: () => void;
  onTabSelect: (tab: HeaderTab) => void;
  navControls: FolderNavControls;
  ui: UiContent;
  step: AnalysisStep;
  setStep: (step: AnalysisStep) => void;
  analysisResult: AnalysisResponse | null;
  setAnalysisResult: (result: AnalysisResponse | null) => void;
  analysisError: string;
  setAnalysisError: (error: string) => void;
  onSaveAnalysis: (result: AnalysisResponse | null) => Promise<void>;
  onExportAnalysis: (result: AnalysisResponse | null) => Promise<void>;
}) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startProcessing = async (file: File) => {
    setIsDragActive(false);
    setAnalysisError("");
    setAnalysisResult(null);
    setStep("processing");

    try {
      const result = await uploadDocumentForAnalysis(file);
      setAnalysisResult(result);
      setStep("result");
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "Failed to analyze document.");
      setStep("upload");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <section className="px-3 pt-3 pb-6 min-h-screen flex flex-col bg-background">
      <FolderTabs activeTab="Analysis" onSelect={onTabSelect} controls={navControls} ui={ui} />

      <motion.div
        className="relative flex-1 overflow-y-auto overflow-x-hidden rounded-b-[2rem] rounded-tr-[2rem] border border-border/70 bg-secondary shadow-[0_16px_70px_rgba(12,21,25,0.12)] dark:border-highlight/15 dark:bg-secondary dark:shadow-[0_18px_80px_rgba(0,0,0,0.34)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(207,157,123,0.14),transparent_26%),radial-gradient(circle_at_82%_14%,rgba(216,198,186,0.22),transparent_24%)]" />
        {step === "processing" && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {[...Array(14)].map((_, index) => (
              <motion.span
                key={index}
                className="absolute h-1 w-1 rounded-full bg-highlight/45"
                style={{ left: `${8 + index * 6}%`, top: `${18 + (index % 5) * 13}%` }}
                animate={{ y: [-8, -34, -8], opacity: [0.12, 0.65, 0.12] }}
                transition={{ duration: 2.6 + index * 0.08, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
          </div>
        )}

        <div className="relative z-10 flex min-h-[calc(100vh-7rem)] flex-col px-5 py-5 sm:px-8 lg:px-10">
          <div className="mb-8 flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="group flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/60 text-foreground transition-all duration-300 hover:border-highlight hover:bg-secondary dark:border-highlight/25 dark:bg-card/70 dark:text-foreground dark:hover:bg-card"
              aria-label="Go back"
            >
              <ArrowLeft size={17} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
            </button>
            <span className="font-display text-2xl font-black text-foreground dark:text-foreground">Draftly.</span>
          </div>

          <div className="grid flex-1 gap-8 lg:grid-cols-[120px_minmax(0,1fr)]">
            <aside className="pt-1">
              <AnalysisStepper step={step} ui={ui} />
            </aside>

            <AnimatePresence mode="wait">
              {step === "upload" && (
                <motion.div
                  key="upload"
                  className="flex flex-col items-center justify-center text-center"
                  initial={{ opacity: 0, x: 32 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -32 }}
                  transition={{ duration: 0.38, ease: "easeOut" }}
                >
                  <h1 className="mb-12 font-display text-4xl font-bold text-foreground dark:text-foreground md:text-5xl">
                    {ui.analysis.title}
                  </h1>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={event => {
                      const file = event.target.files?.[0];
                      if (file) void startProcessing(file);
                    }}
                  />
                  <motion.div
                    className={`relative w-full max-w-xl rounded-[2rem] border-2 border-dashed bg-card px-8 py-14 shadow-[0_28px_70px_rgba(12,21,25,0.12)] transition-all duration-300 dark:bg-card/80 dark:shadow-[0_28px_70px_rgba(0,0,0,0.24)] ${
                      isDragActive
                        ? "scale-[1.02] border-highlight shadow-[0_0_0_6px_rgba(207,157,123,0.12),0_32px_80px_rgba(12,21,25,0.15)]"
                        : "border-border"
                    }`}
                    onDragEnter={() => setIsDragActive(true)}
                    onDragLeave={() => setIsDragActive(false)}
                    onDragOver={event => event.preventDefault()}
                    onDrop={event => {
                      event.preventDefault();
                      const file = event.dataTransfer.files?.[0];
                      if (file) void startProcessing(file);
                      else setIsDragActive(false);
                    }}
                  >
                    <div className="absolute -inset-x-3 top-5 -z-10 h-full rounded-[2rem] border border-border/60 bg-background" />
                    <div className="absolute -inset-x-6 top-10 -z-20 h-full rounded-[2rem] border border-border/50 bg-border" />
                    <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-secondary text-accent shadow-sm">
                      <UploadCloud size={26} strokeWidth={1.7} />
                    </div>
                    <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.2em] text-accent">
                      {ui.analysis.uploadEyebrow}
                    </p>
                    <h2 className="mb-2 text-xl font-semibold text-foreground dark:text-foreground">{ui.analysis.dropTitle}</h2>
                    <p className="mb-8 text-sm text-muted-foreground/68 dark:text-muted-foreground/62">{ui.analysis.dropDescription}</p>
                    {analysisError && (
                      <p className="mx-auto mb-5 max-w-md text-sm leading-6 text-red-500">
                        {analysisError}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-full bg-button px-8 py-3 text-sm font-semibold text-button-text shadow-[0_10px_24px_rgba(12,21,25,0.16)] transition-all duration-300 hover:-translate-y-1 hover:bg-accent hover:shadow-[0_14px_30px_rgba(114,75,57,0.22)]"
                    >
                      {ui.analysis.browse}
                    </button>
                  </motion.div>
                </motion.div>
              )}

              {step === "processing" && (
                <motion.div
                  key="processing"
                  className="flex flex-col items-center justify-center text-center"
                  initial={{ opacity: 0, x: 32 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -32 }}
                  transition={{ duration: 0.38, ease: "easeOut" }}
                >
                  <h1 className="mb-12 font-display text-4xl font-bold text-foreground dark:text-foreground md:text-5xl">
                    {ui.analysis.processingTitle}
                  </h1>
                  <motion.div
                    className="relative w-full max-w-lg rounded-[2rem] border border-border bg-card px-8 py-16 shadow-[0_30px_80px_rgba(12,21,25,0.14)] dark:border-highlight/20 dark:bg-card/80 dark:shadow-[0_30px_80px_rgba(0,0,0,0.28)]"
                  >
                    <motion.div
                      className="absolute -inset-x-4 top-6 -z-10 h-full rounded-[2rem] border border-border/70 bg-background"
                    />
                    <motion.div
                      className="absolute -inset-x-8 top-12 -z-20 h-full rounded-[2rem] border border-border/60 bg-border"
                    />
                    <LoaderCircle className="mx-auto mb-8 h-16 w-16 animate-spin text-accent" strokeWidth={1.5} />
                    <h2 className="mb-3 text-xl font-semibold text-foreground dark:text-foreground">{ui.analysis.processingSubtitle}</h2>
                    <p className="mx-auto max-w-sm text-sm leading-6 text-muted-foreground/68 dark:text-muted-foreground/62">
                      {ui.analysis.processingDescription}
                    </p>
                  </motion.div>
                </motion.div>
              )}

              {step === "result" && (
                <AnalysisResult
                  result={analysisResult}
                  ui={ui}
                  onSave={() => void onSaveAnalysis(analysisResult)}
                  onExport={() => void onExportAnalysis(analysisResult)}
                  onFinish={() => setShowFinishModal(true)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showFinishModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/35 px-5 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md rounded-[2rem] border border-border bg-secondary p-8 text-center shadow-[0_30px_90px_rgba(12,21,25,0.28)]"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="mb-3 font-display text-3xl font-bold text-foreground">{ui.analysis.finishTitle}</h2>
              <p className="mb-8 text-sm text-muted-foreground/72">{ui.analysis.finishDescription}</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => void onSaveAnalysis(analysisResult)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-button px-5 py-3 text-sm font-semibold text-button-text transition-transform duration-300 hover:scale-[1.03]"
                >
                  <Archive size={16} /> {ui.actions.archive}
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-muted-foreground transition-transform duration-300 hover:scale-[1.03] hover:bg-secondary"
                >
                  <Trash2 size={16} /> {ui.actions.delete}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function translateAnalysisText(text: string) {
  const normalized = text.toLowerCase();
  const translations: Array<[RegExp, string]> = [
    [/lack of defined job duties|job duties|responsibilities/, "Ажилтны гүйцэтгэх ажил, үүрэг хариуцлага тодорхой тусгагдаагүй байна."],
    [/undefined basic salary|basic salary|payment frequency|compensation terms/, "Үндсэн цалин болон цалин олгох давтамж тодорхойгүй тул цалин хөлсний нөхцөл хэрэгжихэд эрсдэлтэй байна."],
    [/undefined working days|working days and hours|work schedule/, "Ажлын өдөр, цагийн хуваарь тодорхойгүй тул ажлын цагийн талаар маргаан үүсэх эрсдэлтэй байна."],
    [/incomplete list of employee and employer rights|rights\/duties|non-compliance/, "Ажилтан болон ажил олгогчийн эрх, үүргийн жагсаалт бүрэн бус тул үл ойлголцол болон хуульд нийцэхгүй байх эрсдэлтэй байна."],
    [/payment terms|undefined payment date|payment/, "Төлбөрийн нөхцөл эсвэл төлбөр төлөх хугацаа тодорхойгүй байна."],
    [/termination|without notice|no notice/, "Гэрээ цуцлах нөхцөл тодорхойгүй эсвэл урьдчилан мэдэгдэх журам дутуу байна."],
    [/confidentiality/, "Нууцлалын заалт дутуу эсвэл хангалтгүй байна."],
    [/liability|unlimited liability/, "Хариуцлагын нөхцөл болон хариуцлагын дээд хэмжээ тодорхойгүй байна."],
    [/dispute resolution|dispute/, "Маргаан шийдвэрлэх журам тодорхойгүй байна."],
    [/force majeure/, "Давагдашгүй хүчин зүйлийн заалт дутуу байна."],
    [/legal review recommended/, "Гарын үсэг зурахаас өмнө хуульчийн хяналт хийх шаардлагатай."],
    [/high risk contract/, "Өндөр эрсдэлтэй гэрээ байна. Чухал заалтуудыг дахин хянах шаардлагатай."],
    [/medium risk contract/, "Дунд эрсдэлтэй гэрээ байна. Гарын үсэг зурахаас өмнө онцолсон заалтуудыг шалгана уу."],
    [/low risk contract/, "Бага эрсдэлтэй гэрээ байна. Зөвхөн жижиг хяналт хийхэд хангалттай."],
    [/gemini api|temporarily unavailable|local risk check/, "AI үйлчилгээ түр хугацаанд боломжгүй байсан тул Draftly үндсэн эрсдэлийн шалгалт хийлээ."],
  ];
  return translations.find(([pattern]) => pattern.test(normalized))?.[1] || text;
}

function AnalysisResult({
  result,
  ui,
  onSave,
  onExport,
  onFinish,
}: {
  result: AnalysisResponse | null;
  ui: UiContent;
  onSave: () => void;
  onExport: () => void;
  onFinish: () => void;
}) {
  const rawRiskScore = result?.analysis.riskScore ?? 62;
  const riskScore = rawRiskScore > 10 ? rawRiskScore / 10 : rawRiskScore;
  const riskPercent = Math.min(100, Math.max(0, riskScore * 10));
  const standardMatch = Math.round(Math.max(0, Math.min(100, 100 - riskScore * 3.5)));
  const riskScoreLabel = `${riskScore.toFixed(1)}/10`;
  const fileName = result?.document.fileName || "Uilchilgeenii_geree_2024.pdf";
  const fileSize = "PDF • 2.4 MB";
  const summary = translateAnalysisText(result?.analysis.summary || ui.analysis.fallbackSummary);
  const previewParagraphs = (result?.document.extractedText || [
    "Энэхүү үйлчилгээ үзүүлэх гэрээг 2024 оны 5 дугаар сарын 28-ны өдөр дараах талууд байгуулав.",
    "1. Талууд. А тал нь Б талд зөвлөх үйлчилгээ үзүүлэх бөгөөд ажлын хүрээ, төлбөр, гүйцэтгэх хугацааг харилцан тохиролцов.",
    "2. Төлбөр. Нэхэмжлэх гарснаас хойш 15 хоногийн дотор төлбөрийг шилжүүлнэ.",
    "3. Үйлчилгээний хүрээ. Үйлчилгээ үзүүлэгч нь хавсралтад заасан ажлыг гүйцэтгэнэ.",
    "4. Төлбөрийн нөхцөл. Захиалагч нь тохирсон хуваарийн дагуу төлбөр төлнө.",
    "5. Нууцлал. Талууд гэрээний хүрээнд авсан мэдээллийг нууцална.",
  ].join("\n\n")).split(/\n{2,}/).slice(0, 10);
  const issueItems = [
    ...(result?.analysis.risks ?? []),
    ...(result?.analysis.missingClauses ?? []),
    ...(result?.analysis.riskyTerms ?? []),
    ...(result?.analysis.inconsistentWording ?? []),
    ...(result?.analysis.complianceWarnings ?? []),
  ].filter(Boolean);
  const issues = (issueItems.length ? issueItems : [
    "Хариуцлагын хязгаарлалт тодорхойгүй байна.",
    "Гэрээ цуцлах нөхцөл тодорхой бус байна.",
    "Шимтгэлийн хугацааны нөхцөл дутуу байна.",
    "Төлбөрийн хугацаа хэт ерөнхий байна.",
  ]).slice(0, 4).map(translateAnalysisText);
  const clauses = result?.clauses ?? [];
  const generatedAt = new Date().toLocaleString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      key="result"
      className="flex min-h-[calc(100vh-13rem)] flex-col gap-4 pb-2"
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -32 }}
      transition={{ duration: 0.38, ease: "easeOut" }}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]">
        <motion.div
          className="rounded-[1rem] border border-border/70 bg-card p-4 shadow-[0_18px_44px_rgba(12,21,25,0.08)] dark:border-highlight/20 dark:bg-card/80"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42 }}
        >
          <h2 className="mb-4 text-sm font-bold text-foreground">Таны оруулсан файл</h2>
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-border/70 bg-secondary/70 p-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-500 text-xs font-black text-white">
              PDF
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{fileName}</p>
              <p className="text-xs text-muted-foreground">{fileSize}</p>
            </div>
            <Info size={16} className="shrink-0 text-muted-foreground" />
          </div>
          <div className="relative h-[520px] overflow-hidden rounded-xl border border-border/70 bg-white shadow-inner dark:bg-secondary">
            <div className="h-full overflow-y-auto px-8 py-8 text-[11px] leading-5 text-slate-700 dark:text-foreground/75">
              <div className="mb-8 text-center">
                <p className="text-sm font-bold tracking-wide text-slate-900 dark:text-foreground">ҮЙЛЧИЛГЭЭ ҮЗҮҮЛЭХ ГЭРЭЭ</p>
                <p className="mt-3 text-[10px] text-slate-500 dark:text-muted-foreground">Энэхүү гэрээг 2024 оны 5 дугаар сарын 28-ны өдөр байгуулав.</p>
              </div>
              {previewParagraphs.map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-secondary px-2 py-1 shadow-sm">
              <button type="button" className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-card" aria-label="Zoom out">
                <ZoomOut size={12} />
              </button>
              <span className="text-[11px] font-semibold">100%</span>
              <button type="button" className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-card" aria-label="Zoom in">
                <ZoomIn size={12} />
              </button>
            </div>
            <button type="button" className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-secondary shadow-sm" aria-label="Full screen">
              <Maximize2 size={14} />
            </button>
          </div>
        </motion.div>

        <div className="grid content-start gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <motion.div
              className="rounded-[1rem] border border-border/70 bg-card p-5 shadow-[0_18px_44px_rgba(12,21,25,0.08)] dark:border-highlight/20 dark:bg-card/80"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, delay: 0.04 }}
            >
              <div className="mb-4 flex items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Таарсан хувь</p>
                <Info size={13} className="text-muted-foreground" />
              </div>
              <p className="text-4xl font-black text-emerald-600">{standardMatch}%</p>
              <p className="mt-2 text-xs font-semibold uppercase text-muted-foreground">Стандарт нийцэл</p>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-border/70">
                <motion.div
                  className="h-full rounded-full bg-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${standardMatch}%` }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">40 / 50 шаардлагат заалттай нийцэж байна</p>
            </motion.div>

            <motion.div
              className="rounded-[1rem] border border-border/70 bg-card p-5 shadow-[0_18px_44px_rgba(12,21,25,0.08)] dark:border-highlight/20 dark:bg-card/80"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, delay: 0.08 }}
            >
              <div className="mb-4 flex items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{ui.analysis.riskScore}</p>
                <Info size={13} className="text-muted-foreground" />
              </div>
              <p className="text-4xl font-black text-red-600">{riskScoreLabel}</p>
              <p className="mt-2 text-xs font-semibold uppercase text-muted-foreground">Дунд эрсдэл</p>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-border/70">
                <motion.div
                  className="h-full rounded-full bg-red-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${riskPercent}%` }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Эрсдэлийн 7 заалт илэрсэн</p>
            </motion.div>
          </div>

          <motion.div
            className="rounded-[1rem] border border-border/70 bg-card p-5 shadow-[0_18px_44px_rgba(12,21,25,0.08)] dark:border-highlight/20 dark:bg-card/80"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: 0.12 }}
          >
            <div className="mb-4 flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">Асуудлууд</h3>
              <Info size={13} className="text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {issues.map((issue, index) => {
                const isWarning = index === 2;
                const isLow = index === 3;
                const tone = isLow
                  ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                  : isWarning
                    ? "border-amber-100 bg-amber-50 text-amber-700"
                    : "border-red-100 bg-red-50 text-red-700";
                const label = isLow ? "Бага эрсдэл" : isWarning ? "Дунд эрсдэл" : "Өндөр эрсдэл";

                return (
                  <div key={`${issue}-${index}`} className="flex items-start gap-3 rounded-xl border border-border/60 bg-secondary/45 p-3">
                    <AlertTriangle size={17} className={isLow ? "mt-0.5 text-emerald-600" : isWarning ? "mt-0.5 text-amber-600" : "mt-0.5 text-red-600"} />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-semibold text-foreground">{issue}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{index + 2}-р зүйл • Хуулийн нийцэл шалгах</p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${tone}`}>{label}</span>
                    <ChevronDown size={16} className="mt-1 shrink-0 text-muted-foreground" />
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            className="rounded-[1rem] border border-border/70 bg-card p-5 shadow-[0_18px_44px_rgba(12,21,25,0.08)] dark:border-highlight/20 dark:bg-card/80"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: 0.16 }}
          >
            <h3 className="mb-3 text-sm font-bold text-foreground">Тайлбар</h3>
            <p className="text-sm leading-6 text-muted-foreground">{summary}</p>
            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-800">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">AI тусламжаар засварлуулж, эрсдэлийг бууруулах уу?</p>
                  <p className="mt-1 text-xs text-blue-700">AI илэрсэн асуудлуудад үндэслэн гэрээг сайжруулах санал бэлдэнэ.</p>
                </div>
                <button type="button" className="shrink-0 rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white">
                  AI-аар засварлуулах
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="rounded-[1rem] border border-border/70 bg-card p-5 shadow-[0_18px_44px_rgba(12,21,25,0.08)] dark:border-highlight/20 dark:bg-card/80"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: 0.2 }}
          >
            <h3 className="mb-4 text-sm font-bold text-foreground">Анализын мэдээлэл</h3>
            <dl className="grid gap-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Анализ хийсэн огноо</dt>
                <dd className="font-semibold text-foreground">{generatedAt}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Файлын нэр</dt>
                <dd className="max-w-[55%] truncate font-semibold text-foreground">{fileName}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Файлын хэмжээ</dt>
                <dd className="font-semibold text-foreground">2.4 MB</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Анализ хийсэн загвар</dt>
                <dd className="font-semibold text-foreground">{clauses[0]?.title || "Үйлчилгээний гэрээний стандарт v2.1"}</dd>
              </div>
            </dl>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-3">
            <button type="button" onClick={onExport} className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-secondary">
              <Download size={16} /> Татах файл (PDF)
            </button>
            <button type="button" onClick={onSave} className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-secondary">
              <Archive size={16} /> Хадгалах
            </button>
            <button type="button" onClick={onFinish} className="flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-card px-4 py-3 text-sm font-semibold text-red-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-50">
              <Trash2 size={16} /> Устгах
            </button>
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-amber-900 shadow-sm">
        <div className="flex min-w-0 items-center gap-3">
          <AlertTriangle size={18} className="shrink-0 text-amber-600" />
          <p className="text-xs font-medium">
            Анхааруулга: Энэхүү анализ нь хиймэл оюунд үндэслэсэн автоматжуулсан мэдээлэл бөгөөд хуульчийн зөвлөгөөг орлохгүй.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" className="rounded-full bg-button px-5 py-2 text-xs font-bold text-button-text">
            Дуусгах
          </button>
          <button type="button" className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-amber-100" aria-label="Close warning">
            <X size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function TemplateStepper({ step, ui }: { step: TemplateStep; ui: UiContent }) {
  const currentIndex = TEMPLATE_STEPS.findIndex(item => item.key === step);
  const stepLabels: Record<TemplateStep, string> = {
    template: ui.steps.template,
    details: ui.steps.details,
    verification: ui.steps.verification,
    payment: ui.steps.payment,
    result: ui.steps.result,
  };

  return (
    <div className="flex gap-2 lg:flex-col">
      {TEMPLATE_STEPS.map((item, index) => {
        const active = item.key === step;
        const completed = index < currentIndex;
        const color = active ? "var(--button)" : completed ? "var(--highlight)" : "var(--border)";

        return (
          <motion.div
            key={item.key}
            className="flex items-center gap-3"
            animate={{ opacity: active || completed ? 1 : 0.55 }}
            transition={{ duration: 0.3 }}
          >
            <motion.span
              className="h-2.5 w-16 rounded-full lg:h-14 lg:w-2.5"
              animate={{ backgroundColor: color, scale: active ? 1.08 : 1 }}
              transition={{ duration: 0.35 }}
            />
            <span className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground/70 dark:text-foreground/70 lg:block">
              {stepLabels[item.key]}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

function TemplateShell({
  step,
  onBackHome,
  onTabSelect,
  navControls,
  ui,
  children,
}: {
  step: TemplateStep;
  onBackHome: () => void;
  onTabSelect: (tab: HeaderTab) => void;
  navControls: FolderNavControls;
  ui: UiContent;
  children: ReactNode;
}) {
  return (
    <section className="px-3 pt-3 pb-6 min-h-screen flex flex-col bg-background">
      <FolderTabs activeTab="Template" onSelect={onTabSelect} controls={navControls} ui={ui} />
      <div className="relative flex-1 overflow-hidden rounded-b-[2rem] rounded-tr-[2rem] border border-border/70 bg-secondary shadow-[0_16px_70px_rgba(12,21,25,0.12)] dark:border-highlight/15 dark:bg-secondary dark:shadow-[0_18px_80px_rgba(0,0,0,0.34)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(207,157,123,0.12),transparent_26%),radial-gradient(circle_at_82%_12%,rgba(216,198,186,0.20),transparent_24%)]" />
        <div className="relative z-10 flex min-h-[calc(100vh-7rem)] flex-col px-5 py-5 sm:px-8 lg:px-10">
          <div className="mb-8 flex items-center justify-between">
            <button
              type="button"
              onClick={onBackHome}
              className="group flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/60 text-foreground transition-all duration-300 hover:border-highlight hover:bg-secondary dark:border-highlight/25 dark:bg-card/70 dark:text-foreground dark:hover:bg-card"
              aria-label={ui.actions.back}
            >
              <ArrowLeft size={17} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
            </button>
            <span className="font-display text-2xl font-black text-foreground dark:text-foreground">Draftly.</span>
          </div>
          {step === "template" ? (
            <div className="relative min-h-[calc(100vh-13rem)] overflow-hidden">
              {children}
            </div>
          ) : (
            <div className="grid flex-1 gap-8 lg:grid-cols-[140px_minmax(0,1fr)]">
              <aside className="pt-2">
                <TemplateStepper step={step} ui={ui} />
              </aside>
              <div className="relative min-h-[calc(100vh-13rem)] overflow-hidden rounded-[2rem]">
                {children}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function TemplateWorkflow({
  onBackHome,
  onTabSelect,
  navControls,
  ui,
  onSaveTemplate,
  onExportTemplate,
}: {
  onBackHome: () => void;
  onTabSelect: (tab: HeaderTab) => void;
  navControls: FolderNavControls;
  ui: UiContent;
  onSaveTemplate: (payload: { title: string; content: string; template?: TemplateSummary }) => Promise<void>;
  onExportTemplate: (payload: { title: string; content: string; template?: TemplateSummary }) => Promise<void>;
}) {
  const [step, setStep] = useState<TemplateStep>("template");
  const [activeGroup, setActiveGroup] = useState(TEMPLATE_GROUPS[0].key);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [stepDirection, setStepDirection] = useState(1);
  const [apiTemplates, setApiTemplates] = useState<TemplateSummary[]>([]);
  const [templateError, setTemplateError] = useState("");
  const [templateValues, setTemplateValues] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    fetchTemplates()
      .then(({ templates }) => {
        if (cancelled) return;
        setApiTemplates(templates);
        setTemplateError("");
        if (templates[0]) {
          setSelectedTemplate(templates[0].name);
        }
      })
      .catch((error) => {
        if (cancelled) return;
        setTemplateError(error instanceof Error ? error.message : "Failed to load backend templates.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const templateCards = apiTemplates.length ? apiTemplates : TEMPLATE_CARDS.map((template, index) => ({
    id: String(index + 1),
    name: template.name,
    category: "Business",
    description: template.desc,
    content: "",
    variables: [],
  }));
  const selectedTemplateData = apiTemplates.find(template => template.name === selectedTemplate);

  useEffect(() => {
    if (!selectedTemplateData) return;
    setTemplateValues((current) => {
      const nextValues: Record<string, string> = {};
      selectedTemplateData.variables.forEach((variable) => {
        nextValues[variable.key] = current[variable.key] || "";
      });
      return nextValues;
    });
  }, [selectedTemplateData]);

  const templateGroups = TEMPLATE_GROUPS.map(group => ({
    ...group,
    name: ui.template.groups[group.key].name,
    desc: ui.template.groups[group.key].desc,
    items: templateCards.filter(template => {
      const haystack = `${template.category} ${template.name} ${template.description}`.toLowerCase();
      return group.keywords.some(keyword => haystack.includes(keyword.toLowerCase()));
    }),
  })).map((group, index, groups) => {
    if (group.key !== "special") return group;

    const assigned = new Set(groups.flatMap(item => item.key === group.key ? [] : item.items.map(template => template.name)));
    return {
      ...group,
      items: templateCards.filter(template => group.items.some(item => item.name === template.name) || !assigned.has(template.name)),
    };
  });

  const activeTemplateGroup = templateGroups.find(group => group.key === activeGroup) || templateGroups[0];
  const filteredTemplates = activeTemplateGroup.items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const nextStep = () => {
    const current = TEMPLATE_STEPS.findIndex(item => item.key === step);
    const next = TEMPLATE_STEPS[Math.min(current + 1, TEMPLATE_STEPS.length - 1)];
    setStepDirection(1);
    setStep(next.key);
  };

  const previousStep = () => {
    const current = TEMPLATE_STEPS.findIndex(item => item.key === step);
    const previous = TEMPLATE_STEPS[Math.max(current - 1, 0)];
    setStepDirection(-1);
    setStep(previous.key);
  };

  const renderStep = () => {
    if (step === "template") {
      return (
        <div className="mx-auto max-w-[1180px] pb-6">
          <div className="mb-7 grid gap-4 lg:grid-cols-[1fr_280px] lg:items-end">
            <div className="text-center lg:pl-[280px]">
              <h1 className="font-display text-3xl font-bold text-foreground dark:text-foreground md:text-4xl">{ui.template.chooseTitle}</h1>
              <p className="mt-2 text-sm text-muted-foreground/66 dark:text-muted-foreground/62">{ui.template.chooseSubtitle}</p>
            </div>
            <div className="group flex h-11 items-center rounded-md border border-border/60 bg-card px-4 text-foreground shadow-sm">
              <Search size={16} className="mr-3 text-muted-foreground/55" />
              <input
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                placeholder={ui.template.searchPlaceholder}
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/45"
              />
            </div>
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {templateGroups.map(group => {
              const Icon = group.Icon;
              const active = activeGroup === group.key;
              return (
                <button
                  key={group.name}
                  type="button"
                  onClick={() => {
                    setActiveGroup(group.key);
                    setSearchTerm("");
                    if (group.items[0]) setSelectedTemplate(group.items[0].name);
                  }}
                  className={`group min-h-[136px] rounded-md border bg-card p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-button/50 hover:shadow-[0_16px_38px_rgba(12,21,25,0.08)] ${
                    active ? "border-button shadow-[0_16px_38px_rgba(12,21,25,0.10)]" : "border-border/70"
                  }`}
                >
                  <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-md border ${
                    active ? "border-button/20 bg-button/10 text-button" : "border-border bg-secondary text-foreground"
                  }`}>
                    <Icon size={21} strokeWidth={1.8} />
                  </div>
                  <h3 className={`mb-2 text-sm font-bold ${active ? "text-button" : "text-foreground"}`}>{group.name}</h3>
                  <p className="text-xs leading-5 text-muted-foreground/68">{group.items.length} {ui.template.fallbackDescription}</p>
                </button>
              );
            })}
          </div>

          {templateError && (
            <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {ui.template.loadErrorPrefix} {templateError}
            </p>
          )}

          <div className="rounded-md border border-border/70 bg-card/70 p-5 shadow-[0_18px_50px_rgba(12,21,25,0.06)]">
            <div className="mb-5 grid gap-4 lg:grid-cols-[1fr_240px] lg:items-start">
              <div>
                <h2 className="mb-2 text-lg font-bold text-button">{activeTemplateGroup.name}</h2>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground/72">{activeTemplateGroup.desc}</p>
              </div>
              {selectedTemplateData && (
                <div className="rounded-md border border-border/70 bg-secondary px-4 py-3 text-xs leading-5 text-muted-foreground/72">
                  <span className="font-semibold text-foreground">{selectedTemplateData.variables.length}</span> {ui.template.fieldsCount}
                </div>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredTemplates.map(card => (
                <button
                  key={card.name}
                  type="button"
                  onClick={() => setSelectedTemplate(card.name)}
                  className={`group flex min-h-[82px] items-start gap-4 rounded-md border bg-secondary p-4 text-left transition-all duration-250 hover:border-button/40 hover:bg-background ${
                    selectedTemplate === card.name ? "border-button bg-background shadow-sm" : "border-border/70"
                  }`}
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border ${
                    selectedTemplate === card.name ? "border-button/20 bg-button/10 text-button" : "border-border bg-card text-button"
                  }`}>
                    <FileText size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">{card.name}</span>
                    <span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted-foreground/66">{card.description || `${card.category} ${ui.template.fallbackDescription}`}</span>
                  </span>
                  <ArrowRight size={15} className="mt-1 shrink-0 text-button transition-transform duration-300 group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={nextStep}
              disabled={!selectedTemplate}
              className="inline-flex items-center gap-3 rounded-md bg-button px-7 py-3 text-sm font-semibold text-button-text shadow-[0_12px_26px_rgba(12,21,25,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              {ui.actions.continue} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      );
    }

    if (step === "details") {
      return (
        <TemplateDetails
          template={selectedTemplateData}
          values={templateValues}
          ui={ui}
          onValueChange={(key, value) => setTemplateValues(current => ({ ...current, [key]: value }))}
          onBack={previousStep}
          onContinue={nextStep}
        />
      );
    }
    if (step === "verification") return <TemplateVerification template={selectedTemplateData} values={templateValues} ui={ui} onBack={previousStep} onContinue={nextStep} />;
    if (step === "payment") return <TemplatePayment ui={ui} onBack={previousStep} onContinue={nextStep} />;
    const previewContent = renderTemplateContent(selectedTemplateData, templateValues, ui);
    return (
      <TemplateResult
        template={selectedTemplateData}
        values={templateValues}
        ui={ui}
        onBack={previousStep}
        onSave={() => void onSaveTemplate({
          title: selectedTemplateData?.name || "Generated Contract",
          content: previewContent,
          template: selectedTemplateData,
        })}
        onExport={() => void onExportTemplate({
          title: selectedTemplateData?.name || "Generated Contract",
          content: previewContent,
          template: selectedTemplateData,
        })}
        onFinish={() => setShowConfirm(true)}
      />
    );
  };

  return (
    <TemplateShell step={step} onBackHome={onBackHome} onTabSelect={onTabSelect} navControls={navControls} ui={ui}>
      <div
        key={step}
        className="absolute inset-0 overflow-y-auto rounded-t-[2rem] bg-secondary p-1 shadow-[0_-15px_50px_rgba(0,0,0,0.15)]"
        style={{ borderRadius: "32px 32px 0 0" }}
      >
        {renderStep()}
      </div>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 px-5 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md rounded-[2rem] border border-border/35 bg-secondary p-8 text-center shadow-[0_30px_90px_rgba(0,0,0,0.32)]"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
            >
              <h2 className="mb-8 font-display text-3xl font-bold text-foreground">{ui.confirm.title}</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const previewContent = renderTemplateContent(selectedTemplateData, templateValues, ui);
                    void onSaveTemplate({
                      title: selectedTemplateData?.name || "Generated Contract",
                      content: previewContent,
                      template: selectedTemplateData,
                    });
                    setShowConfirm(false);
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-button px-5 py-3 text-sm font-semibold text-button-text transition-transform duration-300 hover:scale-[1.03]"
                >
                  <Archive size={16} /> {ui.actions.archive}
                </button>
                <button onClick={() => setShowConfirm(false)} className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-muted-foreground transition-transform duration-300 hover:scale-[1.03]">
                  <Trash2 size={16} /> {ui.actions.delete}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </TemplateShell>
  );
}

function CoffeeButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full bg-button px-9 py-3.5 text-sm font-semibold text-button-text shadow-[0_0_0_rgba(207,157,123,0)] transition-all duration-300 hover:scale-[1.02] hover:bg-accent hover:shadow-[0_0_30px_rgba(207,157,123,0.28)]"
    >
      {children}
    </button>
  );
}

function StepActions({ ui, onBack, onContinue }: { ui: UiContent; onBack: () => void; onContinue: () => void }) {
  return (
    <div className="mt-8 flex items-center justify-between gap-4">
      <button
        type="button"
        onClick={onBack}
        className="group flex items-center gap-2 rounded-full border border-border/35 bg-secondary/70 px-6 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:border-highlight hover:bg-card"
      >
        <ArrowLeft size={15} className="transition-transform duration-300 group-hover:-translate-x-0.5" /> {ui.actions.back}
      </button>
      <CoffeeButton onClick={onContinue}>{ui.actions.continue}</CoffeeButton>
    </div>
  );
}

function renderTemplateContent(template: TemplateSummary | undefined, values: Record<string, string>, ui: UiContent) {
  const content = template?.content || ui.template.editor.fallbackContent;
  const labelsByKey = new Map((template?.variables || []).map(variable => [variable.key, variable.label || variable.key]));
  return content.replace(/{{\s*([A-Za-z0-9_]+)\s*}}/g, (_match, key: string) => {
    const value = values[key]?.trim();
    return value || `[${labelsByKey.get(key) || key}]`;
  });
}

function groupTemplateVariables(variables: TemplateVariable[], ui: UiContent) {
  const groups = [
    { title: ui.template.fieldGroups.parties, keywords: ["name", "representative", "company", "client", "buyer", "seller", "address", "phone", "bank", "email", "ner", "tal"] },
    { title: ui.template.fieldGroups.main, keywords: ["contract", "work", "service", "description", "purpose", "location", "type", "duration", "date", "start", "end"] },
    { title: ui.template.fieldGroups.payment, keywords: ["payment", "amount", "price", "cost", "rent", "fee", "currency", "rate", "percent", "value"] },
    { title: ui.template.fieldGroups.additional, keywords: [] },
  ];

  return groups.map(group => ({
    title: group.title,
    variables: variables.filter(variable => {
      const haystack = `${variable.key} ${variable.label}`.toLowerCase();
      if (group.keywords.length === 0) {
        return !groups.slice(0, -1).some(item => item.keywords.some(keyword => haystack.includes(keyword)));
      }
      return group.keywords.some(keyword => haystack.includes(keyword));
    }),
  })).filter(group => group.variables.length > 0);
}

function TemplateField({
  variable,
  value,
  onChange,
}: {
  variable: TemplateVariable;
  value: string;
  onChange: (value: string) => void;
}) {
  const baseClass = "w-full rounded-md border border-border/70 bg-background px-4 py-3 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/42 focus:border-button focus:shadow-[0_0_0_4px_rgba(13,39,76,0.08)]";
  const label = variable.label || variable.key;

  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-muted-foreground/80">
        <span>{label}</span>
        {variable.required && <span className="text-button">*</span>}
      </span>
      {variable.type === "textarea" ? (
        <textarea
          value={value}
          onChange={event => onChange(event.target.value)}
          placeholder={label}
          rows={4}
          className={`${baseClass} min-h-[112px] resize-y`}
        />
      ) : variable.type === "boolean" ? (
        <button
          type="button"
          onClick={() => onChange(value === "true" ? "false" : "true")}
          className={`flex h-12 w-full items-center justify-between rounded-md border px-4 text-sm font-semibold transition-colors ${
            value === "true" ? "border-button bg-button/10 text-button" : "border-border/70 bg-background text-muted-foreground"
          }`}
        >
          <span>{label}</span>
          <span className={`h-5 w-9 rounded-full p-0.5 transition-colors ${value === "true" ? "bg-button" : "bg-border"}`}>
            <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${value === "true" ? "translate-x-4" : ""}`} />
          </span>
        </button>
      ) : (
        <input
          value={value}
          onChange={event => onChange(event.target.value)}
          placeholder={label}
          type={variable.type === "number" || variable.type === "date" || variable.type === "email" ? variable.type : "text"}
          className={baseClass}
        />
      )}
    </label>
  );
}

function TemplateDetails({
  template,
  values,
  ui,
  onValueChange,
  onBack,
  onContinue,
}: {
  template?: TemplateSummary;
  values: Record<string, string>;
  ui: UiContent;
  onValueChange: (key: string, value: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const groups = groupTemplateVariables(template?.variables || [], ui);
  const preview = renderTemplateContent(template, values, ui);

  return (
    <motion.div
      key="details"
      className="mx-auto flex max-w-[1280px] flex-col"
    >
      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-button">{ui.template.editor.eyebrow}</p>
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">{template?.name || "Selected template"}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground/70">
          {ui.template.editor.helper}
        </p>
      </div>

      <div className="grid flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="min-h-[620px] overflow-hidden rounded-md border border-border/70 bg-card shadow-[0_18px_50px_rgba(12,21,25,0.06)]">
          <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">{ui.template.editor.preview}</p>
              <h2 className="mt-1 text-sm font-bold text-foreground">{template?.category || "Contract"}</h2>
            </div>
            <span className="rounded-md bg-button/10 px-3 py-1 text-xs font-semibold text-button">AI</span>
          </div>
          <div className="h-[560px] overflow-y-auto bg-background px-8 py-8">
            <article className="mx-auto max-w-[760px] whitespace-pre-wrap rounded-sm bg-white px-8 py-10 text-sm leading-7 text-slate-900 shadow-[0_16px_40px_rgba(12,21,25,0.08)] dark:bg-card dark:text-foreground">
              {preview}
            </article>
          </div>
        </section>

        <aside className="min-h-[620px] overflow-hidden rounded-md border border-border/70 bg-card shadow-[0_18px_50px_rgba(12,21,25,0.06)]">
          <div className="border-b border-border/70 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">{ui.template.editor.fields}</p>
            <h2 className="mt-1 text-lg font-bold text-foreground">{template?.variables.length || 0} {ui.template.editor.fieldUnit}</h2>
          </div>
          <div className="h-[560px] overflow-y-auto px-5 py-5">
            {groups.length === 0 ? (
              <p className="rounded-md border border-border/70 bg-secondary p-4 text-sm leading-6 text-muted-foreground/70">
                {ui.template.editor.emptyFields}
              </p>
            ) : (
              <div className="space-y-6">
                {groups.map(group => (
                  <div key={group.title}>
                    <h3 className="mb-3 text-sm font-bold text-button">{group.title}</h3>
                    <div className="space-y-4">
                      {group.variables.map(variable => (
                        <TemplateField
                          key={variable.key}
                          variable={variable}
                          value={values[variable.key] || ""}
                          onChange={(value) => onValueChange(variable.key, value)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
      <StepActions ui={ui} onBack={onBack} onContinue={onContinue} />
    </motion.div>
  );
}

function TemplateVerification({
  template,
  values,
  ui,
  onBack,
  onContinue,
}: {
  template?: TemplateSummary;
  values: Record<string, string>;
  ui: UiContent;
  onBack: () => void;
  onContinue: () => void;
}) {
  const preview = renderTemplateContent(template, values, ui);

  return (
    <motion.div
      key="verification"
      className="flex flex-col"
    >
      <div className="flex flex-1 items-center justify-center">
        <motion.div
          className="w-full max-w-3xl rounded-[2rem] border border-border/25 bg-secondary/80 p-10 text-foreground shadow-[0_26px_70px_rgba(0,0,0,0.25)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-highlight">{ui.template.verification.eyebrow}</p>
          <h1 className="mb-5 font-display text-4xl font-bold">{template?.name || ui.template.verification.title}</h1>
          <div className="max-h-[420px] overflow-y-auto whitespace-pre-wrap rounded-md border border-border/70 bg-background p-5 text-sm leading-7 text-muted-foreground/80">
            {preview}
          </div>
        </motion.div>
      </div>
      <StepActions ui={ui} onBack={onBack} onContinue={onContinue} />
    </motion.div>
  );
}

function TemplatePayment({ ui, onBack, onContinue }: { ui: UiContent; onBack: () => void; onContinue: () => void }) {
  const amount = 5000;
  const [invoice, setInvoice] = useState<QPayInvoiceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const qrImage = invoice?.qr_image
    ? invoice.qr_image.startsWith("data:") ? invoice.qr_image : `data:image/png;base64,${invoice.qr_image}`
    : "";

  const createInvoice = async () => {
    setIsLoading(true);
    setPaymentError("");

    try {
      const createdInvoice = await createPublicQPayInvoice({
        amount,
        description: "Draftly гэрээний загвар үүсгэх төлбөр",
      });
      setInvoice(createdInvoice);
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "QPay invoice үүсгэж чадсангүй.");
    } finally {
      setIsLoading(false);
    }
  };

  const checkPayment = async () => {
    if (!invoice?.invoice_id) return;
    setIsChecking(true);
    setPaymentError("");

    try {
      const status = await checkQPayInvoice(invoice.invoice_id);
      setIsPaid(status.paid);
      if (status.paid) {
        onContinue();
      } else {
        setPaymentError("Төлбөр хараахан баталгаажаагүй байна.");
      }
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Төлбөр шалгаж чадсангүй.");
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    void createInvoice();
  }, []);

  return (
    <motion.div
      key="payment"
      className="flex flex-col"
    >
      <div className="flex flex-1 items-center justify-center">
        <motion.div
          className="w-full max-w-lg rounded-[2rem] border border-border/25 bg-secondary p-8 text-center text-foreground shadow-[0_28px_80px_rgba(0,0,0,0.28)]"
          animate={{ scale: [1, 1.015, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-highlight">QPay</p>
          <h1 className="mb-2 font-display text-3xl font-bold">Төлбөр төлөх</h1>
          <p className="mb-6 text-sm text-muted-foreground/75">
            Гэрээний загвар үүсгэх төлбөр: {amount.toLocaleString("mn-MN")} MNT
          </p>
          <motion.div
            className="mx-auto mb-6 flex h-64 w-64 items-center justify-center rounded-[1.5rem] border border-border bg-card p-4 shadow-inner"
            animate={{ boxShadow: ["0 0 0 rgba(207,157,123,0)", "0 0 34px rgba(207,157,123,0.28)", "0 0 0 rgba(207,157,123,0)"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            {isLoading ? (
              <LoaderCircle className="h-14 w-14 animate-spin text-foreground" strokeWidth={1.5} />
            ) : qrImage ? (
              <img src={qrImage} alt="QPay QR" className="h-full w-full object-contain" />
            ) : (
              <QrCode size={132} strokeWidth={1.25} className="text-foreground" />
            )}
          </motion.div>
          {invoice?.urls?.length ? (
            <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {invoice.urls.filter(item => item.link).slice(0, 6).map(item => (
                <a
                  key={`${item.name}-${item.link}`}
                  href={item.link}
                  className="rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-background"
                >
                  {item.name || item.description || "Bank"}
                </a>
              ))}
            </div>
          ) : null}
          {paymentError && (
            <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {paymentError}
            </p>
          )}
          {isPaid && (
            <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Төлбөр амжилттай баталгаажлаа.
            </p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={createInvoice}
              disabled={isLoading}
              className="flex-1 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-transform duration-300 hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Дахин үүсгэх
            </button>
            <button
              type="button"
              onClick={checkPayment}
              disabled={!invoice || isChecking}
              className="flex-1 rounded-full bg-button px-6 py-3 text-sm font-semibold text-button-text transition-transform duration-300 hover:scale-[1.03] hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isChecking ? "Шалгаж байна..." : ui.template.payment.check}
            </button>
          </div>
        </motion.div>
      </div>
      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="group flex items-center gap-2 rounded-full border border-border/35 bg-secondary/70 px-6 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:border-highlight hover:bg-card"
        >
          <ArrowLeft size={15} className="transition-transform duration-300 group-hover:-translate-x-0.5" /> {ui.actions.back}
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="rounded-full bg-button px-9 py-3.5 text-sm font-semibold text-button-text shadow-[0_0_0_rgba(207,157,123,0)] transition-all duration-300 hover:scale-[1.02] hover:bg-accent hover:shadow-[0_0_30px_rgba(207,157,123,0.28)]"
        >
          {isPaid ? ui.actions.continue : "Дараа төлөөд үргэлжлүүлэх"}
        </button>
      </div>
    </motion.div>
  );
}

function TemplateResult({
  template,
  values,
  ui,
  onBack,
  onSave,
  onExport,
  onFinish,
}: {
  template?: TemplateSummary;
  values: Record<string, string>;
  ui: UiContent;
  onBack: () => void;
  onSave: () => void;
  onExport: () => void;
  onFinish: () => void;
}) {
  const preview = renderTemplateContent(template, values, ui);
  const completedFields = (template?.variables || []).filter(variable => values[variable.key]?.trim()).length;
  const totalFields = template?.variables.length || 0;
  const completionRate = totalFields ? Math.round((completedFields / totalFields) * 100) : 100;
  const missingFields = (template?.variables || [])
    .filter(variable => variable.required && !values[variable.key]?.trim())
    .map(variable => variable.label || variable.key);
  const previewLines = preview.split(/\n{2,}/).filter(Boolean);

  return (
    <motion.div
      key="template-result"
      className="grid gap-8 pb-6 lg:grid-cols-[minmax(0,1fr)_380px]"
    >
      <motion.div
        className="relative min-h-[560px] overflow-hidden rounded-[2rem] border border-border/30 bg-secondary p-8 text-foreground shadow-[0_28px_80px_rgba(0,0,0,0.28)]"
      >
        <div className="absolute -inset-x-4 top-6 -z-10 h-full rounded-[2rem] bg-background/70" />
        <div className="absolute -inset-x-8 top-12 -z-20 h-full rounded-[2rem] bg-border/65" />
        <div className="h-full overflow-y-auto pr-3 text-sm leading-7 text-muted-foreground/80">
          <div className="mb-7">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-highlight">{template?.category || "Contract"}</p>
            <h2 className="text-2xl font-semibold text-foreground">{template?.name || ui.template.result.previewTitle}</h2>
          </div>
          <article className="whitespace-pre-wrap rounded-md bg-white px-8 py-9 text-sm leading-7 text-slate-900 shadow-[0_16px_40px_rgba(12,21,25,0.08)] dark:bg-card dark:text-foreground">
            {previewLines.length ? previewLines.map((paragraph, index) => (
              <p key={index} className="mb-5 last:mb-0">
                {paragraph}
              </p>
            )) : preview}
          </article>
        </div>
      </motion.div>

      <div className="flex flex-col gap-4">
        {[
          [`${completionRate}% бөглөгдсөн`, `${completedFields}/${totalFields || completedFields} талбар бөглөгдсөн байна.`],
          [ui.template.result.missingTitle, missingFields.length ? missingFields.join(", ") : ui.template.result.missingText],
          [ui.template.result.analysisTitle, ui.template.result.analysisText],
        ].map(([title, text], index) => (
          <motion.div
            key={title}
            className="rounded-[1.5rem] border border-border/20 bg-card/80 p-6 text-foreground shadow-[0_16px_38px_rgba(0,0,0,0.18)]"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: index * 0.12 }}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-highlight">{title}</p>
            <p className="text-sm leading-6 text-muted-foreground/68">{text}</p>
          </motion.div>
        ))}

        <div className="mt-auto space-y-4 pt-3">
          <div className="flex flex-wrap gap-2">
            {["PPT", "Word", "Docs"].map(label => (
              <button key={label} type="button" onClick={onExport} className="flex h-11 min-w-16 items-center justify-center rounded-full border border-border/25 bg-secondary/80 px-4 text-xs font-semibold text-foreground transition-all duration-300 hover:-translate-y-1 hover:border-highlight">
                {label}
              </button>
            ))}
            <button type="button" onClick={onSave} className="flex h-11 w-11 items-center justify-center rounded-full border border-border/25 bg-secondary/80 text-highlight transition-all duration-300 hover:-translate-y-1 hover:border-highlight">
              <Archive size={16} />
            </button>
            <button type="button" onClick={onFinish} className="flex h-11 w-11 items-center justify-center rounded-full border border-border/25 bg-secondary/80 text-highlight transition-all duration-300 hover:-translate-y-1 hover:border-highlight">
              <Trash2 size={16} />
            </button>
          </div>
          <div className="flex items-center justify-between gap-4">
            <button type="button" onClick={onBack} className="rounded-full border border-border/35 bg-secondary/70 px-6 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:bg-card">
              {ui.actions.back}
            </button>
            <button type="button" onClick={onFinish} className="flex-1 rounded-full bg-button px-8 py-3.5 text-sm font-semibold text-button-text shadow-[0_0_0_rgba(207,157,123,0)] transition-all duration-300 hover:scale-[1.02] hover:bg-accent hover:shadow-[0_0_30px_rgba(207,157,123,0.28)]">
              {ui.template.result.create}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
  const [locale, setLocale] = useState<Locale>("mn");
  const [isDark, setIsDark] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [page, setPage] = useState<AppPage>("home");
  const [previousPage, setPreviousPage] = useState<AppPage>("home");
  const [pageDirection, setPageDirection] = useState(1);
  const [activeFeature, setActiveFeature] = useState(1);
  const [circleTilt, setCircleTilt] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<AnalysisStep>("upload");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [analysisError, setAnalysisError] = useState("");
  const [authToken, setAuthToken] = useState<string>("");
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [accessState, setAccessState] = useState<AccessState>({
    isPaid: false,
    profileComplete: false,
    missingFields: ["firstName", "lastName"],
  });
  const [savedDocuments, setSavedDocuments] = useState<Array<any>>([]);
  const [savedContracts, setSavedContracts] = useState<Array<any>>([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [globalNotice, setGlobalNotice] = useState("");
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallInvoice, setPaywallInvoice] = useState<QPayInvoiceResponse | null>(null);
  const [paywallBusy, setPaywallBusy] = useState(false);
  const [paywallError, setPaywallError] = useState("");
  const homeScrollRef = useRef<HTMLDivElement>(null);
  const content = LOCALES[locale];
  const PARTNERS = content.partners;
  const TEMPLATES = content.templates;

  const featuresRef = useInView();
  const templateRef = useInView();
  const uploadRef   = useInView();
  const footerRef   = useInView();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    const t = setInterval(() => setActiveFeature(p => (p + 1) % ORBIT_FEATURES.length), 3800);
    return () => clearInterval(t);
  }, []);

  const hydrateAuthState = async (token: string) => {
    const [me, documents, contracts, payment] = await Promise.all([
      fetchMe(token),
      listMyDocuments(token),
      listMyContracts(token),
      fetchMyPaymentStatus(token),
    ]);

    setAuthUser(me.user);
    setAccessState({
      isPaid: payment.isPaid || me.access.isPaid,
      profileComplete: me.profile.isComplete,
      missingFields: me.profile.missingFields,
    });
    setSavedDocuments(documents.documents || []);
    setSavedContracts(contracts.contracts || []);
  };

  useEffect(() => {
    const existingToken = localStorage.getItem("draftly_auth_token");
    if (!existingToken) return;
    setAuthToken(existingToken);
    hydrateAuthState(existingToken).catch(() => {
      localStorage.removeItem("draftly_auth_token");
      setAuthToken("");
      setAuthUser(null);
    });
  }, []);

  const handleGoogleLogin = async () => {
    if (!googleClientId) {
      setGlobalNotice(content.ui.auth.googleClientMissing);
      return;
    }
    setAuthBusy(true);
    setGlobalNotice("");
    try {
      const idToken = await requestGoogleIdToken(googleClientId);
      const auth = await loginWithGoogle(idToken);
      setAuthToken(auth.token);
      localStorage.setItem("draftly_auth_token", auth.token);
      await hydrateAuthState(auth.token);
      setGlobalNotice(content.ui.auth.loginSuccess);
    } catch (error) {
      setGlobalNotice(error instanceof Error ? error.message : String(error));
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("draftly_auth_token");
    setAuthToken("");
    setAuthUser(null);
    setSavedDocuments([]);
    setSavedContracts([]);
    setAccessState({
      isPaid: false,
      profileComplete: false,
      missingFields: ["firstName", "lastName"],
    });
    setProfileOpen(false);
    setGlobalNotice(content.ui.auth.logoutSuccess);
  };

  const handleProfileSave = async (payload: { firstName: string; lastName: string }) => {
    if (!authToken) return;
    const updated = await updateMyProfile(authToken, payload);
    setAuthUser(updated.user);
    setAccessState((current) => ({
      ...current,
      profileComplete: updated.profile.isComplete,
      missingFields: updated.profile.missingFields,
    }));
    setGlobalNotice(content.ui.profile.updated);
  };

  const ensureAccessForSave = async () => {
    if (!authToken || !authUser) {
      setGlobalNotice(content.ui.auth.loginRequired);
      await handleGoogleLogin();
      return false;
    }
    if (!accessState.profileComplete) {
      setGlobalNotice(content.ui.profile.incompletePrefix);
      setProfileOpen(true);
      return false;
    }
    if (!accessState.isPaid) {
      setGlobalNotice(content.ui.paywall.title);
      setPaywallOpen(true);
      return false;
    }
    return true;
  };

  const createPaywallInvoice = async () => {
    setPaywallBusy(true);
    setPaywallError("");
    try {
      const invoice = await createPublicQPayInvoice({
        amount: 5000,
        description: "Draftly save/export access",
      });
      setPaywallInvoice(invoice);
    } catch (error) {
      setPaywallError(error instanceof Error ? error.message : String(error));
    } finally {
      setPaywallBusy(false);
    }
  };

  useEffect(() => {
    if (!paywallOpen) return;
    if (!paywallInvoice) {
      void createPaywallInvoice();
    }
  }, [paywallOpen, paywallInvoice]);

  const confirmPaywallPayment = async () => {
    if (!paywallInvoice?.invoice_id || !authToken) return;
    setPaywallBusy(true);
    setPaywallError("");
    try {
      const status = await checkQPayInvoice(paywallInvoice.invoice_id);
      if (!status.paid) {
        setPaywallError(content.ui.paywall.pending);
        return;
      }
      await activatePaidAccess(authToken, paywallInvoice.invoice_id);
      setAccessState((current) => ({ ...current, isPaid: true }));
      setPaywallOpen(false);
      setPaywallInvoice(null);
      setGlobalNotice(content.ui.paywall.success);
    } catch (error) {
      setPaywallError(error instanceof Error ? error.message : String(error));
    } finally {
      setPaywallBusy(false);
    }
  };

  const handleSaveAnalysis = async (result: AnalysisResponse | null) => {
    const allowed = await ensureAccessForSave();
    if (!allowed || !authToken || !result) return;
    const saved = await saveAnalyzedDocument(authToken, {
      title: result.document.title || "Analyzed document",
      content: result.document.extractedText || "",
      fileName: result.document.fileName,
      fileUrl: result.document.fileUrl,
    });
    setSavedDocuments((current) => [saved.document, ...current]);
    setGlobalNotice("Анализын баримт хадгалагдлаа.");
  };

  const handleSaveTemplate = async (payload: { title: string; content: string; template?: TemplateSummary }) => {
    const allowed = await ensureAccessForSave();
    if (!allowed || !authToken) return;
    const saved = await saveGeneratedContract(authToken, {
      title: payload.title,
      content: payload.content,
      contractType: payload.template?.category,
    });
    setSavedContracts((current) => [saved.contract, ...current]);
    setGlobalNotice("Гэрээ хадгалагдлаа.");
  };

  const handleExportAction = async (_payload?: unknown) => {
    const allowed = await ensureAccessForSave();
    if (!allowed) return;
    setGlobalNotice("Export бэлэн. Дараагийн алхмаар PDF generation холбогдоно.");
  };

  const navigateTo = (nextPage: AppPage, direction = 1) => {
    if (nextPage !== page) {
      setPreviousPage(page);
    }
    setPageDirection(direction);
    setPage(nextPage);
  };

  const openHome = () => {
    navigateTo("home", -1);
    window.setTimeout(() => {
      homeScrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
    }, 80);
  };

  const openAnalysis = () => {
    navigateTo("analysis", 1);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const openTemplate = () => {
    navigateTo("template", 1);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const goBackPage = () => {
    const fallback = previousPage === page ? "home" : previousPage;
    navigateTo(fallback, -1);
  };

  const scrollHomeTo = (ref: RefObject<HTMLElement>) => {
    navigateTo("home", -1);
    window.setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "auto", block: "start" });
    }, 80);
  };

  const handleTabSelect = (tab: HeaderTab) => {
    if (tab === "Home") {
      openHome();
      return;
    }

    if (tab === "Template") {
      openTemplate();
      return;
    }

    if (tab === "Analysis") {
      openAnalysis();
      return;
    }

    if (tab === "Contact us") {
      scrollHomeTo(footerRef.ref);
      return;
    }

    openHome();
  };

  const navControls: FolderNavControls = {
    isDark,
    languageLabel: locale === "mn" ? "MN" : "ENG",
    loginLabel: authBusy ? "..." : content.login,
    isAuthenticated: Boolean(authUser),
    userAvatarUrl: authUser?.avatarUrl || null,
    onThemeToggle: () => setIsDark(d => !d),
    onLanguageToggle: () => setLocale(current => current === "mn" ? "en" : "mn"),
    onLoginClick: () => void handleGoogleLogin(),
    onProfileClick: () => setProfileOpen(true),
  };

  return (
    <div className="relative h-screen overflow-hidden bg-background transition-colors duration-700">
      <AnimatePresence>
        {showSplash && <OpeningSplash onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>
      {page === "template" ? (
          <div
            key="template"
            className="absolute inset-0 overflow-hidden rounded-t-[2rem] shadow-[0_-15px_50px_rgba(0,0,0,0.15)]"
            style={{ borderRadius: "32px 32px 0 0" }}
          >
            <TemplateWorkflow
              onBackHome={goBackPage}
              onTabSelect={handleTabSelect}
              navControls={navControls}
              ui={content.ui}
              onSaveTemplate={handleSaveTemplate}
              onExportTemplate={handleExportAction}
            />
          </div>
        ) : page === "analysis" ? (
          <div
            key="analysis"
            className="absolute inset-0 overflow-y-auto overflow-x-hidden rounded-t-[2rem] shadow-[0_-15px_50px_rgba(0,0,0,0.15)]"
            style={{ borderRadius: "32px 32px 0 0" }}
          >
            <AnalysisWorkflow
              onBack={goBackPage}
              onTabSelect={handleTabSelect}
              navControls={navControls}
              ui={content.ui}
              step={analysisStep}
              setStep={setAnalysisStep}
              analysisResult={analysisResult}
              setAnalysisResult={setAnalysisResult}
              analysisError={analysisError}
              setAnalysisError={setAnalysisError}
              onSaveAnalysis={handleSaveAnalysis}
              onExportAnalysis={() => handleExportAction()}
            />
          </div>
        ) : (
          <div
            key="home"
            ref={homeScrollRef}
            className="absolute inset-0 overflow-y-auto bg-background"
          >
            <HomeSimpleNav onSelect={handleTabSelect} controls={navControls} ui={content.ui} scrollContainerRef={homeScrollRef} />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PAGE 1 â€” HERO
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <motion.section
        className="sticky top-0 min-h-screen overflow-hidden rounded-t-[2rem] bg-secondary px-3 pb-6 pt-3 shadow-[0_-18px_55px_rgba(0,0,0,0.10)] flex flex-col"
        style={{ zIndex: 1 }}
        variants={SECTION_REVEAL}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.16 }}
      >
        <FolderTabs activeTab="Home" onSelect={handleTabSelect} controls={navControls} ui={content.ui} />
        {/* Document body */}
        <motion.div
          className="relative flex-1 bg-background border border-border rounded-b-[2rem] rounded-tr-[2rem] shadow-[0_12px_70px_rgba(0,0,0,0.07)] overflow-hidden flex flex-col"
        >
          <div className="pointer-events-none absolute left-0 top-0 z-20 h-px w-[920px] max-w-[calc(100vw-1.5rem)] bg-background" />
          {/* Hero content */}
          <motion.div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 md:py-14">
            <motion.h1
              className="font-display text-4xl md:text-[3.55rem] lg:text-[3.9rem] font-bold leading-[1.08] max-w-3xl text-foreground mb-7"
              variants={REVEAL_ITEM}
            >
              {content.hero.title}
            </motion.h1>

            <motion.div
              className="flex gap-3 mb-11"
              variants={REVEAL_ITEM}
            >
              <button className="flex min-w-[10rem] items-center justify-center gap-2 bg-button text-button-text px-8 py-3.5 rounded-full text-sm font-medium hover:opacity-85 active:scale-95 transition-all duration-200">
                {content.hero.primaryCta} <ArrowRight size={14} />
              </button>
              <button className="min-w-[10rem] px-8 py-3.5 rounded-full text-sm font-medium border border-border hover:bg-secondary active:scale-95 transition-all duration-200 text-foreground">
                {content.hero.secondaryCta}
              </button>
            </motion.div>

            {/* Partner logos */}
            <motion.div
              className="space-y-3 w-full max-w-lg"
              variants={REVEAL_ITEM}
            >
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {content.hero.partnerLabel}
              </p>
              <div className="overflow-hidden">
                <div className="animate-marquee gap-10">
                  {[...PARTNERS, ...PARTNERS].map((p, i) => (
                    <span
                      key={i}
                      className="shrink-0 text-sm font-medium text-muted-foreground/55 hover:text-muted-foreground transition-colors"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PAGE 2 â€” WHAT DO WE DO?
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <motion.section
        className="sticky top-0 min-h-screen overflow-hidden rounded-t-[2rem] bg-background py-16 shadow-[0_-18px_55px_rgba(0,0,0,0.12)] md:py-24"
        style={{ zIndex: 2 }}
        ref={featuresRef.ref}
        variants={SECTION_REVEAL}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.14 }}
      >
        <div
          className="flex min-h-[calc(100vh-9rem)] flex-col items-center gap-10 px-4 md:px-6 lg:flex-row lg:gap-0"
          onMouseMove={event => {
            const rect = event.currentTarget.getBoundingClientRect();
            const offset = (event.clientX - rect.left) / rect.width - 0.5;
            setCircleTilt(offset * 10);
          }}
          onMouseLeave={() => setCircleTilt(0)}
        >
          {/* â”€â”€ Circle carousel â”€â”€ */}
          <motion.div className="relative aspect-square w-[min(88vw,460px)] flex-shrink-0 lg:-ml-[2vw] lg:w-[41vw] lg:min-w-[390px] lg:max-w-[650px]" variants={REVEAL_ITEM}>

            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(207,157,123,0.10),transparent_48%)]" />

            {/* Subtle orbital field */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ rotate: 360 + circleTilt }}
              transition={{ duration: 96, repeat: Infinity, ease: "linear" }}
            >
              {ORBIT_RADII.map((radius, index) => (
                <div
                  key={radius}
                  className={`absolute rounded-full border ${
                    index === activeFeature
                      ? "border-highlight/42 shadow-[0_0_28px_rgba(207,157,123,0.16)]"
                      : "border-accent/18"
                  }`}
                  style={{
                    inset: `${(100 - radius) / 2}%`,
                  }}
                />
              ))}
              <div className="absolute inset-[5%] rounded-full border border-highlight/12 shadow-[0_0_80px_rgba(207,157,123,0.12)]" />
              {ORBIT_PARTICLES.map((particle, index) => (
                <span
                  key={`${particle.left}-${particle.top}`}
                  className="absolute h-1 w-1 rounded-full bg-button/55 shadow-[0_0_12px_rgba(207,157,123,0.22)]"
                  style={{
                    left: particle.left,
                    top: particle.top,
                    opacity: 0.26 + (index % 4) * 0.08,
                  }}
                />
              ))}
            </motion.div>

            {/* Nodes */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ rotate: 360 + circleTilt * 1.35 }}
              transition={{ duration: 118, repeat: Infinity, ease: "linear" }}
            >
              {ORBIT_FEATURES.map((feature, index) => {
                const isActive = index === activeFeature;
                const rad = (ORBIT_ANGLES[index] * Math.PI) / 180;
                const radius = ORBIT_RADII[index] / 2;
                const x = 50 + radius * Math.sin(rad);
                const y = 50 - radius * Math.cos(rad);

                return (
                  <motion.button
                    key={feature.num}
                    type="button"
                    className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border font-mono leading-none backdrop-blur-md transition-colors duration-500 ${
                      isActive
                        ? "h-16 w-16 border-highlight bg-secondary/88 text-2xl font-bold text-foreground shadow-[0_0_34px_rgba(207,157,123,0.42),inset_0_0_24px_rgba(207,157,123,0.08)]"
                        : "h-11 w-11 border-border/20 bg-card/26 text-sm font-semibold text-foreground/50 shadow-[0_12px_30px_rgba(0,0,0,0.22)] hover:border-accent/70 hover:text-foreground/80"
                    }`}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    animate={{ scale: isActive ? 1.08 : 1, opacity: isActive ? 1 : 0.58 }}
                    transition={{ duration: 0.48, ease: "easeOut" }}
                    onClick={() => setActiveFeature(index)}
                    aria-label={`Show ${feature.title}`}
                  >
                    <motion.span
                      animate={{ rotate: -360 - circleTilt * 1.35 }}
                      transition={{ duration: 118, repeat: Infinity, ease: "linear" }}
                    >
                      {feature.num}
                    </motion.span>
                  </motion.button>
                );
              })}
            </motion.div>

            {/* Quiet center field */}
            <div className="pointer-events-none absolute inset-[30%] rounded-full border border-accent/22 bg-background/24 shadow-[inset_0_0_54px_rgba(0,0,0,0.22)]">
              <div className="absolute inset-[22%] rounded-full border border-border/20 bg-background/18" />
            </div>
          </motion.div>

          {/* â”€â”€ Feature content â”€â”€ */}
          <motion.div className="flex-1 px-2 text-center sm:px-6 lg:px-12 lg:text-left xl:pr-24" variants={REVEAL_ITEM}>
            <div className="mb-7 inline-flex rounded-full border border-highlight/24 bg-secondary px-5 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.18)] sm:px-7">
              <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
                {content.featuresSectionTitle}
              </h2>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.45 }}
              >
                <p className="mb-5 font-mono text-sm text-highlight">
                  {ORBIT_FEATURES[activeFeature].num}
                </p>
                <h3 className="mb-7 font-display text-4xl font-bold leading-none text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                  {ORBIT_FEATURES[activeFeature].title}
                </h3>
                <p className="mx-auto max-w-sm text-base leading-relaxed text-foreground/68 sm:text-lg lg:mx-0">
                  {ORBIT_FEATURES[activeFeature].desc}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Progress indicators */}
            <div className="mt-9 flex gap-2">
              {ORBIT_FEATURES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveFeature(i)}
                  className={`h-0.5 rounded-full transition-all duration-500 ${
                    i === activeFeature
                      ? "w-10 bg-highlight"
                      : "w-2 bg-secondary/18 hover:bg-highlight/48"
                  }`}
                  aria-label={`Go to feature ${i + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PAGE 3 â€” TEMPLATE FLOW
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <motion.section
        className="sticky top-0 min-h-screen overflow-hidden rounded-t-[2rem] bg-secondary py-16 shadow-[0_-18px_55px_rgba(0,0,0,0.12)] md:py-28"
        style={{ zIndex: 3 }}
        ref={templateRef.ref}
        variants={SECTION_REVEAL}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.16 }}
      >
        <div className="mx-auto flex w-full max-w-screen-xl flex-col-reverse items-center gap-10 px-4 sm:px-6 lg:flex-row lg:gap-16 lg:px-8 xl:gap-24">

          {/* â”€â”€ 3D screen card â”€â”€ */}
          <motion.div
            className="w-full max-w-[20rem] flex-shrink-0"
            variants={REVEAL_ITEM}
          >
            <div
              className="bg-secondary dark:bg-secondary rounded-3xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.13)] border border-border"
            >
              {/* Title bar */}
              <div className="bg-muted/50 dark:bg-card/50 px-5 py-3.5 flex items-center gap-2 border-b border-border/50">
                <div className="w-2.5 h-2.5 rounded-full bg-highlight" />
                <div className="w-2.5 h-2.5 rounded-full bg-border" />
                <div className="w-2.5 h-2.5 rounded-full bg-border/50" />
                <span className="ml-3 text-[11px] text-muted-foreground">{content.templateFlow.windowTitle}</span>
              </div>

              {/* Scrolling list */}
              <div className="h-[340px] overflow-hidden relative p-3">
                <div className="animate-scrollup space-y-2">
                  {[...TEMPLATES, ...TEMPLATES].map((t, i) => (
                    <div
                      key={i}
                      className="bg-background rounded-2xl px-4 py-3.5 flex items-center gap-3 border border-border/60"
                    >
                      <div className="w-8 h-8 rounded-xl bg-secondary dark:bg-background flex items-center justify-center flex-shrink-0">
                        <FileText size={13} className="text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">{t}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{content.templateFlow.itemSubtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-secondary to-transparent pointer-events-none" />
              </div>
            </div>
          </motion.div>

          {/* â”€â”€ Text â”€â”€ */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            variants={REVEAL_ITEM}
          >
            <h2 className="mb-6 font-display text-3xl font-bold leading-[1.15] text-foreground sm:text-4xl md:text-5xl">
              {content.templateFlow.titleLines.map((line, index) => (
                <span key={line}>
                  {line}
                  {index < content.templateFlow.titleLines.length - 1 && <br />}
                </span>
              ))}
            </h2>
            <p className="mx-auto mb-10 max-w-md text-base leading-relaxed text-muted-foreground lg:mx-0">
              {content.templateFlow.description}
            </p>
            <button className="flex min-w-[10rem] items-center justify-center gap-2 bg-foreground text-background px-7 py-3.5 rounded-full text-sm font-medium hover:opacity-85 active:scale-95 transition-all duration-200">
              {content.templateFlow.cta} <ArrowRight size={14} />
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PAGE 4 â€” UPLOAD & ANALYSE
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <motion.section
        className="sticky top-0 min-h-screen overflow-hidden rounded-t-[2rem] bg-secondary py-16 shadow-[0_-18px_55px_rgba(0,0,0,0.12)] md:py-28"
        style={{ zIndex: 4 }}
        ref={uploadRef.ref}
        variants={SECTION_REVEAL}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.16 }}
      >
        <div className="mx-auto flex w-full max-w-screen-xl flex-col items-stretch gap-10 px-4 sm:px-6 lg:flex-row lg:items-start lg:gap-16 lg:px-8 xl:gap-24">

          {/* â”€â”€ Analysis labels â”€â”€ */}
          <div className="flex-1 pt-4">
            {content.upload.labels.map((text, i) => (
              <motion.div
                key={text}
                className="py-9 border-b border-border"
                variants={REVEAL_ITEM}
                transition={{ duration: 0.65, delay: i * 0.1, ease: "easeOut" }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
                    {text}
                  </h3>
                  <span className="font-mono text-sm text-muted-foreground/50">0{i + 1}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* â”€â”€ Upload card â”€â”€ */}
          <motion.div
            className="w-full max-w-sm self-center pt-2 lg:w-80 lg:self-auto lg:pt-4"
            variants={REVEAL_ITEM}
          >
            {/* Bouncing icon */}
            <motion.div
              className="w-14 h-14 bg-background border border-border rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm"
            >
              <FileText size={24} className="text-muted-foreground" />
            </motion.div>

            <div
              className={`relative bg-background border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-300 ${
                isDragging
                  ? "border-highlight bg-highlight/5 scale-[1.01]"
                  : "border-border"
              }`}
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => setIsDragging(false)}
            >
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.16em] mb-4">
                {content.upload.eyebrow}
              </p>
              <h4 className="text-base font-semibold text-foreground mb-2">
                {content.upload.title}
              </h4>
              <p className="text-sm text-muted-foreground mb-7">
                {content.upload.description}
              </p>
              <button className="w-full bg-foreground text-background py-3.5 rounded-full text-sm font-medium hover:opacity-85 transition-opacity">
                {content.upload.cta}
              </button>

              {/* Accent line at bottom */}
              <div className="absolute bottom-0 left-6 right-6 h-px rounded-full bg-gradient-to-r from-transparent via-highlight to-transparent opacity-60" />
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PAGE 5 â€” FOOTER
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <motion.footer
        className="sticky top-0 min-h-screen overflow-hidden rounded-t-[2rem] bg-secondary border-t border-border shadow-[0_-18px_55px_rgba(0,0,0,0.12)]"
        style={{ zIndex: 5 }}
        ref={footerRef.ref}
        variants={SECTION_REVEAL}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.16 }}
      >
        <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4 md:gap-12">

            {/* Brand */}
            <motion.div className="space-y-5" variants={REVEAL_ITEM}>
              <div className="font-display text-2xl font-bold text-foreground">{content.brand}</div>
              <p className="text-sm text-muted-foreground">{content.footer.tagline}</p>
              <div className="flex gap-2">
                {[Twitter, Linkedin, Instagram, Facebook].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <Icon size={12} className="text-muted-foreground" />
                  </a>
                ))}
              </div>
              <p className="text-xs text-muted-foreground pt-2">{content.footer.copyright}</p>
            </motion.div>

            {/* Company */}
            <motion.div variants={REVEAL_ITEM}>
              <h6 className="text-sm font-semibold text-foreground mb-5">{content.footer.companyTitle}</h6>
              <ul className="space-y-3.5">
                {content.footer.companyLinks.map(l => (
                  <li key={l}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact */}
            <motion.div variants={REVEAL_ITEM}>
              <h6 className="text-sm font-semibold text-foreground mb-5">{content.footer.contactTitle}</h6>
              <ul className="space-y-4">
                <li className="flex items-start gap-2.5">
                  <MapPin size={12} className="text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">{content.footer.address}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone size={12} className="text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">{content.footer.phone}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail size={12} className="text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">{content.footer.email}</span>
                </li>
              </ul>
            </motion.div>

            {/* Additional */}
            <motion.div variants={REVEAL_ITEM}>
              <h6 className="text-sm font-semibold text-foreground mb-5">{content.footer.additionalTitle}</h6>
              <ul className="space-y-3.5">
                {content.footer.additionalLinks.map(l => (
                  <li key={l}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.footer>
          </div>
        )}
      {globalNotice && (
        <div className="pointer-events-none fixed bottom-4 right-4 z-[130] max-w-sm rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground shadow-lg">
          {globalNotice}
        </div>
      )}
      <ProfilePanel
        isOpen={profileOpen}
        user={authUser}
        locale={locale}
        ui={content.ui}
        access={accessState}
        documents={savedDocuments}
        contracts={savedContracts}
        onClose={() => setProfileOpen(false)}
        onLogout={handleLogout}
        onLanguageToggle={() => setLocale(current => current === "mn" ? "en" : "mn")}
        onProfileSave={handleProfileSave}
      />
      <AnimatePresence>
        {paywallOpen && (
          <motion.div
            className="fixed inset-0 z-[125] flex items-center justify-center bg-background/45 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPaywallOpen(false)}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-[0_24px_70px_rgba(0,0,0,0.25)]"
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 18, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-accent" />
                <h4 className="text-lg font-bold text-foreground">{content.ui.paywall.title}</h4>
              </div>
              <p className="mb-5 text-sm text-muted-foreground">{content.ui.paywall.description}</p>
              <div className="mb-5 flex items-center justify-center rounded-xl border border-border bg-secondary p-4">
                {paywallBusy ? (
                  <LoaderCircle className="h-10 w-10 animate-spin text-accent" />
                ) : paywallInvoice?.qr_image ? (
                  <img
                    src={paywallInvoice.qr_image.startsWith("data:") ? paywallInvoice.qr_image : `data:image/png;base64,${paywallInvoice.qr_image}`}
                    alt="Payment QR"
                    className="h-56 w-56 object-contain"
                  />
                ) : (
                  <QrCode size={128} />
                )}
              </div>
              {paywallError && <p className="mb-3 text-sm text-red-600">{paywallError}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void createPaywallInvoice()}
                  disabled={paywallBusy}
                  className="flex-1 rounded-full border border-border bg-secondary px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-60"
                >
                  {content.ui.paywall.createAgain}
                </button>
                <button
                  type="button"
                  onClick={() => void confirmPaywallPayment()}
                  disabled={paywallBusy || !paywallInvoice}
                  className="flex-1 rounded-full bg-button px-4 py-2 text-sm font-semibold text-button-text disabled:opacity-60"
                >
                  {content.ui.paywall.check}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}




