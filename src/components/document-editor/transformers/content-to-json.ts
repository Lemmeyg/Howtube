import { DOMParser } from 'prosemirror-model';
import { type VideoContent } from './schema-validator';

export function contentToJson(html: string): VideoContent {
  // Create a temporary div to parse HTML
  const div = document.createElement('div');
  div.innerHTML = html;

  const result: VideoContent = {
    title: '',
    summary: '',
    sections: [],
    difficulty: 'beginner',
    keywords: []
  };

  // Extract title
  const h1 = div.querySelector('h1');
  if (h1) {
    result.title = h1.textContent || '';
  }

  // Extract summary (first p after h1)
  const firstP = div.querySelector('h1 + p');
  if (firstP) {
    result.summary = firstP.textContent || '';
  }

  // Extract metadata
  const metadata = div.querySelector('.metadata');
  if (metadata) {
    const difficultyEl = metadata.querySelector('p:contains("Difficulty:")');
    if (difficultyEl) {
      const difficulty = difficultyEl.textContent?.split(':')[1]?.trim();
      if (difficulty === 'beginner' || difficulty === 'intermediate' || difficulty === 'advanced') {
        result.difficulty = difficulty;
      }
    }
  }

  // Extract sections
  let currentSection: typeof result.sections[0] | null = null;

  Array.from(div.children).forEach(element => {
    if (element.tagName === 'H2') {
      if (currentSection) {
        result.sections.push(currentSection);
      }
      currentSection = {
        title: element.textContent || '',
        content: '',
        steps: [],
      };
    } else if (currentSection && element.tagName === 'P' && !element.classList.contains('duration')) {
      currentSection.content += (currentSection.content ? ' ' : '') + (element.textContent || '');
    } else if (currentSection && element.tagName === 'OL') {
      currentSection.steps = Array.from(element.querySelectorAll('li')).map(li => {
        const titleEl = li.querySelector('h4');
        const descriptionEl = li.querySelector('p:not(.duration)');
        const detailsEl = descriptionEl?.nextElementSibling;
        const durationEl = li.querySelector('.duration');
        const materialsUl = li.querySelector('ul');

        return {
          ...(titleEl?.textContent && { title: titleEl.textContent }),
          description: descriptionEl?.textContent || '',
          details: detailsEl?.textContent || '',
          ...(durationEl?.textContent && { 
            duration: durationEl.textContent.match(/Duration: (.*)/)?.[1] || ''
          }),
          ...(materialsUl && {
            materials: Array.from(materialsUl.querySelectorAll('li')).map(material => 
              material.textContent || ''
            )
          })
        };
      });
    }
  });

  if (currentSection) {
    result.sections.push(currentSection);
  }

  // Extract keywords
  const keywordsSection = div.querySelector('.keywords');
  if (keywordsSection) {
    result.keywords = Array.from(keywordsSection.querySelectorAll('li'))
      .map(li => li.textContent || '')
      .filter(keyword => keyword.length > 0);
  }

  return result;
} 