-- ============================================================
-- FULL DATABASE EXPORT
-- Generated: 2026-01-07
-- Project: Vridhion & Udaanex IT Solutions PVT LTD
-- ============================================================

-- ============================================================
-- PART 1: ENUMS
-- ============================================================

CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');
CREATE TYPE public.application_status AS ENUM ('pending', 'reviewing', 'approved', 'rejected');

-- ============================================================
-- PART 2: TABLES
-- ============================================================

-- Profiles table (stores user profile data)
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  email VARCHAR NULL,
  full_name VARCHAR NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User roles table (stores user permissions)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Contact requests table
CREATE TABLE public.contact_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  purpose VARCHAR NOT NULL,
  message VARCHAR NOT NULL
);

-- Career applications table
CREATE TABLE public.career_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  role_applied VARCHAR NOT NULL,
  resume_url TEXT NULL,
  cover_letter VARCHAR NULL,
  status TEXT NULL DEFAULT 'pending'
);

-- NowRise applications table
CREATE TABLE public.nowrise_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  program VARCHAR NOT NULL,
  phone VARCHAR NULL,
  education VARCHAR NULL,
  status TEXT NULL DEFAULT 'pending'
);

-- Content pages table (CMS)
CREATE TABLE public.content_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_name TEXT NOT NULL,
  content_json JSONB NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID NULL
);

-- Custom forms table (Form Builder)
CREATE TABLE public.custom_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  form_name TEXT NOT NULL,
  description TEXT NULL,
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_page TEXT NOT NULL,
  display_type TEXT NOT NULL DEFAULT 'popup',
  is_published BOOLEAN NOT NULL DEFAULT false,
  popup_trigger_text TEXT NULL DEFAULT 'Get Started',
  section_title TEXT NULL DEFAULT 'Contact Us',
  created_by UUID NULL
);

-- Form submissions table
CREATE TABLE public.form_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.custom_forms(id) ON DELETE CASCADE,
  submission_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending'
);

-- ============================================================
-- PART 3: ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nowrise_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PART 4: DATABASE FUNCTIONS
-- ============================================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
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

-- ============================================================
-- PART 5: TRIGGERS
-- ============================================================

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- PART 6: ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK ((auth.role() = 'authenticated') AND (auth.uid() = id));

CREATE POLICY "Authenticated users can update own profile" ON public.profiles
  FOR UPDATE USING ((auth.role() = 'authenticated') AND (auth.uid() = id));

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Contact requests policies
CREATE POLICY "Anyone can submit contact requests" ON public.contact_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view contact requests" ON public.contact_requests
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete contact requests" ON public.contact_requests
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Career applications policies
CREATE POLICY "Anyone can submit career applications" ON public.career_applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view career applications" ON public.career_applications
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update career applications" ON public.career_applications
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete career applications" ON public.career_applications
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- NowRise applications policies
CREATE POLICY "Anyone can submit nowrise applications" ON public.nowrise_applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view nowrise applications" ON public.nowrise_applications
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update nowrise applications" ON public.nowrise_applications
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete nowrise applications" ON public.nowrise_applications
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Content pages policies
CREATE POLICY "Anyone can view content pages" ON public.content_pages
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage content pages" ON public.content_pages
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Custom forms policies
CREATE POLICY "Anyone can view published forms" ON public.custom_forms
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage custom forms" ON public.custom_forms
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Form submissions policies
CREATE POLICY "Anyone can submit forms" ON public.form_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage form submissions" ON public.form_submissions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- PART 7: SEED DATA
-- ============================================================

-- NOTE: User profiles are created automatically when users sign up
-- The following is existing data for reference (user IDs will be different in new project)

-- Existing Profiles (6 users)
-- User IDs reference auth.users table which must exist first
-- INSERT INTO public.profiles (id, email, full_name) VALUES
--   ('ed8785ca-e3f8-4c61-aebc-73e8d2ebaf2f', 'nowrise@gmail.com', 'reddy'),
--   ('04c82024-efbe-4d64-ad9b-7c07d1373ae0', 'kondapuramvarunreddy@gmail.com', 'varun reddy'),
--   ('437b7181-2d88-4632-8e0b-7af76e2cd768', 'eshwarreddy0989@gmail.com', 'Eshwar'),
--   ('20988018-1f02-4a3f-8cca-42c965743914', 'arvk2917@gmail.com', 'Anusha Reddy'),
--   ('bef00fe6-7f5a-408c-a095-fa68b8135bf5', 'varunreddy3173@gmail.com', 'Varun'),
--   ('ac0b9d01-c37b-4f62-97ca-2e8c3337e003', 'mummadibharath2@gmail.com', 'MUMMADIBHARATH');

