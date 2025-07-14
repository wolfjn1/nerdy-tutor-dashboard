import { useEffect, useState } from 'react'
import { useTutorStore } from '@/lib/stores/tutorStore'

export function useHydratedStore() {
  const [isHydrated, setIsHydrated] = useState(false)
  const store = useTutorStore()

  useEffect(() => {
    // This ensures the store is hydrated on the client
    setIsHydrated(true)
  }, [])

  return {
    ...store,
    isHydrated
  }
} 