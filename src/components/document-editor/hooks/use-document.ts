import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

interface UseDocumentProps {
  onSave?: (content: string) => void;
  debounceTime?: number;
}

export function useDocument({ onSave, debounceTime = 1000 }: UseDocumentProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [content, setContent] = useState('');
  const debouncedContent = useDebounce(content, debounceTime);

  const saveDocument = useCallback(
    async (newContent: string) => {
      setContent(newContent);
    },
    []
  );

  useEffect(() => {
    if (debouncedContent && onSave) {
      setIsSaving(true);
      onSave(debouncedContent);
      setIsSaving(false);
    }
  }, [debouncedContent, onSave]);

  return {
    isSaving,
    saveDocument,
    content,
  };
} 