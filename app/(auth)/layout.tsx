import { SimpleAuthProvider } from '@/lib/auth/simple-auth-context'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SimpleAuthProvider>
      {children}
    </SimpleAuthProvider>
  )
} 