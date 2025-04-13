-- Add progress column to videos table
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS progress integer DEFAULT 0;

-- Update existing records to have a default progress value
UPDATE videos 
SET progress = 0 
WHERE progress IS NULL; 