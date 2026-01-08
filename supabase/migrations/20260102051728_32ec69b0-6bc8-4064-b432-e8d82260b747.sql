-- Add delete policies for admin to manage contact requests, career applications, and nowrise applications

-- Delete policy for contact_requests
CREATE POLICY "Admins can delete contact requests"
ON public.contact_requests
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Delete policy for career_applications
CREATE POLICY "Admins can delete career applications"
ON public.career_applications
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Delete policy for nowrise_applications
CREATE POLICY "Admins can delete nowrise applications"
ON public.nowrise_applications
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));