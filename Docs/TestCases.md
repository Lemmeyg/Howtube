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

#### 1.6 Email Verification Flow
- [ ] Register new user
- [ ] Check if user can access restricted features before verification
- [ ] Expected: Should be restricted
- [ ] Verify email verification link format
- [ ] Test expired verification link
- [ ] Expected: Show appropriate error message
- [ ] Test already verified user attempting verification
- [ ] Expected: Show appropriate message
- [ ] Test malformed verification tokens
- [ ] Expected: Show security error message

#### 1.7 User Profile Management
- [ ] Navigate to profile settings
- [ ] Update user display name
- [ ] Expected: Success message and immediate UI update
- [ ] Update user email
- [ ] Expected: Require email verification for new address
- [ ] Upload profile picture
- [ ] Expected: Image preview and successful update
- [ ] Update password with invalid current password
- [ ] Expected: Error message
- [ ] Update password with valid current password
- [ ] Expected: Success message and stay logged in
- [ ] Delete account
- [ ] Expected: Confirmation modal and successful deletion

#### 1.8 Subscription Tier Validation
- [ ] Log in as free tier user
- [ ] Verify available features match free tier
- [ ] Upgrade to pro tier
- [ ] Expected: Immediate access to pro features
- [ ] Verify feature availability persists after refresh
- [ ] Downgrade to free tier
- [ ] Expected: Immediate restriction of pro features
- [ ] Test grace period for expired subscriptions
- [ ] Expected: Warning message and feature access for grace period
- [ ] Test after grace period
- [ ] Expected: Revert to free tier restrictions

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

#### 2.9 AssemblyAI Integration Edge Cases
- [ ] Test video with multiple languages
- [ ] Expected: Primary language detection and appropriate handling
- [ ] Test video with background noise
- [ ] Expected: Transcription with noise reduction applied
- [ ] Test video with music sections
- [ ] Expected: Proper handling of non-speech audio
- [ ] Test connection failure during transcription
- [ ] Expected: Retry mechanism activation
- [ ] Test API key expiration during process
- [ ] Expected: Appropriate error message and process halt

#### 2.10 Concurrent Processing Limits
- [ ] Submit multiple videos simultaneously as free tier user
- [ ] Expected: Queue system activation
- [ ] Submit multiple videos as pro tier user
- [ ] Expected: Higher concurrent processing limit
- [ ] Test queue priority system
- [ ] Expected: Pro tier videos prioritized
- [ ] Test queue timeout handling
- [ ] Expected: Appropriate timeout messages
- [ ] Test queue position updates
- [ ] Expected: Real-time queue position display

#### 2.11 Video Metadata Validation
- [ ] Process video with no title
- [ ] Expected: Use video ID as fallback
- [ ] Process video with special characters in title
- [ ] Expected: Proper escaping and handling
- [ ] Process video with extremely long title
- [ ] Expected: Proper truncation
- [ ] Process video with no description
- [ ] Expected: Handle empty description gracefully
- [ ] Process video with embedded timestamps
- [ ] Expected: Proper parsing of timestamp information

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

### 9. OpenAI Analysis

#### 9.1 System Prompt Management
- [ ] Log in as admin
- [ ] Navigate to prompt management interface
- [ ] Create new system prompt
- [ ] Expected: Prompt saved and available for use
- [ ] Edit existing prompt
- [ ] Expected: Changes reflected in new processing
- [ ] Test prompt versioning
- [ ] Expected: Ability to rollback to previous versions
- [ ] Test prompt validation
- [ ] Expected: Error for invalid prompt structure

#### 9.2 JSON Schema Validation
- [ ] Process video with complete schema
- [ ] Expected: All fields properly populated
- [ ] Process video with missing optional fields
- [ ] Expected: Default values applied
- [ ] Process video with invalid field types
- [ ] Expected: Type coercion or error message
- [ ] Test nested JSON structures
- [ ] Expected: Proper parsing of all levels
- [ ] Test array field handling
- [ ] Expected: Proper array structure maintained

#### 9.3 SEO Metadata Processing
- [ ] Process video with rich metadata
- [ ] Expected: Keywords and tags extracted
- [ ] Process video with minimal metadata
- [ ] Expected: AI-generated alternative metadata
- [ ] Test metadata relevance scoring
- [ ] Expected: Properly ranked keywords
- [ ] Test metadata language variants
- [ ] Expected: Language-specific SEO data
- [ ] Test metadata character limits
- [ ] Expected: Proper truncation for different platforms

