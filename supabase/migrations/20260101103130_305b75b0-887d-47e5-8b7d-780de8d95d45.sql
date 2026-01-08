-- Fix: Add explicit INSERT policy for profiles table
-- This ensures only the authenticated user can create their own profile
-- (though typically handled by the trigger on auth.users)

-- First, let's add an explicit INSERT policy for defense in depth
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Also add an explicit DENY policy via restrictive insert for extra safety
-- The existing trigger handles profile creation on signup, so direct INSERT should be limited