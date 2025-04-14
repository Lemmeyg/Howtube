-- Create feature configurations table
CREATE TABLE IF NOT EXISTS public.feature_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tier TEXT NOT NULL,
  feature TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(tier, feature)
);

-- Enable Row Level Security
ALTER TABLE public.feature_configs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admins to manage feature configs
CREATE POLICY "Admins can manage feature configs"
  ON public.feature_configs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_feature_configs_updated_at
  BEFORE UPDATE ON public.feature_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 