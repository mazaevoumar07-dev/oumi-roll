"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getAllOrders, updateOrderStatus, type Order } from "@/types/order";

/* ===== CONSTANTS ===== */

const REFRESH_INTERVAL = 30_000;

const STATUS_LABEL: Record<Order["status"], string> = {
  pending_payment: "Paiement en attente",
  nouveau:         "Nouveau",
  en_preparation:  "En préparation",
  en_livraison:    "En livraison",
  livre:           "Livré",
  annule:          "Annulé",
};

const STATUS_COLOR: Record<Order["status"], string> = {
  pending_payment: "text-[#8A8A8A] border-[#3A3A3A] bg-[#2A2A2A]",
  nouveau:         "text-[#C8A96E] border-[#C8A96E]/40 bg-[#C8A96E]/10",
  en_preparation:  "text-[#5B9BD5] border-[#5B9BD5]/40 bg-[#5B9BD5]/10",
  en_livraison:    "text-[#E8A438] border-[#E8A438]/40 bg-[#E8A438]/10",
  livre:           "text-[#27AE60] border-[#27AE60]/40 bg-[#27AE60]/10",
  annule:          "text-[#8A8A8A] border-[#3A3A3A] bg-[#2A2A2A]",
};

type FilterKey = "actifs" | "tous" | Order["status"];

/* ===== AUDIO HELPER ===== */

function playNewOrderBeep() {
  try {
    const ctx = new AudioContext();
    const freqs = [880, 1100];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      const t = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  } catch {
    // AudioContext not available (SSR or blocked)
  }
}

/* ===== HELPERS ===== */

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)  return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  return `${Math.floor(diff / 3600)}h`;
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

/* ===== PAGE ===== */

