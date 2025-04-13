'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JsonSchemaManager } from "@/components/json-schema-manager";
import { PromptManager } from "@/components/prompt-manager";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .single();

      if (!roles || roles.role !== 'admin') {
        router.push('/dashboard');
      }
    };

    checkAdminAccess();
  }, [router]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Portal</h1>
      
      <Tabs defaultValue="prompts" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="prompts">System Prompts</TabsTrigger>
          <TabsTrigger value="schemas">JSON Schemas</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="prompts">
          <Card className="p-6">
            <PromptManager />
          </Card>
        </TabsContent>
        
        <TabsContent value="schemas">
          <Card className="p-6">
            <JsonSchemaManager />
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">User Management</h2>
            <p>User management features coming soon...</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 