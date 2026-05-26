import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText, BarChart3, ArrowRight, ArrowLeft, Globe, Twitter, Linkedin,
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

const LOCALES = {
  mn: mnContent,
  en: enContent,
};

// Positions of the 3 numbers on the right semicircle (degrees from top, clockwise)
const CIRCLE_ANGLES = [52, 96, 140];

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
  const ref = useRef<HTMLDivElement>(null);
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

function FolderTabs({
  activeTab,
  onSelect,
}: {
  activeTab: HeaderTab;
  onSelect: (tab: HeaderTab) => void;
}) {
  return (
    <div className="relative z-10 overflow-x-auto rounded-t-[2rem] bg-[#0C1519] px-4 pt-5 sm:px-7">
      <div className="flex min-w-max items-end pl-1">
        {HEADER_TABS.map(({ label, Icon, tone }, index) => {
          const active = label === activeTab;

          return (
            <button
              key={label}
              type="button"
              onClick={() => onSelect(label)}
              style={{
                backgroundColor: active ? "#FFFDF9" : tone,
                zIndex: active ? 30 : 20 - index,
              }}
              className={`group relative -mb-px flex h-14 min-w-[156px] items-center justify-center gap-2.5 border border-[#D8C6BA] border-b-0 px-6 text-sm font-semibold text-[#162127] shadow-[0_10px_22px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.55)] transition-all duration-300 ease-out first:ml-0 sm:h-16 sm:min-w-[190px] ${
                index > 0 ? "-ml-5 sm:-ml-7" : ""
              } ${
                active
                  ? "rounded-t-[24px] -translate-y-1 shadow-[0_18px_38px_rgba(0,0,0,0.38),0_-3px_18px_rgba(247,241,236,0.14),inset_0_1px_0_rgba(255,255,255,0.9)]"
                  : "rounded-t-[20px] opacity-95 hover:-translate-y-1 hover:brightness-105 hover:shadow-[0_14px_30px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.55)]"
              }`}
            >
              <span className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-[#D8C6BA]/70" />
              <span className="pointer-events-none absolute inset-x-6 top-1 h-px rounded-full bg-white/55 opacity-80" />
              <Icon size={16} strokeWidth={1.8} className="shrink-0 text-[#724B39]" />
              <span className="leading-none">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
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
            <span className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-[#3A3534]/70 lg:block">
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
}: {
  onBack: () => void;
  onTabSelect: (tab: HeaderTab) => void;
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
    <section className="px-3 pt-3 pb-6 min-h-screen flex flex-col">
      <FolderTabs activeTab="Analysis" onSelect={onTabSelect} />

      <motion.div
        className="relative flex-1 overflow-hidden rounded-b-[2rem] rounded-tr-[2rem] border border-[#D8C6BA]/70 bg-[#FFFDF9] shadow-[0_16px_70px_rgba(12,21,25,0.12)]"
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
              className="group flex h-10 w-10 items-center justify-center rounded-full border border-[#D8C6BA] bg-white/60 text-[#0C1519] transition-all duration-300 hover:border-[#CF9D7B] hover:bg-[#F7F1EC]"
              aria-label="Back to homepage"
            >
              <ArrowLeft size={17} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
            </button>
            <span className="font-display text-2xl font-black text-[#0C1519]">Draftly.</span>
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
                  <h1 className="mb-12 font-display text-4xl font-bold text-[#0C1519] md:text-5xl">
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
                    className={`relative w-full max-w-xl rounded-[2rem] border-2 border-dashed bg-white px-8 py-14 shadow-[0_28px_70px_rgba(12,21,25,0.12)] transition-all duration-300 ${
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
                    <h2 className="mb-2 text-xl font-semibold text-[#0C1519]">Drop your documents here</h2>
                    <p className="mb-8 text-sm text-[#3A3534]/68">PDF DOCX TXT up to 50MB</p>
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
                  <h1 className="mb-12 font-display text-4xl font-bold text-[#0C1519] md:text-5xl">
                    Анализ хийж байна
                  </h1>
                  <motion.div
                    className="relative w-full max-w-lg rounded-[2rem] border border-[#D8C6BA] bg-white px-8 py-16 shadow-[0_30px_80px_rgba(12,21,25,0.14)]"
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
                    <h2 className="mb-3 text-xl font-semibold text-[#0C1519]">AI таны гэрээг шалгаж байна</h2>
                    <p className="mx-auto max-w-sm text-sm leading-6 text-[#3A3534]/68">
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
            <p className="mt-2 text-4xl font-bold text-[#0C1519]">7.5/10</p>
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
          <p key={item} className="mb-2 flex items-center gap-2 text-sm text-[#3A3534]">
            <Check size={15} className="text-[#724B39]" /> {item}
          </p>
        ))}
      </div>
    ),
    (
      <div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#724B39]">Missing Clauses</p>
        {["Termination missing", "Liability missing", "Payment delay condition missing"].map(item => (
          <p key={item} className="mb-3 text-sm text-[#3A3534]/82">- {item}</p>
        ))}
      </div>
    ),
    (
      <div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#724B39]">AI Analysis Result</p>
        <motion.p
          className="overflow-hidden whitespace-nowrap text-sm leading-6 text-[#3A3534]/82"
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
        className="relative min-h-[560px] overflow-hidden rounded-[2rem] border border-[#D8C6BA] bg-white p-8 shadow-[0_24px_70px_rgba(12,21,25,0.12)]"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-x-8 top-7 h-px bg-[#D8C6BA]/70" />
        <div className="h-full overflow-y-auto pr-3 text-left text-sm leading-7 text-[#3A3534]/78">
          <h2 className="mb-7 text-2xl font-semibold text-[#0C1519]">Service Agreement Preview</h2>
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
            className="rounded-[1.5rem] border border-[#D8C6BA] bg-white/82 p-6 shadow-[0_16px_38px_rgba(12,21,25,0.08)]"
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
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D8C6BA] bg-white text-[#724B39] transition-all duration-300 hover:-translate-y-1 hover:bg-[#F7F1EC]"
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
            <span className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-[#F7F1EC]/72 lg:block">
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
  children,
}: {
  step: TemplateStep;
  onBackHome: () => void;
  onTabSelect: (tab: HeaderTab) => void;
  children: ReactNode;
}) {
  return (
    <section className="px-3 pt-3 pb-6 min-h-screen flex flex-col bg-[#0C1519]">
      <FolderTabs activeTab="Template" onSelect={onTabSelect} />
      <div className="relative flex-1 overflow-hidden rounded-b-[2rem] rounded-tr-[2rem] border border-[#D8C6BA]/20 bg-[#0C1519] shadow-[0_18px_80px_rgba(0,0,0,0.34)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(207,157,123,0.16),transparent_26%),radial-gradient(circle_at_82%_12%,rgba(247,241,236,0.09),transparent_24%)]" />
        <div className="relative z-10 flex min-h-[calc(100vh-7rem)] flex-col px-5 py-5 sm:px-8 lg:px-10">
          <div className="mb-8 flex items-center justify-between">
            <button
              type="button"
              onClick={onBackHome}
              className="group flex h-10 w-10 items-center justify-center rounded-full border border-[#D8C6BA]/35 bg-[#162127]/80 text-[#F7F1EC] transition-all duration-300 hover:border-[#CF9D7B] hover:bg-[#3A3534]"
              aria-label="Back to homepage"
            >
              <ArrowLeft size={17} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
            </button>
            <span className="font-display text-2xl font-black text-[#F7F1EC]">Draftly.</span>
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
}: {
  onBackHome: () => void;
  onTabSelect: (tab: HeaderTab) => void;
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
    <TemplateShell step={step} onBackHome={onBackHome} onTabSelect={onTabSelect}>
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
              <h1 className="font-display text-4xl font-bold text-[#F7F1EC] md:text-6xl">Choose your contract type.</h1>
              <p className="mt-3 text-sm text-[#EFE5DC]/66">Choose and forget...</p>
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
      <h1 className="mb-12 text-center font-display text-4xl font-bold text-[#F7F1EC] md:text-6xl">Details Input</h1>
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
  const [page, setPage] = useState<AppPage>("home");
  const [activeFeature, setActiveFeature] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const content = LOCALES[locale];
  const PARTNERS = content.partners;
  const FEATURES = content.features;
  const TEMPLATES = content.templates;

  const featuresRef = useInView();
  const templateRef = useInView();
  const uploadRef   = useInView();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    const t = setInterval(() => setActiveFeature(p => (p + 1) % 3), 3800);
    return () => clearInterval(t);
  }, []);

  // Circle: [prev, active, next] feature indices mapped to positions
  const orderedByPos = [
    (activeFeature + 2) % 3,
    activeFeature,
    (activeFeature + 1) % 3,
  ];

  const openHome = () => {
    setPage("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openAnalysis = () => {
    setPage("analysis");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openTemplate = () => {
    setPage("template");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTabSelect = (tab: HeaderTab) => {
    if (tab === "Template") {
      openTemplate();
      return;
    }

    if (tab === "Analysis") {
      openAnalysis();
      return;
    }

    openHome();
  };

  return (
    <div className="bg-[#EFE5DC] dark:bg-[#0C1519] min-h-screen transition-colors duration-700">
      <AnimatePresence mode="wait">
        {page === "template" ? (
          <motion.div
            key="template"
            initial={{ opacity: 0, x: 44 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -44 }}
            transition={{ duration: 0.42, ease: "easeOut" }}
          >
            <TemplateWorkflow onBackHome={openHome} onTabSelect={handleTabSelect} />
          </motion.div>
        ) : page === "analysis" ? (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, x: 44 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -44 }}
            transition={{ duration: 0.42, ease: "easeOut" }}
          >
            <AnalysisWorkflow onBack={openHome} onTabSelect={handleTabSelect} />
          </motion.div>
        ) : (
          <motion.div
            key="home"
            initial={{ opacity: 0, x: -44 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 44 }}
            transition={{ duration: 0.42, ease: "easeOut" }}
          >

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PAGE 1 â€” HERO
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="px-3 pt-3 pb-6 min-h-screen flex flex-col">

        {/* Tab strip - sits above the document */}
        <FolderTabs activeTab="Home" onSelect={handleTabSelect} />

        {/* Document body */}
        <motion.div
          className="flex-1 bg-background border border-border rounded-b-[2rem] rounded-tr-[2rem] shadow-[0_12px_70px_rgba(0,0,0,0.07)] overflow-hidden flex flex-col"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Nav */}
          <nav className="flex flex-shrink-0 flex-wrap items-center justify-between gap-4 border-b border-[#D8C6BA]/80 bg-[#FFFDF9]/82 px-5 py-4 backdrop-blur-sm transition-all duration-300 sm:px-8 lg:px-10">
            <span className="font-display text-2xl font-black tracking-[0.01em] text-[#0C1519] transition-colors duration-300">
              {content.brand}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDark(d => !d)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D8C6BA] bg-[#F7F1EC] text-[#3A3534] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#CF9D7B] hover:bg-[#EFE5DC] hover:text-[#0C1519]"
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun size={14} /> : <Moon size={14} />}
              </button>
              <button
                onClick={() => setLocale(current => current === "mn" ? "en" : "mn")}
                className="flex items-center gap-1.5 rounded-full border border-[#D8C6BA] bg-[#F7F1EC] px-3 py-2 text-sm font-medium text-[#3A3534] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#CF9D7B] hover:bg-[#EFE5DC] hover:text-[#0C1519]"
                aria-label="Switch language"
              >
                <Globe size={14} /> {content.switchLabel}
              </button>
              <button className="rounded-full bg-[#0C1519] px-5 py-2.5 text-sm font-semibold text-[#F7F1EC] shadow-[0_8px_20px_rgba(12,21,25,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#724B39] hover:shadow-[0_12px_26px_rgba(114,75,57,0.18)]">
                {content.login}
              </button>
            </div>
          </nav>

          {/* Hero content */}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
            <motion.h1
              className="font-display text-5xl md:text-[4.5rem] font-bold leading-[1.07] max-w-3xl text-foreground mb-9"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              {content.hero.title}
            </motion.h1>

            <motion.div
              className="flex gap-3 mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
            >
              <button className="flex items-center gap-2 bg-foreground text-background px-8 py-3.5 rounded-full text-sm font-medium hover:opacity-85 active:scale-95 transition-all duration-200">
                {content.hero.primaryCta} <ArrowRight size={14} />
              </button>
              <button className="px-8 py-3.5 rounded-full text-sm font-medium border border-border hover:bg-secondary active:scale-95 transition-all duration-200 text-foreground">
                {content.hero.secondaryCta}
              </button>
            </motion.div>

            {/* Partner logos */}
            <motion.div
              className="space-y-3.5 w-full max-w-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.55 }}
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
          </div>
        </motion.div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PAGE 2 â€” WHAT DO WE DO?
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="py-28 overflow-hidden" ref={featuresRef.ref}>

        {/* Title pill */}
        <div className="max-w-screen-xl mx-auto px-8 mb-20">
          <motion.div
            className="inline-flex bg-secondary dark:bg-[#162127] border border-border rounded-full px-9 py-4"
            initial={{ opacity: 0, x: -20 }}
            animate={featuresRef.inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl font-bold text-foreground">
              {content.featuresSectionTitle}
            </h2>
          </motion.div>
        </div>

        <div className="flex items-center">
          {/* â”€â”€ Circle carousel â”€â”€ */}
          <div className="relative flex-shrink-0 w-[280px] h-[280px] -ml-[140px]">

            {/* Outer rotating ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-border"
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />

            {/* Inner static ring */}
            <div className="absolute inset-10 rounded-full border border-border/30" />

            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-foreground/40" />

            {/* Numbers â€” fixed positions, content cycles */}
            {CIRCLE_ANGLES.map((angleDeg, posIdx) => {
              const fIdx = orderedByPos[posIdx];
              const f = FEATURES[fIdx];
              const isActive = posIdx === 1;
              const rad = (angleDeg * Math.PI) / 180;
              const r = 106;
              const cx = 140, cy = 140;
              const x = cx + r * Math.sin(rad);
              const y = cy - r * Math.cos(rad);

              return (
                <div
                  key={posIdx}
                  className="absolute"
                  style={{ left: x - 20, top: y - 14 }}
                >
                  <AnimatePresence mode="wait">
                    <motion.button
                      key={`${posIdx}-${f.num}`}
                      className={`font-mono leading-none cursor-pointer select-none ${
                        isActive
                          ? "text-3xl font-bold text-foreground"
                          : "text-sm text-muted-foreground/35"
                      }`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      onClick={() => setActiveFeature(fIdx)}
                    >
                      {f.num}
                    </motion.button>
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* â”€â”€ Feature content â”€â”€ */}
          <div className="flex-1 pl-16 pr-8 md:pr-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.45 }}
              >
                <p className="font-mono text-sm text-muted-foreground mb-4">
                  {FEATURES[activeFeature].num}
                </p>
                <h3 className="font-display text-6xl md:text-7xl font-bold text-foreground mb-7 leading-none">
                  {FEATURES[activeFeature].title}
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-sm">
                  {FEATURES[activeFeature].desc}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Progress indicators */}
            <div className="flex gap-2 mt-12">
              {FEATURES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveFeature(i)}
                  className={`h-0.5 rounded-full transition-all duration-500 ${
                    i === activeFeature
                      ? "w-10 bg-foreground"
                      : "w-2 bg-border hover:bg-muted-foreground/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PAGE 3 â€” TEMPLATE FLOW
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="py-28" ref={templateRef.ref}>
        <div className="max-w-screen-xl mx-auto px-8 flex items-center gap-16 md:gap-24">

          {/* â”€â”€ 3D screen card â”€â”€ */}
          <motion.div
            className="flex-shrink-0 w-72 md:w-80"
            initial={{ opacity: 0, x: -40 }}
            animate={templateRef.inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease: "easeOut" }}
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
            initial={{ opacity: 0, x: 40 }}
            animate={templateRef.inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
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
            <button className="flex items-center gap-2 bg-foreground text-background px-7 py-3.5 rounded-full text-sm font-medium hover:opacity-85 active:scale-95 transition-all duration-200">
              {content.templateFlow.cta} <ArrowRight size={14} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PAGE 4 â€” UPLOAD & ANALYSE
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="py-28" ref={uploadRef.ref}>
        <div className="max-w-screen-xl mx-auto px-8 flex items-start gap-16 md:gap-24">

          {/* â”€â”€ Analysis labels â”€â”€ */}
          <div className="flex-1 pt-4">
            {content.upload.labels.map((text, i) => (
              <motion.div
                key={text}
                className="py-9 border-b border-border"
                initial={{ opacity: 0, x: -30 }}
                animate={uploadRef.inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.65, delay: i * 0.16 }}
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
            initial={{ opacity: 0, y: 30 }}
            animate={uploadRef.inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
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
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PAGE 5 â€” FOOTER
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <footer className="bg-background border-t border-border mt-8">
        <div className="max-w-screen-xl mx-auto px-8 py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">

            {/* Brand */}
            <div className="space-y-5">
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
            </div>

            {/* Company */}
            <div>
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
            </div>

            {/* Contact */}
            <div>
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
            </div>

            {/* Additional */}
            <div>
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
            </div>
          </div>
        </div>
      </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


