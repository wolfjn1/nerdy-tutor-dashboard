import { redirect } from 'next/navigation'

// Redirect root to dashboard
export default function RootPage() {
  return redirect('/dashboard')
} 