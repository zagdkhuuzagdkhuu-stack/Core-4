import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { saveSession } from "../lib/session";

export default function AuthPage({ mode, setSession, t }) {
  const navigate = useNavigate();
  const isRegister = mode === "register";
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleAuthResponse(response) {
    saveSession(response.data);
    setSession(response.data);
    navigate("/dashboard", { replace: true });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
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
      setError(authError.response?.data?.message || t("auth.error"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="auth-layout">
      <div className="auth-card">
        <div className="section-heading compact">
          <p className="eyebrow">{isRegister ? t("nav.register") : t("nav.login")}</p>
          <h1>{isRegister ? t("auth.registerTitle") : t("auth.loginTitle")}</h1>
          <p>{isRegister ? t("auth.registerSubtitle") : t("auth.loginSubtitle")}</p>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {isRegister && (
            <label>
              <span>{t("auth.fullName")}</span>
              <input name="fullName" onChange={updateField} required value={form.fullName} />
            </label>
          )}

          <label>
            <span>{t("auth.email")}</span>
            <input name="email" onChange={updateField} required type="email" value={form.email} />
          </label>

          <label>
            <span>{t("auth.password")}</span>
            <input minLength={8} name="password" onChange={updateField} required type="password" value={form.password} />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="primary-action wide" disabled={isLoading} type="submit">
            {isLoading ? t("common.loading") : isRegister ? t("auth.register") : t("auth.login")}
          </button>
        </form>

        <div className="google-wrap">
          <GoogleLogin onError={() => setError(t("auth.error"))} onSuccess={googleLogin} text="continue_with" />
        </div>

        <p className="auth-switch">
          {isRegister ? t("auth.hasAccount") : t("auth.noAccount")}{" "}
          <Link to={isRegister ? "/login" : "/register"}>{isRegister ? t("nav.login") : t("nav.register")}</Link>
        </p>
      </div>
    </section>
  );
}
