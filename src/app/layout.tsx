import type { Metadata, Viewport } from 'next'
import '../index.css'

export const metadata: Metadata = {
  title: 'Not3s',
  description: 'Premium local-first knowledge workspace',
  icons: {
    icon: '/favicon.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}
