'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JsonSchemaManager } from "@/components/json-schema-manager";
import { Card } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <Card className="p-6">
      <Tabs defaultValue="schemas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schemas">JSON Schemas</TabsTrigger>
          <TabsTrigger value="prompts">System Prompts</TabsTrigger>
        </TabsList>
        <TabsContent value="schemas">
          <JsonSchemaManager />
        </TabsContent>
        <TabsContent value="prompts">
          <div className="text-muted-foreground">
            Prompt Manager coming soon...
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
} 