export const DEFAULT_OUTPUT_SCHEMA = {
  type: 'object',
  required: ['title', 'summary', 'sections'],
  properties: {
    title: {
      type: 'string',
      description: 'The title of the tutorial'
    },
    summary: {
      type: 'string',
      description: 'A brief overview of what the tutorial covers'
    },
    sections: {
      type: 'array',
      items: {
        type: 'object',
        required: ['title', 'content', 'steps'],
        properties: {
          title: {
            type: 'string',
            description: 'Section title'
          },
          content: {
            type: 'string',
            description: 'Section overview'
          },
          steps: {
            type: 'array',
            items: {
              type: 'object',
              required: ['description', 'details'],
              properties: {
                description: {
                  type: 'string',
                  description: 'Step description'
                },
                details: {
                  type: 'string',
                  description: 'Detailed explanation of the step'
                },
                duration: {
                  type: 'string',
                  description: 'Estimated time for this step (optional)'
                },
                materials: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  description: 'Required materials or tools (optional)'
                }
              }
            }
          }
        }
      }
    },
    difficulty: {
      type: 'string',
      enum: ['beginner', 'intermediate', 'advanced'],
      description: 'The difficulty level of the tutorial'
    },
    keywords: {
      type: 'array',
      items: {
        type: 'string'
      },
      description: 'Relevant keywords for searchability'
    }
  }
}; 