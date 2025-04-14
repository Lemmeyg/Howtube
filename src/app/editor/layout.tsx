import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Document Editor - Howtube',
  description: 'Edit and manage your video transcriptions',
};

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1">{children}</main>
    </div>
  );
} 