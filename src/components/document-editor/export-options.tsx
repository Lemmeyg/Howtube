'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileCode, FilePdf } from 'lucide-react';
import { useEditor } from '@tiptap/react';
import { useToast } from '@/components/ui/use-toast';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ExportOptionsProps {
  editorContent: string;
  title?: string;
}

export function ExportOptions({ editorContent, title = 'Document' }: ExportOptionsProps) {
  const { toast } = useToast();

  const exportAsPDF = async () => {
    try {
      // Create a temporary div to render the content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = editorContent;
      document.body.appendChild(tempDiv);

      // Convert to canvas
      const canvas = await html2canvas(tempDiv);
      document.body.removeChild(tempDiv);

      // Create PDF
      const pdf = new jsPDF();
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${title}.pdf`);

      toast({
        title: 'Success',
        description: 'Document exported as PDF',
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to export PDF',
        variant: 'destructive',
      });
    }
  };

  const exportAsDOCX = async () => {
    try {
      // Create a new document
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun(editorContent.replace(/<[^>]*>/g, '')),
              ],
            }),
          ],
        }],
      });

      // Generate the document
      const buffer = await Packer.toBlob(doc);
      saveAs(buffer, `${title}.docx`);

      toast({
        title: 'Success',
        description: 'Document exported as DOCX',
      });
    } catch (error) {
      console.error('Error exporting DOCX:', error);
      toast({
        title: 'Error',
        description: 'Failed to export DOCX',
        variant: 'destructive',
      });
    }
  };

  const exportAsMarkdown = () => {
    try {
      // Convert HTML to Markdown
      const markdown = editorContent
        .replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n')
        .replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n')
        .replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n')
        .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
        .replace(/<ul>(.*?)<\/ul>/gs, (_, content) => 
          content.replace(/<li>(.*?)<\/li>/g, '- $1\n')
        )
        .replace(/<ol>(.*?)<\/ol>/gs, (_, content) => 
          content.replace(/<li>(.*?)<\/li>/g, (match, p1, index) => `${index + 1}. ${p1}\n`)
        )
        .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
        .replace(/<em>(.*?)<\/em>/g, '*$1*')
        .replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)')
        .replace(/<[^>]*>/g, '')
        .replace(/\n{3,}/g, '\n\n');

      // Create and download the file
      const blob = new Blob([markdown], { type: 'text/markdown' });
      saveAs(blob, `${title}.md`);

      toast({
        title: 'Success',
        description: 'Document exported as Markdown',
      });
    } catch (error) {
      console.error('Error exporting Markdown:', error);
      toast({
        title: 'Error',
        description: 'Failed to export Markdown',
        variant: 'destructive',
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportAsPDF}>
          <FilePdf className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsDOCX}>
          <FileText className="mr-2 h-4 w-4" />
          Export as DOCX
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsMarkdown}>
          <FileCode className="mr-2 h-4 w-4" />
          Export as Markdown
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 