export type BonusConfig = {
  freeDelivery: boolean;
  freeItem: boolean;
  freeItemId: string | null;
};

const KEY = "oumi_bonus";

const DEFAULT: BonusConfig = {
  freeDelivery: false,
  freeItem: false,
  freeItemId: null,
};

export function getBonusConfig(): BonusConfig {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...(JSON.parse(raw) as Partial<BonusConfig>) };
  } catch {
    return DEFAULT;
  }
}

export function saveBonusConfig(config: BonusConfig): void {
  localStorage.setItem(KEY, JSON.stringify(config));
}

export const BONUS_MIN_QTY = 2;
