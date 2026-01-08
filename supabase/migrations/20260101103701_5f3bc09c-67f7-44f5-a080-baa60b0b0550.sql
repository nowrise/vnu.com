-- Fix profiles RLS: Ensure anonymous users cannot access profiles
-- The current RESTRICTIVE policies only allow access when conditions match,
-- but we need to ensure authenticated users only

-- Drop existing SELECT policies and recreate with explicit auth check
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create combined policy that requires authentication
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
USING (
  auth.role() = 'authenticated' AND
  (auth.uid() = id OR has_role(auth.uid(), 'admin'::app_role))
);

-- Also fix the INSERT policy to require authentication
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Authenticated users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  auth.uid() = id
);

-- Fix UPDATE policy to also require authentication explicitly
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Authenticated users can update own profile"
ON public.profiles
FOR UPDATE
USING (
  auth.role() = 'authenticated' AND
  auth.uid() = id
);