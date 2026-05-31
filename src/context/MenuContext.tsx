"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

/* ===== ТИПЫ ===== */

export type ApiMenuItem = {
  id: string
  name: string
  description: string | null
  price: number
  original_price: number | null
  photo_url: string | null
  is_available: boolean
  category: string | null
  pieces: number | null
}

export type PromoState = {
  is_active: boolean
  gift_item_id: string | null
  // Имя ролла-подарка — null если бонус неактивен или ролл скрыт/недоступен
  gift_item_name: string | null
}

export const BONUS_MIN_QTY = 2

interface MenuContextValue {
  items: ApiMenuItem[]
  promo: PromoState
  loading: boolean
}

/* ===== КОНТЕКСТ ===== */

const MenuContext = createContext<MenuContextValue>({
  items: [],
  promo: { is_active: false, gift_item_id: null, gift_item_name: null },
  loading: true,
})

export function MenuProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ApiMenuItem[]>([])
  const [promo, setPromo] = useState<PromoState>({
    is_active: false,
    gift_item_id: null,
    gift_item_name: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([loadMenu(), loadPromo()]).finally(() => setLoading(false))
  }, [])

  async function loadMenu() {
    try {
      const res = await fetch('/api/menu')
      if (!res.ok) return
      setItems(await res.json() as ApiMenuItem[])
    } catch {
      // Меню недоступно — показываем пустое состояние
    }
  }

  async function loadPromo() {
    try {
      const supabase = createClient()
      // Бонус публично доступен по RLS (USING (true))
      const { data } = await supabase
        .from('promotions')
        .select('is_active, gift_item_id')
        .single()

      if (!data?.is_active || !data.gift_item_id) return

      // Читаем ролл-подарок — RLS на menu_items вернёт только видимые позиции
      const { data: gift } = await supabase
        .from('menu_items')
        .select('name, is_available')
        .eq('id', data.gift_item_id)
        .single()

      setPromo({
        is_active: data.is_active && !!gift?.is_available,
        gift_item_id: data.gift_item_id,
        gift_item_name: gift?.is_available ? gift.name : null,
      })
    } catch {
      // Бонус недоступен — оставляем по умолчанию (неактивен)
    }
  }

  return (
    <MenuContext.Provider value={{ items, promo, loading }}>
      {children}
    </MenuContext.Provider>
  )
}

export function useMenu() {
  return useContext(MenuContext)
}
