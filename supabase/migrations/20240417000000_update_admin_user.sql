-- Update the specified user's profile to have admin privileges
-- Replace 'YOUR_USER_EMAIL' with the actual email of the user you want to make admin
UPDATE public.profiles
SET is_admin = true
WHERE email = 'YOUR_USER_EMAIL';

-- Ensure RLS policy allows admin users to access admin features
CREATE POLICY "Allow admins full access" ON public.profiles
    USING (auth.uid() IN (
        SELECT id FROM public.profiles WHERE is_admin = true
    ));

-- Grant additional permissions to admin users if needed
CREATE POLICY "Admins can view all videos" ON public.videos
    FOR SELECT
    USING (auth.uid() IN (
        SELECT id FROM public.profiles WHERE is_admin = true
    ));

CREATE POLICY "Admins can update all videos" ON public.videos
    FOR UPDATE
    USING (auth.uid() IN (
        SELECT id FROM public.profiles WHERE is_admin = true
    )); 