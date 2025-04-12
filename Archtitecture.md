# TypeScript Application Architecture for YouTube Transcription App

```
project-root/
├── .env.local
├── .gitignore
├── next.config.js
├── package.json
├── README.md
├── tsconfig.json
├── public/
│   ├── favicon.ico
│   └── images/
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── (auth)/
    │   │   ├── layout.tsx
    │   │   ├── login/
    │   │   │   └── page.tsx
    │   │   ├── register/
    │   │   │   └── page.tsx
    │   │   ├── reset-password/
    │   │   │   └── page.tsx
    │   │   └── verify/
    │   │       └── page.tsx
    │   ├── (dashboard)/
    │   │   ├── layout.tsx
    │   │   ├── dashboard/
    │   │   │   └── page.tsx
    │   │   ├── document/
    │   │   │   ├── [id]/
    │   │   │   │   └── page.tsx
    │   │   │   └── new/
    │   │   │       └── page.tsx
    │   │   └── documents/
    │   │       └── page.tsx
    │   ├── admin/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   ├── prompts/
    │   │   │   └── page.tsx
    │   │   ├── json-schema/
    │   │   │   └── page.tsx
    │   │   ├── users/
    │   │   │   └── page.tsx
    │   │   └── analytics/
    │   │       └── page.tsx
    │   └── api/
    │       ├── auth/
    │       │   └── route.ts
    │       ├── transcription/
    │       │   ├── route.ts
    │       │   └── status/
    │       │       └── route.ts
    │       ├── openai/
    │       │   └── process/
    │       │       └── route.ts
    │       ├── documents/
    │       │   ├── route.ts
    │       │   └── [id]/
    │       │       └── route.ts
    │       └── admin/
    │           ├── prompts/
    │           │   └── route.ts
    │           ├── schema/
    │           │   └── route.ts
    │           └── users/
    │               └── route.ts
    ├── components/
    │   ├── ui/
    │   │   ├── button.tsx
    │   │   ├── input.tsx
    │   │   ├── form.tsx
    │   │   ├── modal.tsx
    │   │   ├── toast.tsx
    │   │   └── loader.tsx
    │   ├── auth/
    │   │   ├── login-form.tsx
    │   │   ├── register-form.tsx
    │   │   └── reset-form.tsx
    │   ├── dashboard/
    │   │   ├── url-form.tsx
    │   │   ├── document-card.tsx
    │   │   └── progress-indicator.tsx
    │   ├── editor/
    │   │   ├── tiptap-editor.tsx
    │   │   ├── toolbar.tsx
    │   │   ├── feature-toggle.tsx
    │   │   └── sidebar.tsx
    │   ├── admin/
    │   │   ├── prompt-editor.tsx
    │   │   ├── json-editor.tsx
    │   │   ├── user-table.tsx
    │   │   └── analytics-display.tsx
    │   └── layout/
    │       ├── navbar.tsx
    │       ├── footer.tsx
    │       └── sidebar-nav.tsx
    ├── lib/
    │   ├── api/
    │   │   ├── supabase.ts
    │   │   ├── assembly-ai.ts
    │   │   └── openai.ts
    │   ├── utils/
    │   │   ├── url-validation.ts
    │   │   ├── formatting.ts
    │   │   ├── date-utils.ts
    │   │   └── error-handling.ts
    │   ├── hooks/
    │   │   ├── use-auth.ts
    │   │   ├── use-document.ts
    │   │   ├── use-transcription.ts
    │   │   └── use-feature-flags.ts
    │   ├── context/
    │   │   ├── auth-provider.tsx
    │   │   ├── editor-provider.tsx
    │   │   └── feature-provider.tsx
    │   └── types/
    │       ├── database.types.ts
    │       ├── document.types.ts
    │       ├── user.types.ts
    │       └── api.types.ts
    ├── services/
    │   ├── auth.service.ts
    │   ├── transcription.service.ts
    │   ├── openai.service.ts
    │   ├── document.service.ts
    │   ├── feature.service.ts
    │   └── admin.service.ts
    ├── styles/
    │   ├── globals.css
    │   └── themes.css
    └── config/
        ├── constants.ts
        ├── editor-config.ts
        └── feature-config.ts
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

- **`src/`**: Contains all application source code
  - **`app/`**: Next.js 14 app router structure
  - **`components/`**: Reusable UI components
  - **`lib/`**: Shared utilities, hooks, and types
  - **`services/`**: Business logic and API interactions
  - **`styles/`**: Global styles and themes
  - **`config/`**: Application configuration

### App Directory (Routes)

- **`app/(auth)/`**: Authentication-related pages (login, register, etc.)
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
- **`lib/hooks/`**: Custom React hooks
- **`lib/context/`**: React context providers
- **`lib/types/`**: TypeScript type definitions

### Services Directory

- Service files for business logic and data operations
- Each service aligns with a specific domain (auth, transcription, etc.)

## Key Files and Their Purpose

- **`auth-provider.tsx`**: Manages authentication state throughout the app
- **`feature-provider.tsx`**: Controls feature flag visibility based on subscription
- **`transcription.service.ts`**: Handles YouTube URL validation and AssemblyAI integration
- **`openai.service.ts`**: Manages communication with OpenAI API
- **`document.service.ts`**: Handles document CRUD operations
- **`tiptap-editor.tsx`**: Core document editing component
- **`feature-toggle.tsx`**: UI for toggling document sections based on permissions
