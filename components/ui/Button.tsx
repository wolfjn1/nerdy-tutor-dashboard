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
        outline: 'border-2 bg-transparent hover:bg-opacity-10 active:bg-opacity-20',
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
      variant,
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
      
      switch (gradientType) {
        case 'nerdy':
          return `${baseClasses} bg-gradient-nerdy hover:shadow-lg nerdy-glow`
        case 'yellow-pink':
          return `${baseClasses} bg-gradient-yellow-pink hover:shadow-lg`
        case 'pink-cyan':
          return `${baseClasses} bg-gradient-pink-cyan hover:shadow-lg`
        case 'orange-magenta':
          return `${baseClasses} bg-gradient-orange-magenta hover:shadow-lg`
        case 'blue':
          return `${baseClasses} bg-gradient-blue hover:from-blue-600 hover:to-blue-700`
        case 'purple':
          return `${baseClasses} bg-gradient-purple hover:from-purple-600 hover:to-purple-700`
        case 'orange':
          return `${baseClasses} bg-gradient-orange hover:from-orange-600 hover:to-orange-700`
        case 'green':
          return `${baseClasses} bg-gradient-green hover:from-green-600 hover:to-green-700`
        case 'pink':
          return `${baseClasses} bg-gradient-pink hover:from-pink-600 hover:to-pink-700`
        case 'cyan':
          return `${baseClasses} bg-gradient-cyan hover:from-cyan-600 hover:to-cyan-700`
        default:
          return `${baseClasses} bg-gradient-nerdy`
      }
    }

    const getOutlineClasses = () => {
      if (variant !== 'outline') return ''
      
      switch (gradientType) {
        case 'nerdy':
          return 'border-nerdy-pink text-nerdy-pink hover:bg-nerdy-pink'
        case 'yellow-pink':
          return 'border-nerdy-yellow text-nerdy-yellow hover:bg-nerdy-yellow'
        case 'pink-cyan':
          return 'border-nerdy-cyan text-nerdy-cyan hover:bg-nerdy-cyan'
        case 'orange-magenta':
          return 'border-nerdy-magenta text-nerdy-magenta hover:bg-nerdy-magenta'
        case 'blue':
          return 'border-blue-500 text-blue-500 hover:bg-blue-500'
        case 'purple':
          return 'border-purple-500 text-purple-500 hover:bg-purple-500'
        case 'orange':
          return 'border-orange-500 text-orange-500 hover:bg-orange-500'
        case 'green':
          return 'border-green-500 text-green-500 hover:bg-green-500'
        case 'pink':
          return 'border-pink-500 text-pink-500 hover:bg-pink-500'
        case 'cyan':
          return 'border-cyan-500 text-cyan-500 hover:bg-cyan-500'
        default:
          return 'border-nerdy-pink text-nerdy-pink hover:bg-nerdy-pink'
      }
    }

    const getGhostClasses = () => {
      if (variant !== 'ghost') return ''
      
      switch (gradientType) {
        case 'nerdy':
          return 'text-white hover:bg-white/10'
        case 'yellow-pink':
          return 'text-nerdy-yellow hover:bg-nerdy-yellow/10'
        case 'pink-cyan':
          return 'text-nerdy-cyan hover:bg-nerdy-cyan/10'
        case 'orange-magenta':
          return 'text-nerdy-magenta hover:bg-nerdy-magenta/10'
        case 'blue':
          return 'text-blue-500 hover:bg-blue-500'
        case 'purple':
          return 'text-purple-500 hover:bg-purple-500'
        case 'orange':
          return 'text-orange-500 hover:bg-orange-500'
        case 'green':
          return 'text-green-500 hover:bg-green-500'
        case 'pink':
          return 'text-pink-500 hover:bg-pink-500'
        case 'cyan':
          return 'text-cyan-500 hover:bg-cyan-500'
        default:
          return 'text-white hover:bg-white/10'
      }
    }

    const getSolidClasses = () => {
      if (variant !== 'solid') return ''
      
      switch (gradientType) {
        case 'nerdy':
          return 'bg-nerdy-purple text-white hover:bg-nerdy-navy'
        case 'yellow-pink':
          return 'bg-nerdy-yellow text-white hover:bg-nerdy-orange'
        case 'pink-cyan':
          return 'bg-nerdy-pink text-white hover:bg-nerdy-cyan'
        case 'orange-magenta':
          return 'bg-nerdy-orange text-white hover:bg-nerdy-magenta'
        case 'blue':
          return 'bg-blue-500 text-white hover:bg-blue-600'
        case 'purple':
          return 'bg-purple-500 text-white hover:bg-purple-600'
        case 'orange':
          return 'bg-orange-500 text-white hover:bg-orange-600'
        case 'green':
          return 'bg-green-500 text-white hover:bg-green-600'
        case 'pink':
          return 'bg-pink-500 text-white hover:bg-pink-600'
        case 'cyan':
          return 'bg-cyan-500 text-white hover:bg-cyan-600'
        default:
          return 'bg-nerdy-purple text-white hover:bg-nerdy-navy'
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