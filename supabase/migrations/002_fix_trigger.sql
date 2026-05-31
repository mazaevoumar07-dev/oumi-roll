-- Fix handle_new_user trigger:
-- Copy first_name, last_name, sms_opt_in, sms_opt_in_at from auth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    phone,
    first_name,
    last_name,
    role,
    sms_opt_in,
    sms_opt_in_at,
    created_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    'client',
    COALESCE((NEW.raw_user_meta_data->>'sms_opt_in')::boolean, false),
    CASE
      WHEN (NEW.raw_user_meta_data->>'sms_opt_in')::boolean = true THEN NOW()
      ELSE NULL
    END,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
