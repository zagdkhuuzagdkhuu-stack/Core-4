import { useState, useEffect, useRef } from "react";
import type { ReactNode, RefObject } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText, BarChart3, ArrowRight, ArrowLeft, Twitter, Linkedin,
  Instagram, Facebook, Phone, Mail, MapPin, Sun, Moon, UploadCloud,
  LoaderCircle, Check, Archive, Download, Trash2, House, Search, QrCode,
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
      duration: 0.8,
      ease: "easeOut",
      staggerChildren: 0.12,
      when: "beforeChildren",
    },
  },
};

const REVEAL_ITEM = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const HEADER_TABS = [
  { label: "Home", Icon: House, tone: "#F7F1EC" },
  { label: "Template", Icon: FileText, tone: "#F7F1EC" },
  { label: "Analysis", Icon: BarChart3, tone: "#D8C6BA" },
  { label: "Contact us", Icon: Mail, tone: "#CF9D7B" },
] satisfies { label: HeaderTab; Icon: typeof FileText; tone: string }[];

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

function OpeningSplash({ onComplete }: { onComplete: () => void }) {
  const letters = "Draftly.".split("");

  useEffect(() => {
    const timer = window.setTimeout(onComplete, 2850);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0C1519]"
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 1, 0] }}
      transition={{ duration: 2.85, times: [0, 0.86, 1], ease: "easeInOut" }}
      aria-hidden="true"
    >
      <motion.div
        className="font-display text-6xl font-black tracking-normal text-[#F7F1EC] md:text-7xl"
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
          ? "bg-[#F7F1EC]/96 px-5 py-3 shadow-[0_14px_34px_rgba(12,21,25,0.10)] backdrop-blur-md sm:px-8"
          : `bg-transparent ${
              homeGlobal ? "px-3 pt-3 sm:pr-7" : "-mb-[2px] pl-0 pr-4 pt-0 sm:pr-7"
            }`
      }`}
      animate={{ y: isHidden ? -120 : 0, opacity: isHidden ? 0 : 1 }}
      transition={{ duration: 0.36, ease: "easeOut" }}
    >
      <div className={`relative w-full text-[#0C1519] ${isSimpleHomeNav ? "max-w-none" : "max-w-[920px]"}`}>
        <motion.div
          className={`relative z-10 flex items-center gap-3 overflow-x-auto transition-all duration-300 sm:gap-5 ${
            isSimpleHomeNav
              ? "min-h-12 rounded-none border-0 bg-transparent px-0 py-0 shadow-none"
              : "-mb-[2px] min-h-20 rounded-t-[2.1rem] border border-[#D8C6BA]/55 border-b-0 bg-[#F7F1EC] px-7 py-4 shadow-none sm:px-9"
          }`}
          animate={{ y: 0 }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <button
            type="button"
            onClick={() => onSelect("Home")}
            className="mr-2 shrink-0 font-display text-3xl font-black leading-none text-[#0C1519] transition-transform duration-300 hover:-translate-y-0.5 sm:mr-4"
          >
            Draftly.
          </button>
          <span className="h-6 w-px shrink-0 bg-[#724B39]/30" />
          <nav className="flex min-w-max items-center gap-2 sm:gap-3">
            {navItems.map(label => {
              const active = activeTab === label;

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => onSelect(label)}
                  className={`group relative flex min-w-[7.25rem] justify-center rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_22px_rgba(207,157,123,0.28)] sm:px-5 ${
                    active ? "text-[#F7F1EC]" : "text-[#0C1519]/82 hover:text-[#0C1519]"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="folder-nav-active-pill"
                      className="absolute inset-0 rounded-full bg-[#724B39]"
                      transition={{ duration: 0.32, ease: "easeOut" }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                  {!active && <span className="absolute bottom-1.5 left-5 right-5 h-px scale-x-0 bg-[#724B39] transition-transform duration-300 group-hover:scale-x-100" />}
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
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F7F1EC]/20 bg-[#162127] text-[#F7F1EC] shadow-[0_10px_24px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#CF9D7B]"
          aria-label="Toggle dark mode"
        >
          {controls.isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <button
          type="button"
          onClick={controls.onLanguageToggle}
          className="flex min-w-[6.25rem] justify-center rounded-full border border-[#F7F1EC]/20 bg-[#162127] px-4 py-2.5 text-sm font-semibold text-[#F7F1EC] shadow-[0_10px_24px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#CF9D7B]"
          aria-label="Switch language"
        >
          🌐 {controls.languageLabel}
        </button>
        <button className="min-w-[8.5rem] rounded-full bg-[#0C1519] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_26px_rgba(207,157,123,0.32)]">
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
      className="fixed left-0 right-0 top-0 z-50 flex items-center gap-4 bg-[#F7F1EC]/96 px-5 py-3 shadow-[0_14px_34px_rgba(12,21,25,0.10)] backdrop-blur-md sm:px-8"
      animate={{ y: isVisible ? 0 : -90, opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      style={{ pointerEvents: isVisible ? "auto" : "none" }}
    >
      <button
        type="button"
        onClick={() => onSelect("Home")}
        className="mr-3 shrink-0 font-display text-3xl font-black leading-none text-[#0C1519] transition-transform duration-300 hover:-translate-y-0.5"
      >
        Draftly.
      </button>
      <span className="h-6 w-px shrink-0 bg-[#724B39]/30" />
      <nav className="flex min-w-max items-center gap-2 sm:gap-3">
        {navItems.map(label => (
          <button
            key={label}
            type="button"
            onClick={() => onSelect(label)}
            className={`group relative flex min-w-[7.25rem] justify-center rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 sm:px-5 ${
              label === "Home" ? "text-[#F7F1EC]" : "text-[#0C1519]/82 hover:text-[#0C1519]"
            }`}
          >
            {label === "Home" && <span className="absolute inset-0 rounded-full bg-[#724B39]" />}
            <span className="relative z-10">{label}</span>
          </button>
        ))}
      </nav>

      <div className="ml-auto hidden shrink-0 items-center gap-2 md:flex">
        <button
          type="button"
          onClick={controls.onThemeToggle}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F7F1EC]/20 bg-[#162127] text-[#F7F1EC] shadow-[0_10px_24px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#CF9D7B]"
          aria-label="Toggle dark mode"
        >
          {controls.isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <button
          type="button"
          onClick={controls.onLanguageToggle}
          className="flex min-w-[6.25rem] justify-center rounded-full border border-[#F7F1EC]/20 bg-[#162127] px-4 py-2.5 text-sm font-semibold text-[#F7F1EC] shadow-[0_10px_24px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#CF9D7B]"
          aria-label="Switch language"
        >
          🌐 {controls.languageLabel}
        </button>
        <button className="min-w-[8.5rem] rounded-full bg-[#0C1519] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_26px_rgba(207,157,123,0.32)]">
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
        const color = active ? "#0C1519" : completed ? "#724B39" : "#D8C6BA";

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
            <span className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-[#3A3534]/70 dark:text-[#F7F1EC]/70 lg:block">
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
    <section className="px-3 pt-3 pb-6 min-h-screen flex flex-col bg-[#EFE5DC] dark:bg-[#0C1519]">
      <FolderTabs activeTab="Analysis" onSelect={onTabSelect} controls={navControls} />

      <motion.div
        className="relative flex-1 overflow-hidden rounded-b-[2rem] rounded-tr-[2rem] border border-[#D8C6BA]/70 bg-[#FFFDF9] shadow-[0_16px_70px_rgba(12,21,25,0.12)] dark:border-[#CF9D7B]/15 dark:bg-[#162127] dark:shadow-[0_18px_80px_rgba(0,0,0,0.34)]"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(207,157,123,0.14),transparent_26%),radial-gradient(circle_at_82%_14%,rgba(216,198,186,0.22),transparent_24%)]" />
        {step === "processing" && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {[...Array(14)].map((_, index) => (
              <motion.span
                key={index}
                className="absolute h-1 w-1 rounded-full bg-[#CF9D7B]/45"
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
              className="group flex h-10 w-10 items-center justify-center rounded-full border border-[#D8C6BA] bg-white/60 text-[#0C1519] transition-all duration-300 hover:border-[#CF9D7B] hover:bg-[#F7F1EC] dark:border-[#CF9D7B]/25 dark:bg-[#0C1519]/70 dark:text-[#F7F1EC] dark:hover:bg-[#3A3534]"
              aria-label="Back to homepage"
            >
              <ArrowLeft size={17} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
            </button>
            <span className="font-display text-2xl font-black text-[#0C1519] dark:text-[#F7F1EC]">Draftly.</span>
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
                  <h1 className="mb-12 font-display text-4xl font-bold text-[#0C1519] dark:text-[#F7F1EC] md:text-5xl">
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
                    className={`relative w-full max-w-xl rounded-[2rem] border-2 border-dashed bg-white px-8 py-14 shadow-[0_28px_70px_rgba(12,21,25,0.12)] transition-all duration-300 dark:bg-[#0C1519]/58 dark:shadow-[0_28px_70px_rgba(0,0,0,0.24)] ${
                      isDragActive
                        ? "scale-[1.02] border-[#CF9D7B] shadow-[0_0_0_6px_rgba(207,157,123,0.12),0_32px_80px_rgba(12,21,25,0.15)]"
                        : "border-[#D8C6BA]"
                    }`}
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    onDragEnter={() => setIsDragActive(true)}
                    onDragLeave={() => setIsDragActive(false)}
                    onDragOver={event => event.preventDefault()}
                    onDrop={event => {
                      event.preventDefault();
                      startProcessing();
                    }}
                  >
                    <div className="absolute -inset-x-3 top-5 -z-10 h-full rounded-[2rem] border border-[#D8C6BA]/60 bg-[#EFE5DC]" />
                    <div className="absolute -inset-x-6 top-10 -z-20 h-full rounded-[2rem] border border-[#D8C6BA]/50 bg-[#D8C6BA]" />
                    <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D8C6BA] bg-[#F7F1EC] text-[#724B39] shadow-sm">
                      <UploadCloud size={26} strokeWidth={1.7} />
                    </div>
                    <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.2em] text-[#724B39]">
                      UPLOAD & ORGANIZE DOCUMENT
                    </p>
                    <h2 className="mb-2 text-xl font-semibold text-[#0C1519] dark:text-[#F7F1EC]">Drop your documents here</h2>
                    <p className="mb-8 text-sm text-[#3A3534]/68 dark:text-[#EFE5DC]/62">PDF DOCX TXT up to 50MB</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-full bg-[#0C1519] px-8 py-3 text-sm font-semibold text-[#F7F1EC] shadow-[0_10px_24px_rgba(12,21,25,0.16)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#724B39] hover:shadow-[0_14px_30px_rgba(114,75,57,0.22)]"
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
                  <h1 className="mb-12 font-display text-4xl font-bold text-[#0C1519] dark:text-[#F7F1EC] md:text-5xl">
                    Анализ хийж байна
                  </h1>
                  <motion.div
                    className="relative w-full max-w-lg rounded-[2rem] border border-[#D8C6BA] bg-white px-8 py-16 shadow-[0_30px_80px_rgba(12,21,25,0.14)] dark:border-[#CF9D7B]/20 dark:bg-[#0C1519]/58 dark:shadow-[0_30px_80px_rgba(0,0,0,0.28)]"
                    animate={{ y: [0, -8, 0], scale: [1, 1.01, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <motion.div
                      className="absolute -inset-x-4 top-6 -z-10 h-full rounded-[2rem] border border-[#D8C6BA]/70 bg-[#EFE5DC]"
                      animate={{ y: [0, -9, 0] }}
                      transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                      className="absolute -inset-x-8 top-12 -z-20 h-full rounded-[2rem] border border-[#D8C6BA]/60 bg-[#D8C6BA]"
                      animate={{ y: [0, -13, 0] }}
                      transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <LoaderCircle className="mx-auto mb-8 h-16 w-16 animate-spin text-[#724B39]" strokeWidth={1.5} />
                    <h2 className="mb-3 text-xl font-semibold text-[#0C1519] dark:text-[#F7F1EC]">AI таны гэрээг шалгаж байна</h2>
                    <p className="mx-auto max-w-sm text-sm leading-6 text-[#3A3534]/68 dark:text-[#EFE5DC]/62">
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0C1519]/35 px-5 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md rounded-[2rem] border border-[#D8C6BA] bg-[#FFFDF9] p-8 text-center shadow-[0_30px_90px_rgba(12,21,25,0.28)]"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="mb-3 font-display text-3xl font-bold text-[#0C1519]">Анализ дууссан</h2>
              <p className="mb-8 text-sm text-[#3A3534]/72">Анализ хийсэн баримтыг хадгалах уу?</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onBack}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#0C1519] px-5 py-3 text-sm font-semibold text-[#F7F1EC] transition-transform duration-300 hover:scale-[1.03]"
                >
                  <Archive size={16} /> Archive
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[#D8C6BA] bg-white px-5 py-3 text-sm font-semibold text-[#3A3534] transition-transform duration-300 hover:scale-[1.03] hover:bg-[#F7F1EC]"
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
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#724B39]">Risk Score</p>
            <p className="mt-2 text-4xl font-bold text-[#0C1519] dark:text-[#F7F1EC]">7.5/10</p>
          </div>
          <div className="relative h-16 w-16 rounded-full bg-[#EFE5DC]">
            <motion.div
              className="absolute inset-0 rounded-full border-[6px] border-[#724B39]"
              initial={{ clipPath: "inset(100% 0 0 0)" }}
              animate={{ clipPath: "inset(25% 0 0 0)" }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            />
          </div>
        </div>
        {["Scope of Work", "Payment Terms", "Confidentiality"].map(item => (
          <p key={item} className="mb-2 flex items-center gap-2 text-sm text-[#3A3534] dark:text-[#EFE5DC]/75">
            <Check size={15} className="text-[#724B39]" /> {item}
          </p>
        ))}
      </div>
    ),
    (
      <div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#724B39]">Missing Clauses</p>
        {["Termination missing", "Liability missing", "Payment delay condition missing"].map(item => (
          <p key={item} className="mb-3 text-sm text-[#3A3534]/82 dark:text-[#EFE5DC]/75">- {item}</p>
        ))}
      </div>
    ),
    (
      <div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#724B39]">AI Analysis Result</p>
        <motion.p
          className="overflow-hidden whitespace-nowrap text-sm leading-6 text-[#3A3534]/82 dark:text-[#EFE5DC]/75"
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
        className="relative min-h-[560px] overflow-hidden rounded-[2rem] border border-[#D8C6BA] bg-white p-8 shadow-[0_24px_70px_rgba(12,21,25,0.12)] dark:border-[#CF9D7B]/20 dark:bg-[#0C1519]/58 dark:shadow-[0_24px_70px_rgba(0,0,0,0.28)]"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-x-8 top-7 h-px bg-[#D8C6BA]/70" />
        <div className="h-full overflow-y-auto pr-3 text-left text-sm leading-7 text-[#3A3534]/78 dark:text-[#EFE5DC]/70">
          <h2 className="mb-7 text-2xl font-semibold text-[#0C1519] dark:text-[#F7F1EC]">Service Agreement Preview</h2>
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
            className="rounded-[1.5rem] border border-[#D8C6BA] bg-white/82 p-6 shadow-[0_16px_38px_rgba(12,21,25,0.08)] dark:border-[#CF9D7B]/20 dark:bg-[#0C1519]/52 dark:shadow-[0_16px_38px_rgba(0,0,0,0.22)]"
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
            className="flex-1 rounded-full bg-[#0C1519] px-8 py-3.5 text-sm font-semibold text-[#F7F1EC] shadow-[0_12px_26px_rgba(12,21,25,0.16)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#724B39]"
          >
            Дуусгах
          </button>
          <div className="flex gap-2">
            {[Archive, Download].map((Icon, index) => (
              <button
                key={index}
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D8C6BA] bg-white text-[#724B39] transition-all duration-300 hover:-translate-y-1 hover:bg-[#F7F1EC] dark:border-[#CF9D7B]/25 dark:bg-[#0C1519]/60 dark:text-[#CF9D7B] dark:hover:bg-[#3A3534]"
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
        const color = active ? "#F7F1EC" : completed ? "#CF9D7B" : "#724B39";

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
            <span className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-[#3A3534]/70 dark:text-[#F7F1EC]/70 lg:block">
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
    <section className="px-3 pt-3 pb-6 min-h-screen flex flex-col bg-[#EFE5DC] dark:bg-[#0C1519]">
      <FolderTabs activeTab="Template" onSelect={onTabSelect} controls={navControls} />
      <div className="relative flex-1 overflow-hidden rounded-b-[2rem] rounded-tr-[2rem] border border-[#D8C6BA]/70 bg-[#FFFDF9] shadow-[0_16px_70px_rgba(12,21,25,0.12)] dark:border-[#CF9D7B]/15 dark:bg-[#162127] dark:shadow-[0_18px_80px_rgba(0,0,0,0.34)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(207,157,123,0.12),transparent_26%),radial-gradient(circle_at_82%_12%,rgba(216,198,186,0.20),transparent_24%)]" />
        <div className="relative z-10 flex min-h-[calc(100vh-7rem)] flex-col px-5 py-5 sm:px-8 lg:px-10">
          <div className="mb-8 flex items-center justify-between">
            <button
              type="button"
              onClick={onBackHome}
              className="group flex h-10 w-10 items-center justify-center rounded-full border border-[#D8C6BA] bg-white/60 text-[#0C1519] transition-all duration-300 hover:border-[#CF9D7B] hover:bg-[#F7F1EC] dark:border-[#CF9D7B]/25 dark:bg-[#0C1519]/70 dark:text-[#F7F1EC] dark:hover:bg-[#3A3534]"
              aria-label="Back to homepage"
            >
              <ArrowLeft size={17} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
            </button>
            <span className="font-display text-2xl font-black text-[#0C1519] dark:text-[#F7F1EC]">Draftly.</span>
          </div>
          <div className="grid flex-1 gap-8 lg:grid-cols-[140px_minmax(0,1fr)]">
            <aside className="pt-2">
              <TemplateStepper step={step} />
            </aside>
            {children}
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

  const filteredTemplates = TEMPLATE_CARDS.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const nextStep = () => {
    const current = TEMPLATE_STEPS.findIndex(item => item.key === step);
    const next = TEMPLATE_STEPS[Math.min(current + 1, TEMPLATE_STEPS.length - 1)];
    setStep(next.key);
  };

  const previousStep = () => {
    const current = TEMPLATE_STEPS.findIndex(item => item.key === step);
    const previous = TEMPLATE_STEPS[Math.max(current - 1, 0)];
    setStep(previous.key);
  };

  return (
    <TemplateShell step={step} onBackHome={onBackHome} onTabSelect={onTabSelect} navControls={navControls}>
      <AnimatePresence mode="wait">
        {step === "template" && (
          <motion.div
            key="template-select"
            className="pb-8"
            initial={{ opacity: 0, x: 36 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -36 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="mb-10 text-center">
              <h1 className="font-display text-4xl font-bold text-[#0C1519] dark:text-[#F7F1EC] md:text-6xl">Choose your contract type.</h1>
              <p className="mt-3 text-sm text-[#3A3534]/66 dark:text-[#EFE5DC]/62">Choose and forget...</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(280px,420px)_1fr]">
              <motion.div
                className="relative min-h-[360px] rounded-[2rem] border border-[#D8C6BA]/25 bg-[#F7F1EC] p-8 text-[#0C1519] shadow-[0_28px_80px_rgba(0,0,0,0.26)]"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="absolute -inset-x-3 top-7 -z-10 h-full rounded-[2rem] bg-[#EFE5DC]/70" />
                <FileText size={38} className="mb-10 text-[#724B39]" />
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#724B39]">Featured Template</p>
                <h2 className="mb-4 text-3xl font-bold">{selectedTemplate}</h2>
                <p className="max-w-sm text-sm leading-6 text-[#3A3534]/75">
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
                      className="rounded-[1.4rem] border border-[#D8C6BA]/20 bg-[#162127]/80 p-5 text-left text-[#F7F1EC] shadow-[0_16px_38px_rgba(0,0,0,0.18)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-[#CF9D7B]/70"
                      layout
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold">{category.name}</span>
                        <FileText size={15} className="text-[#CF9D7B]" />
                      </div>
                      <AnimatePresence>
                        {expanded && (
                          <motion.div
                            className="mt-4 space-y-2 overflow-hidden text-sm text-[#EFE5DC]/70"
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
              <div className={`group flex items-center rounded-full border border-[#D8C6BA]/25 bg-[#162127]/90 px-4 py-3 text-[#F7F1EC] transition-all duration-300 ${searchOpen ? "w-full max-w-xl" : "w-64"}`}>
                <Search size={17} className="mr-3 text-[#CF9D7B] transition-transform duration-300 group-focus-within:rotate-12" />
                <input
                  value={searchTerm}
                  onFocus={() => setSearchOpen(true)}
                  onChange={event => setSearchTerm(event.target.value)}
                  placeholder="Search templates..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[#EFE5DC]/45"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredTemplates.map(card => (
                <button
                  key={card.name}
                  type="button"
                  onClick={() => setSelectedTemplate(card.name)}
                  className={`rounded-[1.5rem] border bg-[#162127]/80 p-6 text-left text-[#F7F1EC] shadow-[0_16px_38px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 ${
                    selectedTemplate === card.name ? "border-[#CF9D7B]" : "border-[#D8C6BA]/18"
                  }`}
                >
                  <FileText size={22} className="mb-5 text-[#CF9D7B]" />
                  <h3 className="mb-2 text-lg font-semibold">{card.name}</h3>
                  <p className="text-sm leading-6 text-[#EFE5DC]/62">{card.desc}</p>
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <CoffeeButton onClick={nextStep}>Continue</CoffeeButton>
            </div>
          </motion.div>
        )}

        {step === "details" && (
          <TemplateDetails onBack={previousStep} onContinue={nextStep} />
        )}
        {step === "verification" && (
          <TemplateVerification onBack={previousStep} onContinue={nextStep} />
        )}
        {step === "payment" && (
          <TemplatePayment onBack={previousStep} onContinue={nextStep} />
        )}
        {step === "result" && (
          <TemplateResult onBack={previousStep} onFinish={() => setShowConfirm(true)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0C1519]/50 px-5 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md rounded-[2rem] border border-[#D8C6BA]/35 bg-[#F7F1EC] p-8 text-center shadow-[0_30px_90px_rgba(0,0,0,0.32)]"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
            >
              <h2 className="mb-8 font-display text-3xl font-bold text-[#0C1519]">Та итгэлтэй байна уу?</h2>
              <div className="flex gap-3">
                <button onClick={onBackHome} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#0C1519] px-5 py-3 text-sm font-semibold text-[#F7F1EC] transition-transform duration-300 hover:scale-[1.03]">
                  <Archive size={16} /> Archive
                </button>
                <button onClick={onBackHome} className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[#D8C6BA] bg-white px-5 py-3 text-sm font-semibold text-[#3A3534] transition-transform duration-300 hover:scale-[1.03]">
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
      className="rounded-full bg-[#724B39] px-9 py-3.5 text-sm font-semibold text-[#F7F1EC] shadow-[0_0_0_rgba(207,157,123,0)] transition-all duration-300 hover:scale-[1.02] hover:bg-[#8a5b45] hover:shadow-[0_0_30px_rgba(207,157,123,0.28)]"
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
        className="group flex items-center gap-2 rounded-full border border-[#D8C6BA]/35 bg-[#162127]/70 px-6 py-3 text-sm font-semibold text-[#F7F1EC] transition-all duration-300 hover:border-[#CF9D7B] hover:bg-[#3A3534]"
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
      initial={{ opacity: 0, x: 36 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -36 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <h1 className="mb-12 text-center font-display text-4xl font-bold text-[#0C1519] dark:text-[#F7F1EC] md:text-6xl">Details Input</h1>
      <div className="grid flex-1 gap-6 lg:grid-cols-2">
        {["Text Area 1", "Text Area 2"].map(label => (
          <textarea
            key={label}
            placeholder={label}
            className="min-h-[420px] resize-none rounded-[2rem] border border-[#D8C6BA]/24 bg-[#162127]/80 p-8 text-[#F7F1EC] shadow-[0_22px_60px_rgba(0,0,0,0.22)] outline-none transition-all duration-300 placeholder:text-[#EFE5DC]/40 focus:border-[#CF9D7B] focus:shadow-[0_0_0_5px_rgba(207,157,123,0.12),0_24px_70px_rgba(0,0,0,0.28)]"
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
      initial={{ opacity: 0, x: 36 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -36 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex flex-1 items-center justify-center">
        <motion.div
          className="w-full max-w-3xl rounded-[2rem] border border-[#D8C6BA]/25 bg-[#162127]/80 p-10 text-[#F7F1EC] shadow-[0_26px_70px_rgba(0,0,0,0.25)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#CF9D7B]">Verification</p>
          <h1 className="mb-8 font-display text-4xl font-bold">Entered information preview</h1>
          <p className="leading-8 text-[#EFE5DC]/62">
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
      initial={{ opacity: 0, x: 36 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -36 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex flex-1 items-center justify-center">
        <motion.div
          className="w-full max-w-md rounded-[2rem] border border-[#D8C6BA]/25 bg-[#F7F1EC] p-10 text-center text-[#0C1519] shadow-[0_28px_80px_rgba(0,0,0,0.28)]"
          animate={{ scale: [1, 1.015, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            className="mx-auto mb-8 flex h-56 w-56 items-center justify-center rounded-[1.5rem] border border-[#D8C6BA] bg-white shadow-inner"
            animate={{ boxShadow: ["0 0 0 rgba(207,157,123,0)", "0 0 34px rgba(207,157,123,0.28)", "0 0 0 rgba(207,157,123,0)"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <QrCode size={132} strokeWidth={1.25} className="text-[#0C1519]" />
          </motion.div>
          <button
            type="button"
            className="rounded-full bg-[#0C1519] px-8 py-3 text-sm font-semibold text-[#F7F1EC] transition-transform duration-300 hover:scale-[1.04] hover:bg-[#724B39]"
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
      initial={{ opacity: 0, x: 36 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -36 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.div
        className="relative min-h-[560px] overflow-hidden rounded-[2rem] border border-[#D8C6BA]/30 bg-[#F7F1EC] p-8 text-[#0C1519] shadow-[0_28px_80px_rgba(0,0,0,0.28)]"
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute -inset-x-4 top-6 -z-10 h-full rounded-[2rem] bg-[#EFE5DC]/70" />
        <div className="absolute -inset-x-8 top-12 -z-20 h-full rounded-[2rem] bg-[#D8C6BA]/65" />
        <div className="h-full overflow-y-auto pr-3 text-sm leading-7 text-[#3A3534]/80">
          <h2 className="mb-7 text-2xl font-semibold text-[#0C1519]">Generated Document Preview</h2>
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
            className="rounded-[1.5rem] border border-[#D8C6BA]/20 bg-[#162127]/80 p-6 text-[#F7F1EC] shadow-[0_16px_38px_rgba(0,0,0,0.18)]"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: index * 0.12 }}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#CF9D7B]">{title}</p>
            <p className="text-sm leading-6 text-[#EFE5DC]/68">{text}</p>
          </motion.div>
        ))}

        <div className="mt-auto space-y-4 pt-3">
          <div className="flex flex-wrap gap-2">
            {["PPT", "Word", "Docs"].map(label => (
              <button key={label} type="button" className="flex h-11 min-w-16 items-center justify-center rounded-full border border-[#D8C6BA]/25 bg-[#162127]/80 px-4 text-xs font-semibold text-[#F7F1EC] transition-all duration-300 hover:-translate-y-1 hover:border-[#CF9D7B]">
                {label}
              </button>
            ))}
            {[Archive, Trash2].map((Icon, index) => (
              <button key={index} type="button" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D8C6BA]/25 bg-[#162127]/80 text-[#CF9D7B] transition-all duration-300 hover:-translate-y-1 hover:border-[#CF9D7B]">
                <Icon size={16} />
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-4">
            <button type="button" onClick={onBack} className="rounded-full border border-[#D8C6BA]/35 bg-[#162127]/70 px-6 py-3 text-sm font-semibold text-[#F7F1EC] transition-all duration-300 hover:bg-[#3A3534]">
              Back
            </button>
            <button type="button" onClick={onFinish} className="flex-1 rounded-full bg-[#724B39] px-8 py-3.5 text-sm font-semibold text-[#F7F1EC] shadow-[0_0_0_rgba(207,157,123,0)] transition-all duration-300 hover:scale-[1.02] hover:bg-[#8a5b45] hover:shadow-[0_0_30px_rgba(207,157,123,0.28)]">
              Дуусгах
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function App() {
  const [locale, setLocale] = useState<Locale>("mn");
  const [isDark, setIsDark] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [page, setPage] = useState<AppPage>("home");
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
    setPage("home");
    window.setTimeout(() => {
      homeScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, 80);
  };

  const openAnalysis = () => {
    setPage("analysis");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openTemplate = () => {
    setPage("template");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollHomeTo = (ref: RefObject<HTMLElement>) => {
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
    <div className="bg-[#EFE5DC] dark:bg-[#0C1519] min-h-screen transition-colors duration-700">
      <AnimatePresence>
        {showSplash && <OpeningSplash onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {page === "template" ? (
          <motion.div
            key="template"
            initial={{ opacity: 0, x: 44 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -44 }}
            transition={{ duration: 0.42, ease: "easeOut" }}
          >
            <TemplateWorkflow onBackHome={openHome} onTabSelect={handleTabSelect} navControls={navControls} />
          </motion.div>
        ) : page === "analysis" ? (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, x: 44 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -44 }}
            transition={{ duration: 0.42, ease: "easeOut" }}
          >
            <AnalysisWorkflow onBack={openHome} onTabSelect={handleTabSelect} navControls={navControls} />
          </motion.div>
        ) : (
          <motion.div
            key="home"
            ref={homeScrollRef}
            className="h-screen overflow-y-auto scroll-smooth"
            initial={{ opacity: 0, x: -44, y: 18 }}
            animate={{ opacity: showSplash ? 0 : 1, x: 0, y: showSplash ? 18 : 0 }}
            exit={{ opacity: 0, x: 44 }}
            transition={{ duration: 0.58, ease: "easeOut" }}
          >
            <HomeSimpleNav onSelect={handleTabSelect} controls={navControls} scrollContainerRef={homeScrollRef} />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PAGE 1 â€” HERO
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <motion.section
        className="px-3 pb-6 pt-3 min-h-screen flex flex-col"
        variants={SECTION_REVEAL}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.35 }}
      >
        <FolderTabs activeTab="Home" onSelect={handleTabSelect} controls={navControls} />
        {/* Document body */}
        <motion.div
          className="relative flex-1 bg-background border border-border rounded-b-[2rem] rounded-tr-[2rem] shadow-[0_12px_70px_rgba(0,0,0,0.07)] overflow-hidden flex flex-col"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
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
              <button className="flex min-w-[10rem] items-center justify-center gap-2 bg-foreground text-background px-8 py-3.5 rounded-full text-sm font-medium hover:opacity-85 active:scale-95 transition-all duration-200">
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
        className="overflow-hidden bg-[#0C1519] py-20 md:py-24 min-h-screen"
        ref={featuresRef.ref}
        variants={SECTION_REVEAL}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
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
          {/* â”€â”€ Circle carousel â”€â”€ */}
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
                      ? "border-[#CF9D7B]/42 shadow-[0_0_28px_rgba(207,157,123,0.16)]"
                      : "border-[#724B39]/18"
                  }`}
                  style={{
                    inset: `${(100 - radius) / 2}%`,
                  }}
                />
              ))}
              <div className="absolute inset-[5%] rounded-full border border-[#CF9D7B]/12 shadow-[0_0_80px_rgba(207,157,123,0.12)]" />
              {ORBIT_PARTICLES.map((particle, index) => (
                <span
                  key={`${particle.left}-${particle.top}`}
                  className="absolute h-1 w-1 rounded-full bg-[#724B39]/55 shadow-[0_0_12px_rgba(207,157,123,0.22)]"
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
                        ? "h-16 w-16 border-[#CF9D7B] bg-[#162127]/88 text-2xl font-bold text-[#F7F1EC] shadow-[0_0_34px_rgba(207,157,123,0.42),inset_0_0_24px_rgba(207,157,123,0.08)]"
                        : "h-11 w-11 border-[#F7F1EC]/10 bg-[#3A3534]/26 text-sm font-semibold text-[#F7F1EC]/50 shadow-[0_12px_30px_rgba(0,0,0,0.22)] hover:border-[#724B39]/70 hover:text-[#F7F1EC]/80"
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
            <div className="pointer-events-none absolute inset-[30%] rounded-full border border-[#724B39]/22 bg-[#0C1519]/24 shadow-[inset_0_0_54px_rgba(0,0,0,0.22)]">
              <div className="absolute inset-[22%] rounded-full border border-[#F7F1EC]/7 bg-[#0C1519]/18" />
            </div>
          </motion.div>

          {/* â”€â”€ Feature content â”€â”€ */}
          <motion.div className="flex-1 pl-10 pr-8 md:pl-16 md:pr-24" variants={REVEAL_ITEM}>
            <div className="mb-7 inline-flex rounded-full border border-[#CF9D7B]/24 bg-[#162127] px-7 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
              <h2 className="font-display text-2xl font-bold text-[#F7F1EC] md:text-3xl">
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
                <p className="mb-5 font-mono text-sm text-[#CF9D7B]">
                  {ORBIT_FEATURES[activeFeature].num}
                </p>
                <h3 className="mb-7 font-display text-6xl font-bold leading-none text-[#F7F1EC] md:text-7xl">
                  {ORBIT_FEATURES[activeFeature].title}
                </h3>
                <p className="max-w-sm text-lg leading-relaxed text-[#F7F1EC]/68">
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
                      ? "w-10 bg-[#CF9D7B]"
                      : "w-2 bg-[#F7F1EC]/18 hover:bg-[#CF9D7B]/48"
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
        className="min-h-screen py-28 flex items-center"
        ref={templateRef.ref}
        variants={SECTION_REVEAL}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.35 }}
      >
        <div className="max-w-screen-xl mx-auto px-8 flex items-center gap-16 md:gap-24">

          {/* â”€â”€ 3D screen card â”€â”€ */}
          <motion.div
            className="flex-shrink-0 w-72 md:w-80"
            variants={REVEAL_ITEM}
          >
            <div
              className="bg-secondary dark:bg-[#162127] rounded-3xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.13)] border border-border animate-floatscreen"
            >
              {/* Title bar */}
              <div className="bg-muted/50 dark:bg-[#3A3534]/50 px-5 py-3.5 flex items-center gap-2 border-b border-border/50">
                <div className="w-2.5 h-2.5 rounded-full bg-[#CF9D7B]" />
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
                      <div className="w-8 h-8 rounded-xl bg-secondary dark:bg-[#0C1519] flex items-center justify-center flex-shrink-0">
                        <FileText size={13} className="text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">{t}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{content.templateFlow.itemSubtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-secondary dark:from-[#162127] to-transparent pointer-events-none" />
              </div>
            </div>
          </motion.div>

          {/* â”€â”€ Text â”€â”€ */}
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

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PAGE 4 â€” UPLOAD & ANALYSE
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <motion.section
        className="min-h-screen py-28 flex items-center"
        ref={uploadRef.ref}
        variants={SECTION_REVEAL}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.35 }}
      >
        <div className="max-w-screen-xl mx-auto px-8 flex items-start gap-16 md:gap-24">

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
                  <h3 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                    {text}
                  </h3>
                  <span className="font-mono text-sm text-muted-foreground/50">0{i + 1}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* â”€â”€ Upload card â”€â”€ */}
          <motion.div
            className="flex-shrink-0 w-72 md:w-80 pt-4"
            variants={REVEAL_ITEM}
          >
            {/* Bouncing icon */}
            <motion.div
              className="w-14 h-14 bg-background border border-border rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <FileText size={24} className="text-muted-foreground" />
            </motion.div>

            <div
              className={`relative bg-background border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-300 ${
                isDragging
                  ? "border-[#CF9D7B] bg-[#CF9D7B]/5 scale-[1.01]"
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
              <div className="absolute bottom-0 left-6 right-6 h-px rounded-full bg-gradient-to-r from-transparent via-[#CF9D7B] to-transparent opacity-60" />
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PAGE 5 â€” FOOTER
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <motion.footer
        className="min-h-screen flex items-center bg-background border-t border-border"
        ref={footerRef.ref}
        variants={SECTION_REVEAL}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.35 }}
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


