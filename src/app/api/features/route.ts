import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('[Features API] Fetching feature configurations');
  
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('[Features API] Authentication error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Features API] User authenticated:', user.id);

    // Fetch all feature configurations
    const { data: configs, error: configError } = await supabase
      .from('feature_configs')
      .select('*')
      .order('tier', { ascending: true });

    if (configError) {
      console.error('[Features API] Error fetching configs:', configError);
      return NextResponse.json({ error: 'Failed to fetch feature configs' }, { status: 500 });
    }

    if (!configs || configs.length === 0) {
      console.warn('[Features API] No feature configurations found');
      return NextResponse.json([]);
    }

    console.log('[Features API] Successfully fetched configs:', configs);
    return NextResponse.json(configs);
  } catch (error) {
    console.error('[Features API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 