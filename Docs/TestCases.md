# Feature Configuration Test Cases

## Setup Requirements

Before running these tests, ensure you have:
1. Run all database migrations in order:
   - `20240413000000_create_types.sql`
   - `20240414000000_create_profiles_table.sql`
   - `20240415000000_create_feature_configs_table.sql`
   - `20240416000000_create_test_admin.sql`
2. Started the development server with `npm run dev`
3. Set up required environment variables:
   - `ASSEMBLY_AI_API_KEY`
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Test User Credentials

### Admin User
- Email: admin@example.com
- Password: admin123
- Subscription Tier: Enterprise
- Admin Access: Yes

### Test User (Create this user during testing)
- Email: test@example.com
- Password: test123
- Subscription Tier: Free
- Admin Access: No

## Test Cases

### 1. Authentication and User Management

#### 1.1 User Registration
- [ ] Navigate to `/sign-up`
- [ ] Fill in registration form with test user credentials
- [ ] Submit form
- [ ] Expected: Success message and redirect to sign-in
- [ ] Check email for verification link
- [ ] Click verification link
- [ ] Expected: Redirect to dashboard after verification

#### 1.2 User Login
- [ ] Navigate to `/sign-in`
- [ ] Enter test user credentials
- [ ] Submit form
- [ ] Expected: Success message and redirect to dashboard
- [ ] Verify session persists after page refresh

#### 1.3 Password Reset
- [ ] Navigate to `/reset-password`
- [ ] Enter test user email
- [ ] Submit form
- [ ] Expected: Success message and email with reset link
- [ ] Click reset link
- [ ] Enter new password
- [ ] Expected: Success message and redirect to dashboard

#### 1.4 Session Management
- [ ] Log in with test user
- [ ] Navigate to protected route (e.g., `/dashboard`)
- [ ] Expected: Access granted
- [ ] Clear browser cookies
- [ ] Refresh page
- [ ] Expected: Redirect to sign-in page

#### 1.5 Protected Routes
- [ ] Try to access `/dashboard` while logged out
- [ ] Expected: Redirect to sign-in page
- [ ] Log in with test user
- [ ] Try to access `/admin` (non-admin user)
- [ ] Expected: Redirect to dashboard

### 2. Video Processing Pipeline

#### 2.1 YouTube URL Submission
- [ ] Navigate to `/dashboard`
- [ ] Enter a valid YouTube URL in the submission form
- [ ] Click "Process Video"
- [ ] Expected: Form submission success message
- [ ] Expected: Progress bar appears and updates
- [ ] Expected: Status messages update in real-time

#### 2.2 URL Validation
- [ ] Try submitting an invalid URL
- [ ] Expected: Form validation error message
- [ ] Try submitting a non-YouTube URL
- [ ] Expected: Form validation error message
- [ ] Try submitting a private/unavailable video URL
- [ ] Expected: Error message from YouTube API

#### 2.3 Audio Download
- [ ] Submit a valid YouTube URL
- [ ] Expected: Progress updates to 10% with "downloading" status
- [ ] Expected: Audio file is downloaded successfully
- [ ] Expected: Progress updates to 40% with "uploading" status

#### 2.4 Transcription Process
- [ ] After successful download
- [ ] Expected: Progress updates to 60% with "transcribing" status
- [ ] Expected: Audio is uploaded to AssemblyAI
- [ ] Expected: Transcription job is started
- [ ] Expected: Progress updates to 80% with "processing" status

#### 2.5 OpenAI Processing
- [ ] After successful transcription
- [ ] Expected: Transcription is sent to OpenAI
- [ ] Expected: OpenAI processes the transcription
- [ ] Expected: Progress updates to 100% with "completed" status
- [ ] Expected: Results are stored in the database

#### 2.6 Error Handling
- [ ] Submit a video with poor audio quality
- [ ] Expected: Appropriate error message
- [ ] Submit a very long video (>1 hour)
- [ ] Expected: Token limit error message
- [ ] Submit a video in a non-supported language
- [ ] Expected: Language detection error message

#### 2.7 Progress Tracking
- [ ] Submit a video for processing
- [ ] Expected: Real-time progress updates in the UI
- [ ] Expected: Progress bar updates smoothly
- [ ] Expected: Status messages are clear and informative
- [ ] Expected: Progress persists after page refresh

#### 2.8 Video List Management
- [ ] After successful processing
- [ ] Expected: Video appears in the dashboard list
- [ ] Expected: Video status shows as "completed"
- [ ] Expected: Video has a progress of 100%
- [ ] Expected: Video can be viewed/edited

