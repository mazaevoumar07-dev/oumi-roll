"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const SEND_INTERVAL = 10_000;

type GeoState =
  | { type: "idle" }
  | { type: "requesting" }
  | { type: "active"; lat: number; lng: number }
  | { type: "denied" }
  | { type: "error"; message: string };

function CourierTracker() {
  const params  = useSearchParams();
  const orderId = params.get("order");
  const [geo, setGeo]       = useState<GeoState>({ type: "idle" });
  const [sending, setSending] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchRef    = useRef<number | null>(null);

  const sendPosition = useCallback(async (lat: number, lng: number) => {
    if (!orderId) return;
    setSending(true);
    try {
      await fetch(`/api/courier/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng }),
      });
    } catch {
      // Best-effort — next tick will retry
    } finally {
      setSending(false);
    }
  }, [orderId]);

  function startTracking() {
    if (!navigator.geolocation) {
      setGeo({ type: "error", message: "Géolocalisation non supportée par ce navigateur." });
      return;
    }
    setGeo({ type: "requesting" });

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setGeo({ type: "active", lat, lng });
        sendPosition(lat, lng);

        // Stop previous interval and start fresh
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => sendPosition(lat, lng), SEND_INTERVAL);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGeo({ type: "denied" });
        } else {
          setGeo({ type: "error", message: "Impossible d'obtenir la position GPS." });
        }
      },
      { enableHighAccuracy: true, timeout: 15_000 }
    );
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, []);

  if (!orderId) {
    return (
      <Screen>
        <p className="text-[14px] text-[#C0392B] font-[family-name:var(--font-dm-sans)] text-center">
          Lien invalide — numéro de commande manquant.
        </p>
      </Screen>
    );
  }

  return (
    <Screen>
      {/* Header */}
      <div className="mb-10 text-center">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[#C8A96E] font-[family-name:var(--font-dm-sans)] mb-1">
          OUMI ROLL · Livreur
        </p>
        <h1 className="font-[family-name:var(--font-cormorant)] text-[32px] font-light text-[#F0EAD6] leading-none">
          Commande {orderId}
        </h1>
      </div>

      <div className="h-px bg-[#2A2A2A] mb-8" />

      {/* State machine */}
      {geo.type === "idle" && (
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 rounded-full bg-[#C8A96E]/10 border border-[#C8A96E]/30 flex items-center justify-center text-[32px]">
            🛵
          </div>
          <div>
            <p className="text-[15px] text-[#F0EAD6] font-[family-name:var(--font-dm-sans)] font-medium mb-2">
              Partager votre position
            </p>
            <p className="text-[13px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)] leading-relaxed max-w-xs">
              Le client pourra suivre votre trajet en temps réel. Votre position sera transmise toutes les 10 secondes.
            </p>
          </div>
          <button
            onClick={startTracking}
            className="px-8 py-3.5 bg-[#C8A96E] text-[#0D0D0D] text-[13px] tracking-[0.08em] uppercase font-medium rounded-[4px] hover:bg-[#E2C07A] transition-colors font-[family-name:var(--font-dm-sans)]"
          >
            Autoriser le GPS
          </button>
        </div>
      )}

      {geo.type === "requesting" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-8 h-8 border-2 border-[#C8A96E]/30 border-t-[#C8A96E] rounded-full animate-spin" />
          <p className="text-[13px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]">
            En attente de l&apos;autorisation GPS…
          </p>
        </div>
      )}

      {geo.type === "active" && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3 p-4 bg-[#27AE60]/10 border border-[#27AE60]/30 rounded-[4px]">
            <span className="w-2 h-2 rounded-full bg-[#27AE60] animate-pulse flex-shrink-0" />
            <div>
              <p className="text-[13px] text-[#27AE60] font-[family-name:var(--font-dm-sans)] font-medium">
                Position partagée {sending && "· envoi…"}
              </p>
              <p className="text-[11.5px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)] mt-0.5">
                Mise à jour toutes les 10 secondes
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-[4px]">
            <p className="text-[11px] tracking-[0.15em] uppercase text-[#8A8A8A] font-[family-name:var(--font-dm-sans)] mb-2">
              Position actuelle
            </p>
            <p className="text-[13px] text-[#F0EAD6] font-[family-name:var(--font-dm-sans)] tabular-nums">
              {geo.lat.toFixed(6)}, {geo.lng.toFixed(6)}
            </p>
          </div>

          <p className="text-[11.5px] text-[#8A8A8A]/50 font-[family-name:var(--font-dm-sans)] text-center">
            Gardez cette page ouverte pendant la livraison.
          </p>
        </div>
      )}

      {geo.type === "denied" && (
        <div className="flex flex-col gap-4 text-center">
          <div className="p-4 bg-[#C0392B]/10 border border-[#C0392B]/30 rounded-[4px]">
            <p className="text-[13px] text-[#C0392B] font-[family-name:var(--font-dm-sans)] font-medium mb-1">
              Accès GPS refusé
            </p>
            <p className="text-[12px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]">
              Autorisez l&apos;accès à la localisation dans les paramètres de votre navigateur, puis rechargez la page.
            </p>
          </div>
          <button
            onClick={() => { setGeo({ type: "idle" }); }}
            className="px-6 py-2.5 border border-[#2A2A2A] text-[#8A8A8A] text-[12px] tracking-[0.08em] uppercase rounded-[4px] hover:border-[#C8A96E]/40 hover:text-[#C8A96E]/70 transition-colors font-[family-name:var(--font-dm-sans)]"
          >
            Réessayer
          </button>
        </div>
      )}

      {geo.type === "error" && (
        <div className="p-4 bg-[#C0392B]/10 border border-[#C0392B]/30 rounded-[4px] text-center">
          <p className="text-[13px] text-[#C0392B] font-[family-name:var(--font-dm-sans)]">
            {geo.message}
          </p>
        </div>
      )}
    </Screen>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#0D0D0D] min-h-screen flex items-start justify-center pt-16 px-6">
      <div className="w-full max-w-[400px]">{children}</div>
    </div>
  );
}

export default function CourierPage() {
  return (
    <Suspense fallback={
      <div className="bg-[#0D0D0D] min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C8A96E]/20 border-t-[#C8A96E] rounded-full animate-spin" />
      </div>
    }>
      <CourierTracker />
    </Suspense>
  );
}
