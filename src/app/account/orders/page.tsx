"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useMenu } from "@/context/MenuContext";

/* ===== ТИПЫ ===== */

interface OrderItem {
  id: string;
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  is_gift: boolean;
}

interface Order {
  id: string;
  order_number: number;
  delivery_type: "delivery" | "pickup";
  address: string | null;
  delivery_cost: number;
  total_amount: number;
  status: "new" | "preparing" | "in_delivery" | "completed" | "cancelled";
  payment_status: "pending" | "paid" | "failed";
  created_at: string;
  cancelled_at: string | null;
  order_items: OrderItem[];
}

/* ===== ВСПОМОГАТЕЛЬНЫЕ ===== */

const STATUS_LABELS: Record<Order["status"], string> = {
  new: "Nouvelle",
  preparing: "En préparation",
  in_delivery: "En livraison",
  completed: "Livrée",
  cancelled: "Annulée",
};

const STATUS_COLORS: Record<Order["status"], string> = {
  new: "text-[#C8A96E] border-[#C8A96E]/30 bg-[#C8A96E]/5",
  preparing: "text-[#3B82F6] border-[#3B82F6]/30 bg-[#3B82F6]/5",
  in_delivery: "text-[#8B5CF6] border-[#8B5CF6]/30 bg-[#8B5CF6]/5",
  completed: "text-[#27AE60] border-[#27AE60]/30 bg-[#27AE60]/5",
  cancelled: "text-[#8A8A8A] border-[#8A8A8A]/30 bg-[#8A8A8A]/5",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* ===== PAGE ===== */

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const { addItem, openCart } = useCart();
  const { items: menuItems } = useMenu();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  // id заказа, для которого показывается уведомление
  const [notice, setNotice] = useState<{ orderId: string; text: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/connexion");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/users/me/orders")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<Order[]>;
      })
      .then(setOrders)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [user]);

  function handleRepeat(order: Order) {
    const repeatableItems = order.order_items.filter((i) => !i.is_gift);
    const unavailable: string[] = [];

    for (const item of repeatableItems) {
      const current = menuItems.find(
        (m) => m.id === item.menu_item_id && m.is_available
      );
      if (!current) {
        unavailable.push(item.name);
        continue;
      }
      addItem({ id: current.id, name: current.name, price: current.price }, item.quantity);
    }

    openCart();

    if (unavailable.length > 0) {
      const names = unavailable.join(", ");
      setNotice({
        orderId: order.id,
        text: `Article${unavailable.length > 1 ? "s" : ""} non disponible${unavailable.length > 1 ? "s" : ""} : ${names}`,
      });
      setTimeout(() => setNotice(null), 5000);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-[#0D0D0D]">
        <div className="w-5 h-5 border border-[#C8A96E]/40 border-t-[#C8A96E] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-[#0D0D0D] px-6">
        <p className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[#8A8A8A]">
          Impossible de charger vos commandes. Veuillez réessayer.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#0D0D0D] px-4 py-12 sm:px-6">
      <div className="w-full max-w-[640px] mx-auto flex flex-col gap-8">

        {/* Заголовок */}
        <div className="flex flex-col gap-1">
          <h1 className="font-[family-name:var(--font-cormorant)] text-[36px] sm:text-[44px] font-light text-[#F0EAD6] leading-none">
            Mes commandes
          </h1>
          <p className="font-[family-name:var(--font-dm-sans)] text-[12.5px] text-[#8A8A8A]">
            Historique de vos commandes passées
          </p>
        </div>

        {/* Пустое состояние */}
        {orders.length === 0 && (
          <div className="flex flex-col items-center gap-5 py-16">
            <p className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[#8A8A8A] text-center">
              Vous n&apos;avez pas encore passé de commande.
            </p>
            <Link
              href="/"
              className="px-6 py-[11px] bg-[#C8A96E] text-[#0D0D0D] text-[12px] tracking-[0.08em] uppercase font-medium rounded-[4px] hover:bg-[#E2C07A] transition-colors font-[family-name:var(--font-dm-sans)]"
            >
              Voir le menu
            </Link>
          </div>
        )}

        {/* Список заказов */}
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-[#2A2A2A] rounded-[4px] bg-[#111111] overflow-hidden"
            >
              {/* Шапка заказа */}
              <div className="px-5 py-4 flex items-center justify-between gap-4 border-b border-[#2A2A2A]">
                <div className="flex flex-col gap-0.5">
                  <span className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[#F0EAD6] font-medium">
                    Commande #{order.order_number}
                  </span>
                  <span className="font-[family-name:var(--font-dm-sans)] text-[11.5px] text-[#8A8A8A]">
                    {formatDate(order.created_at)}
                  </span>
                </div>
                <span
                  className={`font-[family-name:var(--font-dm-sans)] text-[10.5px] tracking-[0.06em] uppercase border px-2.5 py-1 rounded-[3px] ${STATUS_COLORS[order.status]}`}
                >
                  {STATUS_LABELS[order.status]}
                </span>
              </div>

              {/* Состав заказа */}
              <div className="px-5 py-4 flex flex-col gap-2">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3">
                    <span className="font-[family-name:var(--font-dm-sans)] text-[12.5px] text-[#C0B89A]">
                      {item.quantity}× {item.name}
                      {item.is_gift && (
                        <span className="ml-1.5 text-[10.5px] text-[#C8A96E]">
                          (offert)
                        </span>
                      )}
                    </span>
                    {!item.is_gift && (
                      <span className="font-[family-name:var(--font-dm-sans)] text-[12px] text-[#8A8A8A] shrink-0">
                        {(item.price * item.quantity).toFixed(2)} €
                      </span>
                    )}
                  </div>
                ))}

                {/* Итог */}
                <div className="mt-2 pt-3 border-t border-[#2A2A2A] flex items-center justify-between">
                  <span className="font-[family-name:var(--font-dm-sans)] text-[11.5px] text-[#8A8A8A]">
                    {order.delivery_type === "delivery" ? "Livraison" : "À emporter"}
                    {order.delivery_cost > 0 && ` — ${order.delivery_cost.toFixed(2)} €`}
                  </span>
                  <span className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[#F0EAD6] font-medium">
                    {order.total_amount.toFixed(2)} €
                  </span>
                </div>
              </div>

              {/* Уведомление о недоступных позициях */}
              {notice?.orderId === order.id && (
                <div className="px-5 pb-3">
                  <p className="font-[family-name:var(--font-dm-sans)] text-[11.5px] text-[#E2A84B] leading-[1.5]">
                    {notice.text}
                  </p>
                </div>
              )}

              {/* Кнопка "Répéter" */}
              {order.status !== "cancelled" &&
                order.order_items.some((i) => !i.is_gift) && (
                  <div className="px-5 pb-4">
                    <button
                      onClick={() => handleRepeat(order)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-[10px] border border-[#C8A96E]/40 text-[#C8A96E] text-[11.5px] tracking-[0.07em] uppercase rounded-[4px] hover:bg-[#C8A96E]/8 hover:border-[#C8A96E]/70 transition-all font-[family-name:var(--font-dm-sans)]"
                    >
                      <RepeatIcon />
                      Répéter la commande
                    </button>
                  </div>
                )}
            </div>
          ))}
        </div>

        {/* Назад */}
        <Link
          href="/"
          className="self-start font-[family-name:var(--font-dm-sans)] text-[12px] text-[#8A8A8A] hover:text-[#C8A96E] transition-colors tracking-[0.04em] uppercase"
        >
          ← Retour au menu
        </Link>
      </div>
    </div>
  );
}

function RepeatIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}
