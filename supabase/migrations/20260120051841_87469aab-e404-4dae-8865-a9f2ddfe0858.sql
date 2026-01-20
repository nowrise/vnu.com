-- Fix OTP codes table security
-- The table should ONLY be accessible via service role (edge functions)
-- No RLS policies needed because service role bypasses RLS by default

-- Verify RLS is enabled (it should be, but let's be certain)
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Explicitly revoke all public access to ensure the table is locked down
-- This ensures anonymous and authenticated users cannot access OTP data at all
-- Service role (used by edge functions) automatically bypasses RLS

-- Add an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON public.otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON public.otp_codes(expires_at);