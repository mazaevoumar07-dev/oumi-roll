"use client";

import { useEffect, useRef, useState } from "react";

/* ===== TYPES ===== */

type SendStatus =
  | { type: "idle" }
  | { type: "sending" }
  | { type: "done"; sent: number; failed: number; total: number }
  | { type: "error"; message: string };

/* ===== CONSTANTS ===== */

const MAX_CHARS = 160;

/* ===== PAGE ===== */

export default function AdminSmsPage() {
  const [message, setMessage]         = useState("");
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus]           = useState<SendStatus>({ type: "idle" });
  const textareaRef                   = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/admin/sms/send")
      .then(r => r.ok ? r.json() : null)
      .then((data: { count?: number } | null) => {
        if (data?.count !== undefined) setSubscriberCount(data.count);
      })
      .catch(() => setSubscriberCount(0));
  }, []);

  const chars     = message.length;
  const overLimit = chars > MAX_CHARS;
  const count     = subscriberCount ?? 0;
  const canSend   = message.trim().length > 0 && !overLimit && count > 0;

  async function send() {
    setShowConfirm(false);
    setStatus({ type: "sending" });

    try {
      const res = await fetch("/api/admin/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });
      const data = await res.json() as { sent?: number; failed?: number; total?: number; error?: string };

      if (!res.ok || data.error) {
        setStatus({ type: "error", message: data.error ?? "Erreur inconnue" });
      } else {
        setStatus({ type: "done", sent: data.sent!, failed: data.failed!, total: data.total! });
        setMessage("");
      }
    } catch {
      setStatus({ type: "error", message: "Connexion impossible. Vérifiez le réseau." });
    }
  }

  return (
    <div className="bg-[#0D0D0D] min-h-screen">
      <div className="max-w-[600px] mx-auto px-6 sm:px-8 py-12 lg:py-16">

        {/* Header */}
        <div className="mb-10">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[#C8A96E] font-[family-name:var(--font-dm-sans)] mb-1">
            Administration
          </p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-[40px] font-light text-[#F0EAD6] leading-none">
            SMS Promotionnels
          </h1>
        </div>

        <div className="h-px bg-[#2A2A2A] mb-8" />

        {/* Subscribers count */}
        <div className="flex items-center gap-3 mb-8 p-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-[4px]">
          <div className="w-8 h-8 rounded-full bg-[#C8A96E]/15 border border-[#C8A96E]/30 flex items-center justify-center text-[#C8A96E]">
            <UsersIcon />
          </div>
          <div>
            <p className="text-[13.5px] text-[#F0EAD6] font-[family-name:var(--font-dm-sans)] font-medium">
              {subscriberCount === null ? "…" : count} abonné{count !== 1 ? "s" : ""}
            </p>
            <p className="text-[11.5px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]">
              Clients ayant accepté de recevoir des SMS
            </p>
          </div>
        </div>

        {/* Status result */}
        {status.type === "done" && (
          <div className="mb-6 p-4 bg-[#27AE60]/10 border border-[#27AE60]/30 rounded-[4px]">
            <p className="text-[13.5px] text-[#F0EAD6] font-[family-name:var(--font-dm-sans)] font-medium mb-1">
              Envoi terminé
            </p>
            <p className="text-[12.5px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]">
              Envoyé&nbsp;:&nbsp;<span className="text-[#27AE60]">{status.sent}</span>
              {status.failed > 0 && (
                <> · Échec&nbsp;: <span className="text-[#C0392B]">{status.failed}</span></>
              )}
              &nbsp;· Total&nbsp;: {status.total}
            </p>
          </div>
        )}

        {status.type === "error" && (
          <div className="mb-6 p-4 bg-[#C0392B]/10 border border-[#C0392B]/30 rounded-[4px]">
            <p className="text-[13px] text-[#C0392B] font-[family-name:var(--font-dm-sans)]">
              {status.message}
            </p>
          </div>
        )}

        {/* Message composer */}
        <div className="flex flex-col gap-5">
          <FormSection title="Message SMS">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={e => {
                  setMessage(e.target.value);
                  if (status.type === "done" || status.type === "error") setStatus({ type: "idle" });
                }}
                placeholder="Ex : 🎉 Profitez de -20% sur tous nos roullés ce weekend ! Code : OUMI20 — oumiroll.fr"
                rows={5}
                className={[
                  "w-full px-4 py-3 bg-[#111] border rounded-[4px] text-[13.5px] text-[#F0EAD6] placeholder:text-[#8A8A8A]/40",
                  "outline-none transition-colors duration-200 resize-none font-[family-name:var(--font-dm-sans)] leading-relaxed",
                  overLimit
                    ? "border-[#C0392B] focus:border-[#C0392B]"
                    : "border-[#2A2A2A] focus:border-[#C8A96E]",
                ].join(" ")}
              />
              <span className={[
                "absolute bottom-3 right-3 text-[11px] font-[family-name:var(--font-dm-sans)] tabular-nums",
                overLimit ? "text-[#C0392B]" : chars > MAX_CHARS * 0.8 ? "text-[#C8A96E]/70" : "text-[#8A8A8A]/40",
              ].join(" ")}>
                {chars}/{MAX_CHARS}
              </span>
            </div>
            {overLimit && (
              <p className="text-[11.5px] text-[#C0392B] font-[family-name:var(--font-dm-sans)]">
                Le message dépasse {MAX_CHARS} caractères — il sera découpé en plusieurs SMS.
              </p>
            )}
            <p className="text-[11.5px] text-[#8A8A8A]/50 font-[family-name:var(--font-dm-sans)]">
              Un SMS standard = 160 caractères. Au-delà, chaque destinataire reçoit plusieurs messages.
            </p>
          </FormSection>

          {/* Preview */}
          {message.trim() && (
            <div>
              <p className="text-[11px] tracking-[0.14em] uppercase text-[#8A8A8A] font-[family-name:var(--font-dm-sans)] mb-2">
                Aperçu
              </p>
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[4px] px-5 py-4">
                <p className="text-[13px] text-[#F0EAD6] font-[family-name:var(--font-dm-sans)] leading-relaxed whitespace-pre-wrap break-words">
                  {message}
                </p>
                <p className="mt-3 text-[11px] text-[#8A8A8A]/40 font-[family-name:var(--font-dm-sans)]">
                  De : OUMIROLL · À : {count} destinataire{count !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}

          {/* Confirm dialog */}
          {showConfirm && (
            <div className="border border-[#C8A96E]/30 bg-[#C8A96E]/5 rounded-[4px] p-5">
              <p className="text-[13.5px] text-[#F0EAD6] font-[family-name:var(--font-dm-sans)] font-medium mb-1">
                Confirmer l&apos;envoi ?
              </p>
              <p className="text-[12.5px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)] mb-4">
                Ce SMS sera envoyé à <strong className="text-[#F0EAD6]">{count}</strong> abonné{count !== 1 ? "s" : ""}. Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={send}
                  className="flex-1 py-2.5 bg-[#C8A96E] text-[#0D0D0D] text-[12px] tracking-[0.08em] uppercase font-medium rounded-[4px] hover:bg-[#E2C07A] transition-colors font-[family-name:var(--font-dm-sans)]"
                >
                  Oui, envoyer
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2.5 border border-[#2A2A2A] text-[#8A8A8A] text-[12px] tracking-[0.08em] uppercase rounded-[4px] hover:border-[#C8A96E]/40 hover:text-[#C8A96E]/70 transition-colors font-[family-name:var(--font-dm-sans)]"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Send button */}
          {!showConfirm && (
            <button
              onClick={() => setShowConfirm(true)}
              disabled={!canSend || status.type === "sending"}
              className={[
                "flex items-center justify-center gap-2 w-full py-[14px] text-[13px] tracking-[0.08em] uppercase font-medium rounded-[4px] transition-colors duration-200 font-[family-name:var(--font-dm-sans)]",
                !canSend || status.type === "sending"
                  ? "bg-[#C8A96E]/30 text-[#0D0D0D]/50 cursor-not-allowed"
                  : "bg-[#C8A96E] text-[#0D0D0D] hover:bg-[#E2C07A] active:bg-[#C8A96E]",
              ].join(" ")}
            >
              {status.type === "sending" ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0D0D0D]/30 border-t-[#0D0D0D] rounded-full animate-spin" />
                  Envoi en cours…
                </>
              ) : (
                <>
                  <SendIcon />
                  Envoyer à {count} abonné{count !== 1 ? "s" : ""}
                </>
              )}
            </button>
          )}

          {count === 0 && subscriberCount !== null && (
            <p className="text-center text-[12px] text-[#8A8A8A]/50 font-[family-name:var(--font-dm-sans)]">
              Aucun abonné SMS pour l&apos;instant.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}

/* ===== SUB-COMPONENTS ===== */

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
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

/* ===== ICONS ===== */

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
