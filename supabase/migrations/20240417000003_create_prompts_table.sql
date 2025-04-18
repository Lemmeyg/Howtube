-- Create enum for prompt types
DO $$ BEGIN
  CREATE TYPE prompt_type AS ENUM ('system', 'user', 'assistant');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type prompt_type NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(type)
);

-- Enable RLS
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admins to manage prompts
CREATE POLICY "Allow admins to manage prompts"
  ON prompts
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  ));

-- Create policy to allow all authenticated users to read prompts
CREATE POLICY "Allow all authenticated users to read prompts"
  ON prompts
  FOR SELECT
  TO authenticated
  USING (true);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default prompts
INSERT INTO prompts (type, name, content, description)
VALUES 
  (
    'system',
    'system_prompt',
    'You are an AI assistant tasked with analyzing video transcriptions and creating structured task outlines. Focus on identifying key topics, action items, and important information.',
    'Default system prompt for video processing'
  ),
  (
    'user',
    'user_prompt',
    'Please analyze this video transcription and create a structured outline of the main points and tasks discussed.',
    'Default user prompt for video processing'
  ),
  (
    'assistant',
    'assistant_prompt',
    'I will analyze the transcription and provide a structured outline following these guidelines:
1. Identify main topics and subtopics
2. Extract action items and tasks
3. Highlight key information and insights
4. Organize content chronologically
5. Use clear hierarchical structure',
    'Default assistant prompt for video processing'
  )
ON CONFLICT (type) 
DO UPDATE SET 
  content = EXCLUDED.content,
  description = EXCLUDED.description,
  updated_at = NOW(); 