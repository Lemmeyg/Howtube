import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "DocuTube - Transform YouTube Tutorials Into Detailed Documentation",
  description:
    "Instantly convert any how-to video into comprehensive, searchable documentation that your users will love.",
  keywords: ["documentation", "youtube", "tutorials", "how-to", "video to text", "learning"],
  openGraph: {
    title: "DocuTube - Transform YouTube Tutorials Into Detailed Documentation",
    description:
      "Instantly convert any how-to video into comprehensive, searchable documentation that your users will love.",
    type: "website",
    locale: "en_US",
    url: "https://docutube.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "DocuTube - Transform YouTube Tutorials Into Detailed Documentation",
    description:
      "Instantly convert any how-to video into comprehensive, searchable documentation that your users will love.",
  },
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
