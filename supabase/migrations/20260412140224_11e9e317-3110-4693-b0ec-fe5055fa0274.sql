
-- Create storage bucket for business logos
INSERT INTO storage.buckets (id, name, public) VALUES ('business-logos', 'business-logos', true);

-- Public read access
CREATE POLICY "Business logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-logos');

-- Members can upload logos for their business
CREATE POLICY "Business members can upload logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'business-logos'
  AND auth.uid() IS NOT NULL
);

-- Members can update their business logos
CREATE POLICY "Business members can update logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'business-logos'
  AND auth.uid() IS NOT NULL
);

-- Members can delete their business logos
CREATE POLICY "Business members can delete logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'business-logos'
  AND auth.uid() IS NOT NULL
);
