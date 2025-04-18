-- Step 1: First verify if the user exists and get their details
SELECT id, email, is_admin 
FROM public.profiles 
WHERE email = 'YOUR_USER_EMAIL';

-- Step 2: Update the user to be an admin
UPDATE public.profiles
SET 
    is_admin = true,
    updated_at = NOW()
WHERE email = 'YOUR_USER_EMAIL'
RETURNING id, email, is_admin;

-- Step 3: Verify the update was successful
SELECT id, email, is_admin 
FROM public.profiles 
WHERE email = 'YOUR_USER_EMAIL'; 