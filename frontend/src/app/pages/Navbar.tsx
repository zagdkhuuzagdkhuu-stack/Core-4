import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CircleUserRound, LogOut, Menu, Moon, Settings, Sun, X } from "lucide-react";
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
          className="fixed inset-0 z-[120] flex items-end justify-center bg-black/40 backdrop-blur-sm"
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
            className="max-h-[86vh] w-full overflow-y-auto rounded-t-2xl border border-[#1F1F1F] bg-[#141414] p-5 shadow-[0_-24px_70px_rgba(0,0,0,0.4)] sm:max-w-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Profile</h3>
              <button type="button" onClick={onClose} className="rounded-full border border-[#2A2A2A] bg-[#1A1A1A] p-2">
                <X size={16} className="text-gray-400" />
              </button>
            </div>
            <div className="mb-6 rounded-xl border border-[#2A2A2A] bg-[#1A1A1A]/60 p-4">
              <p className="text-sm font-semibold text-white">{user?.email || "-"}</p>
              <p className="mt-1 text-xs text-gray-400">
                {access.isPaid ? ui.profile.paidAccessActive : ui.profile.paymentRequired}
              </p>
              {!access.profileComplete && (
                <p className="mt-2 text-xs text-red-400">{ui.profile.incompletePrefix} {access.missingFields.join(", ")}</p>
              )}
            </div>

            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-gray-400">
                First name
                <input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="mt-1 w-full rounded-md border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="text-xs font-semibold text-gray-400">
                Last name
                <input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="mt-1 w-full rounded-md border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-2 text-sm text-white"
                />
              </label>
            </div>
            {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
            <div className="mb-6 flex flex-wrap gap-2">
              <button type="button" onClick={handleSave} disabled={saving} className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black disabled:opacity-60">
                {saving ? "Saving..." : ui.profile.saveSettings}
              </button>
              <button type="button" onClick={onLanguageToggle} className="inline-flex items-center gap-2 rounded-full border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-2 text-sm font-semibold text-white">
                <Settings size={14} /> {locale === "mn" ? "Switch to ENG" : "MN руу шилжих"}
              </button>
              <button type="button" onClick={onLogout} className="inline-flex items-center gap-2 rounded-full border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-2 text-sm font-semibold text-white">
                <LogOut size={14} /> Logout
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A]/50 p-4">
                <p className="mb-3 text-sm font-bold text-white">{ui.profile.savedDocuments}</p>
                <div className="space-y-2">
                  {documents.slice(0, 6).map((doc) => (
                    <div key={doc.id} className="rounded-md border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-2">
                      <p className="truncate text-xs font-semibold text-gray-300">{doc.title}</p>
                    </div>
                  ))}
                  {documents.length === 0 && <p className="text-xs text-gray-500">{ui.profile.emptyDocuments}</p>}
                </div>
              </div>
              <div className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A]/50 p-4">
                <p className="mb-3 text-sm font-bold text-white">{ui.profile.savedContracts}</p>
                <div className="space-y-2">
                  {contracts.slice(0, 6).map((contract) => (
                    <div key={contract.id} className="rounded-md border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-2">
                      <p className="truncate text-xs font-semibold text-gray-300">{contract.title}</p>
                    </div>
                  ))}
                  {contracts.length === 0 && <p className="text-xs text-gray-500">{ui.profile.emptyContracts}</p>}
                </div>
              </div>
            </div>
          </motion.div>
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0A0A]"
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 1, 0] }}
      transition={{ duration: 2, times: [0, 0.8, 1], ease: "easeInOut" }}
      aria-hidden="true"
    >
      <motion.div
        className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
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
        isScrolled ? "bg-[#0A0A0A]/90 backdrop-blur-lg shadow-[0_1px_0_rgba(255,255,255,0.06)]" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => onSelect("Home")}
          className="text-xl font-bold tracking-tight text-white"
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
                  ? "text-white"
                  : "text-gray-400 hover:text-white"
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
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:text-white transition-colors"
            aria-label="Toggle dark mode"
          >
            {controls.isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            type="button"
            onClick={controls.onLanguageToggle}
            className="hidden rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors sm:block"
          >
            {controls.languageLabel}
          </button>
          {controls.isAuthenticated ? (
            <button
              type="button"
              onClick={controls.onProfileClick}
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Open profile"
            >
              {controls.userAvatarUrl ? (
                <img src={controls.userAvatarUrl} alt="Profile" className="h-full w-full object-cover" />
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
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:text-white md:hidden"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>
    </motion.header>

    <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div
          className="fixed inset-0 z-[1000] bg-[#0A0A0A] md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex h-16 items-center justify-between px-4">
            <span className="text-xl font-bold text-white">Draftly.</span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400"
              aria-label="Close menu"
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
                  activeTab === label ? "text-white bg-white/5" : "text-gray-400"
                }`}
              >
                {navLabels[label]}
              </button>
            ))}
            <button
              type="button"
              onClick={controls.onLanguageToggle}
              className="rounded-lg px-4 py-4 text-left text-lg font-medium text-gray-400"
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
