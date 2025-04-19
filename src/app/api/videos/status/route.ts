import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Store processing status in memory (you might want to use Redis in production)
const processingStatus = new Map<string, { progress: number; status: string }>();

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
  }

  // Create SSE response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send initial status if available
      const initialStatus = processingStatus.get(videoId);
      if (initialStatus) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialStatus)}\n\n`));
      }

      // Set up interval to check for updates
      const interval = setInterval(() => {
        const status = processingStatus.get(videoId);
        if (status) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(status)}\n\n`));
        }
      }, 1000);

      // Cleanup on client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

// Helper function to update status
export function updateVideoStatus(videoId: string, progress: number, status: string) {
  processingStatus.set(videoId, { progress, status });
} 