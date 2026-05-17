"use client";

import { useEffect, useState } from "react";
import type { MenuItem } from "@/data/menu";
import { getMenuItems } from "@/lib/menu-storage";
import { getBonusConfig, saveBonusConfig, BONUS_MIN_QTY, type BonusConfig } from "@/lib/bonus-storage";

export default function AdminBonusPage() {
  const [config, setConfig]   = useState<BonusConfig>({ freeDelivery: false, freeItem: false, freeItemId: null });
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    setConfig(getBonusConfig());
    setMenuItems(getMenuItems().filter(i => i.available));
  }, []);

  const giftItem = menuItems.find(i => i.id === config.freeItemId) ?? null;
  const giftHidden = config.freeItem && config.freeItemId && !giftItem;
  const anyActive = config.freeDelivery || config.freeItem;

  function update(patch: Partial<BonusConfig>) {
    const next = { ...config, ...patch };
    setConfig(next);
    saveBonusConfig(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="bg-[#0D0D0D] min-h-screen">
      <div className="max-w-[640px] mx-auto px-6 sm:px-8 py-12 lg:py-16">

        {/* Header */}
        <div className="mb-10">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[#C8A96E] font-[family-name:var(--font-dm-sans)] mb-1">
            Administration
          </p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-[40px] font-light text-[#F0EAD6] leading-none">
            Système de Bonus
          </h1>
        </div>

        <div className="h-px bg-[#2A2A2A] mb-8" />

        {/* Status pill */}
        <div className={["inline-flex items-center gap-2 px-4 py-2 rounded-[4px] border mb-8 font-[family-name:var(--font-dm-sans)] text-[12px] tracking-[0.08em] uppercase",
          anyActive
            ? "bg-[#27AE60]/10 border-[#27AE60]/30 text-[#27AE60]"
            : "bg-[#2A2A2A] border-[#3A3A3A] text-[#8A8A8A]",
        ].join(" ")}>
          <span className={["w-1.5 h-1.5 rounded-full", anyActive ? "bg-[#27AE60]" : "bg-[#8A8A8A]"].join(" ")} />
          {anyActive ? "Bonus actif" : "Bonus inactif"}
          {saved && <span className="ml-2 text-[#C8A96E]">· Sauvegardé</span>}
        </div>

        {/* Condition info */}
        <div className="flex items-start gap-3 p-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-[4px] mb-8">
          <InfoIcon />
          <p className="text-[12.5px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)] leading-relaxed">
            Les bonus s&apos;appliquent automatiquement quand le client commande{" "}
            <strong className="text-[#F0EAD6]">{BONUS_MIN_QTY} portions ou plus</strong>.
          </p>
        </div>

        {/* Gift item hidden warning */}
        {giftHidden && (
          <div className="flex items-start gap-3 p-4 bg-[#C8A96E]/8 border border-[#C8A96E]/30 rounded-[4px] mb-6">
            <WarningIcon />
            <p className="text-[12.5px] text-[#C8A96E] font-[family-name:var(--font-dm-sans)] leading-relaxed">
              Le plat cadeau est masqué du menu — le bonus cadeau ne s&apos;activera pas pour les clients. Choisissez un autre plat ou réactivez celui-ci dans la gestion du menu.
            </p>
          </div>
        )}

        {/* Bonus rows */}
        <div className="flex flex-col gap-4">

          {/* Bonus 1: free delivery */}
          <BonusRow
            title="Livraison offerte"
            description={`Pour toute commande de ${BONUS_MIN_QTY} portions ou plus`}
            enabled={config.freeDelivery}
            onToggle={() => update({ freeDelivery: !config.freeDelivery })}
          />

          {/* Bonus 2: free item */}
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[4px] overflow-hidden">
            <div className="flex items-center justify-between gap-4 p-5">
              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-[#F0EAD6] font-[family-name:var(--font-dm-sans)] font-medium">
                  1 portion offerte
                </p>
                <p className="text-[12px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)] mt-0.5">
                  Pour toute commande de {BONUS_MIN_QTY} portions ou plus
                </p>
              </div>
              <Toggle enabled={config.freeItem} onToggle={() => update({ freeItem: !config.freeItem })} />
            </div>

            {/* Gift item selector */}
            {config.freeItem && (
              <div className="px-5 pb-5 border-t border-[#252525] pt-4">
                <p className="text-[11px] tracking-[0.18em] uppercase text-[#C8A96E] font-[family-name:var(--font-dm-sans)] mb-3">
                  Plat offert
                </p>
                {menuItems.length === 0 ? (
                  <p className="text-[12.5px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]">
                    Aucun plat disponible dans le menu.
                  </p>
                ) : (
                  <div className="relative">
                    <select
                      value={config.freeItemId ?? ""}
                      onChange={e => update({ freeItemId: e.target.value || null })}
                      className="w-full px-4 py-3 bg-[#111] border border-[#2A2A2A] focus:border-[#C8A96E] rounded-[4px] text-[13px] text-[#F0EAD6] outline-none transition-colors font-[family-name:var(--font-dm-sans)] appearance-none pr-8"
                    >
                      <option value="">— Choisir un plat —</option>
                      {menuItems.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name} — €{item.price.toFixed(2)}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </div>
                )}
                {giftItem && (
                  <p className="mt-2.5 text-[12px] text-[#8A8A8A]/60 font-[family-name:var(--font-dm-sans)]">
                    Les clients recevront <strong className="text-[#F0EAD6]">{giftItem.name}</strong> en cadeau avec leur commande.
                  </p>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Preview */}
        {anyActive && (
          <div className="mt-8">
            <p className="text-[11px] tracking-[0.2em] uppercase text-[#8A8A8A] font-[family-name:var(--font-dm-sans)] mb-3">
              Aperçu — message affiché aux clients
            </p>
            <div className="p-4 bg-[#C8A96E]/8 border border-[#C8A96E]/25 rounded-[4px]">
              <p className="text-[13px] text-[#F0EAD6] font-[family-name:var(--font-dm-sans)] leading-relaxed">
                {config.freeDelivery && config.freeItem && giftItem
                  ? `Commandez ${BONUS_MIN_QTY} portions et bénéficiez de la livraison offerte + ${giftItem.name} en cadeau !`
                  : config.freeDelivery
                  ? `Commandez ${BONUS_MIN_QTY} portions et bénéficiez de la livraison offerte !`
                  : giftItem
                  ? `Commandez ${BONUS_MIN_QTY} portions et recevez ${giftItem.name} en cadeau !`
                  : `Commandez ${BONUS_MIN_QTY} portions et profitez de nos bonus !`}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* ===== SUB-COMPONENTS ===== */

function BonusRow({ title, description, enabled, onToggle }: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-[4px]">
      <div className="flex-1 min-w-0">
        <p className="text-[14px] text-[#F0EAD6] font-[family-name:var(--font-dm-sans)] font-medium">{title}</p>
        <p className="text-[12px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)] mt-0.5">{description}</p>
      </div>
      <Toggle enabled={enabled} onToggle={onToggle} />
    </div>
  );
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={enabled ? "Désactiver" : "Activer"}
      className={[
        "relative flex-shrink-0 w-11 h-6 rounded-full border transition-colors",
        enabled ? "bg-[#27AE60]/20 border-[#27AE60]/40" : "bg-[#2A2A2A] border-[#3A3A3A]",
      ].join(" ")}
    >
      <span className={[
        "absolute top-[3px] w-[18px] h-[18px] rounded-full transition-transform",
        enabled ? "translate-x-[22px] bg-[#27AE60]" : "translate-x-[3px] bg-[#8A8A8A]",
      ].join(" ")} />
    </button>
  );
}

/* ===== ICONS ===== */

function InfoIcon() {
  return (
    <svg width="16" height="16" className="flex-shrink-0 mt-[1px] text-[#8A8A8A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="16" height="16" className="flex-shrink-0 mt-[1px]" viewBox="0 0 24 24" fill="none" stroke="#C8A96E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
