import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Lock, Mail } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import api from "../lib/api.js";
import BackButton from "../components/BackButton.jsx";
import BrandLogo from "../components/BrandLogo.jsx";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("lexpilot_token", data.token);
      localStorage.setItem("lexpilot_user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Нэвтрэхэд алдаа гарлаа. Имэйл болон нууц үгээ шалгана уу.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    try {
      setError("");

      const { data } = await api.post("/auth/google", {
        idToken: credentialResponse.credential,
      });

      localStorage.setItem("lexpilot_token", data.token);
      localStorage.setItem("lexpilot_user", JSON.stringify(data.user));

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Google-ээр нэвтрэхэд алдаа гарлаа");
    }
  }

  return (
    <main className="grid min-h-screen grid-rows-[auto_1fr] bg-[#f6f5f1] px-6 py-6 text-black">
      <div className="flex items-center gap-4">
        <BackButton />
        <Link to="/" className="flex items-center gap-4">
          <BrandLogo />
          <span className="brand-wordmark text-2xl">DraftLy</span>
        </Link>
      </div>

      <section className="mx-auto grid w-full max-w-5xl items-center gap-8 self-center lg:grid-cols-[0.9fr_1fr]">
        <div className="lg:-translate-y-16">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/42">
            Нэвтрэх
          </p>
          <h1 className="mt-3 font-serif text-[clamp(38px,4.4vw,56px)] leading-[1.02]">
            Гэрээ, баримт бичгээ ухаалгаар удирдах орчинд нэвтэр.
          </h1>
          <p className="mt-5 max-w-xl text-[16px] leading-7 text-black/58">
            Хиймэл оюуны тусламжтай гэрээ боловсруулах, хянах, удирдах ажлаа үргэлжлүүлэхийн тулд нэвтэрнэ үү.
          </p>
        </div>

        <section className="surface-panel grid gap-3 p-6">
          <div className="grid gap-3">
            <div className="google-login-shell">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google-ээр нэвтрэхэд алдаа гарлаа")}
                width="100%"
                text="signin_with"
                shape="rectangular"
              />
            </div>

            <button className="auth-provider-button" type="button">
              <Building2 size={18} />
              Байгууллагын SSO
            </button>
          </div>

          <div className="my-4 flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.16em] text-black/35">
            <span className="h-px flex-1 bg-black/10" />
            Эсвэл нэвтрэх
            <span className="h-px flex-1 bg-black/10" />
          </div>

          <form className="grid gap-4" onSubmit={handleSubmit}>
            <label className="field-label">
              Имэйл
              <span className="input-with-icon">
                <Mail size={17} />
                <input
                  required
                  type="email"
                  value={form.email}
                  placeholder="you@company.com"
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                />
              </span>
            </label>

            <label className="field-label">
              Нууц үг
              <span className="input-with-icon">
                <Lock size={17} />
                <input
                  required
                  minLength="8"
                  type="password"
                  value={form.password}
                  placeholder="Доод тал нь 8 тэмдэгт"
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                />
              </span>
            </label>

            {error && (
              <p className="rounded-md border border-[#9d4b28]/25 bg-[#9d4b28]/8 px-4 py-3 text-sm text-[#7d3316]">
                {error}
              </p>
            )}

            <button className="primary-button h-12 justify-center" disabled={loading} type="submit">
              {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
            </button>
          </form>

          <p className="mt-2 text-sm text-black/54">
            DraftLy-д шинээр үү?{" "}
            <Link className="font-semibold text-black underline underline-offset-4" to="/register">
              Бүртгэл үүсгэх
            </Link>
          </p>
        </section>
      </section>
    </main>
  );
}
