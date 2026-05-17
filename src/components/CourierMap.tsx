"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";

export type LatLng = { lat: number; lng: number };

// Approximate restaurant position — update when real address is confirmed
export const RESTAURANT_POS: LatLng = { lat: 48.0061, lng: 0.1966 };

const RESTAURANT_ICON = `
  <div style="
    width:36px;height:36px;
    background:#C8A96E;border:2px solid #0D0D0D;border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;
    box-shadow:0 2px 8px rgba(0,0,0,0.4);
  ">
    <span style="transform:rotate(45deg);font-size:15px;line-height:1">🍣</span>
  </div>`;

const COURIER_ICON = `
  <div style="
    width:36px;height:36px;
    background:#5B9BD5;border:2px solid #0D0D0D;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 2px 8px rgba(0,0,0,0.4);
  ">
    <span style="font-size:18px;line-height:1">🛵</span>
  </div>`;

function makeIcon(html: string, anchor: [number, number]): L.DivIcon {
  return L.divIcon({ html, className: "", iconSize: [36, 36], iconAnchor: anchor });
}

export default function CourierMap({ courier }: { courier: LatLng | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<L.Map | null>(null);
  const courierRef    = useRef<L.Marker | null>(null);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, { zoomControl: true, attributionControl: true });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Restaurant marker
    L.marker([RESTAURANT_POS.lat, RESTAURANT_POS.lng], {
      icon: makeIcon(RESTAURANT_ICON, [18, 36]),
    })
      .addTo(map)
      .bindPopup("OUMI ROLL");

    if (courier) {
      courierRef.current = L.marker([courier.lat, courier.lng], {
        icon: makeIcon(COURIER_ICON, [18, 18]),
      })
        .addTo(map)
        .bindPopup("Livreur");

      map.fitBounds(
        [[RESTAURANT_POS.lat, RESTAURANT_POS.lng], [courier.lat, courier.lng]],
        { padding: [48, 48] }
      );
    } else {
      map.setView([RESTAURANT_POS.lat, RESTAURANT_POS.lng], 14);
    }

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      courierRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update courier marker when position changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !courier) return;

    if (courierRef.current) {
      courierRef.current.setLatLng([courier.lat, courier.lng]);
    } else {
      courierRef.current = L.marker([courier.lat, courier.lng], {
        icon: makeIcon(COURIER_ICON, [18, 18]),
      })
        .addTo(map)
        .bindPopup("Livreur");
    }

    map.fitBounds(
      [[RESTAURANT_POS.lat, RESTAURANT_POS.lng], [courier.lat, courier.lng]],
      { padding: [48, 48] }
    );
  }, [courier]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-[4px] overflow-hidden border border-[#2A2A2A]"
      style={{ height: 280 }}
    />
  );
}
