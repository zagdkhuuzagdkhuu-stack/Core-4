import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, Archive, ArrowLeft, ChevronDown, Download, Info, LoaderCircle, Maximize2, Trash2, UploadCloud, X, ZoomIn, ZoomOut } from "lucide-react";
import { uploadDocumentForAnalysis } from "../api";
import type { AnalysisResponse } from "../api";
import { STEP_LABELS } from "../shared/constants";
import type { AnalysisStep, FolderNavControls, HeaderTab, UiContent } from "../shared/types";
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

export function AnalysisWorkflow({
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
  void onTabSelect;
  void navControls;

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
    <section className="flex min-h-screen flex-col bg-background">
      <motion.div
        className="relative flex-1 overflow-x-hidden bg-secondary dark:bg-secondary"
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
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
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
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <h1 className="mb-12 font-display text-4xl font-bold text-foreground dark:text-foreground md:text-5xl">
                    {ui.analysis.processingTitle}
                  </h1>
                  <motion.div
                    className="relative w-full max-w-lg rounded-[2rem] border border-border bg-card px-8 py-16 shadow-[0_30px_80px_rgba(12,21,25,0.14)] dark:border-highlight/20 dark:bg-card/80 dark:shadow-[0_30px_80px_rgba(0,0,0,0.28)]"
                  >
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
            className="fixed inset-0 z-10 flex items-center justify-center bg-background/35 px-5 backdrop-blur-md"
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
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
          <div className="rounded-xl border border-border/70 bg-white shadow-inner dark:bg-secondary">
            <div className="px-8 py-8 text-[11px] leading-5 text-slate-700 dark:text-foreground/75">
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
            <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full border border-border bg-secondary px-2 py-1 shadow-sm">
              <button type="button" className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-card" aria-label="Zoom out">
                <ZoomOut size={12} />
              </button>
              <span className="text-[11px] font-semibold">100%</span>
              <button type="button" className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-card" aria-label="Zoom in">
                <ZoomIn size={12} />
              </button>
            </div>
            <button type="button" className="mx-auto mb-4 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-secondary shadow-sm" aria-label="Full screen">
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
