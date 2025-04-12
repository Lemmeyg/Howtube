# AI IDE Development Guide: YouTube Tutorial Transcription App

This document outlines the step-by-step process for developing a web application that transcribes YouTube "how-to" videos and creates editable task outlines. Each phase defines critical features and completion criteria to guide the AI IDE through the build process.

## Phase 1: Authentication

### Critical Features
1. Implement Supabase Auth integration
2. Create login page
3. Create registration page
4. Set up password reset flow
5. Configure email verification
6. Implement protected routes
7. Set up session management

### Implementation Steps
1. Initialize Supabase client
2. Create authentication context provider
3. Build login form with email/password
4. Build registration form with required fields
5. Implement password reset functionality
6. Set up email verification workflow
7. Configure protected routes using route guards

### Completion Criteria
- Users can register for a new account
- Users can log in with credentials
- Users can reset forgotten passwords
- Email verification flow works correctly
- Protected routes redirect unauthenticated users to login
- Session persists between page refreshes

## Phase 2: URL to AssemblyAI Pipeline

### Critical Features
1. Create YouTube URL submission form
2. Implement URL validation
3. Set up AssemblyAI API integration
4. Create transcription processing workflow
5. Implement progress tracking
6. Set up error handling

### Implementation Steps
1. Build URL submission UI component
2. Create validation logic for YouTube URLs
3. Set up AssemblyAI API client
4. Implement transcription request workflow:
   - Extract video ID from URL
   - Send to AssemblyAI
   - Poll for completion
5. Create progress indicator component
6. Implement error handling for invalid URLs or failed transcriptions

### Completion Criteria
- Users can submit valid YouTube URLs
- System validates URLs before processing
- AssemblyAI correctly transcribes video content
- Users see real-time progress updates
- System handles and displays appropriate errors
- Transcription results are stored for next phase

## Phase 3: Admin Page with Prompt and JSON Structure Editing

### Critical Features
1. Create admin portal UI
2. Implement system prompt editor
3. Create JSON structure editor
4. Set up admin authentication and permissions
5. Create database schema for prompts and JSON structures

### Implementation Steps
1. Build admin portal layout with navigation
2. Create prompt management interface with editor
3. Implement JSON structure editor with validation
4. Set up admin-specific authentication rules
5. Create database tables for storing prompts and JSON schemas
6. Implement save/update functionality for prompts and schemas

### Completion Criteria
- Admins can view and edit system prompts
- Admins can define and modify JSON output structures
- Changes to prompts and structures are saved to database
- Regular users cannot access admin functionality
- Admin portal has basic navigation between sections

## Phase 4: OpenAI Pipeline

### Critical Features
1. Set up OpenAI API integration
2. Create transcription to OpenAI submission workflow
3. Implement system prompt inclusion
4. Create JSON response parsing
5. Implement error handling

### Implementation Steps
1. Set up OpenAI API client
2. Create service to prepare transcription data for OpenAI
3. Configure system to include admin-defined prompts
4. Implement JSON response parser based on defined schema
5. Set up error handling for API failures
6. Store processed results in database

### Completion Criteria
- Transcriptions are correctly submitted to OpenAI
- System prompts are included in submissions
- Responses are parsed according to defined JSON structure
- Errors are properly handled and reported
- Processed data is stored and available for document editor

## Phase 5: Document Editor

### Critical Features
1. Implement TipTap editor
2. Create document loading from JSON
3. Implement feature visibility toggles
4. Set up document saving functionality
5. Create basic formatting tools

### Implementation Steps
1. Set up TipTap editor with basic extensions
2. Create JSON to editor content transformer
3. Implement sidebar with feature toggles
4. Create document auto-save functionality
5. Implement basic formatting toolbar
6. Set up document state management

### Completion Criteria
- OpenAI processed content loads into editor
- Users can toggle visibility of different content sections
- Basic text formatting works (bold, italic, lists, etc.)
- Documents auto-save while editing
- Editor state persists between page refreshes

## Phase 6: Feature Toggles

### Critical Features
1. Create feature flag system
2. Implement subscription-based feature access
3. Create user permission checking
4. Set up feature visibility in UI

### Implementation Steps
1. Define feature flag schema in database
2. Create service to check user permissions against features
3. Implement UI components that respect feature flags
4. Create admin interface for managing feature flags
5. Link feature visibility to subscription levels

### Completion Criteria
- System controls feature access based on user subscription
- UI components conditionally render based on permissions
- Admin can enable/disable features globally
- User subscription level determines available features
- Feature toggles persist in document settings

## Future Phases (Not Initial Focus)

### Subscription System
- Stripe integration
- Subscription plan management
- Payment processing
- Usage tracking

### Document Export
- PDF export
- DOCX export
- Markdown export

### Dashboard & Document Management
- Document library view
- Document organization (tags/folders)
- Search functionality

### SEO Optimization
- Meta tag generation
- Landing page optimization
- Public document discovery

## Technology Stack Reference

- **Frontend**: Next.js 14, TypeScript, ShadCN, TipTap
- **Backend**: Supabase, Vercel
- **APIs**: AssemblyAI, OpenAI
- **Authentication**: Supabase Auth
- **Payments**: Stripe (future phase)
- **Design System**: Origin UI (21st.dev/originui)
