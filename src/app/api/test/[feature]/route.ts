import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkFeatureAvailability } from '@/lib/utils/feature-check';

export async function GET(
  request: Request,
  { params }: { params: { feature: string } }
) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const featureMap: Record<string, keyof TierFeatures> = {
    'transcription': 'transcription',
    'ai-processing': 'aiProcessing',
    'export': 'export',
    'collaboration': 'collaboration',
    'custom-branding': 'customBranding',
  };

  const feature = featureMap[params.feature];
  if (!feature) {
    return NextResponse.json({ error: 'Invalid feature' }, { status: 400 });
  }

  const isEnabled = await checkFeatureAvailability(user.id, feature);
  if (!isEnabled) {
    return NextResponse.json(
      { error: 'Feature not available in your subscription tier' },
      { status: 403 }
    );
  }

  return NextResponse.json({ success: true });
} 