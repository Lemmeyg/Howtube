import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://docutube.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://docutube.com/how-it-works",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://docutube.com/pricing",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://docutube.com/blog",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    // Dynamic routes would be added here for each document
    // Example:
    // {
    //   url: "https://docutube.com/docs/how-to-build-react-app",
    //   lastModified: new Date(),
    //   changeFrequency: "monthly",
    //   priority: 0.9,
    //   // Video sitemap data
    //   videos: [
    //     {
    //       title: "How to Build a React App with Next.js",
    //       thumbnail_loc: "https://docutube.com/thumbnails/react-nextjs.jpg",
    //       description: "A step-by-step guide to creating a modern web application using React and Next.js framework.",
    //     },
    //   ],
    // },
  ]
}
