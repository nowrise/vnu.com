import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed origins for CORS - restrict to specific domains
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://lovable.dev',
  'https://vnuitsolutions.com',
  'https://www.vnuitsolutions.com',
  'https://vnu.lovable.app',
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };
  }
  
  // Check pattern match
  for (const pattern of allowedPatterns) {
    if (pattern.test(origin)) {
      return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      };
    }
  }
  
  // Default: no CORS header (blocks the request)
  return {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

// JWT validation helper
async function validateJWT(req: Request): Promise<{ valid: boolean; userId?: string; error?: string }> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing or invalid authorization header' };
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const token = authHeader.replace('Bearer ', '');
  const { data, error } = await supabase.auth.getUser(token);
  
  if (error || !data.user) {
    return { valid: false, error: 'Invalid or expired token' };
  }

  return { valid: true, userId: data.user.id };
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

function validateCustomFormSubmission(data: Record<string, unknown>, formId: unknown): { valid: boolean; error?: string } {
  // Validate form_id is a valid UUID
  if (!formId || typeof formId !== 'string') {
    return { valid: false, error: 'Form ID is required' };
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(formId)) {
    return { valid: false, error: 'Invalid form ID format' };
  }

  // Validate submission_data structure
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Submission data is required' };
  }

  // Check total size of submission data (limit to 50KB)
  const dataString = JSON.stringify(data);
  if (dataString.length > 51200) {
    return { valid: false, error: 'Submission data is too large' };
  }

  // Validate each field value
  for (const [key, value] of Object.entries(data)) {
    // Key validation
    if (typeof key !== 'string' || key.length > 100) {
      return { valid: false, error: 'Invalid field name' };
    }

    // Value validation
    if (typeof value === 'string') {
      if (value.length > 5000) {
        return { valid: false, error: `Field "${key}" exceeds maximum length` };
      }
    } else if (Array.isArray(value)) {
      // For checkbox/multi-select fields
      if (value.length > 50) {
        return { valid: false, error: `Field "${key}" has too many selections` };
      }
      for (const item of value) {
        if (typeof item !== 'string' || item.length > 500) {
          return { valid: false, error: `Invalid value in field "${key}"` };
        }
      }
    } else if (value !== null && value !== undefined) {
      // Allow numbers, booleans
      if (typeof value !== 'number' && typeof value !== 'boolean') {
        return { valid: false, error: `Invalid value type for field "${key}"` };
      }
    }
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

    const body = await req.json();
    const { formType, data, honeypot, formId, requireAuth } = body;
    // Store formId for later use in validation
    (req as any)._formId = formId;

    // JWT Authentication check (optional based on requireAuth flag)
    if (requireAuth === true) {
      const authResult = await validateJWT(req);
      if (!authResult.valid) {
        console.warn(`Auth failed for IP ${clientIP}: ${authResult.error}`);
        return new Response(
          JSON.stringify({ error: 'Authentication required. Please sign in.' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log(`Authenticated request from user: ${authResult.userId}`);
    }

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
    const validFormTypes = ['contact_requests', 'career_applications', 'nowrise_applications', 'form_submissions'];
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
      case 'form_submissions':
        const formId = (req as any)._formId || data.form_id;
        validation = validateCustomFormSubmission(data.submission_data || data, formId);
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

    // Sanitize data
    function sanitizeValue(value: unknown): unknown {
      if (typeof value === 'string') {
        return value.trim().slice(0, 5000);
      } else if (Array.isArray(value)) {
        return value.map(v => typeof v === 'string' ? v.trim().slice(0, 500) : v);
      }
      return value;
    }

    let insertData: Record<string, unknown>;
    
    if (formType === 'form_submissions') {
      // Handle custom form submissions
      const submissionData = data.submission_data || data;
      const sanitizedSubmission: Record<string, unknown> = {};
      
      for (const [key, value] of Object.entries(submissionData)) {
        sanitizedSubmission[key] = sanitizeValue(value);
      }
      
      insertData = {
        form_id: formId,
        submission_data: sanitizedSubmission,
        status: 'pending'
      };
    } else {
      // Handle legacy form types
      insertData = {};
      for (const [key, value] of Object.entries(data)) {
        insertData[key] = sanitizeValue(value);
      }
    }

    const { error: insertError } = await supabase
      .from(formType)
      .insert(insertData);

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
