import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/ui'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Nerdy Live+AI - Tutor Portal',
  description: 'A gamified tutor portal powered by AI. Manage students, create personalized lessons, and track your teaching journey with cutting-edge technology.',
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/nerdy-logo.png',
        sizes: '1024x1024',
        type: 'image/png',
      },
    ],
    shortcut: '/favicon.svg',
    apple: [
      {
        url: '/nerdy-logo.png',
        sizes: '1024x1024',
        type: 'image/png',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
} 