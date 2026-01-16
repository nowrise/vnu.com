import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://lovable.dev',
  'https://vnuitsolutions.com',
  'https://www.vnuitsolutions.com',
  'https://vnu.lovable.app',
];

// Patterns for dynamic subdomains
const allowedPatterns = [
  /^https:\/\/[a-z0-9-]+\.lovable\.app$/,
  /^https:\/\/[a-z0-9-]+\.lovableproject\.com$/,
  /^https:\/\/[a-z0-9-]+--[a-z0-9-]+\.lovable\.app$/,
];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  
  const isAllowed = allowedOrigins.includes(origin) || 
                    allowedPatterns.some(pattern => pattern.test(origin));
  
  if (isAllowed) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };
  }
  
  // Return headers without origin for disallowed origins
  return {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

// In-memory OTP store (in production, use database)
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

// Rate limiting for OTP requests
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = { maxRequests: 3, windowMs: 300000 }; // 3 requests per 5 minutes

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function isRateLimited(email: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(email);
  
  if (!record || now > record.resetAt) {
    rateLimitStore.set(email, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return false;
  }
  
  if (record.count >= RATE_LIMIT.maxRequests) {
    return true;
  }
  
  record.count++;
  return false;
}

async function sendEmailWithResend(email: string, otp: string, resendApiKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'VNU IT Solutions <onboarding@resend.dev>',
        to: [email],
        subject: 'Your Login OTP - Vriddhion & Udaanex',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; text-align: center;">Login Verification</h1>
            <p style="color: #666; font-size: 16px;">Hello,</p>
            <p style="color: #666; font-size: 16px;">Your one-time password (OTP) for logging into Vriddhion & Udaanex is:</p>
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 10px; margin: 20px 0; letter-spacing: 8px;">
              ${otp}
            </div>
            <p style="color: #666; font-size: 14px;">This OTP is valid for 10 minutes.</p>
            <p style="color: #999; font-size: 12px;">If you didn't request this OTP, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">© Vriddhion & Udaanex IT Solutions Pvt Ltd</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend API error:', errorData);
      return { success: false, error: 'Failed to send email' };
    }

    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, email, otp } = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === 'send') {
      // Check rate limit
      if (isRateLimited(email)) {
        return new Response(
          JSON.stringify({ error: 'Too many OTP requests. Please try again in 5 minutes.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate OTP
      const generatedOTP = generateOTP();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
      
      // Store OTP
      otpStore.set(email, { otp: generatedOTP, expiresAt, attempts: 0 });
      
      // Send OTP via Resend
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      
      if (resendApiKey) {
        const result = await sendEmailWithResend(email, generatedOTP, resendApiKey);
        
        if (!result.success) {
          return new Response(
            JSON.stringify({ error: 'Failed to send OTP. Please try again.' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        // Log OTP for testing when Resend is not configured
        console.log(`OTP for ${email}: ${generatedOTP} (Resend not configured - check edge function logs)`);
      }

      console.log(`OTP sent to ${email}`);
      
      return new Response(
        JSON.stringify({ success: true, message: 'OTP sent successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } else if (action === 'verify') {
      const storedData = otpStore.get(email);
      
      if (!storedData) {
        return new Response(
          JSON.stringify({ error: 'OTP expired or not found. Please request a new one.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Check expiry
      if (Date.now() > storedData.expiresAt) {
        otpStore.delete(email);
        return new Response(
          JSON.stringify({ error: 'OTP has expired. Please request a new one.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Check attempts (max 5)
      if (storedData.attempts >= 5) {
        otpStore.delete(email);
        return new Response(
          JSON.stringify({ error: 'Too many failed attempts. Please request a new OTP.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Verify OTP
      if (storedData.otp !== otp) {
        storedData.attempts++;
        return new Response(
          JSON.stringify({ error: 'Invalid OTP. Please try again.', attemptsLeft: 5 - storedData.attempts }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // OTP verified - clear it
      otpStore.delete(email);
      
      console.log(`OTP verified for ${email}`);
      
      return new Response(
        JSON.stringify({ success: true, verified: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } else if (action === 'check-user') {
      // Check if user exists for password reset
      const { data: users, error } = await supabase.auth.admin.listUsers();
      
      if (error) {
        console.error('Error checking user:', error);
        return new Response(
          JSON.stringify({ exists: false }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const userExists = users.users.some(user => user.email === email);
      
      return new Response(
        JSON.stringify({ exists: userExists }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-otp function:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
