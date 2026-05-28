import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Lock, Mail, PenLine, UserRound } from "lucide-react";

type AuthMode = "choice" | "login" | "signin";

const PANEL_TRANSITION = {
  duration: 0.5,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

function ChoiceCard({
  icon: Icon,
  title,
  subtitle,
  onClick,
}: {
  icon: typeof UserRound;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-xl border border-[#2A2A2A] bg-[#141414] px-5 py-4 text-left transition-all hover:border-[#7C3AED]/50 hover:bg-[#1A1A1A]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] text-gray-400">
        <Icon size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold text-white">{title}</span>
        <span className="mt-1 block text-xs text-gray-400">{subtitle}</span>
      </span>
      <ArrowRight size={18} className="text-gray-500 transition-transform group-hover:translate-x-1" />
    </button>
  );
}

function TextField({ icon: Icon, label, type = "text" }: { icon: typeof Mail; label: string; type?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-gray-400">{label}</span>
      <span className="flex h-12 items-center gap-3 rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] px-4 text-white transition-all focus-within:border-[#7C3AED]">
        <Icon size={16} className="text-gray-500" />
        <input type={type} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-500" />
      </span>
    </label>
  );
}

function SocialButton({ children, onClick, icon }: { children: string; onClick?: () => void; icon: "google" | "facebook" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-[#2A2A2A] bg-[#141414] px-3 text-xs font-bold text-gray-300 transition-all hover:border-[#7C3AED]/50"
    >
      {icon === "google" ? <span className="font-black">G</span> : <span className="font-black">f</span>}
      {children}
    </button>
  );
}

function AuthForm({ mode, onSwitch, onGoogleLogin, authBusy }: { mode: Exclude<AuthMode, "choice">; onSwitch: (mode: AuthMode) => void; onGoogleLogin: () => void; authBusy: boolean }) {
  const isLogin = mode === "login";

  return (
    <motion.div
      key={mode}
      className="w-full max-w-md"
      initial={{ opacity: 0, x: 34 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={PANEL_TRANSITION}
    >
      <h1 className="text-3xl font-bold text-white">{isLogin ? "Login" : "Sign in"}</h1>
      <p className="mt-2 text-sm text-gray-400">{isLogin ? "Бүртгэлтэй хэрэглэгч нэвтрэх" : "Шинэ хэрэглэгчийн бүртгэл"}</p>

      <div className="mt-8 space-y-4">
        {!isLogin && <TextField icon={UserRound} label="Full name" />}
        <TextField icon={Mail} label="Email" type="email" />
        <TextField icon={Lock} label="Password" type="password" />
        {!isLogin && <TextField icon={Lock} label="Confirm password" type="password" />}
      </div>

      <button type="button" className="mt-6 h-12 w-full rounded-lg bg-white text-sm font-bold text-black transition-all hover:bg-gray-200">
        {isLogin ? "Login" : "Sign in"}
      </button>

      <div className="mt-5 flex gap-3">
        <SocialButton icon="google" onClick={onGoogleLogin}>
          {authBusy ? "Connecting..." : "Continue with Google"}
        </SocialButton>
        <SocialButton icon="facebook">Continue with Facebook</SocialButton>
      </div>

      <p className="mt-7 text-center text-sm text-gray-400">
        {isLogin ? "Шинээр бүртгүүлэх үү? " : "Бүртгэлтэй юу? "}
        <button type="button" onClick={() => onSwitch(isLogin ? "signin" : "login")} className="font-semibold text-white transition-colors hover:text-[#7C3AED]">
          {isLogin ? "Sign in" : "Login"}
        </button>
      </p>
    </motion.div>
  );
}

export function AuthPage({ onBackHome, onGoogleLogin, authBusy }: { onBackHome: () => void; onGoogleLogin: () => void; authBusy: boolean }) {
  const [mode, setMode] = useState<AuthMode>("choice");
  const formVisible = mode !== "choice";

  return (
    <main className="relative min-h-screen bg-[#0A0A0A]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.08),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(124,58,237,0.03),transparent_50%)]" />
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

      <button
        type="button"
        onClick={onBackHome}
        className="absolute left-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-lg border border-[#2A2A2A] text-gray-400 transition-all hover:border-[#7C3AED]/50 hover:text-white"
        aria-label="Go back"
      >
        <ArrowLeft size={17} />
      </button>

      <section className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <p className="text-3xl font-bold text-white">Draftly.</p>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-500">AI-POWERED LEGAL DOCUMENTS</p>
          </div>

          {mode === "choice" ? (
            <motion.div
              key="choice"
              initial={{ opacity: 0, x: -34 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={PANEL_TRANSITION}
            >
              <h1 className="mb-4 text-center text-2xl font-bold text-white">Хуулийн баримт бичгийг AI-аар хялбархан үүсгээрэй.</h1>
              <p className="mb-8 text-center text-sm text-gray-400">
                Draftly нь танд баримт бичиг үүсгэх, дүн шинжилгээ хийх, хянах, баталгаажуулах бүх үйл явцыг автоматжуулж, хуулийн ажлыг хялбар болгоно.
              </p>
              <div className="space-y-3">
                <ChoiceCard icon={UserRound} title="Login" subtitle="Бүртгэлтэй хэрэглэгч" onClick={() => setMode("login")} />
                <ChoiceCard icon={PenLine} title="Sign in" subtitle="Шинэ хэрэглэгч бүртгүүлэх" onClick={() => setMode("signin")} />
              </div>
            </motion.div>
          ) : (
            <AuthForm mode={mode} onSwitch={setMode} onGoogleLogin={onGoogleLogin} authBusy={authBusy} />
          )}
        </div>
      </section>
    </main>
  );
}
