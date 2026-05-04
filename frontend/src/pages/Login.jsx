import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Building2, Lock, Mail } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import api from "../lib/api.js";

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
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your email and password.");
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

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Google login failed");
    }
  }

  return (
    <main className="grid min-h-screen bg-[#f6f5f1] text-black lg:grid-cols-[1fr_1.05fr]">
      <section className="hidden bg-black p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-black">
            <ArrowRight size={20} className="-rotate-45" />
          </span>
          <span className="text-lg font-medium">LexPilot</span>
        </Link>

        <div>
          <h1 className="font-serif text-[72px] leading-none">
            Welcome back to contract control.
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-white/62">
            Continue drafting, reviewing, and managing contracts with AI assistance from one secure workspace.
          </p>
        </div>

        <p className="text-sm text-white/42">
          Secure login for legal and professional teams.
        </p>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-10 flex items-center gap-3 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-black text-white">
              <ArrowRight size={17} className="-rotate-45" />
            </span>
            <span className="font-medium">LexPilot</span>
          </Link>

          <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/42">
            Login
          </p>
          <h2 className="mt-3 font-serif text-5xl leading-none">
            Access your workspace.
          </h2>

          <div className="mt-8 grid gap-3">
            <div className="w-full overflow-hidden rounded-md bg-white">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google login failed")}
                width="100%"
                text="signin_with"
                shape="rectangular"
              />
            </div>

            <button className="auth-provider-button" type="button">
              <Building2 size={18} />
              Company SSO
            </button>
          </div>

          <div className="my-7 flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.16em] text-black/35">
            <span className="h-px flex-1 bg-black/10" />
            Or login
            <span className="h-px flex-1 bg-black/10" />
          </div>

          <form className="grid gap-4" onSubmit={handleSubmit}>
            <label className="field-label">
              Email
              <span className="input-with-icon">
                <Mail size={17} />
                <input
                  required
                  type="email"
                  value={form.email}
                  placeholder="you@company.com"
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
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
                  onChange={(event) =>
                    setForm({ ...form, password: event.target.value })
                  }
                />
              </span>
            </label>

            {error && (
              <p className="rounded-md border border-[#9d4b28]/25 bg-[#9d4b28]/8 px-4 py-3 text-sm text-[#7d3316]">
                {error}
              </p>
            )}

            <button
              className="primary-button h-12 justify-center"
              disabled={loading}
              type="submit"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-sm text-black/54">
            New to LexPilot?{" "}
            <Link
              className="font-semibold text-black underline underline-offset-4"
              to="/register"
            >
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}