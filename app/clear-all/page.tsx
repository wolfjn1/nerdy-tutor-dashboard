export default function ClearAllPage() {
  // This is a server component that will clear cookies server-side
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Clear All Cookies</h1>
      
      <div className="bg-yellow-900/20 border border-yellow-700 p-4 rounded mb-6">
        <p className="mb-4">Click the links below to clear your session and cookies:</p>
        
        <ol className="list-decimal list-inside space-y-2">
          <li>
            <a href="/api/force-logout" className="text-blue-400 hover:text-blue-300">
              Step 1: Clear cookies via API
            </a>
          </li>
          <li>
            <a href="/force-logout" className="text-blue-400 hover:text-blue-300">
              Step 2: Clear client-side storage
            </a>
          </li>
        </ol>
      </div>
      
      <div className="bg-gray-800 p-4 rounded">
        <h2 className="font-semibold mb-2">After clearing, try these pages:</h2>
        <ul className="space-y-2">
          <li>
            <a href="/no-auth-test" className="text-blue-400 hover:text-blue-300">
              → No Auth Test Page
            </a>
          </li>
          <li>
            <a href="/simple-supabase-test" className="text-blue-400 hover:text-blue-300">
              → Simple Supabase Test
            </a>
          </li>
          <li>
            <a href="/test?bypass=true" className="text-blue-400 hover:text-blue-300">
              → Test Page with Bypass
            </a>
          </li>
          <li>
            <a href="/login" className="text-blue-400 hover:text-blue-300">
              → Login Page
            </a>
          </li>
        </ul>
      </div>
      
      <div className="mt-6 text-sm text-gray-400">
        <p>If you're still being redirected:</p>
        <ul className="list-disc list-inside mt-2">
          <li>Try opening in an incognito/private window</li>
          <li>Clear your browser cache manually</li>
          <li>Check browser DevTools → Application → Cookies</li>
        </ul>
      </div>
    </div>
  )
} 