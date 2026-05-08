import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, User } from "lucide-react";
import api from "../lib/api.js";
import BackButton from "../components/BackButton.jsx";
import BrandLogo from "../components/BrandLogo.jsx";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/register", form);
      localStorage.setItem("lexpilot_token", data.token);
      localStorage.setItem("lexpilot_user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Бүртгэл үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f5f1] px-6 py-10 text-black">
      <div className="flex items-center gap-4">
        <BackButton />
        <Link to="/" className="flex items-center gap-4">
          <BrandLogo />
          <span className="brand-wordmark text-2xl">DraftLy</span>
        </Link>
      </div>

      <section className="mx-auto mt-16 grid max-w-5xl gap-10 lg:grid-cols-[0.9fr_1fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/42">Бүртгэл үүсгэх</p>
          <h1 className="mt-4 font-serif text-[64px] leading-none max-md:text-5xl">Гэрээний ажлын орчноо эхлүүл.</h1>
          <p className="mt-6 text-lg leading-8 text-black/58">
            Gmail хаяг болон нууц үгээр бүртгэл үүсгэж, гэрээ боловсруулах ажлаа нэг орчноос удирдаарай.
          </p>
        </div>

        <form className="surface-panel grid gap-4 p-7" onSubmit={handleSubmit}>
          <button className="auth-provider-button" type="button" onClick={() => document.getElementById("register-email")?.focus()}>
            <Mail size={18} />
            Gmail хаяг ашиглах
          </button>
          <label className="field-label">
            Бүтэн нэр
            <span className="input-with-icon">
              <User size={17} />
              <input
                required
                value={form.fullName}
                placeholder="Таны нэр"
                onChange={(event) => setForm({ ...form, fullName: event.target.value })}
              />
            </span>
          </label>
          <label className="field-label">
            Gmail
            <span className="input-with-icon">
              <Mail size={17} />
              <input
                required
                id="register-email"
                type="email"
                value={form.email}
                pattern="^[^@\s]+@gmail\.com$"
                placeholder="teacher@gmail.com"
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
          {error && <p className="rounded-md border border-[#9d4b28]/25 bg-[#9d4b28]/8 px-4 py-3 text-sm text-[#7d3316]">{error}</p>}
          <button className="primary-button h-12 justify-center" disabled={loading} type="submit">
            {loading ? "Бүртгэл үүсгэж байна..." : "Бүртгэл үүсгэх"}
          </button>
          <p className="text-sm text-black/54">
            Бүртгэлтэй юу? <Link className="font-semibold text-black underline underline-offset-4" to="/login">Нэвтрэх</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
