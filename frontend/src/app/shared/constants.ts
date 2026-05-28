import { BriefcaseBusiness, Handshake, Home, Landmark, ShieldCheck } from "lucide-react";
import type { AnalysisStep, TemplateStep } from "./types";
export const ORBIT_FEATURES = [
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

export const ORBIT_ANGLES = [18, 64, 109, 154, 205, 250, 298, 336];
export const ORBIT_RADII = [28, 36, 44, 52, 60, 68, 76, 84];
export const ORBIT_PARTICLES = [
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

export const SECTION_REVEAL = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.28,
      ease: "easeOut",
      staggerChildren: 0.04,
      when: "beforeChildren",
    },
  },
};

export const REVEAL_ITEM = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.28, ease: "easeOut" },
  },
};

export const STACK_EASE = [0.22, 1, 0.36, 1] as const;
export const STACK_TRANSITION = { duration: 0.82, ease: STACK_EASE };

export const stackedPageVariants = {
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

export const stackedStepVariants = {
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

export const STEP_LABELS: { key: AnalysisStep; label: string }[] = [
  { key: "upload", label: "Upload" },
  { key: "processing", label: "Analysing" },
  { key: "result", label: "Result" },
];

export const TEMPLATE_STEPS: { key: TemplateStep; label: string }[] = [
  { key: "template", label: "Template" },
  { key: "details", label: "Details" },
  { key: "verification", label: "Verification" },
  { key: "payment", label: "Payment" },
  { key: "result", label: "Result" },
];

export const TEMPLATE_CATEGORIES = [
  { name: "Employment", items: ["Employment Agreement", "Internship Agreement", "Temporary Contract", "Freelance Agreement"] },
  { name: "Business", items: ["Partnership Agreement", "Purchase Agreement", "Sales Agreement"] },
  { name: "Rental", items: ["Lease Agreement", "Sublease Agreement", "Property Use Agreement"] },
  { name: "Financial", items: ["Loan Agreement", "Payment Agreement", "Investment Agreement"] },
  { name: "Government", items: ["Service Request", "Compliance Letter", "Public Procurement"] },
  { name: "Personal", items: ["Personal Loan", "Gift Agreement", "Power of Attorney"] },
  { name: "Legal", items: ["NDA Agreement", "Settlement Agreement", "Legal Notice"] },
];

export const TEMPLATE_CARDS = [
  { name: "Employment Agreement", desc: "A clear employment contract with role, salary, and duties." },
  { name: "Partnership Agreement", desc: "Define ownership, decisions, contributions, and exits." },
  { name: "Lease Agreement", desc: "Rental terms, deposits, use rules, and maintenance duties." },
  { name: "NDA Agreement", desc: "Protect confidential information before collaboration starts." },
  { name: "Loan Agreement", desc: "Repayment schedule, interest, penalties, and guarantees." },
  { name: "Sales Agreement", desc: "Document sale terms, delivery, warranties, and payment." },
];

export const TEMPLATE_GROUPS = [
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
