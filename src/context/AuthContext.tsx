"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

/* ===== TYPES ===== */

export interface User {
  prenom: string;
  nom: string;
  telephone: string;
  smsConsent: boolean;
}

interface StoredUser extends User {
  password: string;
}

export interface RegisterData {
  prenom: string;
  nom: string;
  telephone: string;
  password: string;
  smsConsent: boolean;
}

export type LoginResult =
  | { success: true }
  | { success: false; error: string; attemptsLeft?: number; blockedUntil?: number };

export type AuthResult =
  | { success: true }
  | { success: false; error: string };

/* ===== STORAGE HELPERS ===== */

const KEY_USERS   = "oumi_users";
const KEY_SESSION = "oumi_session";
const KEY_LOCK    = (p: string) => `oumi_lock_${p}`;

interface LockData { count: number; blockedUntil: number | null }

function readUsers(): StoredUser[] {
  try { return JSON.parse(localStorage.getItem(KEY_USERS) || "[]"); } catch { return []; }
}
function writeUsers(u: StoredUser[]) { localStorage.setItem(KEY_USERS, JSON.stringify(u)); }

function readLock(phone: string): LockData {
  try { return JSON.parse(localStorage.getItem(KEY_LOCK(phone)) || "null") ?? { count: 0, blockedUntil: null }; }
  catch { return { count: 0, blockedUntil: null }; }
}
function writeLock(phone: string, d: LockData) { localStorage.setItem(KEY_LOCK(phone), JSON.stringify(d)); }
function clearLock(phone: string) { localStorage.removeItem(KEY_LOCK(phone)); }

export function normalizePhone(phone: string): string {
  const v = phone.replace(/[\s\-\.]/g, "");
  if (v.startsWith("+33")) return "0" + v.slice(3);
  if (v.startsWith("0033")) return "0" + v.slice(4);
  return v;
}

/* ===== CONTEXT ===== */

interface AuthContextValue {
  user: User | null;
  login: (phone: string, password: string) => LoginResult;
  register: (data: RegisterData) => AuthResult;
  updatePassword: (phone: string, newPassword: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY_SESSION);
      if (s) setUser(JSON.parse(s));
    } catch {}
  }, []);

  function login(phone: string, password: string): LoginResult {
    const tel = normalizePhone(phone);
    const lock = readLock(tel);

    if (lock.blockedUntil && Date.now() < lock.blockedUntil) {
      return { success: false, error: "", blockedUntil: lock.blockedUntil };
    }

    const found = readUsers().find(u => u.telephone === tel);
    if (!found || found.password !== password) {
      const newCount = lock.count + 1;
      if (newCount >= 5) {
        const blockedUntil = Date.now() + 15 * 60 * 1000;
        writeLock(tel, { count: newCount, blockedUntil });
        return { success: false, error: "", blockedUntil };
      }
      writeLock(tel, { count: newCount, blockedUntil: null });
      return { success: false, error: "Numéro de téléphone ou mot de passe incorrect.", attemptsLeft: 5 - newCount };
    }

    clearLock(tel);
    const session: User = { prenom: found.prenom, nom: found.nom, telephone: found.telephone, smsConsent: found.smsConsent };
    localStorage.setItem(KEY_SESSION, JSON.stringify(session));
    setUser(session);
    return { success: true };
  }

  function register(data: RegisterData): AuthResult {
    const tel = normalizePhone(data.telephone);
    if (readUsers().find(u => u.telephone === tel)) {
      return { success: false, error: "Ce numéro est déjà utilisé. Connectez-vous ou réinitialisez votre mot de passe." };
    }
    const stored: StoredUser = { ...data, telephone: tel };
    writeUsers([...readUsers(), stored]);
    const session: User = { prenom: data.prenom, nom: data.nom, telephone: tel, smsConsent: data.smsConsent };
    localStorage.setItem(KEY_SESSION, JSON.stringify(session));
    setUser(session);
    return { success: true };
  }

  function updatePassword(phone: string, newPassword: string) {
    const tel = normalizePhone(phone);
    const users = readUsers().map(u => u.telephone === tel ? { ...u, password: newPassword } : u);
    writeUsers(users);
    clearLock(tel);
  }

  function logout() {
    localStorage.removeItem(KEY_SESSION);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, updatePassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
