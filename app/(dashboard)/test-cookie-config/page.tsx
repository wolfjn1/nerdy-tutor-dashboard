'use client'

import { useEffect, useState } from 'react'

export default function TestCookieConfigPage() {
  const [cookies, setCookies] = useState<string>('')
  const [testResult, setTestResult] = useState<string>('')
  
  useEffect(() => {
    // Check current cookies
    setCookies(document.cookie || 'No cookies found')
    
    // Test cookie operations
    try {
      // Test setting a cookie
      document.cookie = 'test-cookie=test-value; path=/; max-age=3600; SameSite=Lax; Secure'
      
      // Check if it was set
      const hasTestCookie = document.cookie.includes('test-cookie=test-value')
      
      // Test on Netlify domain
      const isNetlify = window.location.hostname.includes('netlify')
      const isSecure = window.location.protocol === 'https:'
      
      setTestResult(`
        Cookie Set: ${hasTestCookie ? 'SUCCESS' : 'FAILED'}
        Is Netlify: ${isNetlify}
        Is HTTPS: ${isSecure}
        Domain: ${window.location.hostname}
        All Cookies: ${document.cookie}
      `)
    } catch (error) {
      setTestResult(`Error: ${error}`)
    }
  }, [])
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Cookie Configuration Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <h2 className="font-bold mb-2">Initial Cookies:</h2>
          <pre className="text-xs">{cookies}</pre>
        </div>
        
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <h2 className="font-bold mb-2">Test Results:</h2>
          <pre className="text-xs whitespace-pre-wrap">{testResult}</pre>
        </div>
      </div>
    </div>
  )
} 