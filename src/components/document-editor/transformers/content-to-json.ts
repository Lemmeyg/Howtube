import { DOMParser } from 'prosemirror-model';

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

export function contentToJson(html: string): VideoContent {
  // Create a temporary div to parse HTML
  const div = document.createElement('div');
  div.innerHTML = html;

  const result: VideoContent = {};

  // Extract title
  const h1 = div.querySelector('h1');
  if (h1) {
    result.title = h1.textContent || undefined;
  }

  // Extract description (first p after h1)
  const firstP = div.querySelector('h1 + p');
  if (firstP) {
    result.description = firstP.textContent || undefined;
  }

  // Extract metadata
  const metadata = div.querySelector('.metadata');
  if (metadata) {
    const difficultyEl = metadata.querySelector('p:contains("Difficulty:")');
    const timeEstimateEl = metadata.querySelector('p:contains("Time Estimate:")');

    if (difficultyEl) {
      const difficulty = difficultyEl.textContent?.split(':')[1]?.trim();
      if (difficulty) {
        result.difficulty = difficulty as 'beginner' | 'intermediate' | 'advanced';
      }
    }

    if (timeEstimateEl) {
      result.timeEstimate = timeEstimateEl.textContent?.split(':')[1]?.trim();
    }
  }

  // Extract materials
  const materialsSection = Array.from(div.querySelectorAll('h2')).find(h2 => 
    h2.textContent?.toLowerCase().includes('materials')
  );
  if (materialsSection) {
    const materialsList = materialsSection.nextElementSibling;
    if (materialsList?.tagName === 'UL') {
      result.materials = Array.from(materialsList.querySelectorAll('li')).map(li => {
        const text = li.textContent || '';
        const quantity = text.match(/\((.*?)\)/)?.[1];
        const notes = text.split('-')[1]?.trim();
        const name = text
          .replace(/\((.*?)\)/, '')
          .split('-')[0]
          .trim();

        return {
          name,
          ...(quantity && { quantity }),
          ...(notes && { notes }),
        };
      });
    }
  }

  // Extract sections
  result.sections = [];
  let currentSection: typeof result.sections[0] | null = null;

  Array.from(div.children).forEach(element => {
    if (element.tagName === 'H2' && !element.textContent?.toLowerCase().includes('materials')) {
      if (currentSection) {
        result.sections?.push(currentSection);
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
        const step = {
          title: li.querySelector('h4')?.textContent || '',
          description: li.querySelector('p:not(.duration)')?.textContent || '',
          duration: li.querySelector('.duration')?.textContent?.match(/Duration: (.*)/)?.[1],
          materials: Array.from(li.querySelectorAll('ul li')).map(material => 
            material.textContent || ''
          ),
        };
        return step;
      });
    }
  });

  if (currentSection) {
    result.sections?.push(currentSection);
  }

  // Extract keywords
  const keywordsSection = div.querySelector('.keywords');
  if (keywordsSection) {
    result.keywords = Array.from(keywordsSection.querySelectorAll('li')).map(li => 
      li.textContent || ''
    );
  }

  return result;
} 