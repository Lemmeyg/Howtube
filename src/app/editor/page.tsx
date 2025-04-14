'use client';

import { DocumentEditor } from '@/components/document-editor';
import { FeatureToggles } from '@/components/document-editor/feature-toggles';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

export default function EditorPage() {
  const [content, setContent] = useState('');

  const handleSave = (newContent: string) => {
    console.log('Saving content:', newContent);
    setContent(newContent);
  };

  return (
    <div className="min-h-screen flex flex-col p-8">
      <h1 className="text-2xl font-bold mb-4">Document Editor</h1>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_300px] gap-4">
        <Card className="p-4 min-h-[calc(100vh-8rem)]">
          <DocumentEditor
            initialContent="<h1>Welcome to the Editor</h1><p>Start editing your document...</p>"
            onSave={handleSave}
          />
        </Card>
        <div className="space-y-4">
          <FeatureToggles />
        </div>
      </div>
    </div>
  );
} 