import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { FeatureAvailability } from '@/components/feature-availability';
import { getAvailableFeatures } from '@/lib/utils/feature-check';

export default async function FeaturesPage() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  const features = await getAvailableFeatures(user.id);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Available Features</h1>
      <FeatureAvailability />
    </div>
  );
} 