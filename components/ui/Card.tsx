'use client'

import React, { HTMLAttributes, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const cardVariants = cva(
  'rounded-lg border transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700',
        glass: 'glass-effect border-white/20',
        gradient: 'border-0 shadow-lg',
        outline: 'bg-transparent border-2',
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      hover: {
        none: '',
        lift: 'hover:shadow-lg hover:-translate-y-1',
        glow: 'hover:shadow-xl hover:shadow-blue-500/25',
        scale: 'hover:scale-[1.02]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      hover: 'none',
    },
  }
)

export interface CardAction {
  label: string
  onClick: () => void
  icon?: LucideIcon
  variant?: 'primary' | 'secondary' | 'danger'
}

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  children?: ReactNode
  icon?: LucideIcon
  iconBg?: string
  title?: string
  subtitle?: string
  description?: string
  stats?: Array<{ label: string; value: string }>
  actions?: CardAction[]
  glowOnHover?: boolean
  gradient?: 'blue' | 'purple' | 'orange' | 'green' | 'pink' | 'cyan'
  animate?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      size,
      hover,
      children,
      icon: Icon,
      iconBg,
      title,
      subtitle,
      description,
      stats,
      actions,
      glowOnHover,
      gradient,
      animate = true,
      ...props
    },
    ref
  ) => {
    const getGradientClasses = () => {
      if (variant !== 'gradient' || !gradient) return ''
      
      switch (gradient) {
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
          return 'bg-gradient-blue'
      }
    }

    const combinedClasses = cn(
      cardVariants({ variant, size, hover }),
      getGradientClasses(),
      glowOnHover && 'hover:shadow-xl hover:shadow-blue-500/25',
      className
    )

    const CardContent = () => (
      <div ref={ref} className={combinedClasses} {...props}>
        {/* Header with icon and title */}
        {(Icon || title || subtitle) && (
          <div className="flex items-start gap-4 mb-4">
            {Icon && (
              <div className={cn(
                'flex items-center justify-center w-12 h-12 rounded-lg',
                iconBg || 'bg-gradient-blue'
              )}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            )}
            
            {(title || subtitle) && (
              <div className="flex-1">
                {title && (
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {description}
          </p>
        )}

        {/* Stats */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main content */}
        {children}

        {/* Actions */}
        {actions && actions.length > 0 && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  action.variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
                  action.variant === 'secondary' && 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
                  action.variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
                  !action.variant && 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                )}
              >
                {action.icon && <action.icon className="w-4 h-4" />}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    )

    if (animate) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ y: hover === 'lift' ? -4 : 0 }}
        >
          <CardContent />
        </motion.div>
      )
    }

    return <CardContent />
  }
)

Card.displayName = 'Card'

export { Card, cardVariants } 