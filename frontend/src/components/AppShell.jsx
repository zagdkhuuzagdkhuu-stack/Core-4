import { CalendarDays, ChevronDown, CloudSun, LogOut, Search, Sun, WalletCards, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { clearSession } from "../lib/session";
import { themeNames, useTheme } from "../theme/useTheme";

const themeLabels = {
  pastelLight: "Pastel Light",
  pastelDark: "Pastel Dark",
  neoNature: "Neo Nature",
  dreamySky: "Dreamy Sky",
};

const searchSuggestions = [
  "search.suggestion.insurance",
  "search.suggestion.court",
  "search.suggestion.passport",
  "search.suggestion.lab",
  "search.suggestion.passport",
  "search.suggestion.lab",
];

export default function AppShell({ children, session, t, language, setLanguage }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { themeName, setThemeName } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isDashboardRoute = location.pathname.startsWith("/dashboard");

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsSearchOpen(false);
      }

      if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function logout() {
    clearSession();
    navigate("/login", { replace: true });
  }

  function goToPricing() {
    if (location.pathname === "/") {
      document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    navigate("/#pricing");
  }

  function closeWhenMouseLeavesDown(event) {
    const bounds = event.currentTarget.getBoundingClientRect();

    if (event.clientY >= bounds.bottom - 2) {
      setIsSearchOpen(false);
    }
  }

  return (
    <main className={`app-frame${isDashboardRoute ? " dashboard-shell-mode" : ""}`}>
      {!isDashboardRoute && <header className="site-header">
        <section className="header-status" aria-label="Quick information">
          <span>
            <CloudSun size={14} />
            {t("status.weather")}
          </span>
          <span>
            <WalletCards size={14} />
            {t("status.currency")}
          </span>
          <span>
            <CalendarDays size={14} />
            {t("status.date")}
          </span>
        </section>

        <section className="topbar">
          <div className="brand-group">
            <Link className="brand-mark" to="/">
              {t("app.name")}.
            </Link>
            <nav className="main-nav">
              <NavLink to="/templates">{t("nav.templates")}</NavLink>
              <a href="#knowledge">
                {t("nav.knowledge")}
                <ChevronDown size={14} />
              </a>
            </nav>
          </div>

          <div className="topbar-actions">
            <button className="nav-tool" onClick={() => setIsSearchOpen(true)} type="button">
              <Search size={15} />
              <span>{t("nav.search")}</span>
            </button>

            <button className="quote-link" onClick={goToPricing} type="button">
              {t("nav.quote")}
            </button>

            {session?.token ? (
              <button className="login-button icon-only" onClick={logout} title={t("nav.logout")} type="button">
                <LogOut size={16} />
              </button>
            ) : (
              <Link className="login-button" to="/login">
                {t("nav.login")}
              </Link>
            )}

            <label className="mood-button" title={t("common.theme")}>
              <Sun size={17} />
              <select aria-label={t("common.theme")} value={themeName} onChange={(event) => setThemeName(event.target.value)}>
                {themeNames.map((name) => (
                  <option key={name} value={name}>
                    {themeLabels[name] ?? name}
                  </option>
                ))}
              </select>
            </label>

            <label className="language-switch">
              <span aria-hidden="true">{language.toUpperCase()}</span>
              <select aria-label={t("common.language")} value={language} onChange={(event) => setLanguage(event.target.value)}>
                <option value="mn">MN</option>
                <option value="en">EN</option>
              </select>
            </label>
          </div>
        </section>
      </header>}

      {children}

      {isSearchOpen && (
        <div className="search-overlay" onMouseDown={() => setIsSearchOpen(false)} role="presentation">
          <section
            aria-label={t("search.title")}
            className="search-modal"
            onMouseDown={(event) => event.stopPropagation()}
            onMouseLeave={closeWhenMouseLeavesDown}
          >
            <button className="search-close" onClick={() => setIsSearchOpen(false)} type="button">
              <X size={20} />
            </button>

            <div className="search-modal-heading">
              <h2>{t("search.title")}</h2>
              <p>{t("search.shortcut")}</p>
            </div>

            <form className="global-search-form">
              <div className="search-input-wrap">
                <Search size={22} />
                <input autoFocus placeholder={t("search.placeholder")} />
              </div>
              <button type="submit">{t("search.submit")}</button>
            </form>

            <div className="suggestion-list">
              <h3>{t("search.suggestions")}</h3>
              {searchSuggestions.map((suggestion, index) => (
                <button key={`${suggestion}-${index}`} type="button">
                  <span>
                    <Search size={19} />
                  </span>
                  {t(suggestion)}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
