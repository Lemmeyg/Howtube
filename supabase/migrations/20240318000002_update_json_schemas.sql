-- Add description column and convert schema to JSONB
ALTER TABLE json_schemas 
ADD COLUMN description TEXT,
ALTER COLUMN schema TYPE JSONB USING schema::jsonb;

-- Add user_id column with foreign key constraint
ALTER TABLE json_schemas 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Set user_id for existing rows (replace 'default_admin_user_id' with an actual admin user id)
UPDATE json_schemas 
SET user_id = (SELECT user_id FROM user_roles WHERE role = 'admin' LIMIT 1)
WHERE user_id IS NULL;

-- Make user_id not nullable
ALTER TABLE json_schemas
ALTER COLUMN user_id SET NOT NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_json_schemas_user_id ON json_schemas(user_id);
CREATE INDEX IF NOT EXISTS idx_json_schemas_name ON json_schemas(name);

-- Add granular RLS policies for regular users
CREATE POLICY "Users can view their own schemas"
    ON json_schemas
    FOR SELECT
    USING (
        auth.uid() = user_id 
        OR auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
    );

CREATE POLICY "Users can insert their own schemas"
    ON json_schemas
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id 
        OR auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
    );

CREATE POLICY "Users can update their own schemas"
    ON json_schemas
    FOR UPDATE
    USING (
        auth.uid() = user_id 
        OR auth.uid() IN (SELECT user_roles WHERE role = 'admin')
    )
    WITH CHECK (
        auth.uid() = user_id 
        OR auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
    );

CREATE POLICY "Users can delete their own schemas"
    ON json_schemas
    FOR DELETE
    USING (
        auth.uid() = user_id 
        OR auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
    ); 