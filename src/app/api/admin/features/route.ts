import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { FeatureConfigService } from '@/lib/services/feature-config';
import { FeatureConfig } from '@/types/feature-config';

const featureConfigService = new FeatureConfigService();

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const configs = await featureConfigService.getFeatureConfigs();
    return NextResponse.json(configs);
  } catch (error) {
    console.error('Error fetching feature configs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate request body
    if (!Array.isArray(body) || !body.every(isValidFeatureConfig)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    await featureConfigService.updateFeatureConfigs(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating feature configs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function isValidFeatureConfig(config: any): config is FeatureConfig {
  return (
    typeof config === 'object' &&
    config !== null &&
    typeof config.id === 'string' &&
    typeof config.tier === 'string' &&
    ['free', 'pro', 'enterprise'].includes(config.tier) &&
    typeof config.feature === 'string' &&
    ['transcription', 'aiProcessing', 'export', 'collaboration', 'customBranding'].includes(config.feature) &&
    typeof config.enabled === 'boolean' &&
    typeof config.created_at === 'string' &&
    typeof config.updated_at === 'string'
  );
} 