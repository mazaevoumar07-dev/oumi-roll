"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, normalizePhone } from "@/context/AuthContext";

/* ===== PAGE ===== */

type Mode = "login" | "register" | "reset";

export default function ConnexionPage() {
  const [mode, setMode] = useState<Mode>("login");
  const router = useRouter();

  function onSuccess() { router.push("/"); }

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-[#0D0D0D] px-5 py-12">
      <div className="w-full max-w-[420px]">

        {/* Brand mark */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex flex-col items-center gap-1">
            <LogoIcon />
            <span className="font-[family-name:var(--font-cormorant)] text-[13px] tracking-[0.3em] text-[#C8A96E] uppercase">
              OUMI ROLL
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[4px] overflow-hidden">
          {mode === "reset" ? (
            <ResetForm onBack={() => setMode("login")} />
          ) : (
            <>
              {/* Tabs */}
              <div className="flex border-b border-[#2A2A2A]">
                {(["login", "register"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={[
                      "flex-1 py-4 text-[12px] tracking-[0.1em] uppercase transition-colors duration-200 font-[family-name:var(--font-dm-sans)]",
                      mode === m
                        ? "text-[#C8A96E] border-b-2 border-[#C8A96E] -mb-px"
                        : "text-[#8A8A8A] hover:text-[#F0EAD6]",
                    ].join(" ")}
                  >
                    {m === "login" ? "Se connecter" : "S'inscrire"}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {mode === "login"
                  ? <LoginForm onSuccess={onSuccess} onForgot={() => setMode("reset")} />
                  : <RegisterForm onSuccess={onSuccess} onLogin={() => setMode("login")} />
                }
              </div>
            </>
          )}
        </div>

        {/* Continue without account */}
        <p className="mt-5 text-center font-[family-name:var(--font-dm-sans)] text-[12.5px] text-[#8A8A8A]">
          Pas encore prêt ?{" "}
          <Link href="/#menu" className="text-[#C8A96E] hover:text-[#E2C07A] transition-colors">
            Continuer sans compte
          </Link>
        </p>

      </div>
    </div>
  );
}

/* ===== LOGIN FORM ===== */

function LoginForm({ onSuccess, onForgot }: { onSuccess: () => void; onForgot: () => void }) {
  const { login } = useAuth();
  const [phone, setPhone]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);

  function getRemainingMinutes() {
    if (!blockedUntil) return 0;
    return Math.ceil((blockedUntil - Date.now()) / 60000);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!phone.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    const result = login(phone, password);
    if (result.success) {
      onSuccess();
    } else if ("blockedUntil" in result && result.blockedUntil) {
      setBlockedUntil(result.blockedUntil);
      setError("");
    } else {
      setBlockedUntil(null);
      let msg = result.error;
      if ("attemptsLeft" in result && result.attemptsLeft !== undefined && result.attemptsLeft <= 2) {
        msg += ` (${result.attemptsLeft} tentative${result.attemptsLeft > 1 ? "s" : ""} restante${result.attemptsLeft > 1 ? "s" : ""})`;
      }
      setError(msg);
    }
  }

  if (blockedUntil && Date.now() < blockedUntil) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="w-10 h-10 rounded-full border border-[#C0392B]/40 flex items-center justify-center text-[#C0392B]">
          <LockClosedIcon />
        </div>
        <div>
          <p className="font-[family-name:var(--font-cormorant)] text-[20px] text-[#F0EAD6] mb-1">Compte bloqué</p>
          <p className="font-[family-name:var(--font-dm-sans)] text-[12.5px] text-[#8A8A8A] leading-[1.6]">
            Trop de tentatives. Réessayez dans{" "}
            <span className="text-[#F0EAD6]">{getRemainingMinutes()} minute{getRemainingMinutes() > 1 ? "s" : ""}</span>.
          </p>
        </div>
        <button
          onClick={() => { setBlockedUntil(null); setPhone(""); setPassword(""); }}
          className="text-[12px] text-[#C8A96E] hover:text-[#E2C07A] transition-colors font-[family-name:var(--font-dm-sans)]"
        >
          Réinitialiser le mot de passe
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Field
        label="Téléphone" type="tel" value={phone} autoComplete="tel"
        placeholder="06 12 34 56 78" onChange={setPhone}
      />
      <PassField
        label="Mot de passe" value={password} autoComplete="current-password"
        placeholder="••••••••" show={showPass}
        onChange={setPassword} onToggle={() => setShowPass(v => !v)}
      />

      {error && <ErrorBanner>{error}</ErrorBanner>}

      <button
        type="submit"
        className="mt-1 w-full py-[13px] bg-[#C8A96E] text-[#0D0D0D] text-[13px] tracking-[0.08em] uppercase font-medium rounded-[4px] hover:bg-[#E2C07A] transition-colors font-[family-name:var(--font-dm-sans)]"
      >
        Se connecter
      </button>

      <button
        type="button" onClick={onForgot}
        className="text-center text-[12px] text-[#8A8A8A] hover:text-[#C8A96E] transition-colors font-[family-name:var(--font-dm-sans)]"
      >
        Mot de passe oublié ?
      </button>
    </form>
  );
}

/* ===== REGISTER FORM ===== */

interface RegData { prenom: string; nom: string; telephone: string; password: string; smsConsent: boolean }
type RegErrors = Partial<Record<keyof Omit<RegData, "smsConsent">, string>>;

function isValidPhone(v: string): boolean {
  const n = v.replace(/[\s\-\.]/g, "");
  return /^(0[1-9]\d{8}|(\+33|0033)[1-9]\d{8})$/.test(n);
}

function validateReg(d: RegData): RegErrors {
  const e: RegErrors = {};
  if (!d.prenom.trim())    e.prenom    = "Le prénom est requis";
  if (!d.nom.trim())       e.nom       = "Le nom est requis";
  if (!d.telephone.trim()) e.telephone = "Le téléphone est requis";
  else if (!isValidPhone(d.telephone)) e.telephone = "Format invalide — ex : 06 12 34 56 78";
  if (!d.password.trim())  e.password  = "Le mot de passe est requis";
  else if (d.password.length < 6) e.password = "Minimum 6 caractères";
  return e;
}

function RegisterForm({ onSuccess, onLogin }: { onSuccess: () => void; onLogin: () => void }) {
  const { register } = useAuth();
  const [data, setData]         = useState<RegData>({ prenom: "", nom: "", telephone: "", password: "", smsConsent: false });
  const [errors, setErrors]     = useState<RegErrors>({});
  const [touched, setTouched]   = useState<Partial<Record<string, boolean>>>({});
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState("");

  function set(field: keyof RegData, value: string | boolean) {
    const next = { ...data, [field]: value } as RegData;
    setData(next);
    if (touched[field]) {
      const e = validateReg(next);
      setErrors(prev => ({ ...prev, [field]: (e as RegErrors)[field as keyof RegErrors] }));
    }
  }

  function blur(field: keyof RegData) {
    setTouched(t => ({ ...t, [field]: true }));
    const e = validateReg(data);
    setErrors(prev => ({ ...prev, [field]: (e as RegErrors)[field as keyof RegErrors] }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    const allTouched = Object.fromEntries(Object.keys(data).map(k => [k, true]));
    setTouched(allTouched);
    const errs = validateReg(data);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const result = register(data);
    if (result.success) {
      onSuccess();
    } else {
      setServerError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Prénom" required value={data.prenom} error={errors.prenom} autoComplete="given-name"
          placeholder="Jean" onChange={v => set("prenom", v)} onBlur={() => blur("prenom")} />
        <Field label="Nom" required value={data.nom} error={errors.nom} autoComplete="family-name"
          placeholder="Dupont" onChange={v => set("nom", v)} onBlur={() => blur("nom")} />
      </div>
      <Field label="Téléphone" required type="tel" value={data.telephone} error={errors.telephone}
        autoComplete="tel" placeholder="06 12 34 56 78"
        onChange={v => set("telephone", v)} onBlur={() => blur("telephone")} />
      <PassField label="Mot de passe" required value={data.password} error={errors.password}
        autoComplete="new-password" placeholder="Minimum 6 caractères" show={showPass}
        onChange={v => set("password", v)} onBlur={() => blur("password")}
        onToggle={() => setShowPass(v => !v)} />

      {/* RGPD SMS consent */}
      <label className="flex items-start gap-3 cursor-pointer group mt-1">
        <div
          className={[
            "flex-shrink-0 w-4 h-4 mt-0.5 border rounded-sm transition-colors flex items-center justify-center",
            data.smsConsent ? "bg-[#C8A96E] border-[#C8A96E]" : "border-[#2A2A2A] group-hover:border-[#C8A96E]/50",
          ].join(" ")}
          onClick={() => set("smsConsent", !data.smsConsent)}
        >
          {data.smsConsent && (
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
        <input type="checkbox" className="sr-only" checked={data.smsConsent} onChange={e => set("smsConsent", e.target.checked)} />
        <span className="font-[family-name:var(--font-dm-sans)] text-[11.5px] text-[#8A8A8A] leading-[1.6]">
          J&apos;accepte de recevoir des SMS promotionnels d&apos;OUMI ROLL.
          Vous pouvez retirer ce consentement à tout moment. <span className="text-[#C8A96E]/60">(Optionnel)</span>
        </span>
      </label>

      {serverError && <ErrorBanner>{serverError}</ErrorBanner>}

      <button
        type="submit"
        className="mt-1 w-full py-[13px] bg-[#C8A96E] text-[#0D0D0D] text-[13px] tracking-[0.08em] uppercase font-medium rounded-[4px] hover:bg-[#E2C07A] transition-colors font-[family-name:var(--font-dm-sans)]"
      >
        Créer mon compte
      </button>

      <p className="text-center font-[family-name:var(--font-dm-sans)] text-[12px] text-[#8A8A8A]">
        Déjà un compte ?{" "}
        <button type="button" onClick={onLogin} className="text-[#C8A96E] hover:text-[#E2C07A] transition-colors">
          Se connecter
        </button>
      </p>
    </form>
  );
}

/* ===== RESET PASSWORD FORM ===== */

type ResetStep = 1 | 2 | 3;

function ResetForm({ onBack }: { onBack: () => void }) {
  const { updatePassword } = useAuth();
  const [step, setStep]       = useState<ResetStep>(1);
  const [phone, setPhone]     = useState("");
  const [code, setCode]       = useState("");
  const [newPass, setNewPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]     = useState("");

  function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!isValidPhone(phone)) { setError("Numéro de téléphone invalide."); return; }
    // Phase 1: mock — any registered phone works; skip server call
    setStep(2);
  }

  function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setError("Le code doit contenir 6 chiffres.");
      return;
    }
    // Phase 1: accept any 6-digit code
    setStep(3);
  }

  function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPass.length < 6) { setError("Minimum 6 caractères."); return; }
    updatePassword(phone, newPass);
    setStep(1); // done — go back to login
    onBack();
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-[#8A8A8A] hover:text-[#F0EAD6] transition-colors" aria-label="Retour">
          <ArrowLeftIcon />
        </button>
        <h2 className="font-[family-name:var(--font-cormorant)] text-[20px] text-[#F0EAD6] font-medium">
          Réinitialiser le mot de passe
        </h2>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1.5 mb-6">
        {([1, 2, 3] as ResetStep[]).map(s => (
          <div key={s} className={["h-0.5 flex-1 rounded-full transition-colors", s <= step ? "bg-[#C8A96E]" : "bg-[#2A2A2A]"].join(" ")} />
        ))}
      </div>

      {step === 1 && (
        <form onSubmit={handleSendCode} noValidate className="flex flex-col gap-4">
          <p className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[#8A8A8A] leading-[1.6]">
            Entrez votre numéro de téléphone et nous vous enverrons un code par SMS.
          </p>
          <Field label="Téléphone" type="tel" value={phone} autoComplete="tel"
            placeholder="06 12 34 56 78" onChange={setPhone} />
          {error && <ErrorBanner>{error}</ErrorBanner>}
          <button type="submit" className="w-full py-[13px] bg-[#C8A96E] text-[#0D0D0D] text-[13px] tracking-[0.08em] uppercase font-medium rounded-[4px] hover:bg-[#E2C07A] transition-colors font-[family-name:var(--font-dm-sans)]">
            Envoyer le code
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyCode} noValidate className="flex flex-col gap-4">
          <p className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[#8A8A8A] leading-[1.6]">
            Un code à 6 chiffres a été envoyé au{" "}
            <span className="text-[#F0EAD6]">{phone}</span>.
          </p>
          <Field label="Code de vérification" type="tel" value={code} autoComplete="one-time-code"
            placeholder="123456" onChange={v => setCode(v.replace(/\D/g, "").slice(0, 6))} />
          {error && <ErrorBanner>{error}</ErrorBanner>}
          <button type="submit" className="w-full py-[13px] bg-[#C8A96E] text-[#0D0D0D] text-[13px] tracking-[0.08em] uppercase font-medium rounded-[4px] hover:bg-[#E2C07A] transition-colors font-[family-name:var(--font-dm-sans)]">
            Vérifier le code
          </button>
          <button type="button" onClick={() => setStep(1)} className="text-center text-[12px] text-[#8A8A8A] hover:text-[#C8A96E] transition-colors font-[family-name:var(--font-dm-sans)]">
            Renvoyer le code
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleReset} noValidate className="flex flex-col gap-4">
          <p className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[#8A8A8A] leading-[1.6]">
            Créez votre nouveau mot de passe.
          </p>
          <PassField label="Nouveau mot de passe" value={newPass} autoComplete="new-password"
            placeholder="Minimum 6 caractères" show={showPass}
            onChange={setNewPass} onToggle={() => setShowPass(v => !v)} />
          {error && <ErrorBanner>{error}</ErrorBanner>}
          <button type="submit" className="w-full py-[13px] bg-[#C8A96E] text-[#0D0D0D] text-[13px] tracking-[0.08em] uppercase font-medium rounded-[4px] hover:bg-[#E2C07A] transition-colors font-[family-name:var(--font-dm-sans)]">
            Réinitialiser le mot de passe
          </button>
        </form>
      )}
    </div>
  );
}

/* ===== REUSABLE FIELDS ===== */

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}

function Field({ label, value, onChange, onBlur, error, required, type = "text", placeholder, autoComplete }: FieldProps) {
  const id = `f-${label.replace(/\s/g, "-").toLowerCase()}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[11px] tracking-[0.14em] uppercase text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]">
        {label}{required && <span className="text-[#C8A96E] ml-0.5">*</span>}
      </label>
      <input
        id={id} type={type} value={value} autoComplete={autoComplete} placeholder={placeholder}
        onChange={e => onChange(e.target.value)} onBlur={onBlur}
        className={[
          "h-11 px-4 bg-[#111] border rounded-[4px] text-[13.5px] text-[#F0EAD6] placeholder:text-[#8A8A8A]/40",
          "outline-none transition-colors duration-200 font-[family-name:var(--font-dm-sans)]",
          error ? "border-[#C0392B]" : "border-[#2A2A2A] focus:border-[#C8A96E]",
        ].join(" ")}
      />
      {error && (
        <p className="text-[11.5px] text-[#C0392B] flex items-center gap-1.5 font-[family-name:var(--font-dm-sans)]">
          <ErrIcon />{error}
        </p>
      )}
    </div>
  );
}

interface PassFieldProps extends Omit<FieldProps, "type"> {
  show: boolean;
  onToggle: () => void;
}

function PassField({ label, value, onChange, onBlur, error, required, placeholder, autoComplete, show, onToggle }: PassFieldProps) {
  const id = `f-${label.replace(/\s/g, "-").toLowerCase()}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[11px] tracking-[0.14em] uppercase text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]">
        {label}{required && <span className="text-[#C8A96E] ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          id={id} type={show ? "text" : "password"} value={value}
          autoComplete={autoComplete} placeholder={placeholder}
          onChange={e => onChange(e.target.value)} onBlur={onBlur}
          className={[
            "w-full h-11 px-4 pr-11 bg-[#111] border rounded-[4px] text-[13.5px] text-[#F0EAD6] placeholder:text-[#8A8A8A]/40",
            "outline-none transition-colors duration-200 font-[family-name:var(--font-dm-sans)]",
            error ? "border-[#C0392B]" : "border-[#2A2A2A] focus:border-[#C8A96E]",
          ].join(" ")}
        />
        <button
          type="button" onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#F0EAD6] transition-colors"
          aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && (
        <p className="text-[11.5px] text-[#C0392B] flex items-center gap-1.5 font-[family-name:var(--font-dm-sans)]">
          <ErrIcon />{error}
        </p>
      )}
    </div>
  );
}

function ErrorBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 px-3.5 py-3 bg-[#C0392B]/10 border border-[#C0392B]/30 rounded-[4px]">
      <ErrIcon className="mt-[1px] flex-shrink-0" />
      <p className="font-[family-name:var(--font-dm-sans)] text-[12px] text-[#F0EAD6]/80 leading-[1.6]">
        {children}
      </p>
    </div>
  );
}

/* ===== ICONS ===== */

function LogoIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="17" r="12.5" stroke="#C8A96E" strokeWidth="1.4" />
      <circle cx="20" cy="17" r="4"    stroke="#C8A96E" strokeWidth="1.4" />
      <path d="M2 33 C8 28.5, 13 37, 20 33 C27 29, 32 37.5, 38 33" stroke="#C8A96E" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function LockClosedIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ErrIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={["text-[#C0392B] flex-shrink-0", className].join(" ")} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
