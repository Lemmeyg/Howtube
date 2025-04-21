import Link from "next/link"
import { ArrowRight, Clock, Eye, Search, Star, ThumbsUp, TrendingUp, Youtube } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-2 items-center text-xl font-bold">
            <Youtube className="h-6 w-6 text-red-500" />
            <span>DocuTube</span>
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
              <Button variant="outline" size="sm" className="ml-4">
                Log in
              </Button>
              <Button size="sm">Sign up</Button>
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
                  Simplify Learning & Documentation
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Transform YouTube Tutorials Into Detailed Documentation
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Instantly convert any how-to video into comprehensive, searchable documentation that your users will
                  love.
                </p>
              </div>
              <div className="w-full max-w-2xl space-y-2 mt-4">
                <div className="relative w-full p-1 rounded-xl bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20">
                  <form className="flex w-full items-center space-x-2 bg-card rounded-lg p-1 shadow-sm">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="url"
                        placeholder="Paste YouTube URL here..."
                        className="w-full bg-white pl-10 pr-4 py-6 text-base border-0 focus-visible:ring-primary"
                      />
                    </div>
                    <Button type="submit" size="lg" className="px-8 shadow-sm">
                      Generate Docs
                    </Button>
                  </form>
                </div>
                <p className="text-xs text-muted-foreground">
                  Try it with any how-to video. No sign-up required for your first 3 documents.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <div className="flex items-center gap-1 text-sm text-muted-foreground bg-accent/50 px-3 py-1 rounded-full">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span>4.9/5 from 2,300+ users</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground bg-accent/50 px-3 py-1 rounded-full">
                  <Eye className="h-4 w-4" />
                  <span>120,000+ docs generated</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground bg-accent/50 px-3 py-1 rounded-full">
                  <ThumbsUp className="h-4 w-4" />
                  <span>Used by 5,000+ companies</span>
                </div>
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
                {Array.from({ length: 12 }).map((_, i) => (
                  <Card
                    key={i}
                    className="w-[300px] flex-shrink-0 shadow-md card-hover-effect bg-card border border-border/50"
                  >
                    <CardHeader className="p-4">
                      <div className="aspect-video w-full bg-accent rounded-md overflow-hidden relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Youtube className="h-10 w-10 text-red-500" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <CardTitle className="line-clamp-1 text-lg">
                        {
                          [
                            "How to Build a React App with Next.js",
                            "Complete Guide to CSS Grid Layout",
                            "JavaScript Promises Explained",
                            "Building a REST API with Node.js",
                            "Python for Data Science Beginners",
                            "Docker Containers Tutorial",
                          ][i % 6]
                        }
                      </CardTitle>
                      <CardDescription className="line-clamp-2 mt-2">
                        {
                          [
                            "A step-by-step guide to creating a modern web application using React and Next.js framework.",
                            "Master CSS Grid with this comprehensive tutorial covering all the essential concepts.",
                            "Learn how to use promises to handle asynchronous operations in JavaScript.",
                            "Create a RESTful API from scratch using Node.js, Express, and MongoDB.",
                            "Introduction to data analysis and visualization with Python libraries.",
                            "Learn how to containerize your applications with Docker for better deployment.",
                          ][i % 6]
                        }
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between items-center text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>{["2 days", "5 hours", "1 week", "3 days", "12 hours", "4 days"][i % 6]} ago</span>
                      </div>
                      <div className="flex items-center">
                        <Eye className="mr-1 h-3 w-3" />
                        <span>{["1.2k", "458", "3.5k", "892", "1.7k", "2.3k"][i % 6]} views</span>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
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
                      Receive well-structured, searchable documentation with step-by-step instructions and code
                      snippets.
                    </p>
                  </div>
                </div>

                <div className="mt-10 flex justify-center">
                  <Button size="lg" className="gap-2 bg-primary/90 hover:bg-primary">
                    Try it for free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="relative aspect-video w-full max-w-2xl mt-12 overflow-hidden rounded-xl bg-card shadow-md border border-border/50">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Youtube className="h-16 w-16 text-red-500" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-mesh-gradient">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Top Documentation</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Discover our most popular and helpful documentation.
                </p>
              </div>
            </div>
            <Tabs defaultValue="popular" className="mt-8 w-full max-w-5xl mx-auto">
              <div className="flex justify-center mb-8">
                <TabsList className="grid w-full max-w-md grid-cols-2 bg-accent/50">
                  <TabsTrigger
                    value="popular"
                    className="flex items-center justify-center gap-1 data-[state=active]:bg-card"
                  >
                    <Star className="h-4 w-4" />
                    Most Popular
                  </TabsTrigger>
                  <TabsTrigger
                    value="trending"
                    className="flex items-center justify-center gap-1 data-[state=active]:bg-card"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Trending Now
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="popular" className="space-y-4">
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="shadow-md card-hover-effect bg-card border border-border/50">
                      <CardHeader className="p-4">
                        <div className="aspect-video w-full bg-accent rounded-md overflow-hidden relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Youtube className="h-10 w-10 text-red-500" />
                          </div>
                          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                            {["12:45", "8:32", "22:15", "15:20", "10:05", "18:30"][i % 6]}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <CardTitle className="line-clamp-1 text-lg">
                          {
                            [
                              "Complete Guide to CSS Grid Layout",
                              "React Hooks Explained",
                              "Building a Full-Stack App with Next.js",
                              "TypeScript for JavaScript Developers",
                              "Modern JavaScript Features",
                              "Responsive Web Design Principles",
                            ][i % 6]
                          }
                        </CardTitle>
                        <CardDescription className="line-clamp-2 mt-2">
                          {
                            [
                              "Master CSS Grid with this comprehensive tutorial covering all the essential concepts.",
                              "Learn how to use React Hooks to manage state and side effects in functional components.",
                              "Create a complete web application with Next.js, including API routes and database integration.",
                              "Transition from JavaScript to TypeScript with this beginner-friendly guide.",
                              "Explore the latest JavaScript features and how to use them in your projects.",
                              "Learn how to create websites that look great on any device with responsive design techniques.",
                            ][i % 6]
                          }
                        </CardDescription>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-between items-center text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Star className="mr-1 h-3 w-3 fill-amber-400 stroke-amber-400" />
                          <span>
                            {["4.9", "4.8", "4.7", "4.9", "4.8", "4.7"][i % 6]} (
                            {["2.3k", "1.8k", "3.1k", "1.5k", "2.7k", "1.9k"][i % 6]})
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Eye className="mr-1 h-3 w-3" />
                          <span>{["45.6k", "32.1k", "28.9k", "39.2k", "22.5k", "35.8k"][i % 6]} views</span>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="trending" className="space-y-4">
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="shadow-md card-hover-effect bg-card border border-border/50">
                      <CardHeader className="p-4">
                        <div className="aspect-video w-full bg-accent rounded-md overflow-hidden relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Youtube className="h-10 w-10 text-red-500" />
                          </div>
                          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                            {["14:22", "9:45", "20:18", "16:33", "11:27", "17:52"][i % 6]}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <CardTitle className="line-clamp-1 text-lg">
                          {
                            [
                              "AI Tools for Content Creation",
                              "Web3 Development Introduction",
                              "Advanced React Patterns",
                              "Building with Tailwind CSS",
                              "GraphQL API Development",
                              "Mobile App Development with React Native",
                            ][i % 6]
                          }
                        </CardTitle>
                        <CardDescription className="line-clamp-2 mt-2">
                          {
                            [
                              "Discover the latest AI tools that can help streamline your content creation process.",
                              "Get started with Web3 development, blockchain, and smart contracts.",
                              "Learn advanced React patterns to build scalable and maintainable applications.",
                              "Master Tailwind CSS to create beautiful user interfaces without writing custom CSS.",
                              "Build efficient APIs with GraphQL to fetch exactly the data you need.",
                              "Create cross-platform mobile apps using React Native and JavaScript.",
                            ][i % 6]
                          }
                        </CardDescription>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-between items-center text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                          <span>+{["128%", "95%", "112%", "87%", "143%", "76%"][i % 6]} this week</span>
                        </div>
                        <div className="flex items-center">
                          <Eye className="mr-1 h-3 w-3" />
                          <span>{["12.8k", "9.5k", "15.2k", "8.7k", "11.3k", "10.9k"][i % 6]} views</span>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            <div className="mt-10 flex justify-center">
              <Button variant="outline" className="gap-1 border-primary/20 hover:bg-primary/5">
                Explore all top docs
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-subtle-pattern">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">Testimonials</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Loved by educators and creators</h2>
                <p className="text-muted-foreground md:text-lg">
                  See what our users are saying about how DocuTube has transformed their teaching and learning
                  experience.
                </p>

                <div className="space-y-4 mt-6">
                  <div className="rounded-lg border border-border/50 p-4 bg-card shadow-sm">
                    <p className="italic text-muted-foreground mb-3">
                      "DocuTube has revolutionized how I create learning materials for my students. What used to take
                      hours now takes minutes."
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-accent"></div>
                      <div>
                        <p className="font-medium">Sarah Johnson</p>
                        <p className="text-sm text-muted-foreground">Computer Science Professor</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/50 p-4 bg-card shadow-sm">
                    <p className="italic text-muted-foreground mb-3">
                      "As a content creator, I use DocuTube to provide my audience with searchable documentation
                      alongside my tutorial videos. It's been a game-changer."
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-accent"></div>
                      <div>
                        <p className="font-medium">Michael Chen</p>
                        <p className="text-sm text-muted-foreground">YouTube Educator, 500K subscribers</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-xl"></div>

                <div className="relative space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="aspect-video bg-accent rounded-lg overflow-hidden flex items-center justify-center shadow-sm border border-border/50">
                      <Youtube className="h-10 w-10 text-red-500" />
                    </div>
                    <div className="aspect-video bg-accent rounded-lg overflow-hidden flex items-center justify-center shadow-sm border border-border/50">
                      <Youtube className="h-10 w-10 text-red-500" />
                    </div>
                  </div>
                  <div className="aspect-video bg-accent rounded-lg overflow-hidden flex items-center justify-center shadow-sm border border-border/50">
                    <Youtube className="h-10 w-10 text-red-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary/95 text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ready to transform your tutorials?</h2>
                <p className="mx-auto max-w-[700px] md:text-xl">
                  Join thousands of educators and content creators who are enhancing their videos with comprehensive
                  documentation.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                  Get Started for Free
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  View Pricing
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-12 md:py-16 lg:py-20 bg-card">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex gap-2 items-center text-xl font-bold">
                <Youtube className="h-6 w-6 text-red-500" />
                <span>DocuTube</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Transform YouTube tutorials into comprehensive documentation with our AI-powered platform.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    API
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Tutorials
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-center text-sm text-muted-foreground md:text-left">
              © 2023 DocuTube. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Twitter</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-twitter"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">LinkedIn</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-linkedin"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect width="4" height="12" x="2" y="9"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">GitHub</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-github"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                  <path d="M9 18c-4.51 2-5-2-7-2"></path>
                </svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">YouTube</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-youtube"
                >
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"></path>
                  <path d="m10 15 5-3-5-3z"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
