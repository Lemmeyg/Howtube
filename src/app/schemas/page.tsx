'use client';

import { JsonSchemaManager } from '@/components/json-schema-manager';

export default function SchemasPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">JSON Schemas</h1>
      <JsonSchemaManager />
    </div>
  );
} 