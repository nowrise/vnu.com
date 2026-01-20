-- Drop the incorrectly permissive RLS policy on otp_codes
-- Service role bypasses RLS by default, so no policy is needed for it
DROP POLICY IF EXISTS "Service role can manage OTP codes" ON public.otp_codes;

-- The table now has RLS enabled with no policies, meaning:
-- - Anonymous users: NO ACCESS
-- - Authenticated users: NO ACCESS  
-- - Service role: FULL ACCESS (bypasses RLS)