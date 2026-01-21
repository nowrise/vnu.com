-- Create programs table for NowRise courses
CREATE TABLE public.nowrise_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  content TEXT,
  icon TEXT DEFAULT 'BookOpen',
  duration TEXT,
  level TEXT,
  price DECIMAL(10,2),
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  created_by UUID REFERENCES auth.users(id)
);

-- Create blogs table for NowRise
CREATE TABLE public.nowrise_blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  author_name TEXT NOT NULL,
  author_image TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  tags JSONB DEFAULT '[]'::jsonb,
  read_time INTEGER DEFAULT 5,
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.nowrise_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nowrise_blogs ENABLE ROW LEVEL SECURITY;

-- Programs policies
CREATE POLICY "Admins can manage programs"
ON public.nowrise_programs FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active programs"
ON public.nowrise_programs FOR SELECT
USING (is_active = true);

-- Blogs policies
CREATE POLICY "Admins can manage blogs"
ON public.nowrise_blogs FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view published blogs"
ON public.nowrise_blogs FOR SELECT
USING (is_published = true);

-- Create triggers for updated_at
CREATE TRIGGER update_nowrise_programs_updated_at
BEFORE UPDATE ON public.nowrise_programs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nowrise_blogs_updated_at
BEFORE UPDATE ON public.nowrise_blogs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_nowrise_programs_active ON public.nowrise_programs(is_active, sort_order);
CREATE INDEX idx_nowrise_programs_slug ON public.nowrise_programs(slug);
CREATE INDEX idx_nowrise_blogs_published ON public.nowrise_blogs(is_published, published_at DESC);
CREATE INDEX idx_nowrise_blogs_slug ON public.nowrise_blogs(slug);