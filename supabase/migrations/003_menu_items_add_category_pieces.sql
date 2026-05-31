-- Add category and pieces fields to menu_items.
-- These are needed by the frontend to group and display menu cards correctly.
ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS category VARCHAR(100),
  ADD COLUMN IF NOT EXISTS pieces   INTEGER;
