-- ============================================================
-- OUMI ROLL — Migration 005
-- Таблица настроек ресторана + поле delivery_time в заказах
-- Запустить в Supabase Dashboard → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.restaurant_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Начальное значение: приём заказов активен
INSERT INTO public.restaurant_settings (key, value)
VALUES ('orders_paused', 'false')
ON CONFLICT (key) DO NOTHING;

-- Желаемое время доставки для предзаказов (NULL = как можно скорее)
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS delivery_time TIMESTAMPTZ;
