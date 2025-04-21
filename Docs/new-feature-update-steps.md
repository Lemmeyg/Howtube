# Adding New Features to the Application

This document outlines the steps required to add new features to the application's feature configuration system.

## 1. Database Updates

### 1.1 Update Feature Enum Type
First, add the new feature to the `feature_name` enum type in Supabase:

```sql
-- Add new feature to feature_name enum
ALTER TYPE feature_name ADD VALUE IF NOT EXISTS 'your_new_feature_name';
```

### 1.2 Add Feature Configurations
Insert the feature configurations for each subscription tier:

```sql
-- Add feature configurations for each tier
INSERT INTO feature_configs (tier, feature, enabled)
VALUES
  ('free', 'your_new_feature_name', false),
  ('pro', 'your_new_feature_name', false),
  ('enterprise', 'your_new_feature_name', false);
```

## 2. TypeScript Type Updates

### 2.1 Update FeatureName Type
Add the new feature to the `FeatureName` type in `src/types/feature-config.ts`:

```typescript
export type FeatureName = 
  | 'transcription' 
  | 'aiProcessing' 
  | 'export' 
  | 'collaboration' 
  | 'customBranding'
  | 'your_new_feature_name';  // Add your new feature here
```

## 3. UI Updates

### 3.1 Add Feature Display Name
Add the feature display name in `src/components/document-editor/feature-toggles.tsx`:

```typescript
const FEATURE_DISPLAY_NAMES: Record<FeatureName, string> = {
  transcription: 'Transcription',
  aiProcessing: 'AI Processing',
  export: 'Export',
  collaboration: 'Collaboration',
  customBranding: 'Custom Branding',
  your_new_feature_name: 'Your Feature Display Name'  // Add your new feature here
};
```

### 3.2 Update Feature List
If needed, add the feature to the `ALL_FEATURES` array in the same file:

```typescript
const ALL_FEATURES: FeatureName[] = [
  'transcription',
  'aiProcessing',
  'export',
  'collaboration',
  'customBranding',
  'your_new_feature_name'  // Add your new feature here
];
```

## 4. Feature Implementation

### 4.1 Add Feature Hook (if needed)
If the feature requires specific functionality, create a new hook in `src/components/ui/use-feature-name.ts`:

```typescript
export function useYourFeature() {
  const { checkFeature } = useFeatureAvailability();
  const isEnabled = checkFeature('your_new_feature_name');

  // Add your feature-specific logic here

  return {
    isEnabled,
    // Add other feature-specific properties/functions
  };
}
```

### 4.2 Add Feature Component (if needed)
If the feature requires a UI component, create it in `src/components/features/your-feature-name.tsx`:

```typescript
export function YourFeatureComponent() {
  const { isEnabled } = useYourFeature();

  if (!isEnabled) {
    return null;
  }

  return (
    // Your feature UI implementation
  );
}
```

## 5. Testing

1. Verify the feature is correctly added to the database
2. Check feature availability for each subscription tier
3. Test feature toggle functionality in the admin interface
4. Verify feature UI components are displayed correctly
5. Test feature functionality for each subscription tier

## Notes

- Feature names should be camelCase in TypeScript/JavaScript
- Feature names in the database should match exactly with the TypeScript types
- Always test feature availability across all subscription tiers
- Consider adding feature documentation for users
- Update relevant test files if they contain feature-related assertions

## Example

Here's a complete example of adding an 'analytics' feature:

```sql
-- Database Updates
ALTER TYPE feature_name ADD VALUE IF NOT EXISTS 'analytics';

INSERT INTO feature_configs (tier, feature, enabled)
VALUES
  ('free', 'analytics', false),
  ('pro', 'analytics', true),
  ('enterprise', 'analytics', true);
```

```typescript
// TypeScript Updates
export type FeatureName = 'transcription' | 'aiProcessing' | 'export' | 'collaboration' | 'customBranding' | 'analytics';

// UI Updates
const FEATURE_DISPLAY_NAMES: Record<FeatureName, string> = {
  // ... existing features ...
  analytics: 'Analytics Dashboard'
};

const ALL_FEATURES: FeatureName[] = [
  // ... existing features ...
  'analytics'
];
``` 