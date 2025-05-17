import type React from "react"
import type { Metadata } from "next"
import localFont from "next/font/local"

import "./globals.css"
import Layout from "./components/layout"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export const metadata: Metadata = {
  title: "Next.js SSE Examples",
  description: "Examples of Server-Sent Events in Next.js",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}
