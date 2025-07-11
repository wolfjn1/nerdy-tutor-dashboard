import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Nerdy Live+AI - Tutor Portal',
  description: 'A gamified tutor portal powered by AI. Manage students, create personalized lessons, and track your teaching journey with cutting-edge technology.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-nerdy-bg text-white">
          {children}
        </div>
      </body>
    </html>
  )
} 