import type { Metadata } from 'next'
import { Rubik } from 'next/font/google'
import { Navigation } from '@/components'
import { SessionProvider } from '@/components/SessionProvider'
import { NotificationProvider } from '@/components/NotificationCenter'
import { AlertMonitor } from '@/components/AlertMonitor'
import '../styles/globals.css'

const rubik = Rubik({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-rubik',
})

export const metadata: Metadata = {
  title: 'SocialBlade Analytics',
  description: 'Track and analyze social media statistics with Airbnb-inspired design',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={rubik.className}>
        <SessionProvider>
          <NotificationProvider>
            <AlertMonitor />
            <Navigation />
            {children}
          </NotificationProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
