"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router  = useRouter();
  const supabase = createClient();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  // Если уже авторизован как админ — сразу перенаправить
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();
      if (data?.role === "admin") router.replace("/admin/commandes");
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError) {
      setLoading(false);
      setError("Identifiants incorrects.");
      return;
    }

    // Vérifier que l'utilisateur est bien administrateur
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      setError("Erreur d'authentification. Réessayez.");
      return;
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      await supabase.auth.signOut();
      setLoading(false);
      setError("Accès refusé. Ce compte n'a pas les droits administrateur.");
      return;
    }

    router.replace("/admin/commandes");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D] px-5">
      <div className="w-full max-w-[400px]">

        {/* Логотип */}
        <div className="flex flex-col items-center gap-2 mb-10">
          <LogoIcon />
          <span className="font-[family-name:var(--font-cormorant)] text-[12px] tracking-[0.35em] text-[#C8A96E] uppercase">
            OUMI ROLL
          </span>
          <span className="font-[family-name:var(--font-dm-sans)] text-[11px] tracking-[0.2em] text-[#8A8A8A] uppercase mt-1">
            Administration
          </span>
        </div>

        {/* Карточка */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[4px] p-8">
          <h1 className="font-[family-name:var(--font-cormorant)] text-[22px] text-[#F0EAD6] font-medium mb-6">
            Connexion administrateur
          </h1>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="admin-email"
                className="text-[11px] tracking-[0.14em] uppercase text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]"
              >
                Adresse e-mail
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="admin@oumiroll.fr"
                className="h-11 px-4 bg-[#111] border border-[#2A2A2A] focus:border-[#C8A96E] rounded-[4px] text-[13.5px] text-[#F0EAD6] placeholder:text-[#8A8A8A]/40 outline-none transition-colors duration-200 font-[family-name:var(--font-dm-sans)]"
              />
            </div>

            {/* Mot de passe */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="admin-password"
                className="text-[11px] tracking-[0.14em] uppercase text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]"
              >
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full h-11 px-4 pr-11 bg-[#111] border border-[#2A2A2A] focus:border-[#C8A96E] rounded-[4px] text-[13.5px] text-[#F0EAD6] placeholder:text-[#8A8A8A]/40 outline-none transition-colors duration-200 font-[family-name:var(--font-dm-sans)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#F0EAD6] transition-colors"
                  aria-label={showPass ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Ошибка */}
            {error && (
              <div className="flex items-start gap-2.5 px-3.5 py-3 bg-[#C0392B]/10 border border-[#C0392B]/30 rounded-[4px]">
                <ErrIcon className="mt-[1px] flex-shrink-0" />
                <p className="font-[family-name:var(--font-dm-sans)] text-[12px] text-[#F0EAD6]/80 leading-[1.6]">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full py-[13px] bg-[#C8A96E] text-[#0D0D0D] text-[13px] tracking-[0.08em] uppercase font-medium rounded-[4px] hover:bg-[#E2C07A] transition-colors font-[family-name:var(--font-dm-sans)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Connexion…" : "Se connecter"}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}

/* ===== ИКОНКИ ===== */

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

function ErrIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={["text-[#C0392B] flex-shrink-0", className].join(" ")} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
