import { useState, useEffect, useRef } from "react";
import type { ReactNode, RefObject } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText, ArrowRight, ArrowLeft, Twitter, Linkedin,
  Instagram, Facebook, Phone, Mail, MapPin, Sun, Moon, UploadCloud,
  LoaderCircle, Check, Archive, Download, Trash2, Search, QrCode,
} from "lucide-react";
import enContent from "./content/en.json";
import mnContent from "./content/mn.json";

type Locale = "mn" | "en";
type HeaderTab = "Home" | "Template" | "Analysis" | "Contact us";
type AppPage = "home" | "template" | "analysis";
type AnalysisStep = "upload" | "processing" | "result";
type TemplateStep = "template" | "details" | "verification" | "payment" | "result";
type FolderNavControls = {
  isDark: boolean;
  languageLabel: string;
  loginLabel: string;
  onThemeToggle: () => void;
  onLanguageToggle: () => void;
};

const LOCALES = {
  mn: mnContent,
  en: enContent,
};

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

// ─── Hooks ───────────────────────────────────────────────────────────────────

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
        className="font-display text-6xl font-black tracking-normal text-foreground md:text-7xl"
        initial={{ x: 0, y: 0, scale: 1 }}
        animate={{
          x: ["0vw", "0vw", "calc(-50vw + 120px)"],
          y: ["0vh", "0vh", "calc(-50vh + 78px)"],
          scale: [1, 1, 0.58],
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
  homeGlobal = false,
  scrollContainerRef,
}: {
  activeTab: HeaderTab;
  onSelect: (tab: HeaderTab) => void;
  controls: FolderNavControls;
  homeGlobal?: boolean;
  scrollContainerRef?: RefObject<HTMLElement>;
}) {
  const navItems: HeaderTab[] = ["Home", "Template", "Analysis", "Contact us"];
  const [isHidden, setIsHidden] = useState(false);
  const [isSimpleHomeNav, setIsSimpleHomeNav] = useState(false);
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

  return (
    <motion.header
      className={`top-0 z-50 flex items-start gap-4 transition-all duration-300 ${
        homeGlobal ? "fixed left-0 right-0" : "sticky"
      } ${
        isSimpleHomeNav
          ? "bg-navbar/96 px-5 py-3 shadow-[0_14px_34px_rgba(12,21,25,0.10)] backdrop-blur-md sm:px-8"
          : `bg-transparent ${
              homeGlobal ? "px-3 pt-3 sm:pr-7" : "-mb-[2px] pl-0 pr-4 pt-0 sm:pr-7"
            }`
      }`}
      animate={{ y: isHidden ? -120 : 0, opacity: isHidden ? 0 : 1 }}
      transition={{ duration: 0.36, ease: "easeOut" }}
      style={{ zoom: 1.25 }}
    >
      <div className={`relative w-full text-foreground ${isSimpleHomeNav ? "max-w-none" : "max-w-[920px]"}`}>
        <motion.div
          className={`relative z-10 flex items-center gap-3 overflow-x-auto transition-all duration-300 sm:gap-5 ${
            isSimpleHomeNav
              ? "min-h-12 rounded-none border-0 bg-transparent px-0 py-0 shadow-none"
              : "-mb-[2px] min-h-20 rounded-t-[2.1rem] border border-border/55 border-b-0 bg-secondary px-7 py-4 shadow-none sm:px-9"
          }`}
          animate={{ y: 0 }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <button
            type="button"
            onClick={() => onSelect("Home")}
            className="mr-2 shrink-0 font-display text-3xl font-black leading-none text-foreground transition-transform duration-300 hover:-translate-y-0.5 sm:mr-4"
          >
            Draftly.
          </button>
          <span className="h-6 w-px shrink-0 bg-button/30" />
          <nav className="flex min-w-max items-center gap-2 sm:gap-3">
            {navItems.map(label => {
              const active = activeTab === label;

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => onSelect(label)}
                  className={`group relative flex min-w-[7.25rem] justify-center rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_22px_rgba(207,157,123,0.28)] sm:px-5 ${
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
                  <span className="relative z-10">{label}</span>
                  {!active && <span className="absolute bottom-1.5 left-5 right-5 h-px scale-x-0 bg-button transition-transform duration-300 group-hover:scale-x-100" />}
                </button>
              );
            })}
          </nav>
        </motion.div>
      </div>

      <div className={`ml-auto hidden shrink-0 items-center gap-2 md:flex ${isSimpleHomeNav ? "pt-0" : "pt-4"}`}>
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
          className="flex min-w-[6.25rem] justify-center rounded-full border border-border/20 bg-button px-4 py-2.5 text-sm font-semibold text-button-text shadow-[0_10px_24px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:border-highlight"
          aria-label="Switch language"
        >
          {controls.languageLabel}
        </button>
        <button className="min-w-[8.5rem] rounded-full bg-button px-6 py-2.5 text-sm font-semibold text-button-text shadow-[0_10px_26px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_26px_rgba(207,157,123,0.32)]">
          {controls.loginLabel}
        </button>
      </div>
    </motion.header>
  );
}

function HomeSimpleNav({
  onSelect,
  controls,
  scrollContainerRef,
}: {
  onSelect: (tab: HeaderTab) => void;
  controls: FolderNavControls;
  scrollContainerRef: RefObject<HTMLElement>;
}) {
  const navItems: HeaderTab[] = ["Home", "Template", "Analysis", "Contact us"];
  const [isVisible, setIsVisible] = useState(false);

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

  return (
    <motion.header
      className="fixed left-0 right-0 top-0 z-50 flex items-center gap-4 bg-navbar/96 px-5 py-3 shadow-[0_14px_34px_rgba(12,21,25,0.10)] backdrop-blur-md sm:px-8"
      animate={{ y: isVisible ? 0 : -90, opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      style={{ pointerEvents: isVisible ? "auto" : "none", zoom: 1.25 }}
    >
      <button
        type="button"
        onClick={() => onSelect("Home")}
        className="mr-3 shrink-0 font-display text-3xl font-black leading-none text-foreground transition-transform duration-300 hover:-translate-y-0.5"
      >
        Draftly.
      </button>
      <span className="h-6 w-px shrink-0 bg-button/30" />
      <nav className="flex min-w-max items-center gap-2 sm:gap-3">
        {navItems.map(label => (
          <button
            key={label}
            type="button"
            onClick={() => onSelect(label)}
            className={`group relative flex min-w-[7.25rem] justify-center rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 sm:px-5 ${
              label === "Home" ? "text-button-text" : "text-foreground/82 hover:text-foreground"
            }`}
          >
            {label === "Home" && <span className="absolute inset-0 rounded-full bg-button" />}
            <span className="relative z-10">{label}</span>
          </button>
        ))}
      </nav>

      <div className="ml-auto hidden shrink-0 items-center gap-2 md:flex">
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
          className="flex min-w-[6.25rem] justify-center rounded-full border border-border/20 bg-button px-4 py-2.5 text-sm font-semibold text-button-text shadow-[0_10px_24px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:border-highlight"
          aria-label="Switch language"
        >
          {controls.languageLabel}
        </button>
        <button className="min-w-[8.5rem] rounded-full bg-button px-6 py-2.5 text-sm font-semibold text-button-text shadow-[0_10px_26px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_26px_rgba(207,157,123,0.32)]">
          {controls.loginLabel}
        </button>
      </div>
    </motion.header>
  );
}

function AnalysisStepper({ step }: { step: AnalysisStep }) {
  const currentIndex = STEP_LABELS.findIndex(item => item.key === step);

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
              {item.label}
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
}: {
  onBack: () => void;
  onTabSelect: (tab: HeaderTab) => void;
  navControls: FolderNavControls;
}) {
  const [step, setStep] = useState<AnalysisStep>("upload");
  const [isDragActive, setIsDragActive] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startProcessing = () => {
    setIsDragActive(false);
    setStep("processing");
  };

  useEffect(() => {
    if (step !== "processing") return;
    const timer = window.setTimeout(() => setStep("result"), 3000);
    return () => window.clearTimeout(timer);
  }, [step]);

  return (
    <section className="px-3 pt-3 pb-6 min-h-screen flex flex-col bg-background">
      <FolderTabs activeTab="Analysis" onSelect={onTabSelect} controls={navControls} />

      <motion.div
        className="relative flex-1 overflow-hidden rounded-b-[2rem] rounded-tr-[2rem] border border-border/70 bg-secondary shadow-[0_16px_70px_rgba(12,21,25,0.12)] dark:border-highlight/15 dark:bg-secondary dark:shadow-[0_18px_80px_rgba(0,0,0,0.34)]"
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
              aria-label="Back to homepage"
            >
              <ArrowLeft size={17} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
            </button>
            <span className="font-display text-2xl font-black text-foreground dark:text-foreground">Draftly.</span>
          </div>

          <div className="grid flex-1 gap-8 lg:grid-cols-[120px_minmax(0,1fr)]">
            <aside className="pt-1">
              <AnalysisStepper step={step} />
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
                    Анализ хийх хэсэг
                  </h1>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={event => {
                      if (event.target.files?.length) startProcessing();
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
                      startProcessing();
                    }}
                  >
                    <div className="absolute -inset-x-3 top-5 -z-10 h-full rounded-[2rem] border border-border/60 bg-background" />
                    <div className="absolute -inset-x-6 top-10 -z-20 h-full rounded-[2rem] border border-border/50 bg-border" />
                    <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-secondary text-accent shadow-sm">
                      <UploadCloud size={26} strokeWidth={1.7} />
                    </div>
                    <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.2em] text-accent">
                      UPLOAD & ORGANIZE DOCUMENT
                    </p>
                    <h2 className="mb-2 text-xl font-semibold text-foreground dark:text-foreground">Drop your documents here</h2>
                    <p className="mb-8 text-sm text-muted-foreground/68 dark:text-muted-foreground/62">PDF DOCX TXT up to 50MB</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-full bg-button px-8 py-3 text-sm font-semibold text-button-text shadow-[0_10px_24px_rgba(12,21,25,0.16)] transition-all duration-300 hover:-translate-y-1 hover:bg-accent hover:shadow-[0_14px_30px_rgba(114,75,57,0.22)]"
                    >
                      Browse Files
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
                    Анализ хийж байна
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
                    <h2 className="mb-3 text-xl font-semibold text-foreground dark:text-foreground">AI таны гэрээг шалгаж байна</h2>
                    <p className="mx-auto max-w-sm text-sm leading-6 text-muted-foreground/68 dark:text-muted-foreground/62">
                      Эрсдэл, дутуу нөхцөлүүд боловсруулагдаж байна
                    </p>
                  </motion.div>
                </motion.div>
              )}

              {step === "result" && (
                <AnalysisResult onFinish={() => setShowFinishModal(true)} />
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
              <h2 className="mb-3 font-display text-3xl font-bold text-foreground">Анализ дууссан</h2>
              <p className="mb-8 text-sm text-muted-foreground/72">Анализ хийсэн баримтыг хадгалах уу?</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onBack}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-button px-5 py-3 text-sm font-semibold text-button-text transition-transform duration-300 hover:scale-[1.03]"
                >
                  <Archive size={16} /> Archive
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-muted-foreground transition-transform duration-300 hover:scale-[1.03] hover:bg-secondary"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function AnalysisResult({ onFinish }: { onFinish: () => void }) {
  const cards = [
    (
      <div>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Risk Score</p>
            <p className="mt-2 text-4xl font-bold text-foreground dark:text-foreground">7.5/10</p>
          </div>
          <div className="relative h-16 w-16 rounded-full bg-background">
            <motion.div
              className="absolute inset-0 rounded-full border-[6px] border-accent"
              initial={{ clipPath: "inset(100% 0 0 0)" }}
              animate={{ clipPath: "inset(25% 0 0 0)" }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            />
          </div>
        </div>
        {["Scope of Work", "Payment Terms", "Confidentiality"].map(item => (
          <p key={item} className="mb-2 flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground/75">
            <Check size={15} className="text-accent" /> {item}
          </p>
        ))}
      </div>
    ),
    (
      <div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-accent">Missing Clauses</p>
        {["Termination missing", "Liability missing", "Payment delay condition missing"].map(item => (
          <p key={item} className="mb-3 text-sm text-muted-foreground/82 dark:text-muted-foreground/75">- {item}</p>
        ))}
      </div>
    ),
    (
      <div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-accent">AI Analysis Result</p>
        <motion.p
          className="overflow-hidden whitespace-nowrap text-sm leading-6 text-muted-foreground/82 dark:text-muted-foreground/75"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        >
          AI found moderate risks and several missing clauses.
        </motion.p>
      </div>
    ),
  ];

  return (
    <motion.div
      key="result"
      className="grid gap-8 pb-6 lg:grid-cols-[minmax(0,1fr)_380px]"
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -32 }}
      transition={{ duration: 0.38, ease: "easeOut" }}
    >
      <motion.div
        className="relative min-h-[560px] overflow-hidden rounded-[2rem] border border-border bg-card p-8 shadow-[0_24px_70px_rgba(12,21,25,0.12)] dark:border-highlight/20 dark:bg-card/80 dark:shadow-[0_24px_70px_rgba(0,0,0,0.28)]"
      >
        <div className="absolute inset-x-8 top-7 h-px bg-border/70" />
        <div className="h-full overflow-y-auto pr-3 text-left text-sm leading-7 text-muted-foreground/78 dark:text-muted-foreground/70">
          <h2 className="mb-7 text-2xl font-semibold text-foreground dark:text-foreground">Service Agreement Preview</h2>
          {[...Array(10)].map((_, index) => (
            <p key={index} className="mb-5">
              This agreement outlines scope, payment terms, confidentiality expectations, delivery dates,
              and review obligations between the parties. Draftly highlights clauses requiring legal review
              and identifies missing protections before execution.
            </p>
          ))}
        </div>
      </motion.div>

      <div className="flex flex-col gap-4">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            className="rounded-[1.5rem] border border-border bg-card/82 p-6 shadow-[0_16px_38px_rgba(12,21,25,0.08)] dark:border-highlight/20 dark:bg-background/52 dark:shadow-[0_16px_38px_rgba(0,0,0,0.22)]"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: index * 0.12 }}
          >
            {card}
          </motion.div>
        ))}

        <div className="mt-auto flex items-center justify-between gap-4 pt-3">
          <button
            type="button"
            onClick={onFinish}
            className="flex-1 rounded-full bg-button px-8 py-3.5 text-sm font-semibold text-button-text shadow-[0_12px_26px_rgba(12,21,25,0.16)] transition-all duration-300 hover:-translate-y-1 hover:bg-accent"
          >
            Хадгалах
          </button>
          <div className="flex gap-2">
            {[Archive, Download].map((Icon, index) => (
              <button
                key={index}
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-accent transition-all duration-300 hover:-translate-y-1 hover:bg-secondary dark:border-highlight/25 dark:bg-card/60 dark:text-highlight dark:hover:bg-card"
                aria-label={index === 0 ? "Archive" : "Download"}
              >
                <Icon size={17} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TemplateStepper({ step }: { step: TemplateStep }) {
  const currentIndex = TEMPLATE_STEPS.findIndex(item => item.key === step);

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
              {item.label}
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
  children,
}: {
  step: TemplateStep;
  onBackHome: () => void;
  onTabSelect: (tab: HeaderTab) => void;
  navControls: FolderNavControls;
  children: ReactNode;
}) {
  return (
    <section className="px-3 pt-3 pb-6 min-h-screen flex flex-col bg-background">
      <FolderTabs activeTab="Template" onSelect={onTabSelect} controls={navControls} />
      <div className="relative flex-1 overflow-hidden rounded-b-[2rem] rounded-tr-[2rem] border border-border/70 bg-secondary shadow-[0_16px_70px_rgba(12,21,25,0.12)] dark:border-highlight/15 dark:bg-secondary dark:shadow-[0_18px_80px_rgba(0,0,0,0.34)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(207,157,123,0.12),transparent_26%),radial-gradient(circle_at_82%_12%,rgba(216,198,186,0.20),transparent_24%)]" />
        <div className="relative z-10 flex min-h-[calc(100vh-7rem)] flex-col px-5 py-5 sm:px-8 lg:px-10">
          <div className="mb-8 flex items-center justify-between">
            <button
              type="button"
              onClick={onBackHome}
              className="group flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/60 text-foreground transition-all duration-300 hover:border-highlight hover:bg-secondary dark:border-highlight/25 dark:bg-card/70 dark:text-foreground dark:hover:bg-card"
              aria-label="Back to homepage"
            >
              <ArrowLeft size={17} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
            </button>
            <span className="font-display text-2xl font-black text-foreground dark:text-foreground">Draftly.</span>
          </div>
          <div className="grid flex-1 gap-8 lg:grid-cols-[140px_minmax(0,1fr)]">
            <aside className="pt-2">
              <TemplateStepper step={step} />
            </aside>
            <div className="relative min-h-[calc(100vh-13rem)] overflow-hidden rounded-[2rem]">
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TemplateWorkflow({
  onBackHome,
  onTabSelect,
  navControls,
}: {
  onBackHome: () => void;
  onTabSelect: (tab: HeaderTab) => void;
  navControls: FolderNavControls;
}) {
  const [step, setStep] = useState<TemplateStep>("template");
  const [expandedCategory, setExpandedCategory] = useState("Employment");
  const [selectedTemplate, setSelectedTemplate] = useState("Employment Agreement");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [stepDirection, setStepDirection] = useState(1);

  const filteredTemplates = TEMPLATE_CARDS.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()),
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
        <div className="pb-8">
          <div className="mb-10 text-center">
            <h1 className="font-display text-4xl font-bold text-foreground dark:text-foreground md:text-6xl">Choose your contract type.</h1>
            <p className="mt-3 text-sm text-muted-foreground/66 dark:text-muted-foreground/62">Choose and forget...</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(280px,420px)_1fr]">
            <motion.div
              className="relative min-h-[360px] rounded-[2rem] border border-border/25 bg-card p-8 text-foreground shadow-[0_28px_80px_rgba(0,0,0,0.26)]"
            >
              <div className="absolute -inset-x-3 top-7 -z-10 h-full rounded-[2rem] bg-background/70" />
              <FileText size={38} className="mb-10 text-accent" />
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">Featured Template</p>
              <h2 className="mb-4 text-3xl font-bold">{selectedTemplate}</h2>
              <p className="max-w-sm text-sm leading-6 text-muted-foreground/75">
                Premium AI-guided contract template with structured clauses, editable details, and document-ready output.
              </p>
            </motion.div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {TEMPLATE_CATEGORIES.map(category => {
                const expanded = expandedCategory === category.name;
                return (
                  <motion.button
                    key={category.name}
                    type="button"
                    onClick={() => setExpandedCategory(expanded ? "" : category.name)}
                    className="rounded-[1.4rem] border border-border/20 bg-card/80 p-5 text-left text-foreground shadow-[0_16px_38px_rgba(0,0,0,0.18)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-highlight/70"
                    layout
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{category.name}</span>
                      <FileText size={15} className="text-highlight" />
                    </div>
                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          className="mt-4 space-y-2 overflow-hidden text-sm text-muted-foreground/70"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {category.items.map(item => (
                            <p key={item}>- {item}</p>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="my-8 flex justify-center">
            <div className={`group flex items-center rounded-full border border-border/25 bg-secondary/90 px-4 py-3 text-foreground transition-all duration-300 ${searchOpen ? "w-full max-w-xl" : "w-64"}`}>
              <Search size={17} className="mr-3 text-highlight transition-transform duration-300 group-focus-within:rotate-12" />
              <input
                value={searchTerm}
                onFocus={() => setSearchOpen(true)}
                onChange={event => setSearchTerm(event.target.value)}
                placeholder="Search templates..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/45"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTemplates.map(card => (
              <button
                key={card.name}
                type="button"
                onClick={() => setSelectedTemplate(card.name)}
                className={`rounded-[1.5rem] border bg-card/80 p-6 text-left text-foreground shadow-[0_16px_38px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 ${
                  selectedTemplate === card.name ? "border-highlight" : "border-border/18"
                }`}
              >
                <FileText size={22} className="mb-5 text-highlight" />
                <h3 className="mb-2 text-lg font-semibold">{card.name}</h3>
                <p className="text-sm leading-6 text-muted-foreground/62">{card.desc}</p>
              </button>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <CoffeeButton onClick={nextStep}>Continue</CoffeeButton>
          </div>
        </div>
      );
    }

    if (step === "details") return <TemplateDetails onBack={previousStep} onContinue={nextStep} />;
    if (step === "verification") return <TemplateVerification onBack={previousStep} onContinue={nextStep} />;
    if (step === "payment") return <TemplatePayment onBack={previousStep} onContinue={nextStep} />;
    return <TemplateResult onBack={previousStep} onFinish={() => setShowConfirm(true)} />;
  };

  return (
    <TemplateShell step={step} onBackHome={onBackHome} onTabSelect={onTabSelect} navControls={navControls}>
      <AnimatePresence custom={stepDirection} initial={false}>
        <motion.div
          key={step}
          custom={stepDirection}
          variants={stackedStepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 overflow-y-auto rounded-t-[2rem] bg-secondary p-1 shadow-[0_-15px_50px_rgba(0,0,0,0.15)]"
          style={{ borderRadius: "32px 32px 0 0" }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

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
              <h2 className="mb-8 font-display text-3xl font-bold text-foreground">Та итгэлтэй байна уу?</h2>
              <div className="flex gap-3">
                <button onClick={onBackHome} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-button px-5 py-3 text-sm font-semibold text-button-text transition-transform duration-300 hover:scale-[1.03]">
                  <Archive size={16} /> Archive
                </button>
                <button onClick={onBackHome} className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-muted-foreground transition-transform duration-300 hover:scale-[1.03]">
                  <Trash2 size={16} /> Delete
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

function StepActions({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  return (
    <div className="mt-8 flex items-center justify-between gap-4">
      <button
        type="button"
        onClick={onBack}
        className="group flex items-center gap-2 rounded-full border border-border/35 bg-secondary/70 px-6 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:border-highlight hover:bg-card"
      >
        <ArrowLeft size={15} className="transition-transform duration-300 group-hover:-translate-x-0.5" /> Back
      </button>
      <CoffeeButton onClick={onContinue}>Continue</CoffeeButton>
    </div>
  );
}

function TemplateDetails({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  return (
    <motion.div
      key="details"
      className="flex flex-col"
    >
      <h1 className="mb-12 text-center font-display text-4xl font-bold text-foreground dark:text-foreground md:text-6xl">Details Input</h1>
      <div className="grid flex-1 gap-6 lg:grid-cols-2">
        {["Text Area 1", "Text Area 2"].map(label => (
          <textarea
            key={label}
            placeholder={label}
            className="min-h-[420px] resize-none rounded-[2rem] border border-border/24 bg-secondary/80 p-8 text-foreground shadow-[0_22px_60px_rgba(0,0,0,0.22)] outline-none transition-all duration-300 placeholder:text-muted-foreground/40 focus:border-highlight focus:shadow-[0_0_0_5px_rgba(207,157,123,0.12),0_24px_70px_rgba(0,0,0,0.28)]"
          />
        ))}
      </div>
      <StepActions onBack={onBack} onContinue={onContinue} />
    </motion.div>
  );
}

function TemplateVerification({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
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
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-highlight">Verification</p>
          <h1 className="mb-8 font-display text-4xl font-bold">Entered information preview</h1>
          <p className="leading-8 text-muted-foreground/62">
            Placeholder text only. The information entered in the previous step will appear here for review before payment.
          </p>
        </motion.div>
      </div>
      <StepActions onBack={onBack} onContinue={onContinue} />
    </motion.div>
  );
}

function TemplatePayment({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  return (
    <motion.div
      key="payment"
      className="flex flex-col"
    >
      <div className="flex flex-1 items-center justify-center">
        <motion.div
          className="w-full max-w-md rounded-[2rem] border border-border/25 bg-secondary p-10 text-center text-foreground shadow-[0_28px_80px_rgba(0,0,0,0.28)]"
          animate={{ scale: [1, 1.015, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            className="mx-auto mb-8 flex h-56 w-56 items-center justify-center rounded-[1.5rem] border border-border bg-card shadow-inner"
            animate={{ boxShadow: ["0 0 0 rgba(207,157,123,0)", "0 0 34px rgba(207,157,123,0.28)", "0 0 0 rgba(207,157,123,0)"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <QrCode size={132} strokeWidth={1.25} className="text-foreground" />
          </motion.div>
          <button
            type="button"
            className="rounded-full bg-button px-8 py-3 text-sm font-semibold text-button-text transition-transform duration-300 hover:scale-[1.04] hover:bg-accent"
          >
            Check Payment
          </button>
        </motion.div>
      </div>
      <StepActions onBack={onBack} onContinue={onContinue} />
    </motion.div>
  );
}

function TemplateResult({ onBack, onFinish }: { onBack: () => void; onFinish: () => void }) {
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
          <h2 className="mb-7 text-2xl font-semibold text-foreground">Generated Document Preview</h2>
          {[...Array(11)].map((_, index) => (
            <p key={index} className="mb-5">
              Draftly generated document content preview. Clauses, party information, obligations, and legal terms will be assembled into this paper-style document.
            </p>
          ))}
        </div>
      </motion.div>

      <div className="flex flex-col gap-4">
        {[
          ["Risk Score 7.5/10", "Moderate risk profile with several clauses requiring review."],
          ["Missing Clauses", "Termination, liability, and payment delay condition missing."],
          ["AI Analysis Result", "AI found moderate risks and several missing clauses."],
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
              <button key={label} type="button" className="flex h-11 min-w-16 items-center justify-center rounded-full border border-border/25 bg-secondary/80 px-4 text-xs font-semibold text-foreground transition-all duration-300 hover:-translate-y-1 hover:border-highlight">
                {label}
              </button>
            ))}
            {[Archive, Trash2].map((Icon, index) => (
              <button key={index} type="button" className="flex h-11 w-11 items-center justify-center rounded-full border border-border/25 bg-secondary/80 text-highlight transition-all duration-300 hover:-translate-y-1 hover:border-highlight">
                <Icon size={16} />
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-4">
            <button type="button" onClick={onBack} className="rounded-full border border-border/35 bg-secondary/70 px-6 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:bg-card">
              Back
            </button>
            <button type="button" onClick={onFinish} className="flex-1 rounded-full bg-button px-8 py-3.5 text-sm font-semibold text-button-text shadow-[0_0_0_rgba(207,157,123,0)] transition-all duration-300 hover:scale-[1.02] hover:bg-accent hover:shadow-[0_0_30px_rgba(207,157,123,0.28)]">
              Үүсгэх
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function App() {
  const [locale, setLocale] = useState<Locale>("mn");
  const [isDark, setIsDark] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [page, setPage] = useState<AppPage>("home");
  const [pageDirection, setPageDirection] = useState(1);
  const [activeFeature, setActiveFeature] = useState(1);
  const [circleTilt, setCircleTilt] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
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

  const openHome = () => {
    setPageDirection(-1);
    setPage("home");
    window.setTimeout(() => {
      homeScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, 80);
  };

  const openAnalysis = () => {
    setPageDirection(1);
    setPage("analysis");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openTemplate = () => {
    setPageDirection(1);
    setPage("template");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollHomeTo = (ref: RefObject<HTMLElement>) => {
    setPageDirection(-1);
    setPage("home");
    window.setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    loginLabel: content.login,
    onThemeToggle: () => setIsDark(d => !d),
    onLanguageToggle: () => setLocale(current => current === "mn" ? "en" : "mn"),
  };

  return (
    <div className="relative h-screen overflow-hidden bg-background transition-colors duration-700">
      <AnimatePresence>
        {showSplash && <OpeningSplash onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>
      <AnimatePresence custom={pageDirection} initial={false}>
        {page === "template" ? (
          <motion.div
            key="template"
            custom={pageDirection}
            variants={stackedPageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 overflow-hidden rounded-t-[2rem] shadow-[0_-15px_50px_rgba(0,0,0,0.15)]"
            style={{ borderRadius: "32px 32px 0 0" }}
          >
            <TemplateWorkflow onBackHome={openHome} onTabSelect={handleTabSelect} navControls={navControls} />
          </motion.div>
        ) : page === "analysis" ? (
          <motion.div
            key="analysis"
            custom={pageDirection}
            variants={stackedPageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 overflow-hidden rounded-t-[2rem] shadow-[0_-15px_50px_rgba(0,0,0,0.15)]"
            style={{ borderRadius: "32px 32px 0 0" }}
          >
            <AnalysisWorkflow onBack={openHome} onTabSelect={handleTabSelect} navControls={navControls} />
          </motion.div>
        ) : (
          <motion.div
            key="home"
            ref={homeScrollRef}
            custom={pageDirection}
            variants={stackedPageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 overflow-y-auto scroll-smooth bg-background"
          >
            <HomeSimpleNav onSelect={handleTabSelect} controls={navControls} scrollContainerRef={homeScrollRef} />

      {/* ═══════════════════════════════════════
          PAGE 1 — HERO
          ═══════════════════════════════════════ */}
      <motion.section
        className="sticky top-0 min-h-screen overflow-hidden rounded-t-[2rem] bg-secondary px-3 pb-6 pt-3 shadow-[0_-18px_55px_rgba(0,0,0,0.10)] flex flex-col"
        style={{ zIndex: 1 }}
        variants={SECTION_REVEAL}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.16 }}
      >
        <FolderTabs activeTab="Home" onSelect={handleTabSelect} controls={navControls} />
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

      {/* ═══════════════════════════════════════
          PAGE 2 — WHAT DO WE DO?
          ═══════════════════════════════════════ */}
      <motion.section
        className="sticky top-0 min-h-screen overflow-hidden rounded-t-[2rem] bg-background py-20 shadow-[0_-18px_55px_rgba(0,0,0,0.12)] md:py-24"
        style={{ zIndex: 2 }}
        ref={featuresRef.ref}
        variants={SECTION_REVEAL}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.14 }}
      >
        <div
          className="flex min-h-[calc(100vh-9rem)] items-center"
          onMouseMove={event => {
            const rect = event.currentTarget.getBoundingClientRect();
            const offset = (event.clientX - rect.left) / rect.width - 0.5;
            setCircleTilt(offset * 10);
          }}
          onMouseLeave={() => setCircleTilt(0)}
        >
          {/* ── Circle carousel ── */}
          <motion.div className="relative -ml-[3vw] aspect-square w-[41vw] min-w-[390px] max-w-[650px] flex-shrink-0 md:-ml-[2vw]" variants={REVEAL_ITEM}>

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

          {/* ── Feature content ── */}
          <motion.div className="flex-1 pl-10 pr-8 md:pl-16 md:pr-24" variants={REVEAL_ITEM}>
            <div className="mb-7 inline-flex rounded-full border border-highlight/24 bg-secondary px-7 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
              <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
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
                <h3 className="mb-7 font-display text-6xl font-bold leading-none text-foreground md:text-7xl">
                  {ORBIT_FEATURES[activeFeature].title}
                </h3>
                <p className="max-w-sm text-lg leading-relaxed text-foreground/68">
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

      {/* ═══════════════════════════════════════
          PAGE 3 — TEMPLATE FLOW
          ═══════════════════════════════════════ */}
      <motion.section
        className="sticky top-0 min-h-screen overflow-hidden rounded-t-[2rem] bg-secondary py-28 shadow-[0_-18px_55px_rgba(0,0,0,0.12)] flex items-center"
        style={{ zIndex: 3 }}
        ref={templateRef.ref}
        variants={SECTION_REVEAL}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.16 }}
      >
        <div className="max-w-screen-xl mx-auto px-8 flex items-center gap-16 md:gap-24">

          {/* ── 3D screen card ── */}
          <motion.div
            className="flex-shrink-0 w-72 md:w-80"
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

          {/* ── Text ── */}
          <motion.div
            className="flex-1"
            variants={REVEAL_ITEM}
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground leading-[1.15] mb-6">
              {content.templateFlow.titleLines.map((line, index) => (
                <span key={line}>
                  {line}
                  {index < content.templateFlow.titleLines.length - 1 && <br />}
                </span>
              ))}
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-md mb-10 text-base">
              {content.templateFlow.description}
            </p>
            <button className="flex min-w-[10rem] items-center justify-center gap-2 bg-foreground text-background px-7 py-3.5 rounded-full text-sm font-medium hover:opacity-85 active:scale-95 transition-all duration-200">
              {content.templateFlow.cta} <ArrowRight size={14} />
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════
          PAGE 4 — UPLOAD & ANALYSE
          ═══════════════════════════════════════ */}
      <motion.section
        className="sticky top-0 min-h-screen overflow-hidden rounded-t-[2rem] bg-secondary py-28 shadow-[0_-18px_55px_rgba(0,0,0,0.12)] flex items-center"
        style={{ zIndex: 4 }}
        ref={uploadRef.ref}
        variants={SECTION_REVEAL}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.16 }}
      >
        <div className="max-w-screen-xl mx-auto px-8 flex items-start gap-16 md:gap-24">

          {/* ── Analysis labels ── */}
          <div className="flex-1 pt-4">
            {content.upload.labels.map((text, i) => (
              <motion.div
                key={text}
                className="py-9 border-b border-border"
                variants={REVEAL_ITEM}
                transition={{ duration: 0.65, delay: i * 0.1, ease: "easeOut" }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                    {text}
                  </h3>
                  <span className="font-mono text-sm text-muted-foreground/50">0{i + 1}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Upload card ── */}
          <motion.div
            className="flex-shrink-0 w-72 md:w-80 pt-4"
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

      {/* ═══════════════════════════════════════
          PAGE 5 — FOOTER
          ═══════════════════════════════════════ */}
      <motion.footer
        className="sticky top-0 min-h-screen overflow-hidden rounded-t-[2rem] flex items-center bg-secondary border-t border-border shadow-[0_-18px_55px_rgba(0,0,0,0.12)]"
        style={{ zIndex: 5 }}
        ref={footerRef.ref}
        variants={SECTION_REVEAL}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.16 }}
      >
        <div className="max-w-screen-xl mx-auto px-8 py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">

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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



