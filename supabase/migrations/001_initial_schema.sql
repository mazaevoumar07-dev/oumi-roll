-- ============================================================
-- OUMI ROLL — Initial schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. users — client profiles (extends auth.users)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name    VARCHAR(100),
  last_name     VARCHAR(100),
  phone         VARCHAR(20),
  email         VARCHAR(200),
  role          TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  sms_opt_in    BOOLEAN NOT NULL DEFAULT false,
  sms_opt_in_at TIMESTAMP WITH TIME ZONE,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Auto-create profile row when a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, phone, role, sms_opt_in, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    'client',
    false,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ────────────────────────────────────────────────────────────
-- 2. menu_items
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.menu_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(200) NOT NULL,
  description    TEXT,
  price          NUMERIC(8, 2) NOT NULL,
  original_price NUMERIC(8, 2),
  photo_url      TEXT,
  is_available   BOOLEAN NOT NULL DEFAULT true,
  is_visible     BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 3. orders
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number       SERIAL UNIQUE,
  user_id            UUID REFERENCES public.users(id) ON DELETE SET NULL,
  first_name         VARCHAR(100) NOT NULL,
  last_name          VARCHAR(100) NOT NULL,
  phone              VARCHAR(20) NOT NULL,
  email              VARCHAR(200),
  delivery_type      TEXT NOT NULL CHECK (delivery_type IN ('delivery', 'pickup')),
  address            TEXT,
  delivery_cost      NUMERIC(8, 2) NOT NULL DEFAULT 0,
  total_amount       NUMERIC(8, 2) NOT NULL,
  status             TEXT NOT NULL DEFAULT 'new'
                       CHECK (status IN ('new', 'preparing', 'in_delivery', 'completed', 'cancelled')),
  payment_status     TEXT NOT NULL DEFAULT 'pending'
                       CHECK (payment_status IN ('pending', 'paid', 'failed')),
  stripe_payment_id  TEXT UNIQUE,
  created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  cancelled_at       TIMESTAMP WITH TIME ZONE
);

-- ────────────────────────────────────────────────────────────
-- 4. order_items — snapshot of cart at order time
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  name         VARCHAR(200) NOT NULL,
  price        NUMERIC(8, 2) NOT NULL DEFAULT 0,
  quantity     INTEGER NOT NULL CHECK (quantity > 0),
  is_gift      BOOLEAN NOT NULL DEFAULT false
);

-- ────────────────────────────────────────────────────────────
-- 5. promotions — single row, bonus settings
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.promotions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active    BOOLEAN NOT NULL DEFAULT false,
  gift_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  updated_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Seed the single promotions row
INSERT INTO public.promotions (is_active)
VALUES (false)
ON CONFLICT DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions  ENABLE ROW LEVEL SECURITY;

-- users: each client sees and edits only their own profile
CREATE POLICY "users: select own"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users: update own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- menu_items: public read for visible items; writes via service role only
CREATE POLICY "menu_items: public read"
  ON public.menu_items FOR SELECT
  USING (is_visible = true);

-- orders: authenticated client can read own orders
CREATE POLICY "orders: select own"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

-- order_items: client can read items belonging to their own orders
CREATE POLICY "order_items: select own"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- promotions: anyone can read (shown on the menu page)
CREATE POLICY "promotions: public read"
  ON public.promotions FOR SELECT
  USING (true);
