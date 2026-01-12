import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed origins for CORS - restrict to specific domains
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://lovable.dev',
  'https://vnuitsolutions.com',
  'https://www.vnuitsolutions.com',
];

// Pattern-based allowed origins (subdomains)
const allowedPatterns = [
  /^https:\/\/[a-z0-9-]+\.lovable\.app$/,
  /^https:\/\/[a-z0-9-]+\.lovableproject\.com$/,
];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  
  // Check exact match
  if (allowedOrigins.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };
  }
  
  // Check pattern match
  for (const pattern of allowedPatterns) {
    if (pattern.test(origin)) {
      return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      };
    }
  }
  
  // Default: no CORS header (blocks the request)
  return {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

// In-memory rate limiting store (resets on function cold start)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT = {
  maxRequests: 5,      // Max 5 requests
  windowMs: 60000,     // Per 1 minute window
};

function getRateLimitKey(ip: string, formType: string): string {
  return `${ip}:${formType}`;
}

function isRateLimited(key: string): { limited: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    // Create new window
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return { limited: false, remaining: RATE_LIMIT.maxRequests - 1, resetIn: RATE_LIMIT.windowMs };
  }

  if (record.count >= RATE_LIMIT.maxRequests) {
    return { limited: true, remaining: 0, resetIn: record.resetAt - now };
  }

  record.count++;
  return { limited: false, remaining: RATE_LIMIT.maxRequests - record.count, resetIn: record.resetAt - now };
}

// Input validation schemas
const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

function validateContactRequest(data: Record<string, unknown>): { valid: boolean; error?: string } {
  if (!data.name || typeof data.name !== 'string' || data.name.length < 2 || data.name.length > 100) {
    return { valid: false, error: 'Name must be 2-100 characters' };
  }
  if (!data.email || typeof data.email !== 'string' || !emailRegex.test(data.email) || data.email.length > 255) {
    return { valid: false, error: 'Valid email is required' };
  }
  if (!data.purpose || typeof data.purpose !== 'string' || data.purpose.length > 100) {
    return { valid: false, error: 'Purpose is required' };
  }
  if (!data.message || typeof data.message !== 'string' || data.message.length < 10 || data.message.length > 1000) {
    return { valid: false, error: 'Message must be 10-1000 characters' };
  }
  return { valid: true };
}

function validateCareerApplication(data: Record<string, unknown>): { valid: boolean; error?: string } {
  if (!data.name || typeof data.name !== 'string' || data.name.length < 2 || data.name.length > 100) {
    return { valid: false, error: 'Name must be 2-100 characters' };
  }
  if (!data.email || typeof data.email !== 'string' || !emailRegex.test(data.email) || data.email.length > 255) {
    return { valid: false, error: 'Valid email is required' };
  }
  if (!data.role_applied || typeof data.role_applied !== 'string' || data.role_applied.length > 100) {
    return { valid: false, error: 'Role applied is required' };
  }
  if (data.cover_letter && (typeof data.cover_letter !== 'string' || data.cover_letter.length > 5000)) {
    return { valid: false, error: 'Cover letter must be under 5000 characters' };
  }
  return { valid: true };
}

function validateNowriseApplication(data: Record<string, unknown>): { valid: boolean; error?: string } {
  if (!data.name || typeof data.name !== 'string' || data.name.length < 2 || data.name.length > 100) {
    return { valid: false, error: 'Name must be 2-100 characters' };
  }
  if (!data.email || typeof data.email !== 'string' || !emailRegex.test(data.email) || data.email.length > 255) {
    return { valid: false, error: 'Valid email is required' };
  }
  if (!data.program || typeof data.program !== 'string' || data.program.length > 100) {
    return { valid: false, error: 'Program is required' };
  }
  if (data.phone && (typeof data.phone !== 'string' || data.phone.length > 20)) {
    return { valid: false, error: 'Phone must be under 20 characters' };
  }
  if (data.education && (typeof data.education !== 'string' || data.education.length > 200)) {
    return { valid: false, error: 'Education must be under 200 characters' };
  }
  return { valid: true };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    const { formType, data, honeypot } = await req.json();

    // Honeypot check - if this field has any value, it's likely a bot
    if (honeypot) {
      console.warn(`Honeypot triggered for IP: ${clientIP}, form: ${formType}`);
      // Return success to not reveal the honeypot detection
      return new Response(
        JSON.stringify({ success: true, message: 'Form submitted successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate form type
    const validFormTypes = ['contact_requests', 'career_applications', 'nowrise_applications'];
    if (!validFormTypes.includes(formType)) {
      console.error(`Invalid form type: ${formType}`);
      return new Response(
        JSON.stringify({ error: 'Invalid form type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check rate limit
    const rateLimitKey = getRateLimitKey(clientIP, formType);
    const rateLimit = isRateLimited(rateLimitKey);
    
    console.log(`Rate limit check for ${rateLimitKey}: limited=${rateLimit.limited}, remaining=${rateLimit.remaining}`);

    if (rateLimit.limited) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}, form: ${formType}`);
      return new Response(
        JSON.stringify({ 
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil(rateLimit.resetIn / 1000)
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000))
          } 
        }
      );
    }

    // Validate input based on form type
    let validation: { valid: boolean; error?: string };
    switch (formType) {
      case 'contact_requests':
        validation = validateContactRequest(data);
        break;
      case 'career_applications':
        validation = validateCareerApplication(data);
        break;
      case 'nowrise_applications':
        validation = validateNowriseApplication(data);
        break;
      default:
        validation = { valid: false, error: 'Unknown form type' };
    }

    if (!validation.valid) {
      console.error(`Validation failed for ${formType}: ${validation.error}`);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for inserting
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Sanitize and insert data
    const sanitizedData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        // Basic sanitization - trim and limit length
        sanitizedData[key] = value.trim().slice(0, 5000);
      } else {
        sanitizedData[key] = value;
      }
    }

    const { error: insertError } = await supabase
      .from(formType)
      .insert(sanitizedData);

    if (insertError) {
      console.error(`Database insert error for ${formType}:`, insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to submit form. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully inserted ${formType} from IP: ${clientIP}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Form submitted successfully',
        remaining: rateLimit.remaining
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': String(rateLimit.remaining)
        } 
      }
    );

  } catch (error) {
    console.error('Error in submit-form function:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
