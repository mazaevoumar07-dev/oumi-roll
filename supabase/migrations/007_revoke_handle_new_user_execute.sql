-- ============================================================
-- OUMI ROLL — Migration 007
-- Отозвать EXECUTE у PUBLIC на handle_new_user() — это триггерная
-- функция (auth.users insert), не должна быть вызываемой напрямую
-- через /rest/v1/rpc/handle_new_user анонимно или авторизованным юзером
-- Запустить в Supabase Dashboard → SQL Editor
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
