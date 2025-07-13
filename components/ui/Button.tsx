'use client'

import React, { ButtonHTMLAttributes, ReactNode, useState } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion'
import { Loader2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToastHelpers } from './Toast'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none leading-none',
  {
    variants: {
      variant: {
        gradient: 'text-white border-0 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
        outline: 'border-2 bg-transparent active:bg-opacity-20',
        ghost: 'border-0 bg-transparent hover:bg-opacity-10 active:bg-opacity-20',
        solid: 'border-0 shadow-sm hover:shadow-md active:scale-[0.98]',
      },
      size: {
        sm: 'h-8 px-3 text-xs gap-1.5',
        md: 'h-9 px-4 text-sm gap-2',
        lg: 'h-10 px-6 text-sm gap-2',
        xl: 'h-11 px-8 text-base gap-2.5',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'gradient',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode
  isLoading?: boolean
  loadingText?: string
  xpReward?: number
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  pulse?: boolean
  glow?: boolean
  onXPGained?: (amount: number) => void
  gradientType?: 'blue' | 'purple' | 'orange' | 'green' | 'pink' | 'cyan' | 'nerdy' | 'yellow-pink' | 'pink-cyan' | 'orange-magenta'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'gradient',
      gradientType,
      size,
      children,
      isLoading,
      loadingText,
      xpReward,
      leftIcon,
      rightIcon,
      pulse,
      glow,
      onXPGained,
      onClick,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showXPAnimation, setShowXPAnimation] = useState(false)
    const { success } = useToastHelpers()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || isLoading) return

      // Show XP animation and toast notification if xpReward is provided
      if (xpReward && xpReward > 0) {
        setShowXPAnimation(true)
        setTimeout(() => setShowXPAnimation(false), 2000)
        onXPGained?.(xpReward)
        
        // Show success toast with XP reward
        success(
          `+${xpReward} XP earned!`,
          `Great job! You've gained ${xpReward} experience points.`
        )
      }

      onClick?.(e)
    }

    const getGradientClasses = () => {
      if (variant !== 'gradient') return ''
      
      const baseClasses = 'relative overflow-hidden'
      const type = gradientType || 'nerdy' // Default to 'nerdy' if no gradientType is provided
      
      switch (type) {
        case 'nerdy':
          return `${baseClasses} bg-gradient-nerdy animate-gradient-nerdy hover:shadow-lg nerdy-glow text-white`
        case 'yellow-pink':
          return `${baseClasses} bg-gradient-yellow-pink hover:shadow-lg text-white`
        case 'pink-cyan':
          return `${baseClasses} bg-gradient-pink-cyan hover:shadow-lg text-white`
        case 'orange-magenta':
          return `${baseClasses} bg-gradient-orange-magenta hover:shadow-lg text-white`
        case 'blue':
          return `${baseClasses} bg-gradient-blue hover:from-blue-600 hover:to-blue-700 text-white`
        case 'purple':
          return `${baseClasses} bg-gradient-purple hover:from-purple-600 hover:to-purple-700 text-white`
        case 'orange':
          return `${baseClasses} bg-gradient-orange hover:from-orange-600 hover:to-orange-700 text-white`
        case 'green':
          return `${baseClasses} bg-gradient-green hover:from-green-600 hover:to-green-700 text-white`
        case 'pink':
          return `${baseClasses} bg-gradient-pink hover:from-pink-600 hover:to-pink-700 text-white`
        case 'cyan':
          return `${baseClasses} bg-gradient-cyan hover:from-cyan-600 hover:to-cyan-700 text-white`
        default:
          return `${baseClasses} bg-gradient-nerdy animate-gradient-nerdy text-white`
      }
    }

    const getOutlineClasses = () => {
      if (variant !== 'outline') return ''
      
      const type = gradientType || 'nerdy' // Default to 'nerdy' if no gradientType is provided
      
      switch (type) {
        case 'nerdy':
          return 'border-nerdy-pink text-nerdy-pink hover:!bg-nerdy-pink hover:!bg-opacity-100 hover:!text-white dark:border-pink-400 dark:text-pink-400 dark:hover:!bg-pink-400 transition-all'
        case 'yellow-pink':
          return 'border-nerdy-yellow text-nerdy-yellow hover:bg-nerdy-yellow hover:bg-opacity-100 hover:text-white dark:border-yellow-400 dark:text-yellow-400 dark:hover:bg-yellow-400 transition-all'
        case 'pink-cyan':
          return 'border-nerdy-cyan text-nerdy-cyan hover:bg-nerdy-cyan hover:bg-opacity-100 hover:text-white dark:border-cyan-400 dark:text-cyan-400 dark:hover:bg-cyan-400 transition-all'
        case 'orange-magenta':
          return 'border-nerdy-magenta text-nerdy-magenta hover:bg-nerdy-magenta hover:bg-opacity-100 hover:text-white dark:border-pink-500 dark:text-pink-500 dark:hover:bg-pink-500 transition-all'
        case 'blue':
          return 'border-blue-500 text-blue-500 hover:bg-blue-500 hover:bg-opacity-100 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 transition-all'
        case 'purple':
          return 'border-purple-500 text-purple-500 hover:bg-purple-500 hover:bg-opacity-100 hover:text-white dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-400 transition-all'
        case 'orange':
          return 'border-orange-500 text-orange-500 hover:bg-orange-500 hover:bg-opacity-100 hover:text-white dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-400 transition-all'
        case 'green':
          return 'border-green-500 text-green-500 hover:bg-green-500 hover:bg-opacity-100 hover:text-white dark:border-green-400 dark:text-green-400 dark:hover:bg-green-400 transition-all'
        case 'pink':
          return 'border-pink-500 text-pink-500 hover:bg-pink-500 hover:bg-opacity-100 hover:text-white dark:border-pink-400 dark:text-pink-400 dark:hover:bg-pink-400 transition-all'
        case 'cyan':
          return 'border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:bg-opacity-100 hover:text-white dark:border-cyan-400 dark:text-cyan-400 dark:hover:bg-cyan-400 transition-all'
        default:
          return 'border-nerdy-pink text-nerdy-pink hover:bg-nerdy-pink hover:bg-opacity-100 hover:text-white dark:border-pink-400 dark:text-pink-400 dark:hover:bg-pink-400 transition-all'
      }
    }

    const getGhostClasses = () => {
      if (variant !== 'ghost') return ''
      
      const type = gradientType || 'nerdy' // Default to 'nerdy' if no gradientType is provided
      
      switch (type) {
        case 'nerdy':
          return 'text-white hover:bg-white/10 dark:text-gray-200 dark:hover:bg-gray-700'
        case 'yellow-pink':
          return 'text-nerdy-yellow hover:bg-nerdy-yellow/10 dark:text-yellow-400 dark:hover:bg-yellow-400/10'
        case 'pink-cyan':
          return 'text-nerdy-cyan hover:bg-nerdy-cyan/10 dark:text-cyan-400 dark:hover:bg-cyan-400/10'
        case 'orange-magenta':
          return 'text-nerdy-magenta hover:bg-nerdy-magenta/10 dark:text-pink-500 dark:hover:bg-pink-500/10'
        case 'blue':
          return 'text-blue-500 hover:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-400/10'
        case 'purple':
          return 'text-purple-500 hover:bg-purple-500/10 dark:text-purple-400 dark:hover:bg-purple-400/10'
        case 'orange':
          return 'text-orange-500 hover:bg-orange-500/10 dark:text-orange-400 dark:hover:bg-orange-400/10'
        case 'green':
          return 'text-green-500 hover:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-400/10'
        case 'pink':
          return 'text-pink-500 hover:bg-pink-500/10 dark:text-pink-400 dark:hover:bg-pink-400/10'
        case 'cyan':
          return 'text-cyan-500 hover:bg-cyan-500/10 dark:text-cyan-400 dark:hover:bg-cyan-400/10'
        default:
          return 'text-white hover:bg-white/10 dark:text-gray-200 dark:hover:bg-gray-700'
      }
    }

    const getSolidClasses = () => {
      if (variant !== 'solid') return ''
      
      const type = gradientType || 'nerdy' // Default to 'nerdy' if no gradientType is provided
      
      switch (type) {
        case 'nerdy':
          return 'bg-nerdy-purple text-white hover:bg-nerdy-navy dark:bg-purple-600 dark:hover:bg-purple-700'
        case 'yellow-pink':
          return 'bg-nerdy-yellow text-white hover:bg-nerdy-orange dark:bg-yellow-600 dark:hover:bg-yellow-700'
        case 'pink-cyan':
          return 'bg-nerdy-pink text-white hover:bg-nerdy-cyan dark:bg-pink-600 dark:hover:bg-pink-700'
        case 'orange-magenta':
          return 'bg-nerdy-orange text-white hover:bg-nerdy-magenta dark:bg-orange-600 dark:hover:bg-orange-700'
        case 'blue':
          return 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
        case 'purple':
          return 'bg-purple-500 text-white hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700'
        case 'orange':
          return 'bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700'
        case 'green':
          return 'bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
        case 'pink':
          return 'bg-pink-500 text-white hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-700'
        case 'cyan':
          return 'bg-cyan-500 text-white hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700'
        default:
          return 'bg-nerdy-purple text-white hover:bg-nerdy-navy dark:bg-purple-600 dark:hover:bg-purple-700'
      }
    }

    const combinedClasses = cn(
      buttonVariants({ variant, size }),
      getGradientClasses(),
      getOutlineClasses(),
      getGhostClasses(),
      getSolidClasses(),
      pulse && 'animate-pulse',
      glow && 'glow-effect',
      className
    )

    return (
      <motion.button
        ref={ref}
        className={combinedClasses}
        onClick={handleClick}
        disabled={disabled || isLoading}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        type={props.type || 'button'}
        {...(props as any)}
      >
        {/* Loading spinner */}
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}

        {/* Left icon */}
        {!isLoading && leftIcon && (
          <span className="flex items-center justify-center">{leftIcon}</span>
        )}

        {/* Button content */}
        <span className="relative flex items-center justify-center">
          {isLoading && loadingText ? loadingText : children}
        </span>

        {/* Right icon */}
        {!isLoading && rightIcon && (
          <span className="flex items-center justify-center">{rightIcon}</span>
        )}

        {/* XP Animation */}
        <AnimatePresence>
          {showXPAnimation && (
            <motion.div
              initial={{ opacity: 0, y: 0, scale: 0.8 }}
              animate={{ opacity: 1, y: -40, scale: 1 }}
              exit={{ opacity: 0, y: -60, scale: 0.8 }}
              className="absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none"
            >
              <div className="bg-gradient-yellow-pink text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                +{xpReward} XP
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gradient shimmer effect for gradient buttons */}
        {variant === 'gradient' && !disabled && !isLoading && (
          <motion.div
            className="absolute inset-0 opacity-0 hover:opacity-20"
            initial={false}
            whileHover={{ opacity: 0.2 }}
            style={{
              background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)',
              backgroundSize: '200% 200%',
              animation: 'shimmer 1.5s ease-in-out infinite',
            }}
          />
        )}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants } 