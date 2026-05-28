import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CreditCard, LoaderCircle, QrCode } from "lucide-react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import enContent from "./content/en.json";
import mnContent from "./content/mn.json";
import {
  activatePaidAccess,
  checkQPayInvoice,
  createPublicQPayInvoice,
  fetchMe,
  fetchMyPaymentStatus,
  listMyContracts,
  listMyDocuments,
  loginWithGoogle,
  saveAnalyzedDocument,
  saveGeneratedContract,
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

  if (currentIndex === undefined || nextIndex === undefined) {
    return "right";
  }

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
  const [isDark, setIsDark] = useState(false);
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
  const page = pageFromPath(location.pathname);

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

  const scrollHomeTo = (ref: RefObject<HTMLElement>) => {
    navigateTo("home");
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

    if (tab === "Information") {
      navigateTo("information");
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
          homeGlobal={page === "home"}
          scrollContainerRef={homeScrollRef}
        />
      )}
      <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/auth" element={
          <AuthPage
            onBackHome={() => navigate("/")}
            onGoogleLogin={() => void handleGoogleLogin()}
            authBusy={authBusy}
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
              onExportAnalysis={() => handleExportAction()}
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




