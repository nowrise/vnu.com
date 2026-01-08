# Database Schema & Policies Documentation

This document contains all database tables, columns, RLS policies, functions, and triggers.

---

## Tables

### 1. `career_applications`
Stores job applications submitted through the careers page.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| created_at | timestamp with time zone | NO | now() |
| name | varchar | NO | - |
| email | varchar | NO | - |
| role_applied | varchar | NO | - |
| resume_url | text | YES | - |
| cover_letter | varchar | YES | - |
| status | text | YES | 'pending' |

**RLS Policies:**
- `Admins can view career applications` (SELECT) - `has_role(auth.uid(), 'admin'::app_role)`
- `Admins can update career applications` (UPDATE) - `has_role(auth.uid(), 'admin'::app_role)`
- `Admins can delete career applications` (DELETE) - `has_role(auth.uid(), 'admin'::app_role)`
- `Anyone can submit career applications` (INSERT) - `true`

---

### 2. `contact_requests`
Stores contact form submissions.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| created_at | timestamp with time zone | NO | now() |
| name | varchar | NO | - |
| email | varchar | NO | - |
| purpose | varchar | NO | - |
| message | varchar | NO | - |

**RLS Policies:**
- `Admins can view contact requests` (SELECT) - `has_role(auth.uid(), 'admin'::app_role)`
- `Admins can delete contact requests` (DELETE) - `has_role(auth.uid(), 'admin'::app_role)`
- `Anyone can submit contact requests` (INSERT) - `true`

---

### 3. `content_pages`
Stores CMS content for editable pages.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| page_name | text | NO | - |
| content_json | jsonb | YES | '{}' |
| updated_at | timestamp with time zone | NO | now() |
| updated_by | uuid | YES | - |

**RLS Policies:**
- `Admins can manage content pages` (ALL) - `has_role(auth.uid(), 'admin'::app_role)`
- `Anyone can view content pages` (SELECT) - `true`

---

### 4. `custom_forms`
Stores custom form definitions created in the form builder.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |
| form_name | text | NO | - |
| description | text | YES | - |
| fields | jsonb | NO | '[]' |
| target_page | text | NO | - |
| display_type | text | NO | 'popup' |
| is_published | boolean | NO | false |
| popup_trigger_text | text | YES | 'Get Started' |
| section_title | text | YES | 'Contact Us' |
| created_by | uuid | YES | - |

**RLS Policies:**
- `Admins can manage custom forms` (ALL) - `has_role(auth.uid(), 'admin'::app_role)`
- `Anyone can view published forms` (SELECT) - `is_published = true`

**Notes:**
- `target_page` stores comma-separated page names (e.g., "home,services,contact")
- `display_type` stores comma-separated display types (e.g., "popup,section")

---

### 5. `form_submissions`
Stores submissions from custom forms.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| form_id | uuid | NO | - (FK to custom_forms) |
| submission_data | jsonb | NO | '{}' |
| created_at | timestamp with time zone | NO | now() |
| status | text | NO | 'pending' |

**RLS Policies:**
- `Admins can manage form submissions` (ALL) - `has_role(auth.uid(), 'admin'::app_role)`
- `Anyone can submit forms` (INSERT) - `true`

---

### 6. `nowrise_applications`
Stores NowRise Institute program applications.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| created_at | timestamp with time zone | NO | now() |
| name | varchar | NO | - |
| email | varchar | NO | - |
| program | varchar | NO | - |
| phone | varchar | YES | - |
| education | varchar | YES | - |
| status | text | YES | 'pending' |

**RLS Policies:**
- `Admins can view nowrise applications` (SELECT) - `has_role(auth.uid(), 'admin'::app_role)`
- `Admins can update nowrise applications` (UPDATE) - `has_role(auth.uid(), 'admin'::app_role)`
- `Admins can delete nowrise applications` (DELETE) - `has_role(auth.uid(), 'admin'::app_role)`
- `Anyone can submit nowrise applications` (INSERT) - `true`

---

### 7. `profiles`
Stores user profile information.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | - (references auth.users) |
| email | varchar | YES | - |
| full_name | varchar | YES | - |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |

**RLS Policies:**
- `Users can view own profile` (SELECT) - `auth.uid() = id`
- `Admins can view all profiles` (SELECT) - `has_role(auth.uid(), 'admin'::app_role)`
- `Authenticated users can insert own profile` (INSERT) - `auth.role() = 'authenticated' AND auth.uid() = id`
- `Authenticated users can update own profile` (UPDATE) - `auth.role() = 'authenticated' AND auth.uid() = id`

---

### 8. `user_roles`
Stores user roles for access control.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| user_id | uuid | NO | - |
| role | app_role | NO | - |

**RLS Policies:**
- `Users can view their own roles` (SELECT) - `auth.uid() = user_id`
- `Admins can view all roles` (SELECT) - `has_role(auth.uid(), 'admin'::app_role)`
- `Admins can manage roles` (ALL) - `has_role(auth.uid(), 'admin'::app_role)`

---

## Enums

### `app_role`
```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');
```

### `application_status`
```sql
CREATE TYPE public.application_status AS ENUM ('pending', 'reviewing', 'approved', 'rejected');
```

---

## Database Functions

### `has_role(_user_id uuid, _role app_role)`
Checks if a user has a specific role. Used in RLS policies.

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

### `update_updated_at_column()`
Trigger function to auto-update `updated_at` timestamps.

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
```

### `handle_new_user()`
Trigger function to create profile when new user signs up.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;
```

---

## Security Notes

1. **RLS is enabled on all tables** - Row Level Security ensures data isolation
2. **Admin access** uses `has_role()` function with SECURITY DEFINER to prevent RLS recursion
3. **Public forms** are read-only for anonymous users (`is_published = true`)
4. **Form submissions** allow INSERT by anyone but only admins can view/manage
5. **User roles are stored separately** from profiles to prevent privilege escalation
