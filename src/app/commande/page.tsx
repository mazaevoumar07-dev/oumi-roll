"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { generateOrderId, saveOrder } from "@/types/order";

/* ===== TYPES ===== */

interface FormData {
  prenom: string;
  nom: string;
  telephone: string;
  mode: "livraison" | "emporter";
  adresse: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;
type Touched    = Partial<Record<keyof FormData, boolean>>;

/* ===== VALIDATION ===== */

function isValidPhone(value: string): boolean {
  const v = value.replace(/[\s\-\.]/g, "");
  return /^(0[1-9]\d{8}|(\+33|0033)[1-9]\d{8})$/.test(v);
}

function validate(f: FormData): FormErrors {
  const e: FormErrors = {};
  if (!f.prenom.trim())    e.prenom    = "Le prénom est requis";
  if (!f.nom.trim())       e.nom       = "Le nom est requis";
  if (!f.telephone.trim()) e.telephone = "Le numéro de téléphone est requis";
  else if (!isValidPhone(f.telephone)) e.telephone = "Format invalide — ex : 06 12 34 56 78";
  if (f.mode === "livraison" && !f.adresse.trim()) e.adresse = "L'adresse est requise pour la livraison";
  return e;
}

/* ===== CONSTANTS ===== */

const FORM_ID     = "checkout-form";
const DELIVERY_MIN = 2.50;

/* ===== PAGE ===== */

export default function CommandePage() {
  const { items, total, clearCart, closeCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<FormData>({
    prenom: "", nom: "", telephone: "", mode: "livraison", adresse: "",
  });

  // Prefill from auth when user logs in or page loads
  useEffect(() => {
    if (!user) return;
    const fill = setTimeout(() => {
      setForm(f => ({
        ...f,
        prenom:    f.prenom    || user.prenom,
        nom:       f.nom       || user.nom,
        telephone: f.telephone || user.telephone,
      }));
    }, 0);
    return () => clearTimeout(fill);
  }, [user]);
  const [errors,  setErrors]  = useState<FormErrors>({});
  const [touched, setTouched] = useState<Touched>({});

  const deliveryCost = form.mode === "livraison" ? DELIVERY_MIN : 0;
  const orderTotal   = total + deliveryCost;
  const isEmpty      = items.length === 0;

  function set(field: keyof FormData, value: string) {
    const next = { ...form, [field]: value };
    setForm(next);
    if (touched[field]) {
      const e = validate(next);
      setErrors(prev => ({ ...prev, [field]: e[field] }));
    }
  }

  function blur(field: keyof FormData) {
    setTouched(t => ({ ...t, [field]: true }));
    const e = validate(form);
    setErrors(prev => ({ ...prev, [field]: e[field] }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allTouched: Touched = Object.fromEntries(Object.keys(form).map(k => [k, true]));
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      const id = generateOrderId();
      saveOrder({
        id,
        items,
        subtotal: total,
        deliveryCost,
        total: orderTotal,
        mode: form.mode,
        adresse: form.adresse,
        prenom: form.prenom,
        nom: form.nom,
        telephone: form.telephone,
        status: "pending_payment",
        createdAt: new Date().toISOString(),
      });
      clearCart();
      closeCart();
      router.push(`/paiement/${id}`);
    }
  }

  /* ── Panier vide ── */
  if (isEmpty) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-center gap-6 bg-[#0D0D0D] px-6">
        <p className="font-[family-name:var(--font-cormorant)] text-[28px] text-[#8A8A8A] font-light">
          Votre panier est vide
        </p>
        <Link
          href="/#menu"
          className="px-6 py-3 border border-[#C8A96E]/50 text-[#C8A96E] text-[12.5px] tracking-[0.1em] uppercase rounded-[4px] hover:bg-[#C8A96E]/10 transition-all font-[family-name:var(--font-dm-sans)]"
        >
          Voir le menu
        </Link>
      </div>
    );
  }

  /* ── Page principale ── */
  return (
    <div className="bg-[#0D0D0D] min-h-[calc(100vh-72px)]">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-10 py-12 lg:py-16">

        <StepsIndicator />

        <div className="mt-10 lg:mt-12 grid lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-10 lg:gap-14 items-start">

          {/* ══ FORMULAIRE ══ */}
          <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">

            {/* Informations personnelles */}
            <FormSection title="Vos informations">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label="Prénom" required placeholder="Jean" autoComplete="given-name"
                  value={form.prenom} error={errors.prenom}
                  onChange={v => set("prenom", v)} onBlur={() => blur("prenom")}
                />
                <Field
                  label="Nom" required placeholder="Dupont" autoComplete="family-name"
                  value={form.nom} error={errors.nom}
                  onChange={v => set("nom", v)} onBlur={() => blur("nom")}
                />
              </div>
              <Field
                label="Téléphone" required type="tel"
                placeholder="06 12 34 56 78" autoComplete="tel"
                value={form.telephone} error={errors.telephone}
                onChange={v => set("telephone", v)} onBlur={() => blur("telephone")}
              />
            </FormSection>

            {/* Mode de réception */}
            <FormSection title="Mode de réception">
              <div className="grid grid-cols-2 gap-3">
                {(["livraison", "emporter"] as const).map(m => (
                  <button
                    key={m} type="button" onClick={() => set("mode", m)}
                    className={[
                      "flex flex-col items-center gap-2.5 px-4 py-5 border rounded-[4px] transition-all duration-200",
                      form.mode === m
                        ? "bg-[#C8A96E]/10 border-[#C8A96E] text-[#C8A96E]"
                        : "border-[#2A2A2A] text-[#8A8A8A] hover:border-[#C8A96E]/40 hover:text-[#C8A96E]/70",
                    ].join(" ")}
                  >
                    {m === "livraison" ? <TruckIcon /> : <WalkIcon />}
                    <span className="text-[12px] tracking-[0.1em] uppercase font-[family-name:var(--font-dm-sans)]">
                      {m === "livraison" ? "Livraison" : "À emporter"}
                    </span>
                  </button>
                ))}
              </div>

              {form.mode === "emporter" && (
                <p className="text-[12.5px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)] leading-[1.6] mt-1">
                  Récupérez votre commande directement au restaurant ·{" "}
                  <span className="text-[#F0EAD6]">Le Mans</span>
                </p>
              )}

              {/* Adresse — slide in/out */}
              <div className={[
                "overflow-hidden transition-all duration-300 ease-in-out",
                form.mode === "livraison" ? "max-h-[160px] opacity-100 mt-1" : "max-h-0 opacity-0",
              ].join(" ")}>
                <Field
                  label="Adresse de livraison" required autoComplete="street-address"
                  placeholder="12 rue de la Paix, 72000 Le Mans"
                  value={form.adresse} error={errors.adresse}
                  onChange={v => set("adresse", v)} onBlur={() => blur("adresse")}
                />
                <p className="mt-2 text-[11.5px] text-[#8A8A8A]/55 font-[family-name:var(--font-dm-sans)]">
                  Zone de livraison : rayon de 5 km autour du restaurant
                </p>
              </div>
            </FormSection>

            {/* Bouton mobile uniquement */}
            <div className="lg:hidden">
              <SubmitBtn />
            </div>
          </form>

          {/* ══ RÉCAPITULATIF ══ */}
          <aside className="lg:sticky lg:top-[calc(72px+2rem)]">
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[4px] overflow-hidden">

              <div className="px-5 py-4 border-b border-[#2A2A2A]">
                <h2 className="font-[family-name:var(--font-cormorant)] text-[19px] font-medium text-[#F0EAD6]">
                  Récapitulatif
                </h2>
              </div>

              {/* Articles */}
              <ul className="divide-y divide-[#2A2A2A]">
                {items.map(item => (
                  <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-[#C8A96E]/15 text-[#C8A96E] text-[10px] font-medium rounded-sm font-[family-name:var(--font-dm-sans)]">
                        {item.qty}
                      </span>
                      <span className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[#F0EAD6] truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="flex-shrink-0 font-[family-name:var(--font-dm-sans)] text-[13px] text-[#8A8A8A]">
                      €{(item.price * item.qty).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Totaux */}
              <div className="px-5 py-4 flex flex-col gap-2 border-t border-[#2A2A2A]">
                <div className="flex justify-between">
                  <span className="text-[12.5px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]">Sous-total</span>
                  <span className="text-[13px] text-[#F0EAD6] font-[family-name:var(--font-dm-sans)]">€{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12.5px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]">Livraison</span>
                  {form.mode === "emporter"
                    ? <span className="text-[13px] text-[#27AE60] font-[family-name:var(--font-dm-sans)]">Gratuit</span>
                    : <span className="text-[13px] text-[#F0EAD6] font-[family-name:var(--font-dm-sans)]">€{deliveryCost.toFixed(2)}</span>
                  }
                </div>
                {form.mode === "livraison" && (
                  <p className="text-[11px] text-[#8A8A8A]/50 font-[family-name:var(--font-dm-sans)]">
                    * Minimum · coût exact calculé selon l&apos;adresse
                  </p>
                )}
                <div className="flex justify-between items-baseline pt-3 mt-1 border-t border-[#2A2A2A]">
                  <span className="font-[family-name:var(--font-cormorant)] text-[17px] text-[#F0EAD6]">Total</span>
                  <span className="font-[family-name:var(--font-cormorant)] text-[26px] font-semibold text-[#C8A96E]">
                    €{orderTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Bouton desktop */}
              <div className="px-5 pb-5 hidden lg:block">
                <SubmitBtn />
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}

/* ===== SUB-COMPONENTS ===== */

function StepsIndicator() {
  const steps = ["Panier", "Livraison", "Paiement"];
  const current = 1; // 0-indexed

  return (
    <nav aria-label="Étapes de la commande">
      <ol className="flex items-center gap-0">
        {steps.map((step, i) => (
          <li key={step} className="flex items-center">
            {i > 0 && (
              <div className={["h-px w-8 sm:w-14 mx-1", i <= current ? "bg-[#C8A96E]/40" : "bg-[#2A2A2A]"].join(" ")} />
            )}
            <div className="flex items-center gap-2">
              <span className={[
                "flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-medium border transition-colors font-[family-name:var(--font-dm-sans)]",
                i < current  ? "bg-[#C8A96E]/20 border-[#C8A96E]/40 text-[#C8A96E]" : "",
                i === current ? "bg-[#C8A96E] border-[#C8A96E] text-[#0D0D0D]" : "",
                i > current  ? "bg-transparent border-[#2A2A2A] text-[#8A8A8A]" : "",
              ].join(" ")}>
                {i < current ? <CheckIcon /> : i + 1}
              </span>
              <span className={[
                "text-[12px] tracking-[0.06em] font-[family-name:var(--font-dm-sans)] hidden sm:inline",
                i === current ? "text-[#F0EAD6]" : "text-[#8A8A8A]",
              ].join(" ")}>
                {step}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="text-[11px] tracking-[0.2em] uppercase text-[#C8A96E] font-[family-name:var(--font-dm-sans)]">
          {title}
        </span>
        <div className="flex-1 h-px bg-[#2A2A2A]" />
      </div>
      {children}
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  error?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}

function Field({ label, value, onChange, onBlur, error, required, type = "text", placeholder, autoComplete }: FieldProps) {
  const id = `field-${label.toLowerCase().replace(/\s/g, "-")}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[11px] tracking-[0.14em] uppercase text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]">
        {label}{required && <span className="text-[#C8A96E] ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={[
          "w-full h-11 px-4 bg-[#111] border rounded-[4px] text-[13.5px] text-[#F0EAD6] placeholder:text-[#8A8A8A]/40",
          "outline-none transition-colors duration-200 font-[family-name:var(--font-dm-sans)]",
          error
            ? "border-[#C0392B] focus:border-[#C0392B]"
            : "border-[#2A2A2A] focus:border-[#C8A96E]",
        ].join(" ")}
      />
      {error && (
        <p className="text-[11.5px] text-[#C0392B] font-[family-name:var(--font-dm-sans)] flex items-center gap-1.5">
          <ErrorDotIcon />
          {error}
        </p>
      )}
    </div>
  );
}

function SubmitBtn() {
  return (
    <button
      type="submit"
      form={FORM_ID}
      className="flex items-center justify-center gap-2 w-full py-[14px] bg-[#C8A96E] text-[#0D0D0D] text-[13px] tracking-[0.08em] uppercase font-medium rounded-[4px] hover:bg-[#E2C07A] active:bg-[#C8A96E] transition-colors duration-200 font-[family-name:var(--font-dm-sans)]"
    >
      Confirmer la commande
      <ArrowRightIcon />
    </button>
  );
}

/* ===== ICONS ===== */

function TruckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 4v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function WalkIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="4" r="2" />
      <path d="M9 22V12l-2-4h10l-2 4v10" />
      <path d="M7 22h5M12 22h5" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ErrorDotIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="flex-shrink-0">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