export default function AdminCommandesPage() {
  const [orders, setOrders]           = useState<Order[]>([]);
  const [filter, setFilter]           = useState<FilterKey>("actifs");
  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set());
  const [lastRefresh, setLastRefresh]   = useState<Date>(new Date());
  const knownIdsRef                   = useRef<Set<string>>(new Set());
  const timerRef                      = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback((isRefresh = false) => {
    const fresh = getAllOrders();
    if (isRefresh) {
      const newIds = fresh
        .filter(o => o.status === "nouveau" && !knownIdsRef.current.has(o.id))
        .map(o => o.id);
      if (newIds.length > 0) {
        playNewOrderBeep();
        setHighlightIds(prev => new Set([...prev, ...newIds]));
      }
    }
    fresh.forEach(o => knownIdsRef.current.add(o.id));
    setOrders(fresh);
    setLastRefresh(new Date());
  }, []);

  useEffect(() => {
    load(false);
    timerRef.current = setInterval(() => load(true), REFRESH_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [load]);

  function handleStatusChange(id: string, status: Order["status"]) {
    updateOrderStatus(id, status);
    setHighlightIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    load(false);
  }

  const filtered = orders.filter(o => {
    if (filter === "tous") return true;
    if (filter === "actifs") return !["livre", "annule", "pending_payment"].includes(o.status);
    return o.status === filter;
  });

  const countNouveau = orders.filter(o => o.status === "nouveau").length;

  return (
    <div className="bg-[#0D0D0D] min-h-screen">
      <div className="max-w-[1000px] mx-auto px-6 sm:px-8 py-12 lg:py-16">

        {/* Header */}
        <div className="mb-10 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-[#C8A96E] font-[family-name:var(--font-dm-sans)] mb-1">
              Administration
            </p>
            <h1 className="font-[family-name:var(--font-cormorant)] text-[40px] font-light text-[#F0EAD6] leading-none">
              Commandes
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11.5px] text-[#8A8A8A]/50 font-[family-name:var(--font-dm-sans)]">
              Actualisé à {fmtTime(lastRefresh.toISOString())}
            </span>
            <button
              onClick={() => load(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-[#2A2A2A] rounded-[4px] text-[11.5px] text-[#8A8A8A] hover:border-[#C8A96E]/40 hover:text-[#C8A96E]/70 transition-colors font-[family-name:var(--font-dm-sans)]"
            >
              <RefreshIcon />
              Actualiser
            </button>
          </div>
        </div>

        <div className="h-px bg-[#2A2A2A] mb-8" />

        {/* Stats */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <StatPill label="Total" value={orders.length} />
          <StatPill label="Actifs" value={orders.filter(o => !["livre", "annule", "pending_payment"].includes(o.status)).length} accent />
          {countNouveau > 0 && <StatPill label="Nouveaux" value={countNouveau} pulse />}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-7 overflow-x-auto pb-1 -mx-6 px-6 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
          {(["actifs", "tous", "nouveau", "en_preparation", "en_livraison", "livre", "annule"] as FilterKey[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                "flex-shrink-0 px-4 py-[8px] text-[11px] tracking-[0.1em] uppercase rounded-[4px] border transition-all font-[family-name:var(--font-dm-sans)]",
                filter === f
                  ? "bg-[#C8A96E]/10 border-[#C8A96E] text-[#C8A96E]"
                  : "border-[#2A2A2A] text-[#8A8A8A] hover:border-[#C8A96E]/40 hover:text-[#C8A96E]/70",
              ].join(" ")}
            >
              {f === "actifs" ? "Actifs" : f === "tous" ? "Tous" : STATUS_LABEL[f as Order["status"]]}
            </button>
          ))}
        </div>

        {/* Orders */}
        <div className="flex flex-col gap-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-2">
              <span className="font-[family-name:var(--font-cormorant)] text-[24px] text-[#8A8A8A] font-light">
                Aucune commande
              </span>
              <span className="text-[12px] text-[#8A8A8A]/40 font-[family-name:var(--font-dm-sans)]">
                Les nouvelles commandes apparaîtront ici
              </span>
            </div>
          ) : (
            filtered.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                isNew={highlightIds.has(order.id)}
                onStatusChange={handleStatusChange}
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
}

/* ===== ORDER CARD ===== */

function OrderCard({
  order, isNew, onStatusChange,
}: {
  order: Order;
  isNew: boolean;
  onStatusChange: (id: string, status: Order["status"]) => void;
}) {
  const isTerminal = order.status === "livre" || order.status === "annule";

  return (
    <article
      className={[
        "bg-[#1A1A1A] rounded-[4px] border overflow-hidden transition-all duration-300",
        isNew
          ? "border-[#C8A96E]/60 shadow-[0_0_24px_rgba(200,169,110,0.12)]"
          : "border-[#2A2A2A]",
      ].join(" ")}
    >
      {/* Card header */}
      <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-[#252525] flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          {isNew && (
            <span className="px-2 py-[3px] bg-[#C8A96E] text-[#0D0D0D] text-[10px] tracking-[0.12em] uppercase font-medium rounded-[2px] font-[family-name:var(--font-dm-sans)]">
              Nouveau
            </span>
          )}
          <span className="font-[family-name:var(--font-dm-sans)] text-[13px] font-semibold text-[#F0EAD6] tracking-[0.05em]">
            {order.id}
          </span>
          <span className="text-[12px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]">
            {fmtTime(order.createdAt)} · il y a {timeAgo(order.createdAt)}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className={[
            "px-2.5 py-[4px] rounded-[2px] border text-[10px] tracking-[0.1em] uppercase font-[family-name:var(--font-dm-sans)]",
            order.mode === "livraison"
              ? "text-[#8A8A8A] border-[#3A3A3A] bg-[#222]"
              : "text-[#8A8A8A] border-[#3A3A3A] bg-[#222]",
          ].join(" ")}>
            {order.mode === "livraison" ? "Livraison" : "À emporter"}
          </span>
          <span className={["px-2.5 py-[4px] rounded-[2px] border text-[10px] tracking-[0.1em] uppercase font-[family-name:var(--font-dm-sans)]", STATUS_COLOR[order.status]].join(" ")}>
            {STATUS_LABEL[order.status]}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="px-5 py-4 grid sm:grid-cols-[1fr_auto] gap-4">

        {/* Left: client + items */}
        <div className="flex flex-col gap-3">
          {/* Client */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-[family-name:var(--font-dm-sans)] text-[13.5px] text-[#F0EAD6] font-medium">
              {order.prenom} {order.nom}
            </span>
            <a
              href={`tel:${order.telephone}`}
              className="flex items-center gap-1.5 text-[12.5px] text-[#C8A96E]/70 hover:text-[#C8A96E] transition-colors font-[family-name:var(--font-dm-sans)]"
            >
              <PhoneIcon />
              {order.telephone}
            </a>
          </div>

          {/* Address */}
          {order.mode === "livraison" && order.adresse && (
            <div className="flex items-start gap-1.5 text-[12px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]">
              <PinIcon />
              <span>{order.adresse}</span>
            </div>
          )}

          {/* Items */}
          <div className="flex flex-col gap-1">
            {order.items.map((item, i) => (
              <span key={i} className="text-[12px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]">
                {item.qty}× {item.name}
              </span>
            ))}
          </div>
        </div>

        {/* Right: total */}
        <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-2">
          <div>
            <p className="text-[10px] tracking-[0.12em] uppercase text-[#8A8A8A]/50 font-[family-name:var(--font-dm-sans)] mb-0.5">
              Total
            </p>
            <p className="font-[family-name:var(--font-cormorant)] text-[26px] font-semibold text-[#F0EAD6] leading-none">
              €{order.total.toFixed(2)}
            </p>
            {order.mode === "livraison" && (
              <p className="text-[11px] text-[#8A8A8A]/50 font-[family-name:var(--font-dm-sans)] mt-0.5">
                dont €{order.deliveryCost.toFixed(2)} livraison
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Courier link — shown when en_livraison */}
      {order.status === "en_livraison" && (
        <div className="px-5 py-3 border-t border-[#252525] flex items-center gap-3 flex-wrap">
          <span className="text-[11.5px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]">
            Lien livreur&nbsp;:
          </span>
          <code className="text-[11.5px] text-[#C8A96E]/80 font-mono bg-[#111] px-2 py-1 rounded-[3px] select-all">
            /courier?order={order.id}
          </code>
        </div>
      )}

      {/* Card footer: actions */}
      {!isTerminal && order.status !== "pending_payment" && (
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-t border-[#252525] flex-wrap">
          <ActionButtons order={order} onStatusChange={onStatusChange} />
        </div>
      )}
      {order.status === "livre" && (
        <div className="px-5 py-3 border-t border-[#252525]">
          <span className="text-[11.5px] text-[#27AE60]/60 font-[family-name:var(--font-dm-sans)]">
            Commande terminée — aucune action possible
          </span>
        </div>
      )}
    </article>
  );
}

/* ===== ACTION BUTTONS ===== */

function ActionButtons({ order, onStatusChange }: { order: Order; onStatusChange: (id: string, s: Order["status"]) => void }) {
  const { id, status, mode } = order;

  return (
    <>
      {status === "nouveau" && (
        <ActionBtn primary onClick={() => onStatusChange(id, "en_preparation")}>
          <CheckIcon /> Accepter
        </ActionBtn>
      )}

      {status === "en_preparation" && mode === "livraison" && (
        <ActionBtn primary onClick={() => onStatusChange(id, "en_livraison")}>
          <TruckIcon /> Transmettre au livreur
        </ActionBtn>
      )}

      {status === "en_preparation" && mode === "emporter" && (
        <ActionBtn primary onClick={() => onStatusChange(id, "livre")}>
          <CheckIcon /> Prêt à emporter
        </ActionBtn>
      )}

      {status === "en_livraison" && (
        <ActionBtn primary onClick={() => onStatusChange(id, "livre")}>
          <CheckIcon /> Marquer livré
        </ActionBtn>
      )}

      {/* Cancel — admin can always cancel except terminal statuses */}
      <ActionBtn danger onClick={() => onStatusChange(id, "annule")}>
        <XIcon /> Annuler
      </ActionBtn>
    </>
  );
}

function ActionBtn({
  children, primary, danger, onClick,
}: {
  children: React.ReactNode;
  primary?: boolean;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex items-center gap-1.5 px-4 py-[8px] text-[11.5px] tracking-[0.06em] uppercase rounded-[4px] border transition-colors font-[family-name:var(--font-dm-sans)] font-medium",
        primary && "bg-[#C8A96E] border-[#C8A96E] text-[#0D0D0D] hover:bg-[#E2C07A] hover:border-[#E2C07A]",
        danger  && "border-[#C0392B]/30 text-[#C0392B]/60 hover:border-[#C0392B] hover:text-[#C0392B] hover:bg-[#C0392B]/5",
      ].filter(Boolean).join(" ")}
    >
      {children}
    </button>
  );
}

/* ===== HELPERS ===== */

function StatPill({ label, value, accent = false, pulse = false }: { label: string; value: number; accent?: boolean; pulse?: boolean }) {
  return (
    <div className={["flex items-center gap-2.5 px-4 py-2.5 bg-[#1A1A1A] border rounded-[4px]", pulse ? "border-[#C8A96E]/40" : "border-[#2A2A2A]"].join(" ")}>
      <span className={["font-[family-name:var(--font-cormorant)] text-[24px] font-semibold leading-none", accent || pulse ? "text-[#C8A96E]" : "text-[#F0EAD6]"].join(" ")}>
        {value}
      </span>
      <span className="text-[11px] tracking-[0.12em] uppercase text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]">
        {label}
      </span>
    </div>
  );
}

/* ===== ICONS ===== */

function RefreshIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4a2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.29 6.29l.86-.86a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="12" height="12" className="mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
