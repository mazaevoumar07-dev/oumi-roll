export interface Order {
  id: string;
  items: Array<{ id: string; name: string; price: number; qty: number }>;
  subtotal: number;
  deliveryCost: number;
  total: number;
  mode: "livraison" | "emporter";
  adresse: string;
  prenom: string;
  nom: string;
  telephone: string;
  status: "nouveau" | "en_preparation" | "en_livraison" | "livre" | "annule";
  createdAt: string;
}

const KEY = "oumi_orders";

function readAll(): Record<string, Order> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function saveOrder(order: Order): void {
  const all = readAll();
  all[order.id] = order;
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function getOrder(id: string): Order | null {
  return readAll()[id] ?? null;
}

export function cancelOrder(id: string): void {
  const all = readAll();
  if (all[id]) {
    all[id] = { ...all[id], status: "annule" };
    localStorage.setItem(KEY, JSON.stringify(all));
  }
}

export function generateOrderId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "OU";
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}
