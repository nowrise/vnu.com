-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table for custom forms
CREATE TABLE public.custom_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  form_name TEXT NOT NULL,
  description TEXT,
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_page TEXT NOT NULL,
  display_type TEXT NOT NULL DEFAULT 'popup' CHECK (display_type IN ('popup', 'section')),
  is_published BOOLEAN NOT NULL DEFAULT false,
  popup_trigger_text TEXT DEFAULT 'Get Started',
  section_title TEXT DEFAULT 'Contact Us',
  created_by UUID REFERENCES auth.users(id)
);

-- Create table for form submissions
CREATE TABLE public.form_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  form_id UUID NOT NULL REFERENCES public.custom_forms(id) ON DELETE CASCADE,
  submission_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending'
);

-- Enable RLS on custom_forms
ALTER TABLE public.custom_forms ENABLE ROW LEVEL SECURITY;

-- Enable RLS on form_submissions
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Admins can manage forms
CREATE POLICY "Admins can manage custom forms"
ON public.custom_forms
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view published forms
CREATE POLICY "Anyone can view published forms"
ON public.custom_forms
FOR SELECT
USING (is_published = true);

-- Anyone can submit forms
CREATE POLICY "Anyone can submit forms"
ON public.form_submissions
FOR INSERT
WITH CHECK (true);

-- Admins can view and manage submissions
CREATE POLICY "Admins can manage form submissions"
ON public.form_submissions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_custom_forms_updated_at
BEFORE UPDATE ON public.custom_forms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();