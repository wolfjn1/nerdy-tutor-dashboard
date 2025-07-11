'use client'

import React, { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-600 text-white hover:bg-primary-700',
        secondary: 'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
        destructive: 'border-transparent bg-red-600 text-white hover:bg-red-700',
        outline: 'text-gray-900 border-gray-300 hover:bg-gray-50 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-800',
        success: 'border-transparent bg-green-600 text-white hover:bg-green-700',
        warning: 'border-transparent bg-yellow-600 text-white hover:bg-yellow-700',
        info: 'border-transparent bg-blue-600 text-white hover:bg-blue-700',
        gradient: 'border-transparent text-white shadow-sm',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  pulse?: boolean
  gradient?: 'blue' | 'purple' | 'orange' | 'green' | 'pink' | 'cyan' | 'nerdy' | 'yellow-pink' | 'pink-cyan' | 'orange-magenta'
  animate?: boolean
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, pulse, gradient, animate = true, ...props }, ref) => {
    const getGradientClasses = () => {
      if (variant !== 'gradient' || !gradient) return ''
      
      switch (gradient) {
        case 'nerdy':
          return 'bg-gradient-nerdy'
        case 'yellow-pink':
          return 'bg-gradient-yellow-pink'
        case 'pink-cyan':
          return 'bg-gradient-pink-cyan'
        case 'orange-magenta':
          return 'bg-gradient-orange-magenta'
        case 'blue':
          return 'bg-gradient-blue'
        case 'purple':
          return 'bg-gradient-purple'
        case 'orange':
          return 'bg-gradient-orange'
        case 'green':
          return 'bg-gradient-green'
        case 'pink':
          return 'bg-gradient-pink'
        case 'cyan':
          return 'bg-gradient-cyan'
        default:
          return 'bg-gradient-nerdy'
      }
    }

    const combinedClasses = cn(
      badgeVariants({ variant, size }),
      getGradientClasses(),
      pulse && 'animate-pulse',
      className
    )

    if (animate) {
      return (
        <motion.div
          ref={ref}
          className={combinedClasses}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          {...(props as any)}
        />
      )
    }

    return (
      <div
        ref={ref}
        className={combinedClasses}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

export { Badge, badgeVariants } 