import { useEffect, useState } from 'react'
import { useTutorStore } from '@/lib/stores/tutorStore'

export function useHydratedStore() {
  const [isHydrated, setIsHydrated] = useState(false)
  const tutor = useTutorStore((state) => state.tutor)
  const students = useTutorStore((state) => state.students)
  const sessions = useTutorStore((state) => state.sessions)
  const level = useTutorStore((state) => state.level)
  const totalXP = useTutorStore((state) => state.totalXP)

  useEffect(() => {
    // This ensures the store is hydrated on the client
    setIsHydrated(true)
  }, [])

  return {
    tutor,
    students,
    sessions,
    level,
    totalXP,
    isHydrated
  }
} 