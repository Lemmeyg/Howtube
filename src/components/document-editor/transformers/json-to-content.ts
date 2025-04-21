import { type FeatureToggles } from '@/lib/stores/feature-toggles';
import { type VideoContent } from './schema-validator';

export function jsonToEditorContent(json: VideoContent, features: FeatureToggles): string {
  let content = '';

  // Add title
  if (json.title) {
    content += `<h1>${json.title}</h1>`;
  }

  // Add summary
  if (json.summary) {
    content += `<p>${json.summary}</p>`;
  }

  // Add difficulty if available
  if (features.showDifficulty && json.difficulty) {
    content += '<div class="metadata">';
    content += `<p><strong>Difficulty:</strong> ${json.difficulty}</p>`;
    content += '</div>';
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
          if (step.title) {
            content += `<h4>${step.title}</h4>`;
          }
          content += `<p>${step.description}</p>`;
          content += `<p>${step.details}</p>`;
          
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