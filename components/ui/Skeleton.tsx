'use client'

import React, { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const skeletonVariants = cva(
  'animate-pulse rounded-md bg-gray-200 dark:bg-gray-700',
  {
    variants: {
      variant: {
        default: 'bg-gray-200 dark:bg-gray-700',
        shimmer: 'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] animate-shimmer',
      },
      size: {
        sm: 'h-4',
        md: 'h-6',
        lg: 'h-8',
        xl: 'h-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface SkeletonProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  width?: string | number
  height?: string | number
  circle?: boolean
  animate?: boolean
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant,
      size,
      width,
      height,
      circle,
      animate = true,
      style,
      ...props
    },
    ref
  ) => {
    const skeletonStyle = {
      width,
      height,
      ...style,
    }

    const combinedClasses = cn(
      skeletonVariants({ variant, size }),
      circle && 'rounded-full',
      className
    )

    if (animate) {
      return (
        <motion.div
          ref={ref}
          className={combinedClasses}
          style={skeletonStyle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          {...(props as any)}
        />
      )
    }

    return (
      <div
        ref={ref}
        className={combinedClasses}
        style={skeletonStyle}
        {...props}
      />
    )
  }
)

Skeleton.displayName = 'Skeleton'

// Skeleton preset components
export const SkeletonText: React.FC<{
  lines?: number
  className?: string
}> = ({ lines = 3, className }) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={cn(
          'h-4',
          i === lines - 1 ? 'w-3/4' : 'w-full'
        )}
      />
    ))}
  </div>
)

export const SkeletonCard: React.FC<{
  className?: string
}> = ({ className }) => (
  <div className={cn('space-y-3', className)}>
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-32 w-full" />
  </div>
)

export const SkeletonAvatar: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  }

  return (
    <Skeleton
      className={cn(sizeClasses[size], className)}
      circle
    />
  )
}

export const SkeletonButton: React.FC<{
  className?: string
}> = ({ className }) => (
  <Skeleton className={cn('h-10 w-24', className)} />
)

export const SkeletonTable: React.FC<{
  rows?: number
  columns?: number
  className?: string
}> = ({ rows = 5, columns = 4, className }) => (
  <div className={cn('space-y-3', className)}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, j) => (
          <Skeleton key={j} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
)

export { Skeleton, skeletonVariants } 