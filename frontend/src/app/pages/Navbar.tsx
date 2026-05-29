import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CircleUserRound, LogOut, Menu, Moon, RefreshCw, Save, Settings, Sun, Trash2, X } from "lucide-react";
import type { AuthUser } from "../api";
import type { AccessState, FolderNavControls, HeaderTab, Locale, UiContent } from "../shared/types";

export function ProfilePanel({
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
  onDeleteDocument,
  onDeleteContract,
  onUpdateDocumentContent,
  onReanalyzeDocument,
  onUpdateAnalysis,
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
  onDeleteDocument: (id: string) => Promise<void>;
  onDeleteContract: (id: string) => Promise<void>;
  onUpdateDocumentContent?: (id: string, content: string) => Promise<void>;
  onReanalyzeDocument?: (documentId: string) => Promise<void>;
  onUpdateAnalysis?: (documentId: string, data: any) => Promise<void>;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [detailItem, setDetailItem] = useState<{ type: "document" | "contract"; data: any } | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [editingAnalysis, setEditingAnalysis] = useState(false);
  const [editAnalysisData, setEditAnalysisData] = useState<any>({});

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

  const handleStartEdit = () => {
    const content = detailItem?.data?.content || detailItem?.data?.document?.content || "";
    setEditContent(content);
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditContent("");
  };

  const handleSaveContent = async () => {
    if (!detailItem || detailItem.type !== "document" || !onUpdateDocumentContent) return;
    setSavingEdit(true);
    try {
      await onUpdateDocumentContent(detailItem.data.id, editContent);
      detailItem.data.content = editContent;
      if (detailItem.data.document) {
        detailItem.data.document.content = editContent;
      }
      setEditMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSavingEdit(false);
    }
  };

  const handleReanalyze = async () => {
    if (!detailItem || detailItem.type !== "document" || !onReanalyzeDocument) return;
    setReanalyzing(true);
    try {
      const result = await onReanalyzeDocument(detailItem.data.id);
      if (result) {
        detailItem.data.riskAnalysis = result.analysis || result;
        detailItem.data.status = "completed";
        setDetailItem({ ...detailItem });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setReanalyzing(false);
    }
  };

  const handleStartEditAnalysis = () => {
    const analysis = detailItem?.data?.riskAnalysis || {};
    setEditAnalysisData({
      summary: analysis.summary || "",
      riskScore: analysis.riskScore ?? 0,
      risks: analysis.risks ? [...analysis.risks] : [],
      missingClauses: analysis.missingClauses ? [...analysis.missingClauses] : [],
      riskyTerms: analysis.riskyTerms ? [...analysis.riskyTerms] : [],
      inconsistentWording: analysis.inconsistentWording ? [...analysis.inconsistentWording] : [],
      complianceWarnings: analysis.complianceWarnings ? [...analysis.complianceWarnings] : [],
    });
    setEditingAnalysis(true);
  };

  const handleCancelEditAnalysis = () => {
    setEditingAnalysis(false);
    setEditAnalysisData({});
  };

  const handleSaveAnalysis = async () => {
    if (!detailItem || detailItem.type !== "document" || !onUpdateAnalysis) return;
    setSavingEdit(true);
    try {
      await onUpdateAnalysis(detailItem.data.id, editAnalysisData);
      detailItem.data.riskAnalysis = { ...(detailItem.data.riskAnalysis || {}), ...editAnalysisData };
      setDetailItem({ ...detailItem });
      setEditingAnalysis(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[120]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed right-4 top-[4.5rem] z-[130] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-[0_8px_60px_rgba(0,0,0,0.5)] sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-foreground">Профайл</h3>
              <button type="button" onClick={onClose} className="rounded-full border border-border bg-muted p-2">
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
            <div className="mb-6 rounded-xl border border-border bg-muted/60 p-4">
              <p className="text-sm font-semibold text-foreground">{user?.email || "-"}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {access.isPaid ? ui.profile.paidAccessActive : ui.profile.paymentRequired}
              </p>
              {!access.profileComplete && (
                <p className="mt-2 text-xs text-red-400">{ui.profile.incompletePrefix} {access.missingFields.join(", ")}</p>
              )}
            </div>

            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-muted-foreground">
                Нэр
                <input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>
              <label className="text-xs font-semibold text-muted-foreground">
                Овог
                <input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>
            </div>
            {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
            <div className="mb-6 flex flex-wrap gap-2">
              <button type="button" onClick={handleSave} disabled={saving} className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black disabled:opacity-60">
                {saving ? "Хадгалж байна..." : ui.profile.saveSettings}
              </button>
              <button type="button" onClick={onLanguageToggle} className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-sm font-semibold text-foreground">
                <Settings size={14} /> {locale === "mn" ? "ANG руу шилжих" : "MN руу шилжих"}
              </button>
              <button type="button" onClick={onLogout} className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-sm font-semibold text-foreground">
                <LogOut size={14} /> Гарах
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/50 p-4">
                <p className="mb-3 text-sm font-bold text-foreground">{ui.profile.savedDocuments}</p>
                <div className="space-y-2">
                  {documents.slice(0, 6).map((doc) => (
                    <div
                      key={doc.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setDetailItem({ type: "document", data: doc })}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setDetailItem({ type: "document", data: doc }); } }}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-left transition-all hover:border-accent/30"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-foreground">{doc.title}</p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ""}</span>
                          {doc.status && (
                            <span className={`rounded px-1 py-px text-[9px] font-medium ${doc.status === "FINAL" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>{doc.status}</span>
                          )}
                          {doc.riskAnalysis?.riskScore != null && (
                            <span className={`rounded px-1 py-px text-[9px] font-medium ${doc.riskAnalysis.riskScore >= 70 ? "bg-red-500/20 text-red-400" : doc.riskAnalysis.riskScore >= 40 ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                              {doc.riskAnalysis.riskScore}%
                            </span>
                          )}
                        </div>
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); onDeleteDocument(doc.id); }} className="shrink-0 text-red-400 hover:text-red-300">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {documents.length === 0 && <p className="text-xs text-muted-foreground">{ui.profile.emptyDocuments}</p>}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-muted/50 p-4">
                <p className="mb-3 text-sm font-bold text-foreground">{ui.profile.savedContracts}</p>
                <div className="space-y-2">
                  {contracts.slice(0, 6).map((contract) => (
                    <div
                      key={contract.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setDetailItem({ type: "contract", data: contract })}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setDetailItem({ type: "contract", data: contract }); } }}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-left transition-all hover:border-accent/30"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-foreground">{contract.title}</p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">{contract.createdAt ? new Date(contract.createdAt).toLocaleDateString() : ""}</span>
                          {contract.status && (
                            <span className={`rounded px-1 py-px text-[9px] font-medium ${contract.status === "FINAL" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>{contract.status}</span>
                          )}
                        </div>
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); onDeleteContract(contract.id); }} className="shrink-0 text-red-400 hover:text-red-300">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {contracts.length === 0 && <p className="text-xs text-muted-foreground">{ui.profile.emptyContracts}</p>}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      {detailItem && (
        <motion.div
          className="fixed right-4 top-[4.5rem] z-[140] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-[0_8px_60px_rgba(0,0,0,0.5)] sm:p-6"
          initial={{ opacity: 0, y: -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.96 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div className="mb-4 flex items-center justify-between">
            <button type="button" onClick={() => setDetailItem(null)} className="rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:bg-muted/80">
              ← {ui.actions.back}
            </button>
            <span className="rounded bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
              {detailItem.type === "document" ? "БАРИМТ" : "ГЭРЭЭ"}
            </span>
          </div>

          <h3 className="mb-4 text-lg font-bold text-foreground">{detailItem.data.title || "Гарчиггүй"}</h3>

          <div className="mb-4 space-y-2 text-xs">
            {detailItem.data.createdAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Үүсгэсэн</span>
                <span className="font-medium text-foreground">{new Date(detailItem.data.createdAt).toLocaleString()}</span>
              </div>
            )}
            {detailItem.data.status && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Статус</span>
                <span className="font-medium text-foreground">{detailItem.data.status}</span>
              </div>
            )}
          </div>

          {(detailItem.data.content || detailItem.data.document?.content) && (
            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-[11px] font-semibold text-muted-foreground">Агуулга</p>
                {detailItem.type === "document" && !editMode && (
                  <button type="button" onClick={handleStartEdit} className="text-[10px] font-medium text-accent hover:underline">Засах</button>
                )}
              </div>
              <textarea
                readOnly={!editMode}
                rows={8}
                className="w-full resize-none rounded-lg border border-border bg-background p-3 text-xs leading-relaxed text-foreground outline-none"
                value={editMode ? editContent : (detailItem.data.content || detailItem.data.document?.content || "")}
                onChange={(e) => editMode && setEditContent(e.target.value)}
              />
              {editMode && (
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={handleSaveContent} disabled={savingEdit} className="flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-[10px] font-medium text-white transition-all hover:opacity-90 disabled:opacity-50">
                    <Save className="h-3 w-3" /> {savingEdit ? "Хадгалж байна..." : "Агуулга хадгалах"}
                  </button>
                  <button type="button" onClick={handleCancelEdit} className="rounded-lg border border-border px-3 py-1.5 text-[10px] font-medium text-muted-foreground transition-all hover:bg-muted">Болих</button>
                </div>
              )}
            </div>
          )}

          {detailItem.type === "document" && detailItem.data.riskAnalysis && !editingAnalysis && (
            <>
              <div className="mb-3 rounded-lg border border-border bg-muted/50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Эрсдэлийн анализ</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={handleReanalyze} disabled={reanalyzing} className="flex items-center gap-1 text-[10px] font-medium text-accent transition-all hover:underline disabled:opacity-50">
                      <RefreshCw className={`h-3 w-3 ${reanalyzing ? "animate-spin" : ""}`} /> {reanalyzing ? "Анализ хийж байна..." : "Дахин анализ"}
                    </button>
                    <button type="button" onClick={handleStartEditAnalysis} className="text-[10px] font-medium text-accent hover:underline">Засах</button>
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      detailItem.data.riskAnalysis.riskScore >= 70 ? "bg-red-500/20 text-red-400" :
                      detailItem.data.riskAnalysis.riskScore >= 40 ? "bg-amber-500/20 text-amber-400" :
                      "bg-emerald-500/20 text-emerald-400"
                    }`}>
                      Оноо: {detailItem.data.riskAnalysis.riskScore}/100
                    </span>
                  </div>
                </div>
                {detailItem.data.riskAnalysis.summary && (
                  <p className="mb-2 text-[11px] leading-relaxed text-muted-foreground">{detailItem.data.riskAnalysis.summary}</p>
                )}
                {detailItem.data.riskAnalysis.risks?.length > 0 && (
                  <div className="mb-2">
                    <p className="mb-1 text-[10px] font-semibold text-red-400">Эрсдэл ({detailItem.data.riskAnalysis.risks.length})</p>
                    <ul className="space-y-1">
                      {detailItem.data.riskAnalysis.risks.slice(0, 4).map((r: string, i: number) => (
                        <li key={i} className="text-[10px] text-muted-foreground">• {r}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {detailItem.data.riskAnalysis.missingClauses?.length > 0 && (
                  <div>
                    <p className="mb-1 text-[10px] font-semibold text-amber-400">Дутуу заалт ({detailItem.data.riskAnalysis.missingClauses.length})</p>
                    <ul className="space-y-1">
                      {detailItem.data.riskAnalysis.missingClauses.slice(0, 4).map((m: string, i: number) => (
                        <li key={i} className="text-[10px] text-muted-foreground">• {m}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}

          {detailItem.type === "document" && editingAnalysis && (
            <div className="mb-3 rounded-lg border border-border bg-muted/50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Анализ засах</span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={handleSaveAnalysis} disabled={savingEdit} className="flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-[10px] font-medium text-white transition-all hover:opacity-90 disabled:opacity-50">
                    <Save className="h-3 w-3" /> {savingEdit ? "Хадгалж байна..." : "Хадгалах"}
                  </button>
                  <button type="button" onClick={handleCancelEditAnalysis} className="rounded-lg border border-border px-3 py-1.5 text-[10px] font-medium text-muted-foreground transition-all hover:bg-muted">Болих</button>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground">Эрсдэлийн оноо (0-100)</label>
                  <input type="number" min={0} max={100} value={editAnalysisData.riskScore ?? 0} onChange={(e) => setEditAnalysisData({ ...editAnalysisData, riskScore: Number(e.target.value) })} className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground">Тайлбар</label>
                  <textarea rows={3} value={editAnalysisData.summary || ""} onChange={(e) => setEditAnalysisData({ ...editAnalysisData, summary: e.target.value })} className="w-full resize-none rounded-lg border border-border bg-background p-2 text-xs text-foreground outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground">Эрсдэл (мөр тус бүр)</label>
                  <textarea rows={3} value={(editAnalysisData.risks || []).join("\n")} onChange={(e) => setEditAnalysisData({ ...editAnalysisData, risks: e.target.value.split("\n").filter(Boolean) })} className="w-full resize-none rounded-lg border border-border bg-background p-2 text-xs text-foreground outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground">Дутуу заалт (мөр тус бүр)</label>
                  <textarea rows={3} value={(editAnalysisData.missingClauses || []).join("\n")} onChange={(e) => setEditAnalysisData({ ...editAnalysisData, missingClauses: e.target.value.split("\n").filter(Boolean) })} className="w-full resize-none rounded-lg border border-border bg-background p-2 text-xs text-foreground outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground">Эрсдэлтэй нэр томьёо (мөр тус бүр)</label>
                  <textarea rows={2} value={(editAnalysisData.riskyTerms || []).join("\n")} onChange={(e) => setEditAnalysisData({ ...editAnalysisData, riskyTerms: e.target.value.split("\n").filter(Boolean) })} className="w-full resize-none rounded-lg border border-border bg-background p-2 text-xs text-foreground outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground">Нийцлийн сануулга (мөр тус бүр)</label>
                  <textarea rows={2} value={(editAnalysisData.complianceWarnings || []).join("\n")} onChange={(e) => setEditAnalysisData({ ...editAnalysisData, complianceWarnings: e.target.value.split("\n").filter(Boolean) })} className="w-full resize-none rounded-lg border border-border bg-background p-2 text-xs text-foreground outline-none" />
                </div>
              </div>
            </div>
          )}

          {detailItem.type === "contract" && detailItem.data.contractType && (
            <div className="mb-3 rounded-lg border border-border bg-muted/50 p-3">
              <p className="mb-1 text-[10px] font-semibold text-muted-foreground">Гэрээний төрөл</p>
              <p className="text-xs font-medium text-foreground">{detailItem.data.contractType}</p>
              {detailItem.data.value != null && (
                <div className="mt-2 flex justify-between">
                  <span className="text-[10px] text-muted-foreground">Үнэ</span>
                  <span className="text-xs font-medium text-foreground">{detailItem.data.value.toLocaleString()} {detailItem.data.currency || "MNT"}</span>
                </div>
              )}
              {detailItem.data.parties && (
                <div className="mt-2">
                  <p className="mb-1 text-[10px] font-semibold text-muted-foreground">Талууд</p>
                  <p className="text-xs text-foreground">{String(detailItem.data.parties)}</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function OpeningSplash({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, 2000);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 1, 0] }}
      transition={{ duration: 2, times: [0, 0.8, 1], ease: "easeInOut" }}
      aria-hidden="true"
    >
      <motion.div
        className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        Draftly.
      </motion.div>
    </motion.div>
  );
}

export function FolderTabs({
  activeTab,
  onSelect,
  controls,
  ui,
}: {
  activeTab: HeaderTab;
  onSelect: (tab: HeaderTab) => void;
  controls: FolderNavControls;
  ui: UiContent;
  homeGlobal?: boolean;
  scrollContainerRef?: RefObject<HTMLElement>;
}) {
  const navItems: HeaderTab[] = ["Home", "Template", "Analysis", "Information"];
  const navLabels: Record<HeaderTab, string> = {
    Home: ui.nav.home,
    Template: ui.nav.template,
    Analysis: ui.nav.analysis,
    Information: ui.nav.information,
  };
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  return (
    <>
    <motion.header
      className={`fixed top-0 z-[999] w-full transition-all duration-300 ${
        isScrolled ? "bg-background/90 backdrop-blur-lg shadow-[0_1px_0_rgba(255,255,255,0.06)]" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => onSelect("Home")}
          className="text-xl font-bold tracking-tight text-foreground"
        >
          Draftly.
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map(label => (
            <button
              key={label}
              type="button"
              onClick={() => onSelect(label)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === label
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {navLabels[label]}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={controls.onThemeToggle}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Харанхуй горим"
          >
            {controls.isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            type="button"
            onClick={controls.onLanguageToggle}
            className="hidden rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors sm:block"
          >
            {controls.languageLabel}
          </button>
          {controls.isAuthenticated ? (
            <button
              type="button"
              onClick={controls.onProfileClick}
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white/10 text-foreground transition-colors hover:bg-white/20"
              aria-label="Профайл нээх"
            >
              {controls.userAvatarUrl ? (
                <img src={controls.userAvatarUrl} alt="Профайл" className="h-full w-full object-cover" />
              ) : (
                <CircleUserRound size={16} />
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={controls.onLoginClick}
              className="rounded-lg bg-white px-4 py-1.5 text-sm font-medium text-black transition-colors hover:bg-gray-200"
            >
              {controls.loginLabel}
            </button>
          )}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground md:hidden"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Цэс нээх"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>
    </motion.header>

    <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div
          className="fixed inset-0 z-[1000] bg-background md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex h-16 items-center justify-between px-4">
            <span className="text-xl font-bold text-foreground">Draftly.</span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground"
              aria-label="Цэс хаах"
            >
              <X size={18} />
            </button>
          </div>
          <nav className="flex flex-col gap-2 px-4 pt-4">
            {navItems.map(label => (
              <button
                key={label}
                type="button"
                onClick={() => { onSelect(label); setMobileMenuOpen(false); }}
                className={`rounded-lg px-4 py-4 text-left text-lg font-medium transition-colors ${
                  activeTab === label ? "text-foreground bg-white/5" : "text-muted-foreground"
                }`}
              >
                {navLabels[label]}
              </button>
            ))}
            <button
              type="button"
              onClick={controls.onLanguageToggle}
              className="rounded-lg px-4 py-4 text-left text-lg font-medium text-muted-foreground"
            >
              {controls.languageLabel}
            </button>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}

export function HomeSimpleNav(_props: {
  onSelect: (tab: HeaderTab) => void;
  controls: FolderNavControls;
  ui: UiContent;
  scrollContainerRef: RefObject<HTMLElement>;
}) {
  return null;
}
