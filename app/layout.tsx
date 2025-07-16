import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SimpleAuthProvider } from '@/lib/auth/simple-auth-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Nerdy Tutor Dashboard',
  description: 'AI-powered tutor management platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SimpleAuthProvider>
          {children}
        </SimpleAuthProvider>
      </body>
    </html>
  )
} 