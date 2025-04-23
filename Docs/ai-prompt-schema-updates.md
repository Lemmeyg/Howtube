# Updating AI Prompt and Schema

## Overview
This document outlines the process for updating the OpenAI prompt and schema used in the video pipeline process.

## Current Implementation

### OpenAI Model
- Model: gpt-4o-mini
- Configuration in `src/lib/openai.ts`
- Default settings:
  - Max Tokens: 4000
  - Temperature: 0.7

### Current Schema
Located in `src/components/document-editor/transformers/schema-validator.ts`:
```typescript
const videoContentSchema = {
  title: string,
  summary: string,
  sections: [
    {
      title: string,
      content: string,
      steps: [
        {
          description: string,
          details: string,
          title?: string,
          duration?: string,
          materials?: string[]
        }
      ]
    }
  ],
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  keywords: string[],
  materials?: [
    {
      name: string,
      quantity?: string,
      notes?: string
    }
  ],
  timeEstimate?: string
}
```

### Current Prompt Structure
Located in `src/lib/services/openai.ts`:
```typescript
const chunkPrompt = `
  ${systemPrompt}
  
  ${chunks.length > 1 ? `This is part ${i + 1} of ${chunks.length} of the transcription.
  ${isFirstChunk ? 'Focus on the introduction and first sections.' :
    isLastChunk ? 'Focus on concluding sections and overall summary.' :
    'Focus on the content in this section.'}` : ''}

  You MUST format your response exactly according to this JSON schema:
  ${JSON.stringify(outputSchema, null, 2)}

  Guidelines:
  1. The response must be valid JSON that matches the schema exactly
  2. All required fields must be included
  3. Break down the content into logical sections
  4. Each section should have clear, actionable steps
  5. Include specific materials needed for each step
  6. Estimate durations for steps when possible
  7. Set an appropriate difficulty level
  8. Add relevant keywords for searchability
`;
```

## Update Process

### 1. Schema Updates
1. Modify the schema in `src/components/document-editor/transformers/schema-validator.ts`
2. Update the Zod validation schema
3. Update TypeScript types if needed
4. Test the schema with sample data

### 2. Prompt Updates
1. Modify the prompt template in `src/lib/services/openai.ts`
2. Update the system prompt if needed
3. Add or modify guidelines
4. Update chunk handling instructions if needed

### 3. Editor Updates
If schema changes affect content display:
1. Update `jsonToEditorContent` in `src/components/document-editor/transformers/json-to-content.ts`
2. Update `contentToJson` in `src/components/document-editor/transformers/content-to-json.ts`
3. Test the editor with new content structure

### 4. Testing Process
1. Test with sample transcriptions
2. Verify OpenAI responses match new schema
3. Check editor display of new content
4. Validate error handling for invalid responses

## Best Practices

### Schema Updates
- Keep backward compatibility when possible
- Use clear, descriptive field names
- Include proper TypeScript types
- Add validation rules in Zod schema
- Document any breaking changes

### Prompt Updates
- Be specific about required format
- Include clear examples
- Specify handling of edge cases
- Maintain consistent formatting
- Test with various input lengths

### Testing
- Test with different video types
- Verify chunk handling
- Check error scenarios
- Validate schema enforcement
- Test editor rendering

## Rollback Plan
1. Keep previous schema version
2. Maintain previous prompt version
3. Document breaking changes
4. Prepare rollback instructions
5. Test rollback process

## Version Control
- Commit schema and prompt changes separately
- Include clear commit messages
- Document version changes
- Tag releases appropriately
- Update documentation with changes 