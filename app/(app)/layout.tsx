import { Geist_Mono, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata } from "next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { EDITOR_PATH, SITE_NAME, SITE_URL } from "@/lib/site"
import { cn } from "@/lib/utils"
import { VIEW_TRANSITION_OPT_IN } from "@/lib/view-transition"

const description =
  "Precision 2D drafting with the commands, snaps and keyboard flow AutoCAD users already know — in a browser tab, nothing to install."

// The editor is shared as a link, so it carries a preview — but it has nothing
// to index. `follow` stays on and robots.txt must not block it, or crawlers
// could never read this noindex.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `Draw · ${SITE_NAME}`,
  description,
  applicationName: SITE_NAME,
  robots: { index: false, follow: true },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — 2D CAD in your browser`,
    description,
    url: EDITOR_PATH,
    locale: "en",
  },
  twitter: { card: "summary_large_image" },
}

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <head>
        <style>{VIEW_TRANSITION_OPT_IN}</style>
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
