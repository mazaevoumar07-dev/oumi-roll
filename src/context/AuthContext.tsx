"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

/* ===== ТИПЫ ===== */

export interface AppUser {
  id: string
  prenom: string
  nom: string
  telephone: string
  email: string | null
  smsConsent: boolean
  role: 'client' | 'admin'
}

export interface RegisterData {
  prenom: string
  nom: string
  telephone: string
  password: string
  smsConsent: boolean
}

export type AuthResult =
  | { success: true }
  | { success: false; error: string }

export type SignUpResult =
  | { success: true; needsOtp: true; phone: string }
  | { success: false; error: string }

interface AuthContextValue {
  user: AppUser | null
  loading: boolean
  signIn: (phone: string, password: string) => Promise<AuthResult>
  signUp: (data: RegisterData) => Promise<SignUpResult>
  verifyOtp: (phone: string, token: string) => Promise<AuthResult>
  signOut: () => Promise<void>
}

/* ===== УТИЛИТЫ ===== */

// Приводит номер телефона к формату E.164 (+33...) для Supabase
export function toE164(phone: string): string {
  const v = phone.replace(/[\s\-\.]/g, '')
  if (v.startsWith('+33')) return v
  if (v.startsWith('0033')) return '+33' + v.slice(4)
  if (v.startsWith('0')) return '+33' + v.slice(1)
  return v
}

/* ===== CONTEXT ===== */

const AuthContext = createContext<AuthContextValue | null>(null)

async function loadProfile(userId: string): Promise<AppUser | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('users')
    .select('id, first_name, last_name, phone, email, sms_opt_in, role')
    .eq('id', userId)
    .single()

  if (!data) return null

  return {
    id: data.id,
    prenom: data.first_name ?? '',
    nom: data.last_name ?? '',
    telephone: data.phone ?? '',
    email: data.email ?? null,
    smsConsent: data.sms_opt_in ?? false,
    role: (data.role as 'client' | 'admin') ?? 'client',
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Загрузить сессию при монтировании
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await loadProfile(session.user.id)
        setUser(profile)
      }
      setLoading(false)
    })

    // Следить за изменениями сессии (вход, выход, обновление токена)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const profile = await loadProfile(session.user.id)
          setUser(profile)
        } else {
          setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(phone: string, password: string): Promise<AuthResult> {
    const { error } = await supabase.auth.signInWithPassword({
      phone: toE164(phone),
      password,
    })
    if (error) {
      return { success: false, error: 'Numéro de téléphone ou mot de passe incorrect.' }
    }
    return { success: true }
  }

  async function signUp(data: RegisterData): Promise<SignUpResult> {
    const { error } = await supabase.auth.signUp({
      phone: toE164(data.telephone),
      password: data.password,
      options: {
        data: {
          first_name: data.prenom,
          last_name: data.nom,
          sms_opt_in: data.smsConsent,
        },
      },
    })
    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        return {
          success: false,
          error: 'Ce numéro est déjà utilisé. Connectez-vous ou réinitialisez votre mot de passe.',
        }
      }
      return { success: false, error: 'Erreur lors de l\'inscription. Réessayez.' }
    }
    return { success: true, needsOtp: true, phone: toE164(data.telephone) }
  }

  async function verifyOtp(phone: string, token: string): Promise<AuthResult> {
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    })
    if (error) {
      return { success: false, error: 'Code incorrect ou expiré. Demandez un nouveau code.' }
    }
    return { success: true }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, verifyOtp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
