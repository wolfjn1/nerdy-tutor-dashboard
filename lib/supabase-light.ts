// Lightweight Supabase client for edge functions
export function createLightClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  return {
    url: supabaseUrl,
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
    fetch: async (path: string, options?: RequestInit) => {
      const url = `${supabaseUrl}${path}`
      return fetch(url, {
        ...options,
        headers: {
          ...options?.headers,
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      })
    },
  }
} 