export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page - No Dependencies</h1>
      <p className="mb-4">If you can see this, the Next.js app is running correctly.</p>
      
      <div className="bg-gray-800 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">Environment Check:</h2>
        <ul className="space-y-1 text-sm">
          <li>Build Time: {new Date().toISOString()}</li>
          <li>Node Env: {process.env.NODE_ENV || 'not set'}</li>
        </ul>
      </div>
      
      <div className="space-y-2">
        <a href="/status" className="block text-blue-400 hover:text-blue-300">
          → Go to Status Page (checks Supabase)
        </a>
        <a href="/login" className="block text-blue-400 hover:text-blue-300">
          → Go to Login
        </a>
      </div>
    </div>
  )
} 