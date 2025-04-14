-- Add openai_result column to videos table
ALTER TABLE videos
ADD COLUMN openai_result JSONB;

-- Add comment to explain the column
COMMENT ON COLUMN videos.openai_result IS 'Structured output from OpenAI processing of the transcription';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_videos_openai_result ON videos USING GIN (openai_result); 