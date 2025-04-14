'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Toolbar } from './toolbar';
import { useDocument } from './hooks/use-document';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { jsonToEditorContent } from './transformers/json-to-content';
import { contentToJson } from './transformers/content-to-json';
import { validateVideoContent, type VideoContent } from './transformers/schema-validator';
import { useToast } from '@/hooks/use-toast';
import { useFeatureToggles } from '@/lib/stores/feature-toggles';
import { useEffect } from 'react';

interface DocumentEditorProps {
  initialContent?: VideoContent | string;
  onSave?: (content: VideoContent) => void;
  readOnly?: boolean;
}

export function DocumentEditor({
  initialContent = '',
  onSave,
  readOnly = false,
}: DocumentEditorProps) {
  const { toast } = useToast();
  const features = useFeatureToggles();
  
  const { isSaving, saveDocument } = useDocument({
    onSave: async (content: string) => {
      if (onSave) {
        try {
          const jsonContent = contentToJson(content);
          const validation = validateVideoContent(jsonContent);
          
          if (!validation.success) {
            toast({
              title: 'Validation Error',
              description: validation.error,
              variant: 'destructive',
            });
            return;
          }

          onSave(validation.data);
        } catch (error) {
          console.error('Error converting content to JSON:', error);
          toast({
            title: 'Error',
            description: 'Failed to save document',
            variant: 'destructive',
          });
        }
      }
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Start typing or paste your content here...',
      }),
    ],
    content: typeof initialContent === 'string' 
      ? initialContent 
      : jsonToEditorContent(initialContent, features),
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      saveDocument(content);
    },
  });

  // Update editor content when features change
  useEffect(() => {
    if (editor && typeof initialContent !== 'string') {
      const content = jsonToEditorContent(initialContent, features);
      editor.commands.setContent(content);
    }
  }, [editor, initialContent, features]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="p-4">
      {!readOnly && <Toolbar editor={editor} />}
      <EditorContent editor={editor} className="prose max-w-none" />
      {isSaving && (
        <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving...
        </div>
      )}
    </Card>
  );
} 