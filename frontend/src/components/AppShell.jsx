import { LogOut, Palette, WalletCards } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { clearSession } from "../lib/session";
import { themeNames, themes, useTheme } from "../theme/useTheme";

const themeLabels = {
  pastelLight: "Pastel Light",
  pastelDark: "Pastel Dark",
  neoNature: "Neo Nature",
  dreamySky: "Dreamy Sky",
};

export default function AppShell({ children, session, t, language, setLanguage }) {
  const navigate = useNavigate();
  const { themeName, setThemeName } = useTheme();

  function logout() {
    clearSession();
    navigate("/login", { replace: true });
  }

  return (
    <main className="app-frame">
      <header className="topbar">
        <Link className="brand-mark" to="/">
          <span className="brand-glyph">D</span>
          <span>{t("app.name")}</span>
        </Link>

        <nav className="main-nav">
          <NavLink to="/dashboard">{t("nav.dashboard")}</NavLink>
          <NavLink to="/payments">
            <WalletCards size={16} />
            {t("nav.payments")}
          </NavLink>
        </nav>

        <div className="topbar-actions">
          <label className="compact-select">
            <span>{t("common.language")}</span>
            <select value={language} onChange={(event) => setLanguage(event.target.value)}>
              <option value="en">EN</option>
              <option value="mn">MN</option>
            </select>
          </label>

          <label className="compact-select">
            <Palette size={15} />
            <select value={themeName} onChange={(event) => setThemeName(event.target.value)}>
              {themeNames.map((name) => (
                <option key={name} value={name}>
                  {themeLabels[name] ?? name}
                </option>
              ))}
            </select>
          </label>

          {session?.token ? (
            <button className="icon-button" onClick={logout} title={t("nav.logout")} type="button">
              <LogOut size={18} />
            </button>
          ) : (
            <Link className="primary-action" to="/login">
              {t("nav.login")}
            </Link>
          )}
        </div>
      </header>

      <section className="theme-strip" aria-hidden="true">
        {themes[themeName].background.gradient.map((color) => (
          <span key={color} style={{ background: color }} />
        ))}
      </section>

      {children}
    </main>
  );
}
