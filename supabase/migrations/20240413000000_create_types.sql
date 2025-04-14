-- Create enum for subscription tiers
DO $$ BEGIN
  CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'enterprise');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for features
DO $$ BEGIN
  CREATE TYPE feature_name AS ENUM (
    'transcription',
    'aiProcessing',
    'export',
    'collaboration',
    'customBranding'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$; 