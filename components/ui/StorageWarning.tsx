'use client'

import React from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth/auth-context'

export function StorageWarning() {
  const { storageWarning } = useAuth()
  const [dismissed, setDismissed] = React.useState(false)

  if (!storageWarning || dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-0 left-0 right-0 z-50 p-3 bg-yellow-50 border-b border-yellow-200"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">Limited Storage: </span>
              {storageWarning}
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg hover:bg-yellow-100 transition-colors"
            aria-label="Dismiss warning"
          >
            <X className="h-4 w-4 text-yellow-600" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
} 