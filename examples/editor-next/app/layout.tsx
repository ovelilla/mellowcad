import { Geist_Mono, Inter } from "next/font/google"
import type { ReactNode } from "react"

import "@mellowcad/editor/styles.css"
import "./globals.css"

// The editor reads its fonts from the host: next/font writes each family to
// the variable the editor asks for, on <html>.
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" })
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
