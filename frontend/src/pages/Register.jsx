import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import api from "../lib/api.js";

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
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f5f1] px-6 py-10 text-black">
      <Link to="/" className="flex items-center gap-4">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-black text-white">
          <ArrowRight size={18} className="-rotate-45" />
        </span>
        <span className="text-lg font-medium">LexPilot</span>
      </Link>

      <section className="mx-auto mt-16 grid max-w-5xl gap-10 lg:grid-cols-[0.9fr_1fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/42">Create Account</p>
          <h1 className="mt-4 font-serif text-[64px] leading-none max-md:text-5xl">Start your contract workspace.</h1>
          <p className="mt-6 text-lg leading-8 text-black/58">
            Teachers can create a Gmail/password account here. The account is saved in your PostgreSQL database.
          </p>
        </div>

        <form className="surface-panel grid gap-4 p-7" onSubmit={handleSubmit}>
          <button className="auth-provider-button" type="button" onClick={() => document.getElementById("register-email")?.focus()}>
            <Mail size={18} />
            Use Gmail address
          </button>
          <label className="field-label">
            Full name
            <span className="input-with-icon">
              <User size={17} />
              <input
                required
                value={form.fullName}
                placeholder="Your name"
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
            Password
            <span className="input-with-icon">
              <Lock size={17} />
              <input
                required
                minLength="8"
                type="password"
                value={form.password}
                placeholder="At least 8 characters"
                onChange={(event) => setForm({ ...form, password: event.target.value })}
              />
            </span>
          </label>
          {error && <p className="rounded-md border border-[#9d4b28]/25 bg-[#9d4b28]/8 px-4 py-3 text-sm text-[#7d3316]">{error}</p>}
          <button className="primary-button h-12 justify-center" disabled={loading} type="submit">
            {loading ? "Creating account..." : "Create account"}
          </button>
          <p className="text-sm text-black/54">
            Already have an account? <Link className="font-semibold text-black underline underline-offset-4" to="/login">Login</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