#### 9.4 Admin Prompt Configuration
- [ ] Test prompt template creation
- [ ] Expected: Template saved and available
- [ ] Test variable substitution in templates
- [ ] Expected: Variables properly replaced
- [ ] Test template access control
- [ ] Expected: Only admins can modify
- [ ] Test template categories
- [ ] Expected: Proper organization and filtering
- [ ] Test template performance metrics
- [ ] Expected: Usage and success rate data

#### 9.5 OpenAI Integration Edge Cases
- [ ] Test handling of API timeouts
- [ ] Expected: Retry mechanism activation
- [ ] Test rate limit handling
- [ ] Expected: Queue system activation
- [ ] Test content filter triggers
- [ ] Expected: Appropriate warning messages
- [ ] Test token limit optimization
- [ ] Expected: Content splitting if needed
- [ ] Test error recovery
- [ ] Expected: Graceful fallback options

### 10. Document Editor

#### 10.1 TipTap Editor Core Functionality
- [ ] Create new document
- [ ] Expected: Empty editor with default structure
- [ ] Test basic text formatting (bold, italic, underline)
- [ ] Expected: Proper formatting applied
- [ ] Test heading levels
- [ ] Expected: Proper hierarchy maintained
- [ ] Test lists (ordered and unordered)
- [ ] Expected: Proper list formatting
- [ ] Test undo/redo functionality
- [ ] Expected: State properly tracked

#### 10.2 Field Visibility Controls
- [ ] Toggle individual fields
- [ ] Expected: Immediate UI update
- [ ] Test field dependencies
- [ ] Expected: Related fields toggle together
- [ ] Test subscription-restricted fields
- [ ] Expected: Proper access control
- [ ] Save field visibility state
- [ ] Expected: State persists after refresh
- [ ] Test bulk field toggle
- [ ] Expected: Multiple fields update correctly

#### 10.3 Document State Management
- [ ] Test auto-save functionality
- [ ] Expected: Regular state persistence
- [ ] Test conflict resolution
- [ ] Expected: Proper handling of concurrent edits
- [ ] Test offline changes
- [ ] Expected: Local storage backup
- [ ] Test version history
- [ ] Expected: Ability to view and restore versions
- [ ] Test document sharing state
- [ ] Expected: Proper permission handling

#### 10.4 Collaboration Features
- [ ] Test real-time collaboration
- [ ] Expected: Multiple users can edit
- [ ] Test cursor presence
- [ ] Expected: See other users' cursors
- [ ] Test change attribution
- [ ] Expected: Track who made changes
- [ ] Test comment functionality
- [ ] Expected: Add and resolve comments
- [ ] Test permission levels
- [ ] Expected: Proper access control

#### 10.5 Export Functionality
- [ ] Test PDF export
- [ ] Expected: Proper formatting maintained
- [ ] Test DOCX export
- [ ] Expected: Styles properly converted
- [ ] Test Markdown export
- [ ] Expected: Clean markdown output
- [ ] Test custom export templates
- [ ] Expected: Template properly applied
- [ ] Test batch export
- [ ] Expected: Multiple documents processed

#### 10.6 Performance Testing
- [ ] Test large document handling
- [ ] Expected: No performance degradation
- [ ] Test image handling
- [ ] Expected: Proper optimization
- [ ] Test concurrent operations
- [ ] Expected: No conflicts or locks
- [ ] Test memory usage
- [ ] Expected: Efficient resource usage
- [ ] Test load times
- [ ] Expected: Quick initial render

### 11. Subscription System

#### 11.1 Subscription Plan Management
- [ ] Test plan creation (admin)
- [ ] Expected: New plan available in system
- [ ] Test plan modification
- [ ] Expected: Changes reflect for new subscribers
- [ ] Test plan deprecation
- [ ] Expected: Existing users grandfathered
- [ ] Test feature mapping
- [ ] Expected: Correct features per plan
- [ ] Test custom plan creation
- [ ] Expected: Enterprise plan flexibility

#### 11.2 Payment Processing
- [ ] Test initial subscription
- [ ] Expected: Successful Stripe charge
- [ ] Test subscription renewal
- [ ] Expected: Automatic payment processing
- [ ] Test payment failure
- [ ] Expected: Retry mechanism and notifications
- [ ] Test refund process
- [ ] Expected: Proper refund handling
- [ ] Test proration
- [ ] Expected: Correct amount calculation

