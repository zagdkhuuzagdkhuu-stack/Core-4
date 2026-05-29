import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CreditCard, LoaderCircle, QrCode } from "lucide-react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import enContent from "./content/en.json";
import mnContent from "./content/mn.json";

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

import {
  checkQPayInvoice,
  createPublicQPayInvoice,
  deleteContract,
  deleteDocument,
  fetchMe,
  fetchMyPaymentStatus,
  listMyContracts,
  listMyDocuments,
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
  reanalyzeDocument,
  saveAnalyzedDocument,
  saveGeneratedContract,
  updateAnalysisResults,
  updateDocumentContent,
  updateMyProfile,
} from "./api";
import type { AnalysisResponse, AuthUser, QPayInvoiceResponse, TemplateSummary } from "./api";
import { AnalysisWorkflow } from "./pages/AnalysisPage";
import { AuthPage } from "./pages/AuthPage";
import { HomePage } from "./pages/HomePage";
import { InformationPage } from "./pages/InformationPage";
import { FolderTabs, OpeningSplash, ProfilePanel } from "./pages/Navbar";
import { TemplateWorkflow } from "./pages/TemplatePage";
import { ORBIT_FEATURES } from "./shared/constants";
import { requestGoogleIdToken } from "./shared/googleAuth";
import { useInView } from "./shared/hooks";
import type { AccessState, AnalysisStep, AppPage, FolderNavControls, HeaderTab, Locale } from "./shared/types";

const LOCALES = {
  mn: mnContent,
  en: enContent,
};

const PAGE_TRANSITION = {
  duration: 0.28,
  ease: "easeOut" as const,
};

type PageSlideDirection = "right" | "left";

function PageTransition({
  children,
  className = "",
  style,
  direction,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  direction: PageSlideDirection;
}) {
  return (
    <motion.div
      className={`relative z-0 box-border min-h-screen ${className}`}
      style={style}
      initial={{ opacity: 0, x: direction === "right" ? 40 : -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: direction === "right" ? -40 : 40 }}
      transition={PAGE_TRANSITION}
    >
      {children}
    </motion.div>
  );
}

const PAGE_PATHS: Record<AppPage, string> = {
  home: "/",
  template: "/template",
  analysis: "/analysis",
  information: "/information",
  auth: "/auth",
};

const NAV_PAGE_ORDER: Partial<Record<AppPage, number>> = {
  home: 0,
  template: 1,
  analysis: 2,
  information: 3,
};

function getPageDirection(currentPage: AppPage, nextPage: AppPage): PageSlideDirection {
  const currentIndex = NAV_PAGE_ORDER[currentPage];
  const nextIndex = NAV_PAGE_ORDER[nextPage];
  if (currentIndex === undefined || nextIndex === undefined) return "right";
  return nextIndex >= currentIndex ? "right" : "left";
}