### 3. Database Setup Verification

#### 3.1 Verify Types Creation
- [ ] Open Supabase SQL Editor
- [ ] Run query: `SELECT * FROM pg_type WHERE typname IN ('subscription_tier', 'feature_name');`
- [ ] Expected: Both types should exist

#### 3.2 Verify Tables Creation
- [ ] Run query: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
- [ ] Expected: Should see `profiles` and `feature_configs` tables

#### 3.3 Verify Initial Data
- [ ] Run query: `SELECT * FROM feature_configs ORDER BY tier, feature;`
- [ ] Expected: Should see 15 rows (3 tiers × 5 features)
- [ ] Verify default configurations match expected values

### 4. Authentication and Authorization

#### 4.1 Admin Login
- [ ] Navigate to `/login`
- [ ] Log in with admin credentials
- [ ] Expected: Successful login and redirect to dashboard

#### 4.2 Admin Access to Feature Management
- [ ] Navigate to `/admin/features`
- [ ] Expected: Should see feature configuration table
- [ ] Verify all features are visible and editable

#### 4.3 Non-Admin Access Restriction
- [ ] Create a new test user with free tier
- [ ] Log in with test user credentials
- [ ] Navigate to `/admin/features`
- [ ] Expected: Should be redirected to dashboard

### 5. Feature Configuration Management

#### 5.1 View Feature Configurations
- [ ] Log in as admin
- [ ] Navigate to `/admin/features`
- [ ] Expected: Should see a table with all features and tiers
- [ ] Verify initial configurations are correct

#### 5.2 Update Feature Configuration
- [ ] Toggle a feature for a specific tier
- [ ] Click save
- [ ] Expected: Should see success toast
- [ ] Refresh page and verify change persisted

#### 5.3 Bulk Update Features
- [ ] Select multiple features to update
- [ ] Click save
- [ ] Expected: All changes should be saved
- [ ] Refresh page and verify all changes persisted

### 6. Feature Access Control

#### 6.1 Test Feature Access Page
- [ ] Log in as admin
- [ ] Navigate to `/test/features`
- [ ] Expected: Should see all test buttons enabled
- [ ] Click each button
- [ ] Expected: Should see success toasts for all features

#### 6.2 Test Free Tier Restrictions
- [ ] Log in as test user (free tier)
- [ ] Navigate to `/test/features`
- [ ] Expected: Only transcription button should be enabled
- [ ] Click enabled button
- [ ] Expected: Should see success toast
- [ ] Click disabled buttons
- [ ] Expected: Should see error toasts

#### 6.3 Test API Access Control
- [ ] Using browser dev tools, try to access `/api/test/transcription`
- [ ] Expected: Should succeed for admin and free tier
- [ ] Try to access `/api/test/ai-processing`
- [ ] Expected: Should succeed for admin, fail for free tier

### 7. Feature Guard Component

#### 7.1 Protected Route Access
- [ ] Create a test page with feature guard
- [ ] Try to access with admin user
- [ ] Expected: Should see protected content
- [ ] Try to access with free tier user
- [ ] Expected: Should be redirected

#### 7.2 Fallback Content
- [ ] Add fallback content to feature guard
- [ ] Access with restricted user
- [ ] Expected: Should see fallback content instead of redirect

### 8. Real-time Updates

#### 8.1 Feature Toggle Updates
- [ ] Open two browser windows
- [ ] Log in as admin in both
- [ ] In one window, toggle a feature
- [ ] Expected: Other window should update automatically

#### 8.2 Subscription Tier Changes
- [ ] Change test user's subscription tier
- [ ] Expected: Feature availability should update immediately
- [ ] Verify UI reflects new feature access

## Troubleshooting

If any test fails:
1. Check browser console for errors
2. Verify database migrations ran successfully
3. Confirm user profiles and feature configs exist
4. Check network requests in dev tools
5. Verify RLS policies are correctly configured

## Expected Results Summary

### Admin User (Enterprise Tier)
- Full access to all features
- Can manage feature configurations
- All test buttons enabled
- All API endpoints accessible

### Free Tier User
- Access to transcription only
- Cannot access admin features
- Most test buttons disabled
- Limited API access

### Pro Tier User
- Access to transcription, AI processing, export, and collaboration
- Cannot access admin features
- Custom branding button disabled
- Limited API access

## Notes
- All tests should be run in order
- Clear browser cache between user switches
- Document any unexpected behavior
- Update test cases as new features are added 