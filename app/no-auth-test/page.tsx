export default function NoAuthTestPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">No Auth Test Page</h1>
      <p className="mb-4">This page has no authentication or Supabase dependencies.</p>
      
      <div className="bg-gray-800 p-4 rounded mb-6">
        <h2 className="font-semibold mb-2">Direct Links (no redirects):</h2>
        <ul className="space-y-2">
          <li>
            <a href="/test?bypass=true" className="text-blue-400 hover:text-blue-300">
              → Test Page (with bypass)
            </a>
          </li>
          <li>
            <a href="/test-supabase?bypass=true" className="text-blue-400 hover:text-blue-300">
              → Supabase Test (with bypass)
            </a>
          </li>
          <li>
            <a href="/status?bypass=true" className="text-blue-400 hover:text-blue-300">
              → Status Page (with bypass)
            </a>
          </li>
        </ul>
      </div>
      
      <div className="bg-red-900/20 border border-red-700 p-4 rounded">
        <h2 className="font-semibold mb-2">If you're stuck in a redirect loop:</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Visit: <a href="/api/force-logout" className="text-blue-400">/api/force-logout</a></li>
          <li>Or visit: <a href="/force-logout" className="text-blue-400">/force-logout</a></li>
          <li>Then try the links above with ?bypass=true</li>
        </ol>
      </div>
    </div>
  )
} 