'use client'

import React, { HTMLAttributes, useState } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const avatarVariants = cva(
  'relative inline-flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden',
  {
    variants: {
      size: {
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-lg',
        '2xl': 'h-20 w-20 text-xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

export interface AvatarProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string
  alt?: string
  fallback?: string
  showOnlineStatus?: boolean
  isOnline?: boolean
  animate?: boolean
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      size,
      src,
      alt,
      fallback,
      showOnlineStatus,
      isOnline,
      animate = true,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = useState(false)

    const handleImageError = () => {
      setImageError(true)
    }

    const getStatusSize = () => {
      switch (size) {
        case 'sm':
          return 'h-2 w-2'
        case 'md':
          return 'h-3 w-3'
        case 'lg':
          return 'h-3.5 w-3.5'
        case 'xl':
          return 'h-4 w-4'
        case '2xl':
          return 'h-5 w-5'
        default:
          return 'h-3 w-3'
      }
    }

    const getStatusPosition = () => {
      switch (size) {
        case 'sm':
          return 'bottom-0 right-0'
        case 'md':
          return 'bottom-0 right-0'
        case 'lg':
          return 'bottom-0.5 right-0.5'
        case 'xl':
          return 'bottom-0.5 right-0.5'
        case '2xl':
          return 'bottom-1 right-1'
        default:
          return 'bottom-0 right-0'
      }
    }

    const AvatarContent = () => (
      <div
        ref={ref}
        className={cn(avatarVariants({ size }), className)}
        {...props}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || 'Avatar'}
            onError={handleImageError}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-medium text-gray-600 dark:text-gray-300">
            {fallback || '?'}
          </span>
        )}

        {/* Online status indicator */}
        {showOnlineStatus && (
          <div
            className={cn(
              'absolute border-2 border-white dark:border-gray-900 rounded-full',
              getStatusSize(),
              getStatusPosition(),
              isOnline ? 'bg-green-500' : 'bg-gray-400'
            )}
          />
        )}
      </div>
    )

    if (animate) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          whileHover={{ scale: 1.05 }}
          className="inline-block"
        >
          <AvatarContent />
        </motion.div>
      )
    }

    return <AvatarContent />
  }
)

Avatar.displayName = 'Avatar'

export { Avatar, avatarVariants } 