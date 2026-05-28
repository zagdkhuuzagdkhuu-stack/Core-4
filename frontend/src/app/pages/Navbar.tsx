import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CircleUserRound, House, LogOut, Menu, Moon, Settings, Sun, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import type { AuthUser } from "../api";
import type { AccessState, FolderNavControls, HeaderTab, Locale, UiContent } from "../shared/types";

const NAV_PATHS: Record<HeaderTab, string> = {
  Home: "/",
  Template: "/template",
  Analysis: "/analysis",
  Information: "/information",
};
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
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-end justify-center bg-background/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="max-h-[86vh] w-full overflow-y-auto rounded-t-[1.8rem] border border-border bg-card p-5 shadow-[0_-24px_70px_rgba(0,0,0,0.24)] sm:max-w-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-2xl font-bold text-foreground">Profile</h3>
              <button type="button" onClick={onClose} className="rounded-full border border-border bg-secondary p-2">
                <X size={16} />
              </button>
            </div>
            <div className="mb-6 rounded-xl border border-border/70 bg-secondary/60 p-4">
              <p className="text-sm font-semibold text-foreground">{user?.email || "-"}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {access.isPaid ? ui.profile.paidAccessActive : ui.profile.paymentRequired}
              </p>
              {!access.profileComplete && (
                <p className="mt-2 text-xs text-red-600">{ui.profile.incompletePrefix} {access.missingFields.join(", ")}</p>
              )}
            </div>

            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-muted-foreground">
                First name
                <input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>
              <label className="text-xs font-semibold text-muted-foreground">
                Last name
                <input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>
            </div>
            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
            <div className="mb-6 flex flex-wrap gap-2">
              <button type="button" onClick={handleSave} disabled={saving} className="rounded-full bg-button px-5 py-2 text-sm font-semibold text-button-text disabled:opacity-60">
                {saving ? "Saving..." : ui.profile.saveSettings}
              </button>
              <button type="button" onClick={onLanguageToggle} className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm font-semibold text-foreground">
                <Settings size={14} /> {locale === "mn" ? "Switch to ENG" : "MN руу шилжих"}
              </button>
              <button type="button" onClick={onLogout} className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm font-semibold text-foreground">
                <LogOut size={14} /> Logout
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-border/70 bg-secondary/50 p-4">
                <p className="mb-3 text-sm font-bold text-foreground">{ui.profile.savedDocuments}</p>
                <div className="space-y-2">
                  {documents.slice(0, 6).map((doc) => (
                    <div key={doc.id} className="rounded-md border border-border bg-background px-3 py-2">
                      <p className="truncate text-xs font-semibold text-foreground">{doc.title}</p>
                    </div>
                  ))}
                  {documents.length === 0 && <p className="text-xs text-muted-foreground">{ui.profile.emptyDocuments}</p>}
                </div>
              </div>
              <div className="rounded-xl border border-border/70 bg-secondary/50 p-4">
                <p className="mb-3 text-sm font-bold text-foreground">{ui.profile.savedContracts}</p>
                <div className="space-y-2">
                  {contracts.slice(0, 6).map((contract) => (
                    <div key={contract.id} className="rounded-md border border-border bg-background px-3 py-2">
                      <p className="truncate text-xs font-semibold text-foreground">{contract.title}</p>
                    </div>
                  ))}
                  {contracts.length === 0 && <p className="text-xs text-muted-foreground">{ui.profile.emptyContracts}</p>}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NavActionButtons({
  controls,
  className = "",
  showAuth = true,
}: {
  controls: FolderNavControls;
  className?: string;
  showAuth?: boolean;
}) {
  return (
    <div className={`flex items-center justify-end gap-2 ${className}`}>
      <button
        type="button"
        onClick={controls.onThemeToggle}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0C1519] text-white shadow-[0_12px_24px_rgba(12,21,25,0.18)] transition-all duration-300 hover:scale-105 dark:bg-[#CF9D7B] dark:text-[#0C1519]"
        aria-label="Toggle dark mode"
      >
        {controls.isDark ? <Sun size={15} /> : <Moon size={15} />}
      </button>
      <button
        type="button"
        onClick={controls.onLanguageToggle}
        className="flex h-11 min-w-14 items-center justify-center rounded-full bg-[#0C1519] px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(12,21,25,0.18)] transition-all duration-300 hover:scale-105 dark:bg-[#CF9D7B] dark:text-[#0C1519] sm:min-w-[4.5rem]"
        aria-label="Switch language"
      >
        {controls.languageLabel}
      </button>
      {showAuth && (controls.isAuthenticated ? (
        <button
          type="button"
          onClick={controls.onProfileClick}
          className="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#0C1519] text-white shadow-[0_12px_24px_rgba(12,21,25,0.18)] transition-transform duration-300 hover:scale-105 dark:bg-[#CF9D7B] dark:text-[#0C1519]"
          aria-label="Open profile"
        >
          {controls.userAvatarUrl ? (
            <img src={controls.userAvatarUrl} alt="Profile avatar" className="h-full w-full object-cover" />
          ) : (
            <CircleUserRound size={18} />
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={controls.onLoginClick}
          className="h-11 rounded-full bg-[#0C1519] px-6 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(12,21,25,0.18)] transition-all duration-300 hover:scale-105 dark:bg-[#CF9D7B] dark:text-[#0C1519] sm:min-w-[7.25rem]"
        >
          {controls.loginLabel}
        </button>
      ))}
    </div>
  );
}

export function OpeningSplash({ onComplete }: { onComplete: () => void }) {
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
        className="font-display text-5xl font-black tracking-normal text-foreground sm:text-6xl md:text-7xl"
        initial={{ x: 0, y: 0, scale: 1 }}
        animate={{
          x: ["0vw", "0vw", "clamp(-42vw, calc(-50vw + 5rem), -28vw)"],
          y: ["0vh", "0vh", "clamp(-46vh, calc(-50vh + 4.5rem), -38vh)"],
          scale: [1, 1, 0.52],
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

export function FolderTabs({
  activeTab,
  onSelect,
  controls,
  ui,
  homeGlobal = false,
  scrollContainerRef,
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
  const [isHidden, setIsHidden] = useState(false);
  const [isSimpleHomeNav, setIsSimpleHomeNav] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const handleNavSelect = (tab: HeaderTab) => {
    setMobileMenuOpen(false);
    onSelect(tab);
  };

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  return (
    <>
    <motion.header
      className="fixed left-1/2 top-4 z-[999999] isolate w-[95%] -translate-x-1/2"
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="mx-auto flex h-[72px] w-full max-w-[100rem] items-center rounded-[2rem] border border-black/5 bg-white/92 px-4 text-[#0C1519] shadow-[0_18px_50px_rgba(12,21,25,0.12)] backdrop-blur-md transition-all duration-300 dark:border-white/10 dark:bg-[#162127]/92 dark:text-[#F7F1EC] sm:h-20 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-4">
            <button
              type="button"
              onClick={() => handleNavSelect("Home")}
              className="shrink-0 font-serif text-3xl font-bold leading-none text-[#0C1519] transition-transform duration-300 hover:scale-105 dark:text-[#F7F1EC]"
            >
              Draftly.
            </button>
            <span className="hidden h-8 w-px shrink-0 bg-black/12 dark:bg-white/15 sm:block" />
            <nav className="hidden min-w-0 items-center gap-2 rounded-full bg-white px-2 py-2 shadow-[0_10px_28px_rgba(12,21,25,0.10)] dark:bg-[#1E394B] lg:flex">
              {navItems.map(label => (
                <NavLink
                  key={label}
                  to={NAV_PATHS[label]}
                  end={label === "Home"}
                  onClick={(event) => {
                    event.preventDefault();
                    handleNavSelect(label);
                  }}
                  className={({ isActive }) => `flex shrink-0 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ease-out hover:scale-105 ${
                    isActive ? "bg-[#0C1519] text-white shadow-[0_10px_20px_rgba(12,21,25,0.18)] dark:bg-[#CF9D7B] dark:text-[#0C1519]" : "bg-transparent text-[#0C1519] hover:bg-[#F2F2F0] dark:text-[#F7F1EC] dark:hover:bg-[#2A4354]"
                  }`}
                >
                  <span className="relative z-10 whitespace-nowrap">{navLabels[label]}</span>
                </NavLink>
              ))}
            </nav>
            <div className="ml-auto flex rounded-full bg-white px-2 py-2 shadow-[0_10px_24px_rgba(12,21,25,0.10)] dark:bg-[#1E394B] lg:hidden">
              <button
                type="button"
                onClick={() => handleNavSelect("Home")}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0C1519] text-white transition-transform duration-300 hover:scale-105 dark:bg-[#CF9D7B] dark:text-[#0C1519]"
                aria-label={navLabels.Home}
              >
                <House size={17} />
              </button>
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full text-[#0C1519] transition-all duration-300 hover:scale-105 hover:bg-[#F2F2F0] dark:text-[#F7F1EC] dark:hover:bg-[#2A4354]"
                onClick={() => setMobileMenuOpen(open => !open)}
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
            <NavActionButtons controls={controls} showAuth={false} className="ml-2 flex shrink-0 lg:hidden" />
          </div>
        <NavActionButtons controls={controls} className="ml-auto hidden shrink-0 lg:flex lg:gap-3" />
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[1000000] bg-[#FAFAF9] dark:bg-[#0C1519] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.nav
              className="fixed right-0 top-0 z-[1000000] flex h-screen w-full flex-col overflow-y-auto bg-[#FAFAF9] px-6 pb-10 pt-8 text-[#0C1519] dark:bg-[#0C1519] dark:text-[#F7F1EC]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-12 flex items-center justify-between">
                <span className="font-serif text-3xl font-bold">Draftly.</span>
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0C1519] text-white shadow-[0_12px_24px_rgba(12,21,25,0.16)] transition-transform duration-300 hover:scale-105 dark:bg-[#CF9D7B] dark:text-[#0C1519]"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="grid gap-4">
                {navItems.map(label => (
                  <NavLink
                    key={label}
                    to={NAV_PATHS[label]}
                    end={label === "Home"}
                    onClick={(event) => {
                      event.preventDefault();
                      handleNavSelect(label);
                    }}
                    className={({ isActive }) => `rounded-full px-6 py-5 text-xl font-semibold transition-all duration-300 ${
                      isActive ? "bg-[#0C1519] text-white shadow-[0_14px_28px_rgba(12,21,25,0.14)] dark:bg-[#CF9D7B] dark:text-[#0C1519]" : "bg-white text-[#0C1519] shadow-[0_10px_24px_rgba(12,21,25,0.06)] hover:bg-[#F2F2F0] dark:bg-[#162127] dark:text-[#F7F1EC] dark:hover:bg-[#2A4354]"
                    }`}
                  >
                    {navLabels[label]}
                  </NavLink>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    controls.onLoginClick();
                  }}
                  className="rounded-full bg-white px-6 py-5 text-left text-xl font-semibold text-[#0C1519] shadow-[0_10px_24px_rgba(12,21,25,0.06)] transition-all duration-300 hover:bg-[#F2F2F0] dark:bg-[#162127] dark:text-[#F7F1EC] dark:hover:bg-[#2A4354]"
                >
                  {controls.loginLabel}
                </button>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
    </>
  );
}

export function HomeSimpleNav({
  onSelect: _onSelect,
  controls: _controls,
  ui: _ui,
  scrollContainerRef: _scrollContainerRef,
}: {
  onSelect: (tab: HeaderTab) => void;
  controls: FolderNavControls;
  ui: UiContent;
  scrollContainerRef: RefObject<HTMLElement>;
}) {
  void _onSelect;
  void _controls;
  void _ui;
  void _scrollContainerRef;
  return null;
}
