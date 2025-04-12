# TypeScript Application Architecture for YouTube Transcription App

```
project-root/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   ├── sign-in/
│   │   │   │   └── page.tsx
│   │   │   ├── sign-up/
│   │   │   │   └── page.tsx
│   │   │   ├── reset-password/
│   │   │   │   └── page.tsx
│   │   │   ├── callback/
│   │   │   │   └── page.tsx
│   │   │   ├── update-password/
│   │   │   │   └── page.tsx
│   │   │   └── env-test/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── document/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   └── documents/
│   │   │       └── page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── prompts/
│   │   │   │   └── page.tsx
│   │   │   ├── json-schema/
│   │   │   │   └── page.tsx
│   │   │   ├── users/
│   │   │   │   └── page.tsx
│   │   │   └── analytics/
│   │   │       └── page.tsx
│   │   └── api/
│   │       ├── auth/
│   │       │   └── route.ts
│   │       ├── transcription/
│   │       │   ├── route.ts
│   │       │   └── status/
│   │       │       └── route.ts
│   │       ├── openai/
│   │       │   └── process/
│   │       │       └── route.ts
│   │       ├── documents/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       └── route.ts
│   │       └── admin/
│   │           ├── prompts/
│   │           │   └── route.ts
│   │           ├── schema/
│   │           │   └── route.ts
│   │           └── users/
│   │               └── route.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── form.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── toast.tsx
│   │   │   └── loader.tsx
│   │   ├── auth/
│   │   │   ├── sign-in-form.tsx
│   │   │   ├── sign-up-form.tsx
│   │   │   ├── reset-password-form.tsx
│   │   │   └── user-profile.tsx
│   │   ├── dashboard/
│   │   │   ├── url-form.tsx
│   │   │   ├── document-card.tsx
│   │   │   └── progress-indicator.tsx
│   │   ├── editor/
│   │   │   ├── tiptap-editor.tsx
│   │   │   ├── toolbar.tsx
│   │   │   ├── feature-toggle.tsx
│   │   │   └── sidebar.tsx
│   │   ├── admin/
│   │   │   ├── prompt-editor.tsx
│   │   │   ├── json-editor.tsx
│   │   │   ├── user-table.tsx
│   │   │   └── analytics-display.tsx
│   │   └── layout/
│   │       ├── navbar.tsx
│   │       ├── footer.tsx
│   │       └── sidebar-nav.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── supabase.ts
│   │   │   ├── assembly-ai.ts
│   │   │   └── openai.ts
│   │   ├── utils/
│   │   │   ├── url-validation.ts
│   │   │   ├── formatting.ts
│   │   │   ├── date-utils.ts
│   │   │   └── error-handling.ts
│   │   └── types/
│   │       ├── database.types.ts
│   │       ├── document.types.ts
│   │       ├── user.types.ts
│   │       └── api.types.ts
│   ├── contexts/
│   │   ├── auth-context.tsx
│   │   ├── editor-context.tsx
│   │   └── feature-context.tsx
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── transcription.service.ts
│   │   ├── openai.service.ts
│   │   ├── document.service.ts
│   │   ├── feature.service.ts
│   │   └── admin.service.ts
│   ├── styles/
│   │   ├── globals.css
│   │   └── themes.css
│   └── config/
│       ├── constants.ts
│       ├── editor-config.ts
│       └── feature-config.ts
├── public/
│   ├── favicon.ico
│   └── images/
├── Docs/
│   └── Architecture.md
├── .env.local
├── .gitignore
├── next.config.js
├── package.json
├── README.md
├── tsconfig.json
├── postcss.config.mjs
└── eslint.config.mjs
```

## Database Schema (Supabase)

```
Database Tables:
├── users
│   ├── id (PK)
│   ├── email
│   ├── created_at
│   ├── updated_at
│   └── subscription_tier
├── documents
│   ├── id (PK)
│   ├── user_id (FK -> users.id)
│   ├── title
│   ├── content
│   ├── video_url
│   ├── created_at
│   ├── updated_at
│   └── is_public
├── transcriptions
│   ├── id (PK)
│   ├── document_id (FK -> documents.id)
│   ├── raw_text
│   ├── status
│   ├── created_at
│   └── updated_at
├── prompts
│   ├── id (PK)
│   ├── name
│   ├── content
│   ├── created_at
│   └── updated_at
├── json_schemas
│   ├── id (PK)
│   ├── name
│   ├── schema
│   ├── created_at
│   └── updated_at
├── feature_flags
│   ├── id (PK)
│   ├── name
│   ├── description
│   ├── enabled
│   └── required_tier
└── subscriptions
    ├── id (PK)
    ├── user_id (FK -> users.id)
    ├── stripe_id
    ├── tier
    ├── status
    ├── created_at
    └── updated_at
```

## Key Architecture Principles

1. **Feature-Based Organization**: Code is organized primarily by feature/domain rather than by technical role
2. **Type Safety**: Strong TypeScript typing throughout the application
3. **Separation of Concerns**: Clear boundaries between UI, business logic, and data access
4. **Reusability**: Components and utilities designed for reuse
5. **Testability**: Structure supports easy unit and integration testing

## Directory Structure Explanation

### Root Structure

- **`howtube/`**: Main application directory
  - **`src/`**: Contains all application source code
    - **`app/`**: Next.js 14 app router structure
    - **`components/`**: Reusable UI components
    - **`lib/`**: Shared utilities and types
    - **`contexts/`**: React context providers
    - **`services/`**: Business logic and API interactions
    - **`styles/`**: Global styles and themes
    - **`config/`**: Application configuration
  - **`public/`**: Static assets
  - **`package.json`**: Project dependencies and scripts

### App Directory (Routes)

- **`app/(auth)/`**: Authentication-related pages (sign-in, sign-up, password reset)
- **`app/(dashboard)/`**: Main application pages (dashboard, document editing)
- **`app/admin/`**: Admin portal pages
- **`app/api/`**: API route handlers for server functions

### Components Directory

- **`components/ui/`**: Primitive UI components (buttons, inputs, etc.)
- **`components/auth/`**: Authentication-specific components
- **`components/dashboard/`**: Dashboard and document list components
- **`components/editor/`**: TipTap editor and related components
- **`components/admin/`**: Admin interface components
- **`components/layout/`**: Layout components (navbar, footer, etc.)

### Library Directory

- **`lib/api/`**: API client utilities (Supabase, AssemblyAI, OpenAI)
- **`lib/utils/`**: Helper functions and utilities
- **`lib/types/`**: TypeScript type definitions

### Contexts Directory

- **`contexts/auth-context.tsx`**: Manages authentication state throughout the app
- **`contexts/editor-context.tsx`**: Manages editor state and operations
- **`contexts/feature-context.tsx`**: Controls feature flag visibility based on subscription

### Services Directory

- Service files for business logic and data operations
- Each service aligns with a specific domain (auth, transcription, etc.)

## Key Files and Their Purpose

- **`middleware.ts`**: Handles authentication and route protection
- **`auth-context.tsx`**: Manages authentication state throughout the app
- **`supabase.ts`**: Supabase client configuration and initialization
- **`transcription.service.ts`**: Handles YouTube URL validation and AssemblyAI integration
- **`openai.service.ts`