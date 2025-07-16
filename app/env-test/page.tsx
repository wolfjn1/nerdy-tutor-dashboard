export default function EnvTestPage() {
  // Check environment variables on the server side
  const envCheck = {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    urlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 40) || 'NOT SET',
    keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    vercel: process.env.VERCEL || 'false',
    buildTime: new Date().toISOString()
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Environment Variable Check</h1>
      
      <div className="bg-gray-800 p-6 rounded-lg max-w-2xl">
        <h2 className="text-lg font-semibold mb-4">Server-side Environment Check:</h2>
        
        <div className="space-y-2 font-mono text-sm">
          <div className="flex justify-between">
            <span>NEXT_PUBLIC_SUPABASE_URL:</span>
            <span className={envCheck.hasSupabaseUrl ? 'text-green-400' : 'text-red-400'}>
              {envCheck.hasSupabaseUrl ? '✓ SET' : '✗ MISSING'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
            <span className={envCheck.hasSupabaseKey ? 'text-green-400' : 'text-red-400'}>
              {envCheck.hasSupabaseKey ? `✓ SET (${envCheck.keyLength} chars)` : '✗ MISSING'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>URL Preview:</span>
            <span className="text-gray-400">{envCheck.urlPreview}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Environment:</span>
            <span>{envCheck.nodeEnv}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Vercel:</span>
            <span>{envCheck.vercel}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Build Time:</span>
            <span className="text-gray-400">{envCheck.buildTime}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-8 space-y-2">
        <p className="text-sm text-gray-400">
          If the environment variables are missing above, make sure they are set in your Vercel project settings.
        </p>
        
        <div className="space-y-2 mt-4">
          <a href="/test" className="block text-blue-400 hover:text-blue-300">
            → Basic Test Page
          </a>
          <a href="/api/check-env" className="block text-blue-400 hover:text-blue-300">
            → API Environment Check
          </a>
          <a href="/test-supabase" className="block text-blue-400 hover:text-blue-300">
            → Supabase Connection Test
          </a>
        </div>
      </div>
    </div>
  )
} 