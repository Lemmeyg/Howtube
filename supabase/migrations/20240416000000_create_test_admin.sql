-- Insert test admin user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@example.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Test Admin"}'
);

-- Insert corresponding profile with admin privileges
INSERT INTO profiles (id, email, full_name, is_admin, subscription_tier)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@example.com',
  'Test Admin',
  true,
  'enterprise'
); 