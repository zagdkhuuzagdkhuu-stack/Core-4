import { GoogleLogin } from "@react-oauth/google";
import { CircleArrowOutUpLeft, Eye, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { saveSession } from "../lib/session";

export default function AuthPage({ mode, setSession, t }) {
  const navigate = useNavigate();
  const isRegister = mode === "register";
  const isSso = mode === "sso";
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [form, setForm] = useState({ fullName: "", email: "", password: "", companyEmail: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleAuthResponse(response) {
    saveSession(response.data);
    setSession(response.data);
    navigate("/dashboard", { replace: true });
  }

  function readGooglePayload(idToken) {
    const payload = idToken.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = decodeURIComponent(
      atob(normalized)
        .split("")
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    );

    return JSON.parse(decoded);
  }

  function continueWithGoogleSession(idToken) {
    const payload = readGooglePayload(idToken);
    const [firstName, ...lastNameParts] = String(payload.name || "").trim().split(/\s+/);
    const sessionData = {
      token: idToken,
      user: {
        id: payload.sub,
        email: payload.email,
        firstName: firstName || payload.given_name || null,
        lastName: lastNameParts.join(" ") || payload.family_name || null,
        avatarUrl: payload.picture || null,
        role: "USER",
      },
    };

    saveSession(sessionData);
    setSession(sessionData);
    navigate("/dashboard", { replace: true });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");

    if (isSso) {
      setError(t("auth.ssoUnavailable"));
      return;
    }

    setIsLoading(true);

    try {
      const payload = isRegister
        ? { fullName: form.fullName, email: form.email, password: form.password }
        : { email: form.email, password: form.password };
      const response = await api.post(isRegister ? "/auth/register" : "/auth/login", payload);
      await handleAuthResponse(response);
    } catch (authError) {
      setError(authError.response?.data?.message || t("auth.error"));
    } finally {
      setIsLoading(false);
    }
  }

  async function googleLogin(credentialResponse) {
    if (!credentialResponse.credential) return;
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("/auth/google", { idToken: credentialResponse.credential });
      await handleAuthResponse(response);
    } catch (authError) {
      try {
        continueWithGoogleSession(credentialResponse.credential);
      } catch {
        setError(authError.response?.data?.message || t("auth.error"));
      }
    } finally {
      setIsLoading(false);
    }
  }

  const title = isSso ? t("auth.ssoTitle") : isRegister ? t("auth.registerTitle") : t("auth.loginTitle");
  const subtitle = isSso ? t("auth.ssoSubtitle") : isRegister ? t("auth.registerSubtitle") : t("auth.loginSubtitle");

  return (
    <section className="auth-layout">
      <div className={`auth-card auth-design-card ${isSso ? "auth-sso-card" : ""}`}>
        <aside className="auth-art-panel" aria-hidden="true">
          <CircleArrowOutUpLeft className="auth-art-arrow" size={42} />
          <div className="auth-art-copy">
            <span>{t("auth.artSmall")}</span>
            <strong>{t("auth.artTitle")}</strong>
          </div>
        </aside>

        <section className="auth-form-panel">
          <Link className="auth-mini-logo" to="/">
            <span>D</span>
            {t("app.name")}
          </Link>

          <div className="auth-copy">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>

          <form className="auth-form figma-auth-form" onSubmit={submit}>
            {isRegister && (
              <label>
                <span>{t("auth.fullName")}</span>
                <input name="fullName" onChange={updateField} required value={form.fullName} />
              </label>
            )}

            {isSso ? (
              <label>
                <span>{t("auth.companyEmail")}</span>
                <input name="companyEmail" onChange={updateField} placeholder="name@company.com" required type="email" value={form.companyEmail} />
              </label>
            ) : (
              <>
                <label>
                  <span>{t("auth.email")}</span>
                  <input name="email" onChange={updateField} required type="email" value={form.email} />
                </label>

                <label>
                  <span>{t("auth.password")}</span>
                  <div className="password-field">
                    <input
                      minLength={8}
                      name="password"
                      onChange={updateField}
                      required
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                    />
                    <button onClick={() => setShowPassword((current) => !current)} type="button">
                      <Eye size={22} />
                    </button>
                  </div>
                </label>
              </>
            )}

            {!isRegister && !isSso && (
              <Link className="forgot-link" to="/sso">
                {t("auth.forgotPassword")}
              </Link>
            )}

            {error && <p className="form-error">{error}</p>}

            <button className="figma-submit" disabled={isLoading} type="submit">
              {isLoading ? t("common.loading") : isSso ? t("auth.ssoSubmit") : isRegister ? t("auth.registerSubmit") : t("auth.login")}
            </button>
          </form>

          {isSso ? (
            <div className="auth-divider">
              <span />
              <b>{t("auth.or")}</b>
              <span />
            </div>
          ) : (
            <>
              <div className="auth-divider">
                <span />
                <b>{t("auth.continueWith")}</b>
                <span />
              </div>

              <div className="social-row">
                <div className="social-tile google-tile">
                  {googleClientId ? (
                    <GoogleLogin
                      onError={() => setError(t("auth.error"))}
                      onSuccess={googleLogin}
                      shape="circle"
                      size="large"
                      text="continue_with"
                      type="icon"
                    />
                  ) : (
                    <span className="social-letter">G</span>
                  )}
                </div>
                <button className="social-tile" disabled type="button">
                  <span className="social-letter">f</span>
                </button>
              </div>

              {!googleClientId && <p className="form-error">{t("auth.googleConfigMissing")}</p>}
            </>
          )}

          <p className="auth-switch">
            {isSso ? (
              <Link to="/login">{t("auth.usePersonal")}</Link>
            ) : (
              <>
                {isRegister ? t("auth.hasAccount") : t("auth.noAccount")}{" "}
                <Link to={isRegister ? "/login" : "/register"}>{isRegister ? t("nav.login") : t("nav.register")}</Link>
                {!isRegister && (
                  <>
                    {" "}
                    <Link to="/sso">{t("auth.ssoShort")}</Link>
                  </>
                )}
              </>
            )}
          </p>

          {isSso && (
            <div className="sso-note">
              <ShieldCheck size={16} />
              <span>{t("auth.ssoNote")}</span>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
