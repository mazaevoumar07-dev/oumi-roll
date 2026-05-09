"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadStripe, type Stripe as StripeType } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Link from "next/link";
import { getOrder, updateOrderStatus, type Order } from "@/types/order";

/* ===== STRIPE INIT ===== */

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const STRIPE_APPEARANCE = {
  theme: "night" as const,
  variables: {
    colorPrimary: "#C8A96E",
    colorBackground: "#111111",
    colorText: "#F0EAD6",
    colorTextSecondary: "#8A8A8A",
    colorDanger: "#C0392B",
    borderRadius: "4px",
    fontSizeBase: "13.5px",
  },
  rules: {
    ".Input": { border: "1px solid #2A2A2A", padding: "12px 16px" },
    ".Input:focus": { border: "1px solid #C8A96E", boxShadow: "none" },
    ".Label": { color: "#8A8A8A", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase" },
  },
};

/* ===== ERROR MESSAGES ===== */

function stripeErrorMsg(code: string | undefined): string {
  switch (code) {
    case "insufficient_funds":         return "Fonds insuffisants sur la carte.";
    case "card_declined":              return "Paiement refusé. Contactez votre banque.";
    case "expired_card":               return "Votre carte a expiré.";
    case "incorrect_cvc":              return "Code de sécurité incorrect.";
    case "incorrect_number":           return "Numéro de carte incorrect.";
    case "processing_error":           return "Erreur de traitement. Réessayez.";
    case "payment_intent_authentication_failure": return "Authentification échouée. Réessayez.";
    default:                           return "Paiement échoué. Réessayez ou utilisez une autre carte.";
  }
}

/* ===== CHECKOUT FORM ===== */

function CheckoutForm({ order }: { order: Order }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements || loading) return;

    setLoading(true);
    setError(null);

    const { error: submitErr } = await elements.submit();
    if (submitErr) {
      setError(stripeErrorMsg(submitErr.code));
      setLoading(false);
      return;
    }

    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: `${window.location.origin}/paiement/${order.id}`,
      },
    });

    if (result.error) {
      setError(stripeErrorMsg(result.error.code));
      setLoading(false);
    } else if (result.paymentIntent?.status === "succeeded") {
      updateOrderStatus(order.id, "nouveau");
      router.replace(`/suivi/${order.id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className={["transition-opacity duration-300", ready ? "opacity-100" : "opacity-0"].join(" ")}>
        <PaymentElement onReady={() => setReady(true)} />
      </div>

      {!ready && (
        <div className="flex items-center justify-center h-[200px]">
          <div className="w-6 h-6 border-2 border-[#C8A96E]/20 border-t-[#C8A96E] rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <p className="flex items-center gap-2 text-[12.5px] text-[#C0392B] font-[family-name:var(--font-dm-sans)]">
          <ErrIcon />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || !ready || loading}
        className={[
          "flex items-center justify-center gap-2 w-full py-[14px] text-[13px] tracking-[0.08em] uppercase font-medium rounded-[4px] transition-colors duration-200 font-[family-name:var(--font-dm-sans)]",
          !stripe || !ready || loading
            ? "bg-[#C8A96E]/40 text-[#0D0D0D]/60 cursor-not-allowed"
            : "bg-[#C8A96E] text-[#0D0D0D] hover:bg-[#E2C07A] active:bg-[#C8A96E]",
        ].join(" ")}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-[#0D0D0D]/30 border-t-[#0D0D0D] rounded-full animate-spin" />
            Traitement en cours…
          </>
        ) : (
          <>
            Payer €{order.total.toFixed(2)}
            <LockIcon />
          </>
        )}
      </button>

      <p className="text-center text-[11.5px] text-[#8A8A8A]/50 font-[family-name:var(--font-dm-sans)]">
        Paiement sécurisé · Vos données ne sont jamais stockées sur nos serveurs
      </p>
    </form>
  );
}

/* ===== PAGE ===== */

export default function PaiementPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const initRef = useRef(false);

  useEffect(() => {
    const init = setTimeout(async () => {
      if (initRef.current) return;
      initRef.current = true;

      const o = getOrder(id);
      setOrder(o ?? null);
      if (!o) return;

      // Returning from a 3DS redirect — check payment status from URL params
      const params = new URLSearchParams(window.location.search);
      const existingSecret = params.get("payment_intent_client_secret");
      if (existingSecret) {
        const stripe = await stripePromise as StripeType | null;
        if (!stripe) return;
        const { paymentIntent } = await stripe.retrievePaymentIntent(existingSecret);
        if (paymentIntent?.status === "succeeded") {
          updateOrderStatus(id, "nouveau");
          router.replace(`/suivi/${id}`);
          return;
        }
        // Payment failed after 3DS — fall through to create a new intent
      }

      if (o.status !== "pending_payment") return;

      try {
        const res = await fetch("/api/payment/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: o.total, orderId: o.id }),
        });
        const data = await res.json() as { clientSecret?: string; error?: string };
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setInitError("Impossible d'initialiser le paiement. Réessayez.");
        }
      } catch {
        setInitError("Connexion impossible. Vérifiez votre réseau.");
      }
    }, 0);

    return () => clearTimeout(init);
  }, [id, router]);

  /* ── Loading ── */
  if (order === undefined || (order?.status === "pending_payment" && !clientSecret && !initError)) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-[#0D0D0D]">
        <div className="w-8 h-8 border-2 border-[#C8A96E]/20 border-t-[#C8A96E] rounded-full animate-spin" />
      </div>
    );
  }

  /* ── Not found ── */
  if (!order) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-center gap-6 bg-[#0D0D0D] px-6 text-center">
        <p className="font-[family-name:var(--font-cormorant)] text-[28px] text-[#8A8A8A] font-light">
          Commande introuvable
        </p>
        <Link href="/" className="px-6 py-3 border border-[#2A2A2A] text-[#8A8A8A] text-[12.5px] tracking-[0.08em] uppercase rounded-[4px] hover:border-[#C8A96E]/40 hover:text-[#C8A96E]/70 transition-all font-[family-name:var(--font-dm-sans)]">
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  /* ── Already paid / cancelled ── */
  if (order.status !== "pending_payment") {
    return (
      <div className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-center gap-6 bg-[#0D0D0D] px-6 text-center">
        <p className="font-[family-name:var(--font-cormorant)] text-[28px] text-[#F0EAD6] font-light">
          {order.status === "annule" ? "Commande annulée" : "Paiement déjà effectué"}
        </p>
        <Link href={`/suivi/${order.id}`} className="px-6 py-3 bg-[#C8A96E] text-[#0D0D0D] text-[12.5px] tracking-[0.08em] uppercase rounded-[4px] hover:bg-[#E2C07A] transition-all font-[family-name:var(--font-dm-sans)]">
          Voir ma commande
        </Link>
      </div>
    );
  }

  /* ── Init error ── */
  if (initError) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-center gap-6 bg-[#0D0D0D] px-6 text-center">
        <p className="font-[family-name:var(--font-cormorant)] text-[28px] text-[#8A8A8A] font-light">
          Paiement indisponible
        </p>
        <p className="text-[13.5px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]">{initError}</p>
        <button onClick={() => { initRef.current = false; setInitError(null); }}
          className="px-6 py-3 border border-[#C8A96E]/40 text-[#C8A96E] text-[12.5px] tracking-[0.08em] uppercase rounded-[4px] hover:bg-[#C8A96E]/10 transition-all font-[family-name:var(--font-dm-sans)]"
        >
          Réessayer
        </button>
      </div>
    );
  }

  /* ── Main payment page ── */
  return (
    <div className="bg-[#0D0D0D] min-h-[calc(100vh-72px)]">
      <div className="max-w-[520px] mx-auto px-6 sm:px-8 py-12 lg:py-16">

        {/* Steps */}
        <StepsIndicator />

        {/* Header */}
        <div className="mt-10 mb-8">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[#C8A96E] font-[family-name:var(--font-dm-sans)] mb-1">
            Paiement sécurisé
          </p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-[38px] font-light text-[#F0EAD6] leading-none mb-1">
            #{order.id}
          </h1>
          <p className="text-[22px] font-[family-name:var(--font-cormorant)] text-[#C8A96E] font-semibold">
            €{order.total.toFixed(2)}
          </p>
        </div>

        <div className="h-px bg-[#2A2A2A] mb-8" />

        {/* Order mini-summary */}
        <div className="mb-8 flex flex-col gap-1.5">
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between text-[12.5px] font-[family-name:var(--font-dm-sans)]">
              <span className="text-[#8A8A8A]">{item.qty}× {item.name}</span>
              <span className="text-[#F0EAD6]">€{(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
          {order.deliveryCost > 0 && (
            <div className="flex justify-between text-[12.5px] font-[family-name:var(--font-dm-sans)]">
              <span className="text-[#8A8A8A]">Livraison</span>
              <span className="text-[#F0EAD6]">€{order.deliveryCost.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 mt-1 border-t border-[#2A2A2A]">
            <span className="text-[#8A8A8A] font-[family-name:var(--font-dm-sans)] text-[12.5px]">Total</span>
            <span className="font-[family-name:var(--font-cormorant)] text-[20px] font-semibold text-[#C8A96E]">
              €{order.total.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="h-px bg-[#2A2A2A] mb-8" />

        {/* Stripe form */}
        <Elements
          stripe={stripePromise}
          options={{ clientSecret: clientSecret!, appearance: STRIPE_APPEARANCE }}
        >
          <CheckoutForm order={order} />
        </Elements>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link
            href="/commande"
            className="text-[12px] text-[#8A8A8A]/50 hover:text-[#8A8A8A] transition-colors font-[family-name:var(--font-dm-sans)]"
          >
            ← Modifier la commande
          </Link>
        </div>

      </div>
    </div>
  );
}

/* ===== SUB-COMPONENTS ===== */

function StepsIndicator() {
  const steps = ["Panier", "Livraison", "Paiement"];
  const current = 2;
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

/* ===== ICONS ===== */

function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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

function ErrIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="flex-shrink-0">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
