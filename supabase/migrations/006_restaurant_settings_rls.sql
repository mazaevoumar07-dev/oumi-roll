-- ============================================================
-- OUMI ROLL — Migration 006
-- Включить RLS на restaurant_settings — таблица была полностью
-- открыта для anon-ключа (чтение и запись), включая orders_paused
-- Запустить в Supabase Dashboard → SQL Editor
-- ============================================================

ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;

-- Публичное чтение — GET /api/status и так отдаёт paused всем
CREATE POLICY "restaurant_settings_public_read"
  ON public.restaurant_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Записи нет ни для anon, ни для authenticated:
-- все изменения идут через service_role (admin client)
-- в /api/admin/settings/pause, где роль admin уже проверяется в коде.
