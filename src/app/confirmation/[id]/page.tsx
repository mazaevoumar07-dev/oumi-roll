"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function ConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`pi_${id}`);
      if (raw) {
        const data = JSON.parse(raw) as { email?: string };
        setEmail(data.email ?? null);
      }
    } catch {
      // sessionStorage недоступен или данные повреждены
    }
  }, [id]);

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-[#0D0D0D] px-6">
      <div className="w-full max-w-[480px] flex flex-col items-center text-center gap-8">

        {/* Иконка успеха */}
        <div className="w-16 h-16 rounded-full border border-[#27AE60]/40 bg-[#27AE60]/10 flex items-center justify-center">
          <CheckIcon />
        </div>

        {/* Заголовок */}
        <div className="flex flex-col gap-3">
          <h1 className="font-[family-name:var(--font-cormorant)] text-[40px] sm:text-[48px] font-light text-[#F0EAD6] leading-none">
            Paiement accepté
          </h1>
          <p className="font-[family-name:var(--font-dm-sans)] text-[14px] text-[#8A8A8A] leading-[1.7]">
            Votre commande est en cours de préparation.
          </p>
        </div>

        {/* Email чека */}
        {email && (
          <div className="w-full px-5 py-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-[4px]">
            <p className="font-[family-name:var(--font-dm-sans)] text-[12.5px] text-[#8A8A8A] leading-[1.6]">
              Un reçu de paiement a été envoyé à{" "}
              <span className="text-[#F0EAD6]">{email}</span>
            </p>
          </div>
        )}

        {/* Разделитель */}
        <div className="w-full h-px bg-[#2A2A2A]" />

        {/* Действия */}
        <div className="flex flex-col items-center gap-4 w-full">
          {user ? (
            <Link
              href="/account/orders"
              className="w-full flex items-center justify-center gap-2 px-6 py-[13px] bg-[#C8A96E] text-[#0D0D0D] text-[12.5px] tracking-[0.08em] uppercase font-medium rounded-[4px] hover:bg-[#E2C07A] transition-all font-[family-name:var(--font-dm-sans)]"
            >
              Voir mes commandes
            </Link>
          ) : null}
          <Link
            href="/"
            className="w-full flex items-center justify-center px-6 py-[13px] border border-[#2A2A2A] text-[#8A8A8A] text-[12.5px] tracking-[0.08em] uppercase rounded-[4px] hover:border-[#C8A96E]/40 hover:text-[#C8A96E]/70 transition-all font-[family-name:var(--font-dm-sans)]"
          >
            Retour à l&apos;accueil
          </Link>
        </div>

        {/* Информация о задержке */}
        <p className="font-[family-name:var(--font-dm-sans)] text-[11.5px] text-[#8A8A8A]/50 leading-[1.6] max-w-[340px]">
          La confirmation de commande peut prendre quelques instants.
          Votre commande apparaîtra dans l&apos;historique dès qu&apos;elle aura été enregistrée.
        </p>

      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#27AE60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