function pageFromPath(pathname: string): AppPage {
  if (pathname === "/template") return "template";
  if (pathname === "/analysis") return "analysis";
  if (pathname === "/information") return "information";
  if (pathname === "/auth") return "auth";
  return "home";
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
  const [locale, setLocale] = useState<Locale>("mn");
  const [isDark, setIsDark] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [previousPage, setPreviousPage] = useState<AppPage>("home");
  const [pageDirection, setPageDirection] = useState<PageSlideDirection>("right");
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
  const [authError, setAuthError] = useState("");
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallInvoice, setPaywallInvoice] = useState<QPayInvoiceResponse | null>(null);
  const [paywallBusy, setPaywallBusy] = useState(false);
  const [paywallError, setPaywallError] = useState("");
  const [paywallQrDataUrl, setPaywallQrDataUrl] = useState("");
  const paywallOnPaid = useRef<(() => Promise<void>) | null>(null);
  const homeScrollRef = useRef<HTMLDivElement>(null);
  const content = LOCALES[locale];
  const PARTNERS = content.partners;
  const TEMPLATES = content.templates;

  const featuresRef = useInView();
  const templateRef = useInView();
  const uploadRef   = useInView();
  const footerRef   = useInView();
  const page = pageFromPath(location.pathname);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    const t = setInterval(() => setActiveFeature(p => (p + 1) % ORBIT_FEATURES.length), 3800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!globalNotice) return;
    const t = setTimeout(() => setGlobalNotice(""), 2000);
    return () => clearTimeout(t);
  }, [globalNotice]);

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

  const handleEmailLogin = async (email: string, password: string) => {
    setAuthBusy(true);
    setAuthError("");
    try {
      const auth = await loginWithEmail(email, password);
      setAuthToken(auth.token);
      localStorage.setItem("draftly_auth_token", auth.token);
      await hydrateAuthState(auth.token);
      setGlobalNotice(content.ui.auth.loginSuccess);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : String(error));
    } finally {
      setAuthBusy(false);
    }
  };

  const handleEmailRegister = async (email: string, password: string, fullName?: string) => {
    setAuthBusy(true);
    setAuthError("");
    try {
      const auth = await registerWithEmail(email, password, fullName);
      setAuthToken(auth.token);
      localStorage.setItem("draftly_auth_token", auth.token);
      await hydrateAuthState(auth.token);
      setGlobalNotice(content.ui.auth.loginSuccess);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : String(error));
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

  const ensureAccessForSave = async (onPaid: () => Promise<void>) => {
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
    paywallOnPaid.current = onPaid;
    setPaywallOpen(true);
    return false;
  };

  const createPaywallInvoice = async () => {
    setPaywallBusy(true);
    setPaywallError("");
    try {
      const invoice = await createPublicQPayInvoice({
        amount: 10,
        description: "Draftly хадгалах/экспортлох эрх",
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

  useEffect(() => {
    if (!paywallInvoice?.qr_text) return;
    if (paywallInvoice.qr_image) {
      setPaywallQrDataUrl("");
      return;
    }
    QRCode.toDataURL(paywallInvoice.qr_text, { width: 300, margin: 2 })
      .then(setPaywallQrDataUrl)
      .catch(() => setPaywallQrDataUrl(""));
  }, [paywallInvoice]);

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
      setPaywallOpen(false);
      setPaywallInvoice(null);
      setGlobalNotice(content.ui.paywall.success);
      const action = paywallOnPaid.current;
      paywallOnPaid.current = null;
      if (action) void action();
    } catch (error) {
      setPaywallError(error instanceof Error ? error.message : String(error));
    } finally {
      setPaywallBusy(false);
    }
  };

  const handleSaveAnalysis = async (result: AnalysisResponse | null) => {
    if (!authToken || !result) return;
    const doSave = async () => {
      const saved = await saveAnalyzedDocument(authToken, {
        title: result.document.title || "Анализ хийгдсэн баримт",
        content: result.document.extractedText || "",
        fileName: result.document.fileName,
        fileUrl: result.document.fileUrl,
        fileType: result.document.fileName?.endsWith(".pdf") ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        summary: result.analysis.summary,
        riskScore: result.analysis.riskScore,
        risks: result.analysis.risks,
        missingClauses: result.analysis.missingClauses,
        riskyTerms: result.analysis.riskyTerms,
        inconsistentWording: result.analysis.inconsistentWording,
        complianceWarnings: result.analysis.complianceWarnings,
        estimatedCost: result.analysis.estimatedCost,
        legalReferences: result.analysis.legalReferences,
        clauses: result.clauses,
      });
      setSavedDocuments((current) => [{ ...saved.saved?.document, ...saved.saved }, ...current]);
      setGlobalNotice("Анализын баримт хадгалагдлаа.");
    };
    await ensureAccessForSave(doSave);
  };

  const handleSaveTemplate = async (payload: { title: string; content: string; template?: TemplateSummary }) => {
    if (!authToken) return;
    const doSave = async () => {
      const saved = await saveGeneratedContract(authToken, {
        title: payload.title,
        content: payload.content,
        contractType: payload.template?.category,
      });
      setSavedContracts((current) => [saved.contract, ...current]);
      setGlobalNotice("Гэрээ хадгалагдлаа.");
    };
    await ensureAccessForSave(doSave);
  };

  const handleExportAction = async (payload?: unknown) => {
    if (!authToken) return;
    const doExport = async () => {
      const ar = payload as AnalysisResponse | null;
      const hasAnalysis = ar?.analysis != null;
      const title = hasAnalysis
        ? ar?.document?.title || "Анализ хийгдсэн баримт"
        : ((payload as Record<string, unknown> | null)?.title as string) || "баримт";
      const content = hasAnalysis
        ? ar?.document?.extractedText || ""
        : ((payload as Record<string, unknown> | null)?.content as string) || "";
      const analysisResult = hasAnalysis ? ar : null;

    let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>`;
    html += `<style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.6}h1{color:#1a1a2e}h2{color:#3B82F6;border-bottom:1px solid #e5e7eb;padding-bottom:4px}.risk-high{color:#dc2626}.risk-mid{color:#d97706}.risk-low{color:#16a34a}ul{list-style:disc;margin-left:20px}li{margin:4px 0}.clause{border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0}.clause h3{margin:0 0 4px}</style></head><body>`;
    html += `<h1>${escapeHtml(title)}</h1>`;

    if (analysisResult?.analysis) {
      const a = analysisResult.analysis;
      html += `<p><strong>Risk Score:</strong> ${a.riskScore ?? "N/A"}/100</p>`;
      html += `<p><strong>Тайлбар:</strong> ${escapeHtml(a.summary || "Тайлбар байхгүй")}</p>`;
      if (a.estimatedCost != null) html += `<p><strong>Тооцоолсон өртөг:</strong> ${a.estimatedCost}</p>`;

      const sections: [string, string[], string][] = [
        ["Эрсдэл", a.risks || [], "risk-high"],
        ["Дутуу заалт", a.missingClauses || [], "risk-mid"],
        ["Эрсдэлтэй нэр томьёо", a.riskyTerms || [], "risk-mid"],
        ["Зөрчилтэй найруулга", a.inconsistentWording || [], "risk-mid"],
        ["Нийцлийн сануулга", a.complianceWarnings || [], "risk-high"],
      ];

      for (const [label, items, cls] of sections) {
        if (items.length > 0) {
          html += `<h2>${label}</h2><ul class="${cls}">`;
          for (const item of items) html += `<li>${escapeHtml(item)}</li>`;
          html += `</ul>`;
        }
      }

      if (analysisResult.clauses?.length) {
        html += `<h2>Заалтууд</h2>`;
        for (const c of analysisResult.clauses) {
          const level = c.riskLevel === "HIGH" ? "risk-high" : c.riskLevel === "MEDIUM" ? "risk-mid" : "risk-low";
          html += `<div class="clause"><h3>${escapeHtml(c.title)}</h3><p class="${level}">Risk: ${c.riskLevel}</p><p>${escapeHtml(c.content || c.explanation)}</p></div>`;
        }
      }
    } else if (content) {
      html += `<div>${escapeHtml(content).replace(/\n/g, "<br>")}</div>`;
    }

    html += `</body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-zA-Z0-9а-яА-ЯөүӨҮёЁ\-_ ]/g, "").trim() || "экспорт"}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setGlobalNotice("Баримт татагдлаа.");
  };

    await ensureAccessForSave(doExport);
  };

  const navigateTo = (nextPage: AppPage) => {
    if (nextPage !== page) {
      setPreviousPage(page);
    }
    setPageDirection(getPageDirection(page, nextPage));
    navigate(PAGE_PATHS[nextPage]);
  };

  const openHome = () => {
    navigateTo("home");
    window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
    }, 80);
  };

  const openAnalysis = () => {
    navigateTo("analysis");
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const openTemplate = () => {
    navigateTo("template");
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const goBackPage = () => {
    const fallback = previousPage === page ? "home" : previousPage;
    navigateTo(fallback);
  };

  const handleTabSelect = (tab: HeaderTab) => {
    if (tab === "Home") { openHome(); return; }
    if (tab === "Template") { openTemplate(); return; }
    if (tab === "Analysis") { openAnalysis(); return; }
    if (tab === "Information") { navigateTo("information"); return; }
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
    onLoginClick: () => navigate("/auth"),
    onProfileClick: () => setProfileOpen(true),
  };

  const homeRouteElement = (
    <PageTransition
      key="home"
      direction={pageDirection}
      className="bg-background"
    >
      <div ref={homeScrollRef} className="min-h-screen bg-background">
        <HomePage
          content={content}
          partners={PARTNERS}
          templates={TEMPLATES}
          featuresRef={featuresRef}
          templateRef={templateRef}
          uploadRef={uploadRef}
          footerRef={footerRef}
          activeFeature={activeFeature}
          setActiveFeature={setActiveFeature}
          circleTilt={circleTilt}
          setCircleTilt={setCircleTilt}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
          onTabSelect={handleTabSelect}
          navControls={navControls}
          homeScrollRef={homeScrollRef}
        />
      </div>
    </PageTransition>
  );

  return (
    <div className="relative z-0 min-h-screen overflow-x-hidden bg-background transition-colors duration-700">
      <AnimatePresence>
        {showSplash && <OpeningSplash onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>
      {!showSplash && page !== "auth" && (
        <FolderTabs
          activeTab={page === "template" ? "Template" : page === "analysis" ? "Analysis" : page === "information" ? "Information" : "Home"}
          onSelect={handleTabSelect}
          controls={navControls}
          ui={content.ui}
        />
      )}
      <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/auth" element={
          <AuthPage
            onBackHome={() => navigate("/")}
            onGoogleLogin={() => void handleGoogleLogin()}
            onEmailLogin={handleEmailLogin}
            onEmailRegister={handleEmailRegister}
            authBusy={authBusy}
            authError={authError}
          />
        } />
        <Route path="/template" element={
          <PageTransition key="template" direction={pageDirection} className="bg-background">
            <TemplateWorkflow
              onBackHome={goBackPage}
              onTabSelect={handleTabSelect}
              navControls={navControls}
              ui={content.ui}
              onSaveTemplate={handleSaveTemplate}
              onExportTemplate={handleExportAction}
            />
          </PageTransition>
        } />
        <Route path="/analysis" element={
          <PageTransition key="analysis" direction={pageDirection} className="bg-background">
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
              onExportAnalysis={(result) => handleExportAction(result)}
              onReanalyze={async (documentId) => {
                if (!authToken) return null;
                try {
                  let id = documentId || analysisResult?.document?.id;
                  if (!id && analysisResult?.document?.extractedText) {
                    const saved = await saveAnalyzedDocument(authToken, {
                      title: analysisResult.document.title,
                      content: analysisResult.document.extractedText,
                      fileName: analysisResult.document.fileName,
                      fileUrl: analysisResult.document.fileUrl,
                      summary: analysisResult.analysis.summary,
                      riskScore: analysisResult.analysis.riskScore,
                    });
                    const docId = saved.saved?.document?.id || saved.saved?.id;
                    if (docId) {
                      setAnalysisResult((prev) => prev ? { ...prev, document: { ...prev.document, id: docId } } : prev);
                      id = docId;
                    }
                  }
                  if (!id) {
                    setGlobalNotice("Баримт хадгалагдаагүй байна. Эхлээд хадгална уу.");
                    return null;
                  }
                  const mode = analysisResult?.mode || "single";
                  const result = await reanalyzeDocument(authToken, id, mode);
                  return result;
                } catch (err) {
                  setGlobalNotice("Дахин анализ амжилтгүй: " + (err instanceof Error ? err.message : String(err)));
                  return null;
                }
              }}
              onSaveManualAnalysis={async (documentId, data) => {
                if (!authToken) return;
                try {
                  await updateAnalysisResults(authToken, documentId, data);
setGlobalNotice("Анализ шинэчлэгдлээ.");
                } catch (err) {
                  setGlobalNotice("Шинэчлэлт амжилтгүй: " + (err instanceof Error ? err.message : String(err)));
                }
              }}
              onSaveDocumentText={async (documentId, text) => {
                if (!authToken) return;
                try {
                  await updateDocumentContent(authToken, documentId, text);
                  setGlobalNotice("Текст хадгалагдлаа.");
                } catch (err) {
                  setGlobalNotice("Хадгалахад алдаа гарлаа: " + (err instanceof Error ? err.message : String(err)));
                }
              }}
            />
          </PageTransition>
        } />
        <Route path="/information" element={
          <PageTransition key="information" direction={pageDirection} className="bg-background">
            <InformationPage
              onTabSelect={handleTabSelect}
              navControls={navControls}
              ui={content.ui}
              content={content.information}
            />
          </PageTransition>
        } />
        <Route path="/" element={homeRouteElement} />
        <Route path="*" element={homeRouteElement} />
      </Routes>
      </AnimatePresence>
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
        onDeleteDocument={async (id) => {
          if (!authToken) return;
          try {
            await deleteDocument(authToken, id);
            setSavedDocuments((current) => current.filter((d) => d.id !== id));
            setAnalysisResult((current) =>
              current?.document?.id === id ? null : current
            );
          } catch (err) {
            setGlobalNotice("Устгахад алдаа гарлаа: " + (err instanceof Error ? err.message : String(err)));
          }
        }}
        onDeleteContract={async (id) => {
          if (!authToken) return;
          try {
            await deleteContract(authToken, id);
            setSavedContracts((current) => current.filter((c) => c.id !== id));
          } catch (err) {
            setGlobalNotice("Устгахад алдаа гарлаа: " + (err instanceof Error ? err.message : String(err)));
          }
        }}
        onUpdateDocumentContent={async (id, content) => {
          if (!authToken) return;
          try {
            await updateDocumentContent(authToken, id, content);
            setGlobalNotice("Content saved.");
          } catch (err) {
            setGlobalNotice("Хадгалахад алдаа гарлаа: " + (err instanceof Error ? err.message : String(err)));
          }
        }}
        onReanalyzeDocument={async (documentId) => {
          if (!authToken) return;
          try {
            const result = await reanalyzeDocument(authToken, documentId, "crew");
            return result;
          } catch (err) {
            setGlobalNotice("Дахин анализ хийхэд алдаа гарлаа: " + (err instanceof Error ? err.message : String(err)));
          }
        }}
        onUpdateAnalysis={async (documentId, data) => {
          if (!authToken) return;
          try {
            await updateAnalysisResults(authToken, documentId, data);
            setGlobalNotice("Analysis updated.");
          } catch (err) {
            setGlobalNotice("Шинэчлэхэд алдаа гарлаа: " + (err instanceof Error ? err.message : String(err)));
          }
        }}
      />
      <AnimatePresence>
        {paywallOpen && (
          <motion.div
            className="fixed inset-0 z-[125] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPaywallOpen(false)}
          >
            <motion.div
              className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg"
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 18, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-accent" />
                <h4 className="text-lg font-bold text-foreground">{content.ui.paywall.title}</h4>
              </div>
              <p className="mb-5 text-sm text-gray-400">{content.ui.paywall.description}</p>
              <div className="mb-5 flex items-center justify-center rounded-lg border border-border bg-muted p-4">
                {paywallBusy ? (
                  <LoaderCircle className="h-10 w-10 animate-spin text-accent" />
                ) : paywallInvoice?.qr_image ? (
                  <img
                    src={paywallInvoice.qr_image.startsWith("data:") ? paywallInvoice.qr_image : `data:image/png;base64,${paywallInvoice.qr_image}`}
                    alt="Төлбөрийн QR"
                    className="h-56 w-56 object-contain"
                  />
                ) : paywallQrDataUrl ? (
                  <img
                    src={paywallQrDataUrl}
                    alt="Төлбөрийн QR"
                    className="h-56 w-56 object-contain"
                  />
                ) : (
                  <QrCode size={128} className="text-gray-500" />
                )}
              </div>
              {paywallError && <p className="mb-3 text-sm text-red-400">{paywallError}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void createPaywallInvoice()}
                  disabled={paywallBusy}
                  className="flex-1 rounded-lg border border-border bg-muted px-4 py-2 text-sm font-semibold text-gray-300 disabled:opacity-60"
                >
                  {content.ui.paywall.createAgain}
                </button>
                <button
                  type="button"
                  onClick={() => void confirmPaywallPayment()}
                  disabled={paywallBusy || !paywallInvoice}
                  className="flex-1 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
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
