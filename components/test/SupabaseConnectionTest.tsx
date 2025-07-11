'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button, Card } from '@/components/ui'

const SupabaseConnectionTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing')
  const [error, setError] = useState<string | null>(null)
  const [tables, setTables] = useState<string[]>([])

  const testConnection = async () => {
    try {
      setConnectionStatus('testing')
      setError(null)

      // Test basic connection
      const { data, error: connectionError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(1)

      if (connectionError) {
        throw connectionError
      }

      // Get available tables
      let tablesData, tablesError
      try {
        const result = await supabase.rpc('get_table_names')
        tablesData = result.data
        tablesError = result.error
      } catch {
        // If RPC doesn't exist, try a simple query
        const result = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
        tablesData = result.data
        tablesError = result.error
      }

      if (tablesError) {
        console.warn('Could not fetch tables:', tablesError)
      } else {
        setTables(tablesData?.map((t: any) => t.table_name) || [])
      }

      setConnectionStatus('connected')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setConnectionStatus('error')
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'testing':
        return 'text-yellow-600'
      case 'connected':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing':
        return '🔄'
      case 'connected':
        return '✅'
      case 'error':
        return '❌'
    }
  }

  return (
    <Card className="p-6 max-w-md">
      <h3 className="text-lg font-semibold mb-4">Supabase Connection Test</h3>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getStatusIcon()}</span>
          <div>
            <div className={`font-medium ${getStatusColor()}`}>
              {connectionStatus === 'testing' && 'Testing connection...'}
              {connectionStatus === 'connected' && 'Connected successfully!'}
              {connectionStatus === 'error' && 'Connection failed'}
            </div>
            {error && (
              <div className="text-sm text-red-500 mt-1">{error}</div>
            )}
          </div>
        </div>

        {connectionStatus === 'connected' && (
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-green-800">
              <strong>Connection Details:</strong>
              <br />
              URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}
              <br />
              Status: Ready for data operations
            </div>
            
            {tables.length > 0 && (
              <div className="mt-2">
                <strong className="text-green-800">Available Tables:</strong>
                <div className="text-xs text-green-600 mt-1">
                  {tables.join(', ') || 'No custom tables found'}
                </div>
              </div>
            )}
          </div>
        )}

        <Button 
          onClick={testConnection}
          disabled={connectionStatus === 'testing'}
          variant="outline"
          size="sm"
        >
          {connectionStatus === 'testing' ? 'Testing...' : 'Test Again'}
        </Button>
      </div>
    </Card>
  )
}

export default SupabaseConnectionTest 