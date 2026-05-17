import fr from "./fr";
import en from "./en";
import ru from "./ru";

export type { Dict } from "./fr";
export type Lang = "FR" | "EN" | "RU";

export const LANGS: Lang[] = ["FR", "EN", "RU"];

export const dictionaries: Record<Lang, typeof fr> = { FR: fr, EN: en, RU: ru };
