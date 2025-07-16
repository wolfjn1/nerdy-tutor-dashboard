'use client'

export default function NoAuthDashboard() {
  return (
    <div className="min-h-screen bg-gradient-nerdy-bg-light dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-900 dark:text-purple-400 mb-8">
          No-Auth Dashboard Test
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Test Card 1</h3>
            <p className="text-3xl font-bold text-purple-600">$2,125</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Test Card 2</h3>
            <p className="text-3xl font-bold text-blue-600">5</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Students</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Test Card 3</h3>
            <p className="text-3xl font-bold text-green-600">25</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Sessions Completed</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Test Card 4</h3>
            <p className="text-3xl font-bold text-orange-600">4.9</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Static Content Test</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This page doesn't use any authentication or Supabase connections. 
            If this renders correctly, the issue is with Supabase connectivity.
          </p>
          <div className="flex gap-4">
            <a href="/simple-test" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Go to Simple Test
            </a>
            <a href="/login" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
              Go to Login
            </a>
            <a href="/" className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
              Go to Home
            </a>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Environment: {process.env.NODE_ENV}</p>
          <p>If you see this page, Next.js is working correctly on Vercel.</p>
        </div>
      </div>
    </div>
  )
} 