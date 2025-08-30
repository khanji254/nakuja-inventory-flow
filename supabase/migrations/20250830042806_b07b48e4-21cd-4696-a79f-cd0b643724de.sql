-- Upgrade glenngatiba@gmail.com to super admin
UPDATE public.profiles 
SET role = 'SUPER_ADMIN'
WHERE email = 'glenngatiba@gmail.com';

-- Also update any existing auth user record
UPDATE public.profiles 
SET role = 'SUPER_ADMIN'
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'glenngatiba@gmail.com'
);