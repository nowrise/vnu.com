-- Create OTP storage table for persistent OTP verification
CREATE TABLE public.otp_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Create index for fast email lookups
CREATE INDEX idx_otp_codes_email ON public.otp_codes(email);

-- Create index for cleanup of expired OTPs
CREATE INDEX idx_otp_codes_expires_at ON public.otp_codes(expires_at);

-- Enable RLS
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Only allow service role to access this table (edge functions use service role)
CREATE POLICY "Service role can manage OTP codes"
ON public.otp_codes
FOR ALL
USING (true)
WITH CHECK (true);

-- Create function to clean up expired OTPs (can be called periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.otp_codes WHERE expires_at < now();
END;
$$;