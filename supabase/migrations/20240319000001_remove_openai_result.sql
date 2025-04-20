-- First, migrate any existing data from openai_result to processed_content
UPDATE videos
SET processed_content = openai_result
WHERE openai_result IS NOT NULL AND processed_content IS NULL;

-- Drop the index
DROP INDEX IF EXISTS idx_videos_openai_result;

-- Remove the column
ALTER TABLE videos
DROP COLUMN openai_result; 