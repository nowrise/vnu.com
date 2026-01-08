# Backend Documentation

This document covers all backend functionality including Edge Functions, Authentication, and API integrations.

---

## Overview

The backend is powered by **Lovable Cloud** which provides:
- PostgreSQL Database
- Authentication (Email/Password, Google OAuth)
- Edge Functions (Serverless functions)
- Row Level Security (RLS)

---

## Edge Functions

### `check-admin`

**Location:** `supabase/functions/check-admin/index.ts`

**Purpose:** Secure server-side admin role verification. This prevents client-side manipulation of admin status.

**Endpoint:** `POST /functions/v1/check-admin`

**Authentication:** Requires valid JWT token in Authorization header.

**Request Headers:**
```
Authorization: Bearer <user_access_token>
```

**Response:**
```json
// Success - User is admin
{
  "isAdmin": true
}

// Success - User is not admin
{
  "isAdmin": false
}

// Error - No authorization
{
  "isAdmin": false,
  "error": "No authorization header"
}

// Error - Invalid token
{
  "isAdmin": false,
  "error": "Invalid or expired token"
}
```

**How it works:**
1. Receives the user's JWT token from Authorization header
2. Creates a Supabase client with the user's token to get their user ID
3. Uses the service role key to query `user_roles` table (bypasses RLS)
4. Returns boolean `isAdmin` status

**Frontend Usage:**
```typescript
const { data, error } = await supabase.functions.invoke("check-admin", {
  headers: {
    Authorization: `Bearer ${session.access_token}`,
  },
});
const isAdmin = data?.isAdmin === true;
```

---

### `submit-form`

**Location:** `supabase/functions/submit-form/index.ts`

**Purpose:** Handles form submissions with rate limiting, validation, and honeypot protection.

**Endpoint:** `POST /functions/v1/submit-form`

**Supported Form Types:**
- `contact_requests` - Contact form submissions
- `career_applications` - Job application submissions
- `nowrise_applications` - NowRise Institute applications

**Request Body:**
```json
{
  "formType": "contact_requests",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "purpose": "General Inquiry",
    "message": "Hello, I have a question..."
  },
  "honeypot": ""
}
```

**Features:**

1. **Rate Limiting:**
   - 5 requests per minute per IP per form type
   - Returns 429 status with `Retry-After` header when exceeded

2. **Honeypot Protection:**
   - If `honeypot` field has any value, the request is silently accepted but not processed
   - Prevents automated bot submissions

3. **Input Validation:**
   - Email format validation
   - Field length validation
   - Required field checks

**Response:**
```json
// Success
{
  "success": true,
  "message": "Form submitted successfully",
  "remaining": 4
}

// Error
{
  "error": "Name must be 2-100 characters"
}

// Rate Limited
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": 45
}
```

---

## Authentication

### Email/Password Authentication

Users can sign up and log in using email and password.

**Configuration:**
- Auto-confirm email is **enabled** (no email verification required)
- Anonymous users are **disabled**

**Usage in Frontend:**
```typescript
import { supabase } from "@/integrations/supabase/client";

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: "user@example.com",
  password: "password123",
  options: {
    data: { full_name: "John Doe" }
  }
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "password123"
});

// Sign out
await supabase.auth.signOut();

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

### Google OAuth

Google OAuth is supported for social login.

**Setup Requirements:**
1. Create OAuth credentials in Google Cloud Console
2. Add authorized redirect URLs
3. Configure in Lovable Cloud dashboard (Users → Auth Settings → Google Settings)

**Usage in Frontend:**
```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
});
```

---

## Role-Based Access Control

### User Roles

Roles are stored in the `user_roles` table, separate from user profiles for security.

**Available Roles:**
- `admin` - Full access to all data and management features
- `editor` - Can edit content (future use)
- `user` - Standard user access

### Checking Roles

**In Frontend (Recommended - Server-side check):**
```typescript
// Use the check-admin edge function for secure server-side verification
const checkAdminRole = async (accessToken: string) => {
  const { data, error } = await supabase.functions.invoke("check-admin", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return data?.isAdmin === true;
};

// With session caching to reduce backend calls
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const cached = sessionStorage.getItem('admin_status_cache');
if (cached) {
  const { userId, isAdmin, timestamp } = JSON.parse(cached);
  if (userId === currentUserId && Date.now() - timestamp < CACHE_DURATION_MS) {
    return isAdmin; // Use cached value
  }
}
// Otherwise call the edge function and cache the result
```

**In RLS Policies:**
```sql
-- Check if user is admin
has_role(auth.uid(), 'admin'::app_role)
```

---

## Environment Variables

The following environment variables are automatically configured:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Backend API URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public API key (anon key) |
| `VITE_SUPABASE_PROJECT_ID` | Project identifier |

**For Edge Functions:**
| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Backend URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (full access) |
| `SUPABASE_ANON_KEY` | Anonymous key |

---

## Database Access

### From Frontend

```typescript
import { supabase } from "@/integrations/supabase/client";

// Select
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', 'value');

// Insert
const { data, error } = await supabase
  .from('table_name')
  .insert({ column: 'value' })
  .select()
  .single();

// Update
const { data, error } = await supabase
  .from('table_name')
  .update({ column: 'new_value' })
  .eq('id', 'some-id');

// Delete
const { error } = await supabase
  .from('table_name')
  .delete()
  .eq('id', 'some-id');
```

### From Edge Functions

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // For bypassing RLS
);
```

---

## Realtime Subscriptions

Enable realtime for a table:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.table_name;
```

Subscribe in frontend:
```typescript
const channel = supabase
  .channel('custom-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'table_name' },
    (payload) => console.log('Change:', payload)
  )
  .subscribe();

// Cleanup
supabase.removeChannel(channel);
```

---

## File Storage

Storage buckets can be created for file uploads. Currently no buckets are configured.

**To add a bucket:**
```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('bucket-name', 'bucket-name', false);

-- Add RLS policies
CREATE POLICY "Users can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'bucket-name' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## Security Best Practices

1. **Never expose service role key** in frontend code
2. **Always use RLS policies** for data access control
3. **Validate all inputs** in Edge Functions before database operations
4. **Use honeypot fields** to prevent bot submissions
5. **Implement rate limiting** for public endpoints
6. **Keep roles in separate table** to prevent privilege escalation
7. **Use SECURITY DEFINER functions** carefully and with `SET search_path`

---

## Troubleshooting

### Common Issues

1. **"Row Level Security policy violation"**
   - Check if user is authenticated
   - Verify RLS policies allow the operation
   - Ensure user_id is set correctly for insert operations

2. **"Rate limit exceeded"**
   - Wait for the retry period
   - Check `Retry-After` header for wait time

3. **"Invalid form type"**
   - Ensure formType matches one of: `contact_requests`, `career_applications`, `nowrise_applications`

4. **"Admin check returning false incorrectly"**
   - Verify user has entry in `user_roles` table with `role = 'admin'`
   - Clear browser sessionStorage to reset cached admin status
   - Check edge function logs for errors

5. **Google OAuth not working**
   - Verify redirect URLs are configured
   - Check Google Cloud Console credentials
   - Ensure Site URL is set correctly
