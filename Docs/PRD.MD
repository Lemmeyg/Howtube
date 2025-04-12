# Project Overview

This project is to create a website that can take the url of a "how to" youtube video, transcribe it, then use the transcription to create a task or project outline. The user will then be able to edit the document so the user can follow along with the document as well as the video.

Prioritization
Pages/UX components.
URL - Transcription pipeline
Transcription to openai
Openai to document editor
# Technology Stack
List frameworks and libraries you'll use

- Typescript
- ShadCN
- AssemblyAI
- SupaBase
- Supabase auth
- Stripe
- Vercel
- tiptap

# Core Functionality
Detailed breakdown of features

## 1. Authentication
### Components:
- Login page
- Registration page
- Password reset flow
- Email verification
- Different levels of feature access based on user profile

### Features:
- Supabase Auth integration
- Session management
- Protected routes
- User profile management

## 2. Video Processing Pipeline
### Components:
- YouTube URL submission form
- Video validation
- AssemblyAI integration

### Features:
- URL validation
- Video duration checks
- Transcription processing
- Progress tracking
- Error handling

## 3. OPENAI Analysis for document creation

###Components
AssemblyAI out to Openai submission
Inclusion of system prompt in submission
Error handling
Definition of the Json Outputs
Storing json outputs

###Features
The transcription with be submitted to OPENAI
- Ingest AssemblyAI response to the openAI submission pipeline
- Ingest System prompt with submission
- Ability to Define the json output structure of the response
- Include a UX in admin portal for edit prompt
- Output is displayed in the document editor
  - Select json fields included based on subscription toggles and features.
- SEO MEta data/keywords taken from the original video and included with the document

##4 Document editor
Openai OUtput to displayed in Tiptap edit window
Select json fields will be displayed/hidden based on on radio buttons on the side bar.

### Processing Pipeline

### Data Flow
- AssemblyAI transcription input
- OpenAI processing
- Response handling
- Field extraction

### Editor Integration
- TipTap editor configuration
- Field display logic
- State management

### Sidebar Component
- Field selection interface
- Visibility toggles available based on subscription level of user
- Field grouping and organization

## 5. Document Generation
### Components:
- Document editor interface
- Formatting tools
- Export functionality

### Features:
- OpenAI integration
- Template system
- Document formatting
- Export options (PDF, DOCX, MD)
- Document versioning
- SEO Tactics

### Additional Features:
- Refining and adjusting prompts
- Document editor
- Profile feature availability

## 6. Subscription System
### Components:
- Subscription plans display
- Payment processing
- Usage tracking

### Features:
- Three tiers (Free, Pro, Enterprise)
- Usage limits
- Feature gating
- Stripe integration
- Monthly/yearly billing

## 7. Dashboard
### Components:
- Document list view
- Document detail view
- Usage statistics
- Progress tracking

### Features:
- Document management
- Status tracking
- Analytics display
- Quick actions

## 8. Core Infrastructure
### Components:
- API routes
- Database schema
- Error handling
- Logging system

### Features:
- Rate limiting
- Error tracking
- Performance monitoring
- Security measures

## 9. Template System
### Components:
- Template management interface
- Template editor
- Template testing

### Features:
- Template storage
- Version control
- Template deployment
- Analytics tracking

## 10. Analytics and Monitoring
### Components:
- Usage tracking
- Performance metrics
- Error logging

### Features:
- Usage statistics
- Performance monitoring
- Error tracking
- System health checks

## 11. User Interface
### Components:
- Landing page
- Navigation
- Forms
- Cards
- Progress indicators

### Features:
- Responsive design
- Dark/light mode
- Loading states
- Error states
- Success notifications

## 12. Security Features
### Components:
- Authentication middleware
- Rate limiting
- Input validation

### Features:
- Row Level Security (RLS)
- XSS protection
- CSRF protection
- Data encryption
- Secure communication
#  Technical Requirements


## Frontend
- Next.js 14
- TipTap Editor
- Shadcn UI Components
- State Management (Zustand)

##  Backend
- Supabase Database
- API Routes
- OpenAI Integration
- AssemblyAI Integration

###  Data Structure
- JSON Schema Definition
- Field Type System
- Visibility State Management
- Response Versioning

##Data Flow Process

-URL Submission: User submits YouTube URL through frontend interface
-Transcription: URL sent to AssemblyAI for video transcription
-Analysis: Transcription text processed by OpenAI with specialized system prompt
-JSON Generation: Structured JSON document created from OpenAI output
-Document Loading: Structured content loaded into TipTap editor
-Feature Access: Content elements toggled based on user subscription level
-User Editing: Document customized by user through editor interface
-Storage: Document saved to Supabase database
-Export: Document exported in various formats (PDF, DOCX, MD)
# User Flow
How users will interact with each feature
# User Stories

## Authentication & User Management

1**Account Creation**  
   As a new user, I want to create an account so that I can save my documents and access them across devices.

2. **Subscription Management**  
   As a user, I want to upgrade to a premium plan so that I can access advanced features like more detailed task breakdowns and unlimited documents.

## Video Processing

3. **YouTube URL Submission**  
   As a DIY enthusiast, I want to submit a YouTube tutorial URL so that I can convert it into written instructions without manual transcription.

4. **Processing Progress Tracking**  
   As a user, I want to see the progress of my video processing so that I know when my document will be ready.

5. **Video Validation**  
   As a user, I want immediate feedback if my URL is invalid or the video is too long so that I don't waste my time waiting for processing to fail.

## Document Creation & Editing

6. **Initial Document Generation**  
   As a cooking enthusiast, I want a recipe video converted into a structured task list so that I can follow along without constantly pausing the video.

