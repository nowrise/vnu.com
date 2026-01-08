# Backend Architecture & Strategy Guide

This document outlines the backend architecture patterns, security strategies, and implementation logic used in this project. Use it as a reference for building custom backends.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Design Patterns](#database-design-patterns)
3. [Authentication System](#authentication-system)
4. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
5. [Row Level Security (RLS) Strategy](#row-level-security-rls-strategy)
6. [Edge Functions Pattern](#edge-functions-pattern)
7. [Form System Architecture](#form-system-architecture)
8. [Frontend-Backend Integration](#frontend-backend-integration)
9. [Security Best Practices](#security-best-practices)
10. [Scaling Considerations](#scaling-considerations)

---

## Architecture Overview

### Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                  │
│  - React 18 with TypeScript                                  │
│  - TanStack Query for data fetching/caching                  │
│  - React Router for navigation                               │
│  - Tailwind CSS + shadcn/ui for styling                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   SUPABASE CLIENT SDK                        │
│  - Authentication (supabase.auth)                            │
│  - Database queries (supabase.from())                        │
│  - Edge function calls (supabase.functions.invoke())         │
│  - Realtime subscriptions (supabase.channel())               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  PostgreSQL │  │    Auth     │  │    Edge     │          │
│  │  Database   │  │   Service   │  │  Functions  │          │
│  │  + RLS      │  │             │  │   (Deno)    │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Security First**: RLS policies on all tables, role separation, input validation
2. **Separation of Concerns**: Tables organized by feature domain
3. **Minimal Trust**: Never trust client input, validate server-side
4. **Fail Secure**: Default deny, explicit allow
5. **Audit Trail**: Timestamps on all records

---

## Database Design Patterns

### Table Naming Conventions

```sql
-- Use snake_case for table names
-- Use plural nouns for collection tables
-- Use singular for junction/config tables

CREATE TABLE public.contact_requests (...);  -- Collection
CREATE TABLE public.user_roles (...);         -- Junction table
CREATE TABLE public.content_pages (...);      -- Collection
```

### Standard Column Patterns

Every table should include:

```sql
CREATE TABLE public.example_table (
  -- Primary key (always UUID for distributed systems)
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- User ownership (if user-specific data)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Timestamps (always include both)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Status tracking (use ENUMs for fixed states)
  status TEXT DEFAULT 'pending'
);

-- Auto-update trigger for updated_at
CREATE TRIGGER update_example_updated_at
  BEFORE UPDATE ON public.example_table
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

### Relationship Patterns

```sql
-- One-to-Many: Use foreign key on the "many" side
CREATE TABLE public.form_submissions (
  form_id UUID NOT NULL REFERENCES public.custom_forms(id) ON DELETE CASCADE
);

-- Many-to-Many: Use junction table
CREATE TABLE public.user_roles (
  user_id UUID REFERENCES auth.users(id),
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Self-referencing (hierarchies): Use parent_id
CREATE TABLE public.categories (
  id UUID PRIMARY KEY,
  parent_id UUID REFERENCES public.categories(id)
);
```

### ENUM Usage

```sql
-- Create ENUMs for fixed value sets
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');
CREATE TYPE public.application_status AS ENUM ('pending', 'reviewing', 'approved', 'rejected');

-- Use in columns
role app_role NOT NULL,
status application_status DEFAULT 'pending'
```

---

## Authentication System

### Auth Flow Diagram

```
┌──────────┐     ┌──────────────┐     ┌─────────────┐
│  User    │────▶│  Auth Page   │────▶│  Supabase   │
│          │     │  /auth       │     │  Auth API   │
└──────────┘     └──────────────┘     └─────────────┘
                        │                     │
                        │                     ▼
                        │              ┌─────────────┐
                        │              │  JWT Token  │
                        │              │  Generated  │
                        │              └─────────────┘
                        │                     │
                        ▼                     ▼
                 ┌──────────────┐     ┌─────────────┐
                 │  AuthContext │◀────│  Session    │
                 │  Provider    │     │  Stored     │
                 └──────────────┘     └─────────────┘
                        │
                        ▼
                 ┌──────────────┐
                 │  Protected   │
                 │  Routes      │
                 └──────────────┘
```

### AuthContext Pattern

```typescript
// src/contexts/AuthContext.tsx

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

// Key implementation points:
// 1. Set up listener BEFORE checking session
// 2. Store both user AND session
// 3. Check admin role after auth state changes
```

### Profile Creation on Signup

```sql
-- Trigger function to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

-- Attach to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## Role-Based Access Control (RBAC)

### Why Separate Roles Table?

**CRITICAL SECURITY**: Never store roles on the profile or users table.

```
❌ BAD: Storing role on profile
   - User can potentially modify their own profile
   - RLS policy might allow self-update
   - Privilege escalation attack possible

✅ GOOD: Separate roles table
   - Dedicated RLS policies for role management
   - Only admins can modify roles
   - Clear separation of concerns
```

### Roles Table Structure

```sql
-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');

-- 2. Create roles table (no foreign key to profiles, only to auth.users)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)  -- One role per user (or remove for multi-role)
);

-- 3. Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
```

### Role Checking Function

```sql
-- SECURITY DEFINER bypasses RLS to prevent recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

### Frontend Role Checking (Server-Side)

**IMPORTANT:** Admin checks should happen on the server, not client-side.

```typescript
// In AuthContext - Use edge function for secure server-side check
const checkAdminRole = async (accessToken: string, userId: string) => {
  // Check cache first to reduce backend calls
  const cached = getCachedAdminStatus(userId);
  if (cached !== null) {
    return cached;
  }

  // Call backend edge function for secure server-side check
  const { data, error } = await supabase.functions.invoke("check-admin", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (error) {
    console.error("Error checking admin role:", error);
    return false;
  }
  
  const isAdmin = data?.isAdmin === true;
  setCachedAdminStatus(userId, isAdmin); // Cache for 5 minutes
  return isAdmin;
};
```

**Why Server-Side?**
- Client-side role checks can be bypassed by manipulating JavaScript
- Edge function uses service role key to query user_roles table
- Result is a simple boolean, no role data exposed to client
- Session caching reduces backend calls (5 minute TTL)

---

## Row Level Security (RLS) Strategy

### Policy Categories

```sql
-- 1. PUBLIC READ (anyone can view)
CREATE POLICY "Anyone can view content"
ON public.content_pages FOR SELECT
USING (true);

-- 2. AUTHENTICATED ONLY (logged in users)
CREATE POLICY "Authenticated users can view"
ON public.some_table FOR SELECT
TO authenticated
USING (true);

-- 3. OWNER ONLY (user's own data)
CREATE POLICY "Users can view own data"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- 4. ADMIN ONLY (admins can do everything)
CREATE POLICY "Admins can manage"
ON public.some_table FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- 5. CONDITIONAL (based on record state)
CREATE POLICY "Anyone can view published"
ON public.custom_forms FOR SELECT
USING (is_published = true);
```

### RLS Policy Matrix Pattern

For each table, define policies for all operations:

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | Owner + Admin | Owner | Owner | Never |
| user_roles | Owner + Admin | Admin | Admin | Admin |
| contact_requests | Admin | Public | Never | Admin |
| custom_forms | Published OR Admin | Admin | Admin | Admin |

### Implementing the Matrix

```sql
-- Enable RLS (ALWAYS DO THIS)
ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;

-- SELECT policies
CREATE POLICY "policy_name" ON public.my_table
FOR SELECT USING (/* condition */);

-- INSERT policies (use WITH CHECK, not USING)
CREATE POLICY "policy_name" ON public.my_table
FOR INSERT WITH CHECK (/* condition */);

-- UPDATE policies (can use both USING and WITH CHECK)
CREATE POLICY "policy_name" ON public.my_table
FOR UPDATE
USING (/* which rows can be updated */)
WITH CHECK (/* what values are allowed */);

-- DELETE policies
CREATE POLICY "policy_name" ON public.my_table
FOR DELETE USING (/* condition */);

-- ALL operations (shorthand for CRUD)
CREATE POLICY "policy_name" ON public.my_table
FOR ALL USING (/* condition */);
```

---

## Edge Functions Pattern

### When to Use Edge Functions

Use edge functions when you need:
- **Server-side secrets** (API keys, service tokens)
- **Rate limiting** (can't be bypassed by client)
- **Complex validation** (beyond simple RLS)
- **External API calls** (third-party services)
- **Webhooks** (receiving external events)

### Edge Function Structure

```typescript
// supabase/functions/my-function/index.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers (required for browser calls)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // 1. Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 2. Parse request
    const { data, formType } = await req.json();

    // 3. Validate input
    if (!formType || !data) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Create Supabase client (with service role for admin operations)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 5. Perform operation
    const { error } = await supabase.from(formType).insert(data);

    if (error) throw error;

    // 6. Return success
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // 7. Handle errors
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### Rate Limiting Pattern

```typescript
// In-memory rate limiter (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;        // requests
const RATE_WINDOW = 60000;   // per minute

function isRateLimited(key: string): { limited: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_WINDOW });
    return { limited: false, remaining: RATE_LIMIT - 1, resetIn: RATE_WINDOW };
  }

  if (record.count >= RATE_LIMIT) {
    return { limited: true, remaining: 0, resetIn: record.resetAt - now };
  }

  record.count++;
  return { limited: false, remaining: RATE_LIMIT - record.count, resetIn: record.resetAt - now };
}

// Usage
const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
const rateKey = `${clientIP}:${formType}`;
const { limited, remaining, resetIn } = isRateLimited(rateKey);

if (limited) {
  return new Response(
    JSON.stringify({ error: 'Too many requests', retryAfter: Math.ceil(resetIn / 1000) }),
    { 
      status: 429, 
      headers: { 
        ...corsHeaders,
        'Retry-After': Math.ceil(resetIn / 1000).toString()
      }
    }
  );
}
```

### Honeypot Pattern (Anti-Bot)

```typescript
// Frontend: Add hidden field
<input 
  type="text" 
  name="website" 
  style={{ display: 'none' }} 
  tabIndex={-1}
  autoComplete="off"
/>

// Edge function: Check honeypot
const { honeypot } = await req.json();

if (honeypot) {
  // Bot detected - silently accept but don't process
  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: corsHeaders }
  );
}
```

---

## Form System Architecture

### Dynamic Form Storage

```sql
CREATE TABLE public.custom_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_name TEXT NOT NULL,
  description TEXT,
  target_page TEXT NOT NULL,           -- Which page to display on
  display_type TEXT DEFAULT 'popup',   -- 'popup', 'section', or 'popup,section'
  fields JSONB NOT NULL DEFAULT '[]',  -- Form field definitions
  is_published BOOLEAN DEFAULT false,
  popup_trigger_text TEXT DEFAULT 'Get Started',
  section_title TEXT DEFAULT 'Contact Us',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Field Definition Schema

```typescript
interface FormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];  // For select/radio/checkbox
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

// Example stored in JSONB:
[
  { "id": "name", "type": "text", "label": "Full Name", "required": true },
  { "id": "email", "type": "email", "label": "Email Address", "required": true },
  { "id": "interest", "type": "select", "label": "Interest", "options": ["Sales", "Support"], "required": true }
]
```

### Form Submission Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │────▶│  Frontend   │────▶│  Edge Func  │
│   Fills     │     │  Validates  │     │  Validates  │
│   Form      │     │  Client-side│     │  Server-side│
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  Rate Limit │
                                        │  Check      │
                                        └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  Honeypot   │
                                        │  Check      │
                                        └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  Insert to  │
                                        │  Database   │
                                        └─────────────┘
```

---

## Frontend-Backend Integration

### Supabase Client Setup

```typescript
// src/integrations/supabase/client.ts (auto-generated)
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);
```

### Data Fetching Patterns

```typescript
// Using TanStack Query for caching
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch data
const { data, isLoading, error } = useQuery({
  queryKey: ['contacts'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('contact_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
});

// Mutate data
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: async (newContact) => {
    const { error } = await supabase
      .from('contact_requests')
      .insert(newContact);
    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['contacts'] });
  }
});
```

### Edge Function Calls

```typescript
// Method 1: Using Supabase client (preferred)
const { data, error } = await supabase.functions.invoke('submit-form', {
  body: { formType: 'contact_requests', data: formData }
});

// Method 2: Direct fetch (when needed)
const response = await fetch(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-form`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
    },
    body: JSON.stringify({ formType: 'contact_requests', data: formData })
  }
);
```

---

## Security Best Practices

### Input Validation Checklist

```typescript
// Client-side (UX, not security)
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  message: z.string().min(10).max(1000)
});

// Server-side (ACTUAL security)
function validateContactRequest(data: Record<string, unknown>) {
  const { name, email, message, purpose } = data;
  
  if (typeof name !== 'string' || name.length < 2 || name.length > 100) {
    return { valid: false, error: 'Name must be 2-100 characters' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof email !== 'string' || !emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  // ... more validations
  
  return { valid: true };
}
```

### Security Headers

```typescript
// In edge functions
const securityHeaders = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block'
};
```

### Never Trust Client Data

```typescript
// ❌ BAD: Trusting client-sent user ID
const { userId, data } = await req.json();
await supabase.from('notes').insert({ user_id: userId, ...data });

// ✅ GOOD: Extract user from auth token
const authHeader = req.headers.get('Authorization');
const { data: { user } } = await supabase.auth.getUser(authHeader.split(' ')[1]);
await supabase.from('notes').insert({ user_id: user.id, ...data });
```

---

## Scaling Considerations

### Database Indexing

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_contact_requests_created_at ON public.contact_requests(created_at DESC);
CREATE INDEX idx_form_submissions_form_id ON public.form_submissions(form_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

-- Partial index for active records only
CREATE INDEX idx_active_forms ON public.custom_forms(target_page) WHERE is_published = true;
```

### Query Optimization

```typescript
// Select only needed columns
const { data } = await supabase
  .from('profiles')
  .select('id, full_name')  // Not select('*')
  .limit(50);

// Use pagination
const { data } = await supabase
  .from('contact_requests')
  .select('*')
  .range(0, 49)  // First 50 records
  .order('created_at', { ascending: false });
```

### Realtime Subscriptions

```typescript
// Subscribe to changes
const channel = supabase
  .channel('submissions')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'form_submissions' },
    (payload) => handleNewSubmission(payload.new)
  )
  .subscribe();

// Clean up on unmount
return () => supabase.removeChannel(channel);
```

---

## Quick Reference

### Common SQL Patterns

```sql
-- Enable RLS
ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;

-- Create admin-only policy
CREATE POLICY "Admins only" ON public.my_table
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create owner policy
CREATE POLICY "Owner only" ON public.my_table
FOR ALL USING (auth.uid() = user_id);

-- Auto-update timestamp trigger
CREATE TRIGGER update_my_table_updated_at
BEFORE UPDATE ON public.my_table
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

### Environment Variables

| Variable | Usage |
|----------|-------|
| `VITE_SUPABASE_URL` | Frontend API calls |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Frontend auth |
| `SUPABASE_URL` | Edge functions |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge functions (bypasses RLS) |
| `SUPABASE_ANON_KEY` | Edge functions (respects RLS) |

### File Structure

```
project/
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx      # Authentication state
│   ├── components/
│   │   └── auth/
│   │       └── ProtectedRoute.tsx
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts        # Auto-generated
│   │       └── types.ts         # Auto-generated
│   └── pages/
│       └── admin/               # Admin-only pages
├── supabase/
│   ├── config.toml              # Edge function config
│   └── functions/
│       └── submit-form/
│           └── index.ts
└── docs/
    ├── DATABASE_SCHEMA.md
    ├── BACKEND_README.md
    └── BACKEND_ARCHITECTURE.md
```

---

## Checklist for New Features

When adding a new feature with backend requirements:

- [ ] Design database schema with proper types
- [ ] Add timestamps (created_at, updated_at)
- [ ] Enable RLS on table
- [ ] Create appropriate RLS policies
- [ ] Add indexes for query performance
- [ ] Create edge function if needed
- [ ] Add rate limiting if public endpoint
- [ ] Validate all inputs server-side
- [ ] Update TypeScript types (auto-generated)
- [ ] Test as different user roles
- [ ] Document in relevant docs file