-- Admin Roles (assign after users exist)
-- INSERT INTO public.user_roles (user_id, role) VALUES
--   ('bef00fe6-7f5a-408c-a095-fa68b8135bf5', 'admin'),  -- varunreddy3173@gmail.com
--   ('20988018-1f02-4a3f-8cca-42c965743914', 'admin');  -- arvk2917@gmail.com

-- Contact Requests
INSERT INTO public.contact_requests (email, name, purpose, message) VALUES
  ('test@example.com', 'Test User', 'business', 'This is a test message for security testing.'),
  ('varunreddy3173@gmail.com', 'Varun', 'business', 'How are you');

-- Custom Forms
INSERT INTO public.custom_forms (id, form_name, description, fields, target_page, display_type, is_published, popup_trigger_text, section_title) VALUES
  (
    'd23132cb-f979-49e7-83c2-46fb650f6ece',
    'newsletter singup',
    NULL,
    '[{"id":"4c33b653-3d8a-4fa4-854b-b59ba699e6ce","label":"name","placeholder":"","required":true,"type":"text"},{"id":"3332af49-8d43-46fe-b269-f647f1e3f8c2","label":"Email Address","placeholder":"","required":true,"type":"email"}]'::jsonb,
    'home,services,talent-solutions,ai-consulting,nowrise-institute,careers',
    'section',
    true,
    'Get Started',
    'Newsletter signup'
  );

-- Form Submissions (references custom_forms)
INSERT INTO public.form_submissions (form_id, status, submission_data) VALUES
  ('d23132cb-f979-49e7-83c2-46fb650f6ece', 'pending', '{"name":"Hi"}'::jsonb),
  ('d23132cb-f979-49e7-83c2-46fb650f6ece', 'reviewed', '{"source":"direct"}'::jsonb),
  ('d23132cb-f979-49e7-83c2-46fb650f6ece', 'pending', '{"Email Address":"varunreddy3173@gmail.com","name":"Hwh"}'::jsonb);

-- ============================================================
-- PART 8: EDGE FUNCTIONS
-- ============================================================

/*
The following Edge Functions are deployed with this project:

1. check-admin (supabase/functions/check-admin/index.ts)
   - Purpose: Secure server-side admin role verification
   - Endpoint: POST /functions/v1/check-admin
   - Auth: Requires JWT token in Authorization header
   - Returns: { isAdmin: boolean }
   - Uses service role key to query user_roles table securely

2. submit-form (supabase/functions/submit-form/index.ts)
   - Purpose: Handle public form submissions with security features
   - Endpoint: POST /functions/v1/submit-form
   - Features: Rate limiting (5/min), honeypot protection, input validation
   - Supported forms: contact_requests, career_applications, nowrise_applications
*/

-- ============================================================
-- PART 9: NOTES FOR NEW SUPABASE PROJECT
-- ============================================================

/*
To recreate this database in a new Supabase project:

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor
3. Run this entire file (Parts 1-7)
4. Enable Auth settings:
   - Go to Authentication > Settings
   - Enable Email/Password signup
   - Optionally disable email confirmation for testing
5. Create admin user:
   - Sign up with your admin email
   - Run this SQL to make them admin:
     INSERT INTO public.user_roles (user_id, role) 
     SELECT id, 'admin' FROM auth.users WHERE email = 'your-admin@email.com';
6. Update your frontend .env:
   - VITE_SUPABASE_URL=your-project-url
   - VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
7. Deploy edge functions:
   - Copy supabase/functions/check-admin folder
   - Copy supabase/functions/submit-form folder
   - Deploy using Supabase CLI: supabase functions deploy
8. Set required secrets for edge functions:
   - SUPABASE_URL (auto-configured)
   - SUPABASE_ANON_KEY (auto-configured)
   - SUPABASE_SERVICE_ROLE_KEY (auto-configured)
*/
