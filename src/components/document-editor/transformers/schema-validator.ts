import { z } from 'zod';

// Define the schema using Zod
const stepSchema = z.object({
  description: z.string(),
  details: z.string(),
  title: z.string().optional(),
  duration: z.string().optional(),
  materials: z.array(z.string()).optional(),
});

const sectionSchema = z.object({
  title: z.string(),
  content: z.string(),
  steps: z.array(stepSchema),
});

const materialSchema = z.object({
  name: z.string(),
  quantity: z.string().optional(),
  notes: z.string().optional(),
});

export const videoContentSchema = z.object({
  title: z.string(),
  summary: z.string(),
  sections: z.array(sectionSchema),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  keywords: z.array(z.string()),
  materials: z.array(materialSchema).optional(),
  timeEstimate: z.string().optional(),
});

export type VideoContent = z.infer<typeof videoContentSchema>;

export function validateVideoContent(data: unknown): {
  success: boolean;
  data?: VideoContent;
  error?: string;
} {
  try {
    const validatedData = videoContentSchema.parse(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
      };
    }
    return {
      success: false,
      error: 'Invalid data structure',
    };
  }
} 