-- Add database-level validation constraints to match client-side Zod schemas
-- This provides defense-in-depth for form data

-- Contact requests: Add length constraints matching Zod validation
ALTER TABLE public.contact_requests 
  ALTER COLUMN name TYPE VARCHAR(100),
  ALTER COLUMN email TYPE VARCHAR(255),
  ALTER COLUMN message TYPE VARCHAR(1000),
  ALTER COLUMN purpose TYPE VARCHAR(100);

-- Add email format check constraint
ALTER TABLE public.contact_requests
  ADD CONSTRAINT contact_requests_email_format 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Career applications: Add length constraints
ALTER TABLE public.career_applications
  ALTER COLUMN name TYPE VARCHAR(100),
  ALTER COLUMN email TYPE VARCHAR(255),
  ALTER COLUMN role_applied TYPE VARCHAR(100),
  ALTER COLUMN cover_letter TYPE VARCHAR(5000);

-- Add email format check constraint
ALTER TABLE public.career_applications
  ADD CONSTRAINT career_applications_email_format 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- NowRise applications: Add length constraints  
ALTER TABLE public.nowrise_applications
  ALTER COLUMN name TYPE VARCHAR(100),
  ALTER COLUMN email TYPE VARCHAR(255),
  ALTER COLUMN program TYPE VARCHAR(100),
  ALTER COLUMN phone TYPE VARCHAR(20),
  ALTER COLUMN education TYPE VARCHAR(200);

-- Add email format check constraint
ALTER TABLE public.nowrise_applications
  ADD CONSTRAINT nowrise_applications_email_format 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Profiles: Add length constraints
ALTER TABLE public.profiles
  ALTER COLUMN email TYPE VARCHAR(255),
  ALTER COLUMN full_name TYPE VARCHAR(100);

-- Create status enum type for applications
CREATE TYPE public.application_status AS ENUM ('pending', 'reviewing', 'approved', 'rejected');

-- Note: Converting existing status columns to enum would require data migration
-- For now, add check constraints for valid status values
ALTER TABLE public.career_applications
  ADD CONSTRAINT career_applications_status_check 
  CHECK (status IS NULL OR status IN ('pending', 'reviewing', 'approved', 'rejected'));

ALTER TABLE public.nowrise_applications
  ADD CONSTRAINT nowrise_applications_status_check 
  CHECK (status IS NULL OR status IN ('pending', 'reviewing', 'approved', 'rejected'));