import { type FeatureToggles } from '@/lib/stores/feature-toggles';

interface VideoContent {
  title?: string;
  description?: string;
  sections?: {
    title: string;
    content: string;
    steps?: {
      title: string;
      description: string;
      duration?: string;
      materials?: string[];
    }[];
  }[];
  materials?: {
    name: string;
    quantity?: string;
    notes?: string;
  }[];
  timeEstimate?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  keywords?: string[];
}

export function jsonToEditorContent(json: VideoContent, features: FeatureToggles): string {
  let content = '';

  // Add title
  if (json.title) {
    content += `<h1>${json.title}</h1>`;
  }

  // Add description
  if (json.description) {
    content += `<p>${json.description}</p>`;
  }

  // Add difficulty and time estimate if available
  if ((features.showDifficulty && json.difficulty) || (features.showTimeEstimates && json.timeEstimate)) {
    content += '<div class="metadata">';
    if (features.showDifficulty && json.difficulty) {
      content += `<p><strong>Difficulty:</strong> ${json.difficulty}</p>`;
    }
    if (features.showTimeEstimates && json.timeEstimate) {
      content += `<p><strong>Time Estimate:</strong> ${json.timeEstimate}</p>`;
    }
    content += '</div>';
  }

  // Add materials section if available
  if (features.showMaterials && json.materials && json.materials.length > 0) {
    content += '<h2>Materials Needed</h2><ul>';
    json.materials.forEach(material => {
      let materialText = material.name;
      if (material.quantity) {
        materialText += ` (${material.quantity})`;
      }
      if (material.notes) {
        materialText += ` - ${material.notes}`;
      }
      content += `<li>${materialText}</li>`;
    });
    content += '</ul>';
  }

  // Add sections
  if (json.sections && json.sections.length > 0) {
    json.sections.forEach(section => {
      content += `<h2>${section.title}</h2>`;
      content += `<p>${section.content}</p>`;

      if (section.steps && section.steps.length > 0) {
        content += '<ol>';
        section.steps.forEach(step => {
          content += '<li>';
          content += `<h4>${step.title}</h4>`;
          content += `<p>${step.description}</p>`;
          if (features.showStepDurations && step.duration) {
            content += `<p class="duration"><em>Duration: ${step.duration}</em></p>`;
          }
          if (features.showStepMaterials && step.materials && step.materials.length > 0) {
            content += '<p><strong>Materials for this step:</strong></p><ul>';
            step.materials.forEach(material => {
              content += `<li>${material}</li>`;
            });
            content += '</ul>';
          }
          content += '</li>';
        });
        content += '</ol>';
      }
    });
  }

  // Add keywords if available
  if (features.showKeywords && json.keywords && json.keywords.length > 0) {
    content += '<div class="keywords">';
    content += '<h3>Keywords</h3>';
    content += '<ul>';
    json.keywords.forEach(keyword => {
      content += `<li>${keyword}</li>`;
    });
    content += '</ul></div>';
  }

  return content;
} 