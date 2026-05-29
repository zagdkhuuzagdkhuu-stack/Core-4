import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, Archive, ArrowLeft, Download, Info, LoaderCircle, Pencil, RefreshCw, Save, Trash2, Upload, X } from "lucide-react";
import { reanalyzeDocument, uploadDocumentForAnalysis } from "../api";
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
                active ? "bg-white text-black" : completed ? "bg-accent text-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {completed ? "✓" : index + 1}
            </span>
            <span className={`hidden text-xs font-medium sm:block ${active ? "text-foreground" : "text-muted-foreground"}`}>
              {stepLabels[item.key]}
            </span>
            {index < STEP_LABELS.length - 1 && <span className="hidden h-px w-6 bg-muted sm:block" />}
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
  onReanalyze,
  onSaveManualAnalysis,
  onSaveDocumentText,
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
  onReanalyze?: (documentId: string) => Promise<AnalysisResponse | null>;
  onSaveManualAnalysis?: (documentId: string, data: any) => Promise<void>;
  onSaveDocumentText?: (documentId: string, text: string) => Promise<void>;
}) {
  void onTabSelect;
  void navControls;

  const [isDragActive, setIsDragActive] = useState(false);
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
      setAnalysisError(error instanceof Error ? error.message : "Баримтыг анализ хийхэд алдаа гарлаа.");
      setStep("upload");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <section className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:border-accent/50 hover:text-foreground"
            aria-label="Буцах"
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
              <h1 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">
                {ui.analysis.title}
              </h1>
              <p className="mb-12 text-muted-foreground">Эрсдэл, асуудлыг шинжлэх PDF, DOCX, PPTX файл оруулах</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.pptx,.ppt,.txt"
                className="hidden"
                onChange={event => {
                  const file = event.target.files?.[0];
                  if (file) void startProcessing(file);
                }}
              />
              <motion.div
                className={`w-full max-w-lg rounded-xl border-2 border-dashed p-12 transition-all ${
                  isDragActive
                    ? "border-accent bg-accent/5"
                    : "border-border bg-card"
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
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Upload size={28} />
                </div>
                <h2 className="mb-2 text-xl font-semibold text-foreground">{ui.analysis.dropTitle}</h2>
                <p className="mb-8 text-sm text-muted-foreground">{ui.analysis.dropDescription}</p>
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
                <p className="mt-4 text-xs text-muted-foreground">PDF, DOCX, DOC, PPTX, PPT, TXT</p>
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
              <h1 className="mb-12 text-4xl font-bold text-foreground sm:text-5xl">
                {ui.analysis.processingTitle}
              </h1>
              <div className="w-full max-w-md rounded-xl border border-border bg-card p-12">
                <LoaderCircle className="mx-auto mb-8 h-16 w-16 animate-spin text-accent" strokeWidth={1.5} />
                <h2 className="mb-3 text-xl font-semibold text-foreground">{ui.analysis.processingSubtitle}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
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
              onFinish={() => {
                setAnalysisResult(null);
                setStep("upload");
              }}
              onReanalyze={async () => {
                if (!onReanalyze) return;
                const docId = analysisResult?.document?.id || "";
                try {
                  const newResult = await onReanalyze(docId);
                  if (newResult) {
                    setAnalysisResult({
                      ...analysisResult,
                      analysis: newResult.analysis || analysisResult.analysis,
                      clauses: newResult.clauses || [],
                      mode: newResult.mode || analysisResult.mode,
                    });
                  }
                } catch (err) {
                  console.error("Re-analyze error:", err);
                }
              }}
              onSaveManualEdit={async (analysisData) => {
                if (!analysisResult?.document?.id || !onSaveManualAnalysis) return;
                await onSaveManualAnalysis(analysisResult.document.id, analysisData);
                setAnalysisResult({
                  ...analysisResult,
                  analysis: { ...analysisResult.analysis, ...analysisData },
                });
              }}
              onSaveDocumentText={async (text) => {
                if (!analysisResult?.document?.id || !onSaveDocumentText) return;
                await onSaveDocumentText(analysisResult.document.id, text);
                setAnalysisResult({
                  ...analysisResult,
                  document: { ...analysisResult.document, extractedText: text },
                });
              }}
            />
          )}
        </AnimatePresence>
      </div>
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
  onReanalyze,
  onSaveManualEdit,
  onSaveDocumentText,
}: {
  result: AnalysisResponse | null;
  ui: UiContent;
  onSave: () => void;
  onExport: () => void;
  onFinish: () => void;
  onReanalyze?: () => Promise<void>;
  onSaveManualEdit?: (analysis: any) => Promise<void>;
  onSaveDocumentText?: (text: string) => Promise<void>;
}) {
  const [reanalyzing, setReanalyzing] = useState(false);
  const [manualEditOpen, setManualEditOpen] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [editText, setEditText] = useState("");
  const [savingText, setSavingText] = useState(false);
  const rawRiskScore = result?.analysis.riskScore ?? 62;
  const riskScore = rawRiskScore > 10 ? rawRiskScore / 10 : rawRiskScore;
  const riskPercent = Math.min(100, Math.max(0, riskScore * 10));
  const standardMatch = Math.round(Math.max(0, Math.min(100, 100 - riskScore * 3.5)));
  const riskScoreLabel = `${riskScore.toFixed(1)}/10`;
  const fileName = result?.document.fileName || "Uilchilgeenii_geree_2024.pdf";
  const summary = translateAnalysisText(result?.analysis.summary || ui.analysis.fallbackSummary);
  const missingClauses = result?.analysis.missingClauses ?? [];
  const risks = result?.analysis.risks ?? [];
  const riskyTerms = result?.analysis.riskyTerms ?? [];
  const inconsistentWording = result?.analysis.inconsistentWording ?? [];
  const complianceWarnings = result?.analysis.complianceWarnings ?? [];
  const legalRefs = result?.analysis.legalReferences ?? [];
  const clauses = result?.clauses ?? [];
  const generatedAt = new Date().toLocaleString("mn-MN", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
  const sectionCount = clauses.length;
  const missingCount = missingClauses.length;
  const totalLegalCount = sectionCount + missingCount;

  return (
    <motion.div
      key="result"
      className="py-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="mb-6 flex items-center gap-3 rounded-lg border border-border bg-card p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-400 text-xs font-bold">
          PDF
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">{fileName}</p>
          <p className="text-xs text-muted-foreground">PDF • 2.4 MB</p>
        </div>
        <Info size={16} className="text-muted-foreground" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left: Document text */}
        <div className="order-2 lg:order-1">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Баримтын текст</h3>
              <div className="flex gap-2">
                {editText === "" ? (
                  <button type="button" onClick={() => setEditText(result?.document.extractedText || "")} className="text-[10px] font-medium text-accent hover:underline">Засах</button>
                ) : (
                  <>
                    <button type="button" onClick={async () => { setSavingText(true); try { await onSaveDocumentText?.(editText); } finally { setSavingText(false); } }} disabled={savingText} className="text-[10px] font-medium text-accent hover:underline disabled:opacity-50">{savingText ? "Хадгалж байна..." : "Хадгалах"}</button>
                    <button type="button" onClick={() => setEditText("")} className="text-[10px] font-medium text-muted-foreground hover:underline">Болих</button>
                  </>
                )}
              </div>
            </div>
            <div className="max-h-[600px] overflow-y-auto rounded-lg border border-border bg-background p-4">
              {editText !== "" ? (
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="h-[560px] w-full resize-none bg-transparent text-xs leading-relaxed text-foreground outline-none"
                />
              ) : (
                <pre className="whitespace-pre-wrap text-xs leading-relaxed text-foreground">
                  {result?.document.extractedText || "Текст байхгүй байна."}
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Right: Analysis */}
        <div className="order-1 lg:order-2">
          <div className="grid gap-4">
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Стандарт нийцэл</p>
              <p className="text-4xl font-bold text-emerald-400">{standardMatch}%</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${standardMatch}%` }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">40 / 50 шаардлагат заалттай нийцэж байна</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">{ui.analysis.riskScore}</p>
              <p className="text-4xl font-bold text-red-400">{riskScoreLabel}</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-red-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${riskPercent}%` }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Эрсдэлийн 7 заалт илэрсэн</p>
            </div>

            {/* Found Clauses */}
            {clauses.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-3 text-sm font-bold text-foreground">Илэрсэн заалтууд ({sectionCount}/{totalLegalCount})</h3>
                <div className="space-y-2">
                  {clauses.map((clause, i) => (
                    <div key={clause.title + i} className="rounded-lg border border-border bg-muted p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">{clause.title}</span>
                        <span className={`rounded px-1.5 py-px text-[9px] font-medium ${
                          clause.riskLevel === "HIGH" ? "bg-red-500/20 text-red-400" :
                          clause.riskLevel === "MEDIUM" ? "bg-amber-500/20 text-amber-400" :
                          "bg-emerald-500/20 text-emerald-400"
                        }`}>{clause.riskLevel}</span>
                      </div>
                      <p className="text-[10px] leading-relaxed text-muted-foreground">{clause.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Clauses */}
            {missingClauses.length > 0 && (
              <div className="rounded-xl border border-amber-500/20 bg-card p-6">
                <h3 className="mb-3 text-sm font-bold text-foreground">Дутуу заалтууд ({missingCount})</h3>
                <ul className="space-y-2">
                  {missingClauses.map((m, i) => (
                    <li key={i} className="flex items-start gap-2 rounded-lg border border-border bg-muted p-3">
                      <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-400" />
                      <span className="text-xs text-muted-foreground">{typeof m === "string" ? m : JSON.stringify(m)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Legal References */}
            {legalRefs.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-3 text-sm font-bold text-foreground">Хуулийн лавлагаа</h3>
                <div className="space-y-2">
                  {legalRefs.map((ref: any, i: number) => (
                    <div key={i} className="rounded-lg border border-border bg-muted p-3">
                      <p className="text-[11px] font-semibold text-accent">{ref.provision || ref.law || ref.name || `№${i + 1}`}</p>
                      <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">{ref.text || ref.description || ""}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risks */}
            {risks.length > 0 && (
              <div className="rounded-xl border border-red-500/20 bg-card p-6">
                <h3 className="mb-3 text-sm font-bold text-foreground">Эрсдэлүүд ({risks.length})</h3>
                <ul className="space-y-2">
                  {risks.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 rounded-lg border border-border bg-muted p-3">
                      <AlertTriangle size={14} className="mt-0.5 shrink-0 text-red-400" />
                      <span className="text-xs text-muted-foreground">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risky Terms */}
            {riskyTerms.length > 0 && (
              <div className="rounded-xl border border-orange-500/20 bg-card p-6">
                <h3 className="mb-3 text-sm font-bold text-foreground">Эрсдэлтэй нэр томьёо ({riskyTerms.length})</h3>
                <ul className="space-y-1">
                  {riskyTerms.map((t, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                      <span className="text-xs text-muted-foreground">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Compliance Warnings */}
            {complianceWarnings.length > 0 && (
              <div className="rounded-xl border border-purple-500/20 bg-card p-6">
                <h3 className="mb-3 text-sm font-bold text-foreground">Нийцлийн сануулга ({complianceWarnings.length})</h3>
                <ul className="space-y-1">
                  {complianceWarnings.map((w, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                      <span className="text-xs text-muted-foreground">{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Inconsistent Wording */}
            {inconsistentWording.length > 0 && (
              <div className="rounded-xl border border-cyan-500/20 bg-card p-6">
                <h3 className="mb-3 text-sm font-bold text-foreground">Зөрчилтэй найруулга ({inconsistentWording.length})</h3>
                <ul className="space-y-1">
                  {inconsistentWording.map((w, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                      <span className="text-xs text-muted-foreground">{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Summary */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Тайлбар</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Анализын мэдээлэл</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Анализ хийсэн огноо</dt>
                  <dd className="font-medium text-foreground">{generatedAt}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Файлын нэр</dt>
                  <dd className="max-w-[55%] truncate font-medium text-foreground">{fileName}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={onExport} className="flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-muted">
                <Download size={16} /> Татах (PDF)
              </button>
              <button type="button" onClick={onSave} className="flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-muted">
                <Archive size={16} /> Хадгалах
              </button>
              <button type="button" onClick={onFinish} className="flex items-center gap-2 rounded-lg border border-red-500/30 px-6 py-3 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10">
                <Trash2 size={16} /> Устгах
              </button>
              <button type="button" onClick={async () => { setReanalyzing(true); try { await onReanalyze?.(); } finally { setReanalyzing(false); } }} disabled={reanalyzing || !onReanalyze} className="flex items-center gap-2 rounded-lg border border-accent/30 px-6 py-3 text-sm font-medium text-accent transition-all hover:bg-accent/10 disabled:opacity-50">
                <RefreshCw size={16} className={reanalyzing ? "animate-spin" : ""} /> {reanalyzing ? "Анализ хийж байна..." : "Дахин анализ"}
              </button>
              <button type="button" onClick={() => { setEditData({ summary: result?.analysis.summary || "", riskScore: result?.analysis.riskScore ?? 0, risks: result?.analysis.risks ? [...result.analysis.risks] : [], missingClauses: result?.analysis.missingClauses ? [...result.analysis.missingClauses] : [], riskyTerms: result?.analysis.riskyTerms ? [...result.analysis.riskyTerms] : [], inconsistentWording: result?.analysis.inconsistentWording ? [...result.analysis.inconsistentWording] : [], complianceWarnings: result?.analysis.complianceWarnings ? [...result.analysis.complianceWarnings] : [], legalReferences: result?.analysis.legalReferences ? [...result.analysis.legalReferences] : [], }); setManualEditOpen(true); }} className="flex items-center gap-2 rounded-lg border border-accent/30 px-6 py-3 text-sm font-medium text-accent transition-all hover:bg-accent/10">
                <Pencil size={16} /> Гараар засах
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Edit Modal */}
      {manualEditOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setManualEditOpen(false)}
        >
          <motion.div
            className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Анализыг гараар засах</h3>
              <button type="button" onClick={() => setManualEditOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground">Эрсдэлийн оноо (0-100)</label>
                <input type="number" min={0} max={100} value={editData.riskScore ?? 0} onChange={(e) => setEditData({ ...editData, riskScore: Number(e.target.value) })} className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground">Тайлбар</label>
                <textarea rows={3} value={editData.summary || ""} onChange={(e) => setEditData({ ...editData, summary: e.target.value })} className="w-full resize-none rounded-lg border border-border bg-background p-2 text-xs text-foreground outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground">Эрсдэл (мөр тус бүр)</label>
                <textarea rows={3} value={(editData.risks || []).join("\n")} onChange={(e) => setEditData({ ...editData, risks: e.target.value.split("\n").filter(Boolean) })} className="w-full resize-none rounded-lg border border-border bg-background p-2 text-xs text-foreground outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground">Дутуу заалт (мөр тус бүр)</label>
                <textarea rows={3} value={(editData.missingClauses || []).join("\n")} onChange={(e) => setEditData({ ...editData, missingClauses: e.target.value.split("\n").filter(Boolean) })} className="w-full resize-none rounded-lg border border-border bg-background p-2 text-xs text-foreground outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground">Эрсдэлтэй нэр томьёо (мөр тус бүр)</label>
                <textarea rows={2} value={(editData.riskyTerms || []).join("\n")} onChange={(e) => setEditData({ ...editData, riskyTerms: e.target.value.split("\n").filter(Boolean) })} className="w-full resize-none rounded-lg border border-border bg-background p-2 text-xs text-foreground outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground">Зөрчилтэй найруулга (мөр тус бүр)</label>
                <textarea rows={2} value={(editData.inconsistentWording || []).join("\n")} onChange={(e) => setEditData({ ...editData, inconsistentWording: e.target.value.split("\n").filter(Boolean) })} className="w-full resize-none rounded-lg border border-border bg-background p-2 text-xs text-foreground outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground">Нийцлийн сануулга (мөр тус бүр)</label>
                <textarea rows={2} value={(editData.complianceWarnings || []).join("\n")} onChange={(e) => setEditData({ ...editData, complianceWarnings: e.target.value.split("\n").filter(Boolean) })} className="w-full resize-none rounded-lg border border-border bg-background p-2 text-xs text-foreground outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground">Хуулийн лавлагаа (JSON — "provision" болон "text" талбартай)</label>
                <textarea rows={4} value={JSON.stringify(editData.legalReferences || [], null, 2)} onChange={(e) => { try { setEditData({ ...editData, legalReferences: JSON.parse(e.target.value) }); } catch { /* allow editing even if invalid JSON */ } }} className="w-full resize-none rounded-lg border border-border bg-background p-2 text-xs text-foreground outline-none font-mono" />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={async () => { await onSaveManualEdit?.(editData); setManualEditOpen(false); }} className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90">
                <Save size={15} /> Хадгалах
              </button>
              <button type="button" onClick={() => setManualEditOpen(false)} className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted">Болих</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
