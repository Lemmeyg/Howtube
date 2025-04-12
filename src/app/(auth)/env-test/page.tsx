"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function EnvTestPage() {
  const [envVars, setEnvVars] = useState<{
    supabaseUrl: string | null
    supabaseAnonKey: string | null
  }>({
    supabaseUrl: null,
    supabaseAnonKey: null,
  })

  useEffect(() => {
    setEnvVars({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
  }, [])

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Environment Variables Test</CardTitle>
          <CardDescription>Verify environment variables are loaded correctly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Supabase URL:</p>
            <p className="text-sm text-muted-foreground">
              {envVars.supabaseUrl ? "✅ Loaded" : "❌ Not loaded"}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Supabase Anon Key:</p>
            <p className="text-sm text-muted-foreground">
              {envVars.supabaseAnonKey ? "✅ Loaded" : "❌ Not loaded"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 