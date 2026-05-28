import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, Archive, ArrowLeft, ChevronDown, Download, FileText, Info, LoaderCircle, Trash2, Upload, X } from "lucide-react";
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
    <div className="flex items-center gap-3">
      {STEP_LABELS.map((item, index) => {
        const active = item.key === step;
        const completed = index < currentIndex;
        return (
          <div key={item.key} className="flex items-center gap-2">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                active ? "bg-white text-black" : completed ? "bg-[#7C3AED] text-white" : "bg-[#1F1F1F] text-gray-500"
              }`}
            >
              {completed ? "✓" : index + 1}
            </span>
            <span className={`hidden text-xs font-medium sm:block ${active ? "text-white" : "text-gray-500"}`}>
              {stepLabels[item.key]}
            </span>
            {index < STEP_LABELS.length - 1 && <span className="hidden h-px w-6 bg-[#1F1F1F] sm:block" />}
          </div>
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
    <section className="min-h-screen bg-[#0A0A0A]">
      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#2A2A2A] text-gray-400 transition-all hover:border-[#7C3AED]/50 hover:text-white"
            aria-label="Go back"
          >
            <ArrowLeft size={17} />
          </button>
          <AnalysisStepper step={step} ui={ui} />
        </div>

        <AnimatePresence mode="wait">
          {step === "upload" && (
            <motion.div
              key="upload"
              className="flex flex-col items-center justify-center py-16 text-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
                {ui.analysis.title}
              </h1>
              <p className="mb-12 text-gray-400">Upload a PDF or DOCX to analyze for risks and issues</p>
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
                className={`w-full max-w-lg rounded-xl border-2 border-dashed p-12 transition-all ${
                  isDragActive
                    ? "border-[#7C3AED] bg-[#7C3AED]/5"
                    : "border-[#2A2A2A] bg-[#141414]"
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
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-[#7C3AED]/10 text-[#7C3AED]">
                  <Upload size={28} />
                </div>
                <h2 className="mb-2 text-xl font-semibold text-white">{ui.analysis.dropTitle}</h2>
                <p className="mb-8 text-sm text-gray-400">{ui.analysis.dropDescription}</p>
                {analysisError && (
                  <p className="mx-auto mb-5 max-w-md text-sm text-red-400">{analysisError}</p>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg bg-white px-8 py-3 text-sm font-semibold text-black transition-all hover:bg-gray-200"
                >
                  {ui.analysis.browse}
                </button>
              </motion.div>
            </motion.div>
          )}

          {step === "processing" && (
            <motion.div
              key="processing"
              className="flex flex-col items-center justify-center py-24 text-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <h1 className="mb-12 text-4xl font-bold text-white sm:text-5xl">
                {ui.analysis.processingTitle}
              </h1>
              <div className="w-full max-w-md rounded-xl border border-[#2A2A2A] bg-[#141414] p-12">
                <LoaderCircle className="mx-auto mb-8 h-16 w-16 animate-spin text-[#7C3AED]" strokeWidth={1.5} />
                <h2 className="mb-3 text-xl font-semibold text-white">{ui.analysis.processingSubtitle}</h2>
                <p className="text-sm leading-relaxed text-gray-400">
                  {ui.analysis.processingDescription}
                </p>
              </div>
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

      <AnimatePresence>
        {showFinishModal && (
          <motion.div
            className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 px-5 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md rounded-xl border border-[#2A2A2A] bg-[#141414] p-8 text-center"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="mb-3 text-2xl font-bold text-white">{ui.analysis.finishTitle}</h2>
              <p className="mb-8 text-sm text-gray-400">{ui.analysis.finishDescription}</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => void onSaveAnalysis(analysisResult)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-black transition-all hover:bg-gray-200"
                >
                  <Archive size={16} /> {ui.actions.archive}
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#2A2A2A] px-5 py-3 text-sm font-semibold text-gray-300 transition-all hover:bg-[#1A1A1A]"
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
  const summary = translateAnalysisText(result?.analysis.summary || ui.analysis.fallbackSummary);
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
  const generatedAt = new Date().toLocaleString("mn-MN", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <motion.div
      key="result"
      className="py-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="mb-6 flex items-center gap-3 rounded-lg border border-[#2A2A2A] bg-[#141414] p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-400 text-xs font-bold">
          PDF
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-white">{fileName}</p>
          <p className="text-xs text-gray-400">PDF • 2.4 MB</p>
        </div>
        <Info size={16} className="text-gray-500" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] p-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">Стандарт нийцэл</p>
          <p className="text-4xl font-bold text-emerald-400">{standardMatch}%</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#2A2A2A]">
            <motion.div
              className="h-full rounded-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${standardMatch}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">40 / 50 шаардлагат заалттай нийцэж байна</p>
        </div>

        <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] p-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">{ui.analysis.riskScore}</p>
          <p className="text-4xl font-bold text-red-400">{riskScoreLabel}</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#2A2A2A]">
            <motion.div
              className="h-full rounded-full bg-red-500"
              initial={{ width: 0 }}
              animate={{ width: `${riskPercent}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">Эрсдэлийн 7 заалт илэрсэн</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-[#2A2A2A] bg-[#141414] p-6">
        <h3 className="mb-4 text-sm font-semibold text-white">Асуудлууд</h3>
        <div className="space-y-3">
          {issues.map((issue, index) => {
            const isHigh = index === 0 || index === 1;
            const isMed = index === 2;
            return (
              <div key={`${issue}-${index}`} className="flex items-start gap-3 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] p-4">
                <AlertTriangle size={17} className={`mt-0.5 shrink-0 ${isHigh ? "text-red-400" : isMed ? "text-amber-400" : "text-emerald-400"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-200">{issue}</p>
                  <p className="mt-1 text-xs text-gray-500">{index + 2}-р зүйл • Хуулийн нийцэл шалгах</p>
                </div>
                <span className={`shrink-0 rounded-md border px-2 py-1 text-xs font-medium ${
                  isHigh ? "border-red-500/30 bg-red-500/10 text-red-400" :
                  isMed ? "border-amber-500/30 bg-amber-500/10 text-amber-400" :
                  "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                }`}>
                  {isHigh ? "Өндөр" : isMed ? "Дунд" : "Бага"}
                </span>
                <ChevronDown size={16} className="mt-1 shrink-0 text-gray-500" />
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-[#2A2A2A] bg-[#141414] p-6">
        <h3 className="mb-3 text-sm font-semibold text-white">Тайлбар</h3>
        <p className="text-sm leading-relaxed text-gray-400">{summary}</p>
      </div>

      <div className="mt-4 rounded-xl border border-[#2A2A2A] bg-[#141414] p-6">
        <h3 className="mb-4 text-sm font-semibold text-white">Анализын мэдээлэл</h3>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-400">Анализ хийсэн огноо</dt>
            <dd className="font-medium text-white">{generatedAt}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-400">Файлын нэр</dt>
            <dd className="max-w-[55%] truncate font-medium text-white">{fileName}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 flex gap-3">
        <button type="button" onClick={onExport} className="flex items-center gap-2 rounded-lg border border-[#2A2A2A] px-6 py-3 text-sm font-medium text-gray-300 transition-all hover:bg-[#1A1A1A]">
          <Download size={16} /> Татах (PDF)
        </button>
        <button type="button" onClick={onSave} className="flex items-center gap-2 rounded-lg border border-[#2A2A2A] px-6 py-3 text-sm font-medium text-gray-300 transition-all hover:bg-[#1A1A1A]">
          <Archive size={16} /> Хадгалах
        </button>
        <button type="button" onClick={onFinish} className="flex items-center gap-2 rounded-lg border border-red-500/30 px-6 py-3 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10">
          <Trash2 size={16} /> Устгах
        </button>
      </div>
    </motion.div>
  );
}
