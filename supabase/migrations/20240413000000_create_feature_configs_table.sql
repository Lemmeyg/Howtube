-- Create feature_configs table
CREATE TABLE IF NOT EXISTS feature_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tier subscription_tier NOT NULL,
  feature feature_name NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(tier, feature)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_feature_configs_tier_feature ON feature_configs(tier, feature);

-- Add RLS policies
ALTER TABLE feature_configs ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to all authenticated users" ON feature_configs
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow update access only to admin users
CREATE POLICY "Allow update access only to admin users" ON feature_configs
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  ));

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_feature_configs_updated_at
  BEFORE UPDATE ON feature_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial feature configurations
INSERT INTO feature_configs (tier, feature, enabled)
VALUES
  ('free', 'transcription', true),
  ('free', 'aiProcessing', false),
  ('free', 'export', false),
  ('free', 'collaboration', false),
  ('free', 'customBranding', false),
  ('pro', 'transcription', true),
  ('pro', 'aiProcessing', true),
  ('pro', 'export', true),
  ('pro', 'collaboration', true),
  ('pro', 'customBranding', false),
  ('enterprise', 'transcription', true),
  ('enterprise', 'aiProcessing', true),
  ('enterprise', 'export', true),
  ('enterprise', 'collaboration', true),
  ('enterprise', 'customBranding', true); 