'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Clock, Eye, Search, Star, ThumbsUp, TrendingUp, Youtube, User } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Video {
  id: string;
  youtube_url: string;
  title: string;
  created_at: string;
  user_id: string;
  user_email: string;
  status: string;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      
      // Only fetch videos if user is logged in
      if (session) {
        fetchVideos();
      } else {
        setLoading(false); // Make sure to set loading to false if not fetching
      }
    };

    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase
          .from('videos')
          .select(`
            id,
            youtube_url,
            title,
            created_at,
            user_id,
            profiles:user_id (email)
          `)
          .order('created_at', { ascending: false })
          .limit(8);

        if (error) throw error;

        const formattedVideos = data.map(video => ({
          ...video,
          user_email: video.profiles?.email || 'Unknown User'
        }));

        setVideos(formattedVideos);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    // Store URL in session storage
    sessionStorage.setItem('pendingUrl', url);

    if (isLoggedIn) {
      // If logged in, redirect to dashboard
      router.push('/dashboard');
    } else {
      // If not logged in, redirect to sign in
      router.push('/sign-in');
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-2 items-center text-xl font-bold">
            <Youtube className="h-6 w-6 text-red-500" />
            <span>HowTube</span>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <Link
                href="#how-it-works"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                How It Works
              </Link>
              <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                Pricing
              </Link>
              <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                Blog
              </Link>
              {!isLoggedIn && (
                <>
                  <Button variant="outline" size="sm" className="ml-4" asChild>
                    <Link href="/sign-in">Log in</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/sign-up">Sign up</Link>
                  </Button>
                </>
              )}
              {isLoggedIn && (
                <Button size="sm" asChild>
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-mesh-gradient">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2 max-w-3xl">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                  Transform YouTube Tutorials
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Create Detailed Documentation from Videos
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Convert any YouTube tutorial into comprehensive, searchable documentation with AI-powered analysis.
                </p>
              </div>
              <div className="w-full max-w-2xl space-y-2 mt-4">
                <form onSubmit={handleSubmit} className="relative w-full p-1 rounded-xl bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20">
                  <div className="flex w-full items-center space-x-2 bg-card rounded-lg p-1 shadow-sm">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="url"
                        placeholder="Paste YouTube URL here..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full bg-white pl-10 pr-4 py-6 text-base border-0 focus-visible:ring-primary"
                      />
                    </div>
                    <Button type="submit" size="lg" className="px-8 shadow-sm">
                      Generate Docs
                    </Button>
                  </div>
                </form>
                <p className="text-xs text-muted-foreground">
                  {isLoggedIn ? 'Start creating documentation from YouTube videos.' : 'Sign up to start creating documentation from YouTube videos.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-20 bg-subtle-pattern">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <h2 className="text-2xl font-bold tracking-tighter md:text-3xl">Recently Created Docs</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground">
                Browse through the latest documentation created by our community.
              </p>
            </div>
            <div className="mt-8 overflow-hidden relative">
              <div className="flex space-x-4 animate-scroll hover:pause-animation">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="w-[300px] flex-shrink-0 shadow-md card-hover-effect bg-card border border-border/50">
                      <CardHeader className="p-4">
                        <div className="aspect-video w-full bg-accent rounded-md overflow-hidden relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Youtube className="h-10 w-10 text-red-500" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="h-6 w-3/4 bg-accent rounded animate-pulse" />
                        <div className="h-4 w-full bg-accent rounded mt-2 animate-pulse" />
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  videos.map((video) => (
                    <Card key={video.id} className="w-[300px] flex-shrink-0 shadow-md card-hover-effect bg-card border border-border/50">
                      <CardHeader className="p-4">
                        <div className="aspect-video w-full bg-accent rounded-md overflow-hidden relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Youtube className="h-10 w-10 text-red-500" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <CardTitle className="line-clamp-1 text-lg">{video.title || 'Untitled'}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-2">
                          {video.youtube_url}
                        </CardDescription>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-between items-center text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          <span>{new Date(video.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <User className="mr-1 h-3 w-3" />
                          <span>{video.user_email}</span>
                        </div>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-accent/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">How It Works</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground">
                Converting YouTube tutorials into documentation is simple with our three-step process.
              </p>

              <div className="mt-8 max-w-4xl mx-auto">
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card shadow-sm border border-border/50 hover:border-primary/20 transition-colors">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold mb-4">
                      1
                    </div>
                    <h3 className="text-xl font-medium mb-2">Paste a YouTube URL</h3>
                    <p className="text-muted-foreground">
                      Simply copy and paste the URL of any how-to YouTube video into our tool.
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card shadow-sm border border-border/50 hover:border-primary/20 transition-colors">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold mb-4">
                      2
                    </div>
                    <h3 className="text-xl font-medium mb-2">AI Analyzes Content</h3>
                    <p className="text-muted-foreground">
                      Our advanced AI watches the video, transcribes it, and extracts key information.
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card shadow-sm border border-border/50 hover:border-primary/20 transition-colors">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold mb-4">
                      3
                    </div>
                    <h3 className="text-xl font-medium mb-2">Get Documentation</h3>
                    <p className="text-muted-foreground">
                      Receive well-structured, searchable documentation with step-by-step instructions.
                    </p>
                  </div>
                </div>

                <div className="mt-10 flex justify-center">
                  <Button size="lg" className="gap-2 bg-primary/90 hover:bg-primary" asChild>
                    <Link href="/sign-up">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
