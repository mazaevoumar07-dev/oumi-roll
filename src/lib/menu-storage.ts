import { MENU_ITEMS, type MenuItem } from "@/data/menu";

const STORAGE_KEY = "oumi_menu";

export function getMenuItems(): MenuItem[] {
  if (typeof window === "undefined") return MENU_ITEMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return MENU_ITEMS;
    return JSON.parse(raw) as MenuItem[];
  } catch {
    return MENU_ITEMS;
  }
}

export function saveMenuItems(items: MenuItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    throw new Error("Espace de stockage insuffisant. Réduisez la taille des images.");
  }
}

export function generateItemId(name: string, existing: MenuItem[]): string {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return existing.some((i) => i.id === base) ? `${base}-${Date.now()}` : base;
}
