-- Update the current user to have admin privileges
UPDATE public.profiles
SET 
    is_admin = true,
    subscription_tier = 'enterprise'::subscription_tier,
    updated_at = NOW()
WHERE id = 'f02f1b90-0c87-42f0-be23-36dab481e0eb'
RETURNING id, email, is_admin; 