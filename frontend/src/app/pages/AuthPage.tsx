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
      className="group flex w-full items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 text-left transition-all hover:border-accent/50 hover:bg-muted"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
        <Icon size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold text-foreground">{title}</span>
        <span className="mt-1 block text-xs text-muted-foreground">{subtitle}</span>
      </span>
      <ArrowRight size={18} className="text-muted-foreground transition-transform group-hover:translate-x-1" />
    </button>
  );
}

function AuthForm({
  mode,
  onSwitch,
  onGoogleLogin,
  onSubmit,
  authBusy,
  authError,
}: {
  mode: Exclude<AuthMode, "choice">;
  onSwitch: (mode: AuthMode) => void;
  onGoogleLogin: () => void;
  onSubmit: (email: string, password: string, fullName?: string) => Promise<void>;
  authBusy: boolean;
  authError: string;
}) {
  const isLogin = mode === "login";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async () => {
    setLocalError("");
    if (!email.trim()) { setLocalError("Email оруулна уу."); return; }
    if (!password.trim()) { setLocalError("Нууц үг оруулна уу."); return; }
    if (!isLogin && password !== confirmPassword) {
      setLocalError("Нууц үг таарахгүй байна.");
      return;
    }
    await onSubmit(email, password, isLogin ? undefined : fullName);
  };

  return (
    <motion.div
      key={mode}
      className="w-full max-w-md"
      initial={{ opacity: 0, x: 34 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={PANEL_TRANSITION}
    >
      <h1 className="text-3xl font-bold text-foreground">{isLogin ? "Нэвтрэх" : "Бүртгүүлэх"}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{isLogin ? "Бүртгэлтэй хэрэглэгч нэвтрэх" : "Шинэ хэрэглэгчийн бүртгэл"}</p>

      <div className="mt-8 space-y-4">
        {!isLogin && (
          <label className="block">
            <span className="mb-2 block text-xs font-medium text-muted-foreground">Бүтэн нэр</span>
            <span className="flex h-12 items-center gap-3 rounded-lg border border-border bg-background px-4 text-foreground transition-all focus-within:border-accent">
              <UserRound size={16} className="text-muted-foreground" />
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </span>
          </label>
        )}
        <label className="block">
          <span className="mb-2 block text-xs font-medium text-muted-foreground">И-мэйл</span>
          <span className="flex h-12 items-center gap-3 rounded-lg border border-border bg-background px-4 text-foreground transition-all focus-within:border-accent">
            <Mail size={16} className="text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </span>
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-medium text-muted-foreground">Нууц үг</span>
          <span className="flex h-12 items-center gap-3 rounded-lg border border-border bg-background px-4 text-foreground transition-all focus-within:border-accent">
            <Lock size={16} className="text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </span>
        </label>
        {!isLogin && (
          <label className="block">
            <span className="mb-2 block text-xs font-medium text-muted-foreground">Нууц үг давтах</span>
            <span className="flex h-12 items-center gap-3 rounded-lg border border-border bg-background px-4 text-foreground transition-all focus-within:border-accent">
              <Lock size={16} className="text-muted-foreground" />
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </span>
          </label>
        )}
      </div>

      {(localError || authError) && (
        <p className="mt-4 text-sm text-red-400">{localError || authError}</p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={authBusy}
        className="mt-6 h-12 w-full rounded-lg bg-white text-sm font-bold text-black transition-all hover:bg-gray-200 disabled:opacity-60"
      >
        {authBusy ? "Боловсруулж байна..." : isLogin ? "Нэвтрэх" : "Бүртгүүлэх"}
      </button>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={onGoogleLogin}
          disabled={authBusy}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-bold text-foreground transition-all hover:border-accent/50 disabled:opacity-60"
        >
          <span className="font-black">G</span>
          {authBusy ? "Холбогдож байна..." : "Google-р үргэлжлүүлэх"}
        </button>
        <button
          type="button"
          disabled
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-bold text-muted-foreground opacity-50 cursor-not-allowed"
        >
          <span className="font-black">f</span>
          Facebook
        </button>
      </div>

      <p className="mt-7 text-center text-sm text-muted-foreground">
        {isLogin ? "Шинээр бүртгүүлэх үү? " : "Бүртгэлтэй юу? "}
        <button type="button" onClick={() => onSwitch(isLogin ? "signin" : "login")} className="font-semibold text-foreground transition-colors hover:text-accent">
          {isLogin ? "Бүртгүүлэх" : "Нэвтрэх"}
        </button>
      </p>
    </motion.div>
  );
}

export function AuthPage({
  onBackHome,
  onGoogleLogin,
  onEmailLogin,
  onEmailRegister,
  authBusy,
  authError,
}: {
  onBackHome: () => void;
  onGoogleLogin: () => void;
  onEmailLogin: (email: string, password: string) => Promise<void>;
  onEmailRegister: (email: string, password: string, fullName?: string) => Promise<void>;
  authBusy: boolean;
  authError: string;
}) {
  const [mode, setMode] = useState<AuthMode>("choice");

  return (
    <main className="relative min-h-screen bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.03),transparent_50%)]" />
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

      <button
        type="button"
        onClick={onBackHome}
        className="absolute left-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:border-accent/50 hover:text-foreground"
        aria-label="Буцах"
      >
        <ArrowLeft size={17} />
      </button>

      <section className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <p className="text-3xl font-bold text-foreground">Draftly.</p>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">ХИЙМЭЛ ОЮУНД СУУРИЛСАН ХУУЛИЙН БАРИМТ</p>
          </div>

          {mode === "choice" ? (
            <motion.div
              key="choice"
              initial={{ opacity: 0, x: -34 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={PANEL_TRANSITION}
            >
              <h1 className="mb-4 text-center text-2xl font-bold text-foreground">Хуулийн баримт бичгийг AI-аар хялбархан үүсгээрэй.</h1>
              <p className="mb-8 text-center text-sm text-muted-foreground">
                Draftly нь танд баримт бичиг үүсгэх, дүн шинжилгээ хийх, хянах, баталгаажуулах бүх үйл явцыг автоматжуулж, хуулийн ажлыг хялбар болгоно.
              </p>
              <div className="space-y-3">
                <ChoiceCard icon={UserRound} title="Нэвтрэх" subtitle="Бүртгэлтэй хэрэглэгч" onClick={() => setMode("login")} />
                <ChoiceCard icon={PenLine} title="Бүртгүүлэх" subtitle="Шинэ хэрэглэгч бүртгүүлэх" onClick={() => setMode("signin")} />
              </div>
            </motion.div>
          ) : (
            <AuthForm
              mode={mode}
              onSwitch={setMode}
              onGoogleLogin={onGoogleLogin}
              onSubmit={mode === "login" ? onEmailLogin : onEmailRegister}
              authBusy={authBusy}
              authError={authError}
            />
          )}
        </div>
      </section>
    </main>
  );
}
