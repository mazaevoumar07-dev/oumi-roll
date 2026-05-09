"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getOrder, cancelOrder, type Order } from "@/types/order";

/* ===== CONSTANTS ===== */

const CANCEL_WINDOW = 3 * 60; // seconds

const STEPS: Array<{ key: Order["status"]; label: string; desc: string }> = [
  { key: "nouveau",        label: "Nouveau",         desc: "Votre commande a été reçue" },
  { key: "en_preparation", label: "En préparation",  desc: "Nos chefs préparent votre commande" },
  { key: "en_livraison",   label: "En livraison",    desc: "Le livreur est en route" },
  { key: "livre",          label: "Livré",            desc: "Bonne dégustation !" },
];

const STATUS_ORDER: Record<string, number> = {
  nouveau: 0,
  en_preparation: 1,
  en_livraison: 2,
  livre: 3,
  annule: -1,
};

/* ===== HELPERS ===== */

function formatDate(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return `Passée le ${date} à ${time}`;
}

function expectedTime(iso: string, mode: Order["mode"]): string {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() + (mode === "livraison" ? 35 : 25));
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function fmt(s: number): string {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

/* ===== PAGE ===== */

export default function SuiviPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Load from localStorage and start countdown inside callbacks (not synchronously in effect body)
    const init = setTimeout(() => {
      const o = getOrder(id);
      setOrder(o ?? null);

      if (!o || o.status === "annule") return;

      const elapsed = Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 1000);
      const remaining = Math.max(0, CANCEL_WINDOW - elapsed);
      setSecondsLeft(remaining);

      if (remaining > 0) {
        countdownRef.current = setInterval(() => {
          setSecondsLeft(s => {
            if (s <= 1) { clearInterval(countdownRef.current!); countdownRef.current = null; return 0; }
            return s - 1;
          });
        }, 1000);
      }
    }, 0);

    return () => {
      clearTimeout(init);
      if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
    };
  }, [id]);

  function confirmCancel() {
    if (!order) return;
    cancelOrder(order.id);
    setOrder({ ...order, status: "annule" });
    setSecondsLeft(0);
    setShowConfirm(false);
  }

  /* ── Loading ── */
  if (order === undefined) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-[#0D0D0D]">
        <div className="w-8 h-8 border-2 border-[#C8A96E]/20 border-t-[#C8A96E] rounded-full animate-spin" />
      </div>
    );
  }

  /* ── Not found ── */
  if (order === null) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-center gap-6 bg-[#0D0D0D] px-6 text-center">
        <p className="font-[family-name:var(--font-cormorant)] text-[28px] text-[#8A8A8A] font-light">
          Commande introuvable
        </p>
        <p className="font-[family-name:var(--font-dm-sans)] text-[13.5px] text-[#8A8A8A]/60">
          Vérifiez le lien ou contactez-nous.
        </p>
        <Link
          href="/"
          className="px-6 py-3 border border-[#2A2A2A] text-[#8A8A8A] text-[12.5px] tracking-[0.08em] uppercase rounded-[4px] hover:border-[#C8A96E]/40 hover:text-[#C8A96E]/70 transition-all font-[family-name:var(--font-dm-sans)]"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  const isCancelled = order.status === "annule";
  const currentStep = STATUS_ORDER[order.status] ?? 0;
  const canCancel = !isCancelled && order.status === "nouveau" && secondsLeft > 0;
  const isDelivery = order.mode === "livraison";

  return (
    <div className="bg-[#0D0D0D] min-h-[calc(100vh-72px)]">
      <div className="max-w-[620px] mx-auto px-6 sm:px-8 py-12 lg:py-16">

        {/* Back */}
        <Link
          href="/#menu"
          className="inline-flex items-center gap-2 text-[12px] tracking-[0.1em] uppercase text-[#8A8A8A] hover:text-[#C8A96E] transition-colors font-[family-name:var(--font-dm-sans)] mb-10"
        >
          <BackArrow />
          Retour au menu
        </Link>

        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[#C8A96E] font-[family-name:var(--font-dm-sans)] mb-1">
            Commande
          </p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-[40px] sm:text-[48px] font-light text-[#F0EAD6] leading-none mb-2">
            #{order.id}
          </h1>
          <p className="text-[13px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]">
            {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="h-px bg-[#2A2A2A] mb-8" />

        {/* Status timeline */}
        <div className="mb-8">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[#8A8A8A] font-[family-name:var(--font-dm-sans)] mb-6">
            Statut
          </p>

          {isCancelled ? (
            <CancelledBanner />
          ) : (
            <ol className="flex flex-col gap-0">
              {STEPS.map((step, i) => {
                const done = i < currentStep;
                const active = i === currentStep;
                const isLast = i === STEPS.length - 1;
                return (
                  <li key={step.key} className="flex gap-4">
                    {/* Indicator column */}
                    <div className="flex flex-col items-center">
                      <div className={[
                        "flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-colors",
                        done   ? "bg-[#C8A96E]/20 border-[#C8A96E] text-[#C8A96E]" : "",
                        active ? "bg-[#C8A96E] border-[#C8A96E] text-[#0D0D0D]" : "",
                        !done && !active ? "bg-transparent border-[#2A2A2A] text-[#8A8A8A]/40" : "",
                      ].join(" ")}>
                        {done
                          ? <SmallCheck />
                          : <span className="text-[11px] font-medium font-[family-name:var(--font-dm-sans)]">{i + 1}</span>
                        }
                      </div>
                      {!isLast && (
                        <div className={["w-px flex-1 my-1 min-h-[28px]", done ? "bg-[#C8A96E]/30" : "bg-[#2A2A2A]"].join(" ")} />
                      )}
                    </div>

                    {/* Text */}
                    <div className={["pb-7", isLast ? "pb-0" : ""].join(" ")}>
                      <p className={[
                        "text-[13.5px] font-medium font-[family-name:var(--font-dm-sans)] leading-tight",
                        active ? "text-[#F0EAD6]" : done ? "text-[#C8A96E]" : "text-[#8A8A8A]/40",
                      ].join(" ")}>
                        {step.label}
                        {active && (
                          <span className="ml-2 inline-flex items-center gap-1 text-[10px] tracking-[0.12em] uppercase bg-[#C8A96E]/15 text-[#C8A96E] px-2 py-0.5 rounded-sm font-[family-name:var(--font-dm-sans)]">
                            En cours
                          </span>
                        )}
                      </p>
                      {(done || active) && (
                        <p className="mt-0.5 text-[12px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]">
                          {step.desc}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Estimated time */}
        {!isCancelled && order.status !== "livre" && (
          <>
            <div className="h-px bg-[#2A2A2A] mb-6" />
            <div className="flex items-center gap-3 mb-8">
              <ClockIcon />
              <div>
                <p className="text-[12px] tracking-[0.08em] uppercase text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]">
                  {isDelivery ? "Livraison estimée" : "Prêt pour emporter"}
                </p>
                <p className="text-[15px] text-[#F0EAD6] font-[family-name:var(--font-dm-sans)] mt-0.5">
                  vers {expectedTime(order.createdAt, order.mode)}
                  <span className="text-[12px] text-[#8A8A8A] ml-2">
                    ({isDelivery ? "35 min" : "25 min"})
                  </span>
                </p>
              </div>
            </div>
          </>
        )}

        <div className="h-px bg-[#2A2A2A] mb-8" />

        {/* Order summary */}
        <div className="mb-8">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[#8A8A8A] font-[family-name:var(--font-dm-sans)] mb-4">
            Récapitulatif
          </p>

          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[4px] overflow-hidden">
            <ul className="divide-y divide-[#2A2A2A]">
              {order.items.map(item => (
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

            <div className="px-5 py-4 flex flex-col gap-2 border-t border-[#2A2A2A]">
              <div className="flex justify-between">
                <span className="text-[12.5px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]">Sous-total</span>
                <span className="text-[13px] text-[#F0EAD6] font-[family-name:var(--font-dm-sans)]">€{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[12.5px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]">Livraison</span>
                {order.deliveryCost === 0
                  ? <span className="text-[13px] text-[#27AE60] font-[family-name:var(--font-dm-sans)]">Gratuit</span>
                  : <span className="text-[13px] text-[#F0EAD6] font-[family-name:var(--font-dm-sans)]">€{order.deliveryCost.toFixed(2)}</span>
                }
              </div>
              <div className="flex justify-between items-baseline pt-3 mt-1 border-t border-[#2A2A2A]">
                <span className="font-[family-name:var(--font-cormorant)] text-[17px] text-[#F0EAD6]">Total</span>
                <span className="font-[family-name:var(--font-cormorant)] text-[26px] font-semibold text-[#C8A96E]">
                  €{order.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Delivery details */}
            <div className="px-5 py-4 border-t border-[#2A2A2A] flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]">Mode</span>
                <span className="text-[12.5px] text-[#F0EAD6] font-[family-name:var(--font-dm-sans)]">
                  {isDelivery ? "Livraison" : "À emporter"}
                </span>
              </div>
              {isDelivery && order.adresse && (
                <div className="flex items-start justify-between gap-4">
                  <span className="text-[12px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)] flex-shrink-0">Adresse</span>
                  <span className="text-[12.5px] text-[#F0EAD6] font-[family-name:var(--font-dm-sans)] text-right">
                    {order.adresse}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]">Client</span>
                <span className="text-[12.5px] text-[#F0EAD6] font-[family-name:var(--font-dm-sans)]">
                  {order.prenom} {order.nom}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cancel section */}
        {!isCancelled && order.status === "nouveau" && (
          <div className="border border-[#2A2A2A] rounded-[4px] p-5">
            {canCancel ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[12.5px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]">
                    Annulation possible encore
                  </p>
                  <span className={[
                    "font-[family-name:var(--font-dm-sans)] text-[14px] font-medium tabular-nums",
                    secondsLeft <= 30 ? "text-[#C0392B]" : "text-[#F0EAD6]",
                  ].join(" ")}>
                    {fmt(secondsLeft)}
                  </span>
                </div>

                {showConfirm ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-[13px] text-[#F0EAD6] font-[family-name:var(--font-dm-sans)]">
                      Confirmer l&apos;annulation de cette commande ?
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={confirmCancel}
                        className="flex-1 py-2.5 bg-[#C0392B]/15 border border-[#C0392B]/40 text-[#C0392B] text-[12px] tracking-[0.08em] uppercase rounded-[4px] hover:bg-[#C0392B]/25 transition-colors font-[family-name:var(--font-dm-sans)]"
                      >
                        Oui, annuler
                      </button>
                      <button
                        onClick={() => setShowConfirm(false)}
                        className="flex-1 py-2.5 border border-[#2A2A2A] text-[#8A8A8A] text-[12px] tracking-[0.08em] uppercase rounded-[4px] hover:border-[#C8A96E]/40 hover:text-[#C8A96E]/70 transition-colors font-[family-name:var(--font-dm-sans)]"
                      >
                        Conserver
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="w-full py-2.5 border border-[#2A2A2A] text-[#8A8A8A] text-[12px] tracking-[0.08em] uppercase rounded-[4px] hover:border-[#C0392B]/40 hover:text-[#C0392B]/70 transition-colors font-[family-name:var(--font-dm-sans)]"
                  >
                    Annuler la commande
                  </button>
                )}
              </>
            ) : (
              <p className="text-[12.5px] text-[#8A8A8A]/50 font-[family-name:var(--font-dm-sans)] text-center">
                Le délai d&apos;annulation de 3 minutes est écoulé.{" "}
                <a href="tel:+33" className="text-[#C8A96E]/60 hover:text-[#C8A96E] transition-colors">
                  Contactez-nous par téléphone.
                </a>
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

/* ===== SUB-COMPONENTS ===== */

function CancelledBanner() {
  return (
    <div className="flex items-start gap-4 p-4 bg-[#C0392B]/8 border border-[#C0392B]/25 rounded-[4px]">
      <div className="flex-shrink-0 w-8 h-8 rounded-full border border-[#C0392B]/40 flex items-center justify-center text-[#C0392B]">
        <XIcon />
      </div>
      <div>
        <p className="text-[14px] font-medium text-[#F0EAD6] font-[family-name:var(--font-dm-sans)]">
          Commande annulée
        </p>
        <p className="mt-1 text-[12.5px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]">
          Votre commande a été annulée avec succès.
        </p>
      </div>
    </div>
  );
}

/* ===== ICONS ===== */

function BackArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function SmallCheck() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-shrink-0 opacity-70">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
