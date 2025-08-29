-- Fix security warnings by setting search_path on functions
ALTER FUNCTION public.get_user_role(UUID) SET search_path = public;
ALTER FUNCTION public.get_user_team(UUID) SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;