7. **Content Customization**  
   As a user, I want to edit the AI-generated document so that I can add my own notes, remove unnecessary steps, or clarify instructions.

8. **Feature Toggling**  
   As a pro user, I want to toggle different content sections on/off so that I can customize my document to include only the information I need.

9. **Document Format Selection**  
   As a user, I want to export my document in different formats (PDF, DOCX, MD) so that I can use it in various contexts or applications.

## Dashboard & Document Management

10. **Document Library**  
    As a user, I want to see all my created documents in one place so that I can easily find and access them later.

11. **Document Organization**  
    As a frequent user, I want to organize my documents with tags or folders so that I can manage my growing collection efficiently.

12. **Document Sharing**  
    As a team leader, I want to share my task outlines with team members so that everyone has access to the same instructions.

## Premium Features

13. **Enhanced Analysis**  
    As a premium user, I want more detailed breakdowns of complex tasks so that I can understand the nuances that might be glossed over in the video.

14. **Material Lists**  
    As a DIY enthusiast, I want the AI to extract a complete list of materials mentioned in the video so that I can prepare everything before starting.

15. **Time Estimates**  
    As a project planner, I want time estimates for each step so that I can better plan my schedule around the task.

## Admin & System Management

16. **Prompt Management**  
    As an administrator, I want to modify the system prompts sent to OpenAI so that I can optimize the document generation process.

17. **Usage Analytics**  
    As a business owner, I want to see usage statistics so that I can make informed decisions about scaling and resource allocation.

18. **User Management**  
    As an administrator, I want to manage user accounts and subscription levels so that I can provide appropriate customer support.

## SEO & Content Discoverability 

19. **SEO Optimization**  
    As a content creator, I want my public documents to be SEO-optimized so that others can discover my content through search engines.

20. **Content Discovery**  
    As a user, I want to discover public documents created by others so that I can find useful guides without processing videos myself.
# UX functionality

## Design Language
- Use https://21st.dev/originui for components
- Clean, modern design
## Landing Page 
- See V0.dev for design
- Include recently created document spotlight pages with SEO on them

### Key Features
### Submit URL
- Takes the user to the login or account registration

### Login Button
- Enables user to login
- Reset password and register
- Design based on https://21st.dev/originui
- Configured into Authentication flow

### User Login Frame
- Use https://21st.dev/originui/dialog/sign-up-dialog
- If successful, establish active session and send to dashboard
- If unsuccessful, error message inc reset PW link
- Reset PW link direct to reset PW link

## Create Account Page
- https://21st.dev/originui/dialog/sign-up-dialog

## Dashboard
- User to submit Youtube url into a text field
- User able access account settings
- User able to access doc library
- User to access documentation
- See V0.dev

## Document Review/Edit Page
- Central pane for user to edit document
- Formatting panel
- Panels to toggle on/off different features - feature organized by plan, plans available based on user subscription

## Internal Admin Portal
- Retrieve user profiles
- Retrieve documents produced
- Retrieve costs analysis
- View/edit/write all Databases
- Manage prompts and schemas
- Manage profile/plan features - free/pro/premium
- Version control

# Testing Strategy
## Components:
- Unit Testing Framework
- Integration Testing Suite
- End-to-End (E2E) Testing System
- Performance Testing Tools
- Security Validation Checks

## Features:

### Automated Testing Pipeline
- **Unit Tests**: Use Jest/Vitest to test core logic, including:
  - Video validation logic.
  - OpenAI response parsing and JSON output generation.
- **Integration Tests**: Validate interactions between key components, such as:
  - AssemblyAI transcription → OpenAI analysis pipeline.
  - Subscription-based feature toggling in the document editor.
- **End-to-End (E2E) Tests**: Use Cypress to simulate critical user flows:
  - User authentication (signup → verification → login).
  - YouTube video submission → transcription → document generation.
  - Subscription upgrades and feature access validation

### Performance Validation
- **Load Testing**: Use k6 to test the video processing pipeline under high traffic.
- **Frontend Performance**: Conduct Lighthouse audits to ensure optimal page load times and responsiveness.
- **API Response Monitoring**: Track response times for AssemblyAI and OpenAI integrations.

### 3. Security Testing
- **Vulnerability Scans**: Run OWASP ZAP scans to identify common security issues.
- **Supabase RLS Validation**: Ensure Row Level Security policies are correctly applied to protect user data.
- **Session Management Tests**: Validate secure session handling, including token expiration and logout flows.

### 4. User Acceptance Testing (UAT)
- Conduct real-user testing for key scenarios:
  - Free-tier users testing basic document creation workflows.
  - Pro-tier users testing advanced features like field toggling in the editor.
  - Enterprise users testing bulk processing capabilities.
- Collect feedback on usability, accessibility, and performance.

### 5. Continuous Monitoring
- **Error Tracking**: Use Sentry to capture and analyze runtime errors.
- **Real User Monitoring (RUM)**: Implement LogRocket to track user behavior and identify UX bottlenecks.
- **Supabase Insights**: Monitor database performance and query efficiency.

### 6. Test Data Management
- Curate a set of diverse YouTube video test cases:
  - Short videos (2–5 minutes) for quick processing validation.
  - Long-form videos (45+ minutes) for stress testing transcription pipelines.
  - Multi-language videos to validate language support and transcription accuracy.
- Include edge cases such as:
  - Poor audio quality videos.
  - Vertical vs. landscape video formats.
# Documentation Links: Links to official documentation for technologies
https://21st.dev/originui

Assembly AI - https://www.assemblyai.com/docs/guides/transcribe_youtube_videos
Supabase MCP - https://cursor.directory/mcp/supabase
Supabase Auth - https://supabase.com/docs/guides/auth
Open AI - https://platform.openai.com/docs/api-reference/introduction
