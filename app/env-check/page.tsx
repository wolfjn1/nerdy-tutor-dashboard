'use client'

import React from 'react'

export default function EnvCheckPage() {
  const [mounted, setMounted] = React.useState(false)
  
  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) return <div>Loading...</div>
  
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
    keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
  }
  
  return (
    <div className="p-8 bg-white dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Environment Check</h1>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
        {JSON.stringify(envVars, null, 2)}
      </pre>
      
      <div className="mt-4">
        <h2 className="font-bold">Status:</h2>
        <ul className="list-disc pl-5">
          <li>Supabase URL: {envVars.hasUrl ? '✅ Set' : '❌ Missing'}</li>
          <li>Supabase Key: {envVars.hasKey ? '✅ Set' : '❌ Missing'}</li>
        </ul>
      </div>
    </div>
  )
} 