#### 11.3 Subscription Lifecycle
- [ ] Test upgrade flow
- [ ] Expected: Immediate access to new features
- [ ] Test downgrade flow
- [ ] Expected: Proper feature restriction
- [ ] Test cancellation
- [ ] Expected: Access until period end
- [ ] Test reactivation
- [ ] Expected: Proper feature restoration
- [ ] Test subscription pause
- [ ] Expected: Temporary access suspension

#### 11.4 Usage Tracking
- [ ] Test usage metrics collection
- [ ] Expected: Accurate tracking
- [ ] Test usage limits
- [ ] Expected: Proper limit enforcement
- [ ] Test usage notifications
- [ ] Expected: Timely alerts
- [ ] Test usage reports
- [ ] Expected: Accurate reporting
- [ ] Test usage analytics
- [ ] Expected: Proper data visualization

#### 11.5 Billing Management
- [ ] Test invoice generation
- [ ] Expected: Accurate billing details
- [ ] Test payment method update
- [ ] Expected: Successful card update
- [ ] Test billing cycle changes
- [ ] Expected: Proper proration
- [ ] Test tax calculation
- [ ] Expected: Correct tax application
- [ ] Test currency handling
- [ ] Expected: Proper currency conversion

#### 11.6 Enterprise Features
- [ ] Test custom pricing
- [ ] Expected: Special rates applied
- [ ] Test bulk licensing
- [ ] Expected: Multiple seat management
- [ ] Test custom features
- [ ] Expected: Special feature access
- [ ] Test billing consolidation
- [ ] Expected: Single invoice for multiple seats
- [ ] Test usage reporting
- [ ] Expected: Detailed enterprise reports

### 12. Core Infrastructure

#### 12.1 API Performance
- [ ] Test endpoint response times
- [ ] Expected: Within acceptable thresholds
- [ ] Test concurrent requests
- [ ] Expected: Proper request handling
- [ ] Test rate limiting
- [ ] Expected: Limits properly enforced
- [ ] Test API versioning
- [ ] Expected: Backward compatibility
- [ ] Test API documentation
- [ ] Expected: Up-to-date and accurate

#### 12.2 Error Handling
- [ ] Test global error handler
- [ ] Expected: Proper error formatting
- [ ] Test API error responses
- [ ] Expected: Consistent error structure
- [ ] Test client-side error handling
- [ ] Expected: User-friendly messages
- [ ] Test error logging
- [ ] Expected: Proper error tracking
- [ ] Test error recovery
- [ ] Expected: System stability maintained

#### 12.3 Logging System
- [ ] Test log generation
- [ ] Expected: Proper log formatting
- [ ] Test log levels
- [ ] Expected: Correct level assignment
- [ ] Test log rotation
- [ ] Expected: Proper file management
- [ ] Test log search
- [ ] Expected: Quick log retrieval
- [ ] Test log security
- [ ] Expected: Sensitive data protected

### 13. Security Features

#### 13.1 Authentication Security
- [ ] Test password complexity
- [ ] Expected: Strong password enforcement
- [ ] Test brute force protection
- [ ] Expected: Account lockout after failures
- [ ] Test session timeout
- [ ] Expected: Proper session expiration
- [ ] Test concurrent sessions
- [ ] Expected: Session management
- [ ] Test OAuth security
- [ ] Expected: Proper token handling

#### 13.2 Data Protection
- [ ] Test data encryption at rest
- [ ] Expected: Proper encryption
- [ ] Test data encryption in transit
- [ ] Expected: HTTPS enforcement
- [ ] Test data backup
- [ ] Expected: Regular backups
- [ ] Test data recovery
- [ ] Expected: Successful restoration
- [ ] Test data deletion
- [ ] Expected: Proper data removal

#### 13.3 Access Control
- [ ] Test role-based access
- [ ] Expected: Proper permission enforcement
- [ ] Test resource isolation
- [ ] Expected: Cross-user protection
- [ ] Test API authentication
- [ ] Expected: Valid token required
- [ ] Test permission inheritance
- [ ] Expected: Proper role hierarchy
- [ ] Test access audit
- [ ] Expected: Access logs maintained

#### 13.4 Security Monitoring
- [ ] Test security alerts
- [ ] Expected: Timely notifications
- [ ] Test intrusion detection
- [ ] Expected: Suspicious activity flagged
- [ ] Test security patches
- [ ] Expected: Quick vulnerability fixes
- [ ] Test security reporting
- [ ] Expected: Comprehensive reports
- [ ] Test incident response
- [ ] Expected: Quick threat mitigation

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