-- Create the json_schemas table
CREATE TABLE IF NOT EXISTS json_schemas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    schema JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_json_schemas_user_id ON json_schemas(user_id);
CREATE INDEX IF NOT EXISTS idx_json_schemas_name ON json_schemas(name);

-- Enable Row Level Security
ALTER TABLE json_schemas ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own schemas"
    ON json_schemas
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own schemas"
    ON json_schemas
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schemas"
    ON json_schemas
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schemas"
    ON json_schemas
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_json_schemas_updated_at
    BEFORE UPDATE ON json_schemas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 