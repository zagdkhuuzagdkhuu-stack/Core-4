import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, CheckCircle2, Facebook, FileCheck2, FileText, Gavel, Lock, Mail, PenLine, Scale, UserRound } from "lucide-react";

type AuthMode = "choice" | "login" | "signin";

const PANEL_TRANSITION = {
  duration: 0.72,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

function DocumentIllustration({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`relative mx-auto aspect-square w-full max-w-[34rem] ${compact ? "max-w-[25rem]" : ""}`}>
      <div className="absolute inset-[8%] rounded-full border border-border/55" />
      <div className="absolute inset-[18%] rounded-full border border-border/45" />
      <motion.div
        className="absolute left-[24%] top-[12%] h-[66%] w-[46%] rotate-[-8deg] rounded-[1.4rem] border border-border bg-card shadow-[0_24px_60px_rgba(12,21,25,0.12)]"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="mx-7 mt-8 h-2 rounded-full bg-border/70" />
        <div className="mx-7 mt-5 h-1.5 rounded-full bg-border/55" />
        <div className="mx-7 mt-3 h-1.5 w-2/3 rounded-full bg-border/45" />
        <div className="absolute bottom-8 left-8 h-10 w-24 rounded-full border border-border/70" />
      </motion.div>
      <motion.div
        className="absolute left-[36%] top-[20%] h-[66%] w-[48%] rotate-[5deg] rounded-[1.4rem] border border-border bg-secondary shadow-[0_28px_70px_rgba(12,21,25,0.16)]"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex items-center gap-2 border-b border-border/65 px-7 py-5">
          <FileText size={18} className="text-foreground/70" />
          <div className="h-2 flex-1 rounded-full bg-border/65" />
        </div>
        <div className="space-y-3 px-8 py-8">
          <div className="h-2 rounded-full bg-border/75" />
          <div className="h-2 rounded-full bg-border/55" />
          <div className="h-2 w-2/3 rounded-full bg-border/45" />
          <div className="pt-8">
            <PenLine size={70} className="-rotate-12 text-foreground/20" strokeWidth={1.1} />
          </div>
        </div>
        <div className="absolute bottom-8 right-8 flex h-20 w-20 items-center justify-center rounded-full border-2 border-button/25 text-button/45">
          <CheckCircle2 size={34} strokeWidth={1.35} />
        </div>
      </motion.div>
      <div className="absolute left-[16%] bottom-[20%] flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card text-foreground/55 shadow-sm">
        <Scale size={24} strokeWidth={1.4} />
      </div>
      <div className="absolute right-[13%] top-[24%] flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card text-foreground/55 shadow-sm">
        <Gavel size={23} strokeWidth={1.4} />
      </div>
      <div className="absolute right-[18%] bottom-[16%] flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-button/65 shadow-sm">
        <FileCheck2 size={21} strokeWidth={1.5} />
      </div>
    </div>
  );
}

function ChoiceCard({
  icon: Icon,
  title,
  subtitle,
  active,
  onClick,
}: {
  icon: typeof UserRound;
  title: string;
  subtitle: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-4 rounded-[1.2rem] border px-5 py-4 text-left transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(12,21,25,0.12)] ${
        active
          ? "border-button bg-button text-button-text"
          : "border-border bg-card text-foreground hover:border-highlight"
      }`}
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${active ? "border-button-text/25 bg-button-text/10" : "border-border bg-secondary"}`}>
        <Icon size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-bold">{title}</span>
        <span className={`mt-1 block text-xs ${active ? "text-button-text/75" : "text-muted-foreground"}`}>{subtitle}</span>
      </span>
      <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
    </button>
  );
}

function TextField({ icon: Icon, label, type = "text" }: { icon: typeof Mail; label: string; type?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-muted-foreground">{label}</span>
      <span className="flex h-12 items-center gap-3 rounded-xl border border-border bg-background px-4 text-foreground transition-all duration-300 focus-within:border-button focus-within:shadow-[0_0_0_4px_rgba(12,21,25,0.06)]">
        <Icon size={16} className="text-muted-foreground" />
        <input type={type} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/45" />
      </span>
    </label>
  );
}

function SocialButton({ children, onClick, icon }: { children: string; onClick?: () => void; icon: "google" | "facebook" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 text-xs font-bold text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-highlight hover:shadow-[0_10px_24px_rgba(12,21,25,0.08)]"
    >
      {icon === "google" ? <span className="font-black">G</span> : <Facebook size={15} />}
      {children}
    </button>
  );
}

