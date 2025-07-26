import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  const results: any = {}
  
  // Test 1: Basic fetch to Supabase
  try {
    const response = await fetch(supabaseUrl, {
      headers: {
        'apikey': supabaseKey,
      }
    })
    results.basicFetch = {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    }
  } catch (err) {
    results.basicFetch = {
      error: String(err)
    }
  }
  
  // Test 2: Auth health check
  try {
    const authUrl = `${supabaseUrl}/auth/v1/health`
    const response = await fetch(authUrl)
    results.authHealth = {
      status: response.status,
      ok: response.ok
    }
  } catch (err) {
    results.authHealth = {
      error: String(err)
    }
  }
  
  // Test 3: Try to query with REST API
  try {
    const restUrl = `${supabaseUrl}/rest/v1/tutors?select=id&limit=1`
    const response = await fetch(restUrl, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      }
    })
    const data = await response.text()
    results.restApi = {
      status: response.status,
      ok: response.ok,
      dataLength: data.length,
      sample: data.substring(0, 100)
    }
  } catch (err) {
    results.restApi = {
      error: String(err)
    }
  }
  
  // Test 4: Check if we can reach the auth endpoint
  try {
    const signInUrl = `${supabaseUrl}/auth/v1/token?grant_type=password`
    // Don't actually sign in, just check if endpoint responds
    const response = await fetch(signInUrl, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'test'
      })
    })
    const text = await response.text()
    results.authEndpoint = {
      status: response.status,
      ok: response.ok,
      responseLength: text.length,
      // Should get an error but at least we know endpoint is reachable
      sample: text.substring(0, 100)
    }
  } catch (err) {
    results.authEndpoint = {
      error: String(err)
    }
  }
  
  return NextResponse.json({
    supabaseUrl,
    timestamp: new Date().toISOString(),
    results
  })
} 