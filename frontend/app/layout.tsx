import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LiveKit Streaming Platform',
  description: 'Real-time video streaming with LiveKit',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