function AuthForm({ mode, onSwitch, onGoogleLogin, authBusy }: { mode: Exclude<AuthMode, "choice">; onSwitch: (mode: AuthMode) => void; onGoogleLogin: () => void; authBusy: boolean }) {
  const isLogin = mode === "login";

  return (
    <motion.div
      key={mode}
      className="w-full max-w-[27rem]"
      initial={{ opacity: 0, x: 34 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={PANEL_TRANSITION}
    >
      <h1 className="font-display text-4xl font-black text-foreground">{isLogin ? "Login" : "Sign in"}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{isLogin ? "Бүртгэлтэй хэрэглэгч нэвтрэх" : "Шинэ хэрэглэгчийн бүртгэл"}</p>

      <div className="mt-8 space-y-4">
        {!isLogin && <TextField icon={UserRound} label="Full name" />}
        <TextField icon={Mail} label="Email" type="email" />
        <TextField icon={Lock} label="Password" type="password" />
        {!isLogin && <TextField icon={Lock} label="Confirm password" type="password" />}
      </div>

      {isLogin && (
        <button type="button" className="mt-3 text-xs font-semibold text-foreground transition-colors duration-300 hover:text-button">
          Нууц үг мартсан уу?
        </button>
      )}

      <button type="button" className="mt-6 h-12 w-full rounded-full bg-button text-sm font-bold text-button-text shadow-[0_16px_34px_rgba(12,21,25,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(12,21,25,0.20)]">
        {isLogin ? "Login" : "Sign in"}
      </button>

      <div className="mt-5 flex gap-3">
        <SocialButton icon="google" onClick={onGoogleLogin}>
          {authBusy ? "Connecting..." : "Continue with Google"}
        </SocialButton>
        <SocialButton icon="facebook">Continue with Facebook</SocialButton>
      </div>

      <p className="mt-7 text-center text-sm text-muted-foreground">
        {isLogin ? "Шинээр бүртгүүлэх үү? " : "Бүртгэлтэй юу? "}
        <button type="button" onClick={() => onSwitch(isLogin ? "signin" : "login")} className="font-bold text-foreground transition-colors duration-300 hover:text-button">
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
    <main className="relative min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:radial-gradient(circle_at_1px_1px,var(--border)_1px,transparent_0)] [background-size:18px_18px]" />
      <div className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full border border-border/35" />
      <div className="pointer-events-none absolute -right-24 bottom-12 h-80 w-80 rounded-full border border-border/35" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-[radial-gradient(ellipse_at_bottom,var(--highlight),transparent_60%)] opacity-20" />

      <button
        type="button"
        onClick={onBackHome}
        className="absolute left-5 top-5 z-20 group flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/70 text-foreground shadow-[0_10px_24px_rgba(12,21,25,0.08)] transition-all duration-300 hover:border-highlight hover:bg-secondary dark:border-highlight/25 dark:bg-card/70 dark:hover:bg-card"
        aria-label="Go back"
      >
        <ArrowLeft size={17} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
      </button>

      <section className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <motion.div
          className={`flex min-h-[50vh] items-center justify-center bg-background p-8 lg:min-h-screen lg:p-12 ${formVisible ? "lg:order-1" : "lg:order-2"}`}
          layout
          transition={PANEL_TRANSITION}
        >
          <DocumentIllustration compact={formVisible} />
        </motion.div>

        <motion.div
          className={`flex min-h-[50vh] items-center justify-center bg-secondary p-8 lg:min-h-screen lg:p-12 ${formVisible ? "lg:order-2" : "lg:order-1"}`}
          layout
          transition={PANEL_TRANSITION}
        >
          {mode === "choice" ? (
            <motion.div
              key="choice"
              className="w-full max-w-[34rem]"
              initial={{ opacity: 0, x: -34 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={PANEL_TRANSITION}
            >
              <div className="mb-10">
                <p className="font-display text-4xl font-black text-foreground">Draftly.</p>
                <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">AI-POWERED LEGAL DOCUMENTS</p>
                <h1 className="mt-5 font-display text-4xl font-black leading-tight text-foreground md:text-5xl">
                  Хуулийн баримт бичгийг AI-аар хялбархан үүсгээрэй.
                </h1>
                <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground">
                  Draftly нь танд баримт бичиг үүсгэх, дүн шинжилгээ хийх, хянах, баталгаажуулах бүх үйл явцыг автоматжуулж, хуулийн ажлыг хялбар болгоно.
                </p>
              </div>

              <div className="grid gap-3">
                <ChoiceCard icon={UserRound} title="Login" subtitle="Бүртгэлтэй хэрэглэгч" active={mode === "login"} onClick={() => setMode("login")} />
                <ChoiceCard icon={PenLine} title="Sign in" subtitle="Шинэ хэрэглэгч бүртгүүлэх" active={mode === "signin"} onClick={() => setMode("signin")} />
              </div>
            </motion.div>
          ) : (
            <AuthForm mode={mode} onSwitch={setMode} onGoogleLogin={onGoogleLogin} authBusy={authBusy} />
          )}
        </motion.div>
      </section>
    </main>
  );
}
