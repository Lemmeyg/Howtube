import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { FeatureConfigManager } from '@/components/admin/feature-config-manager';

export default async function FeaturesPage() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Feature Configuration</h1>
      <FeatureConfigManager />
    </div>
  );
} 