/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Nerdy brand colors based on the logo
        nerdy: {
          purple: '#2d1b69',
          navy: '#1a1b3a',
          teal: '#0891b2',
          cyan: '#06b6d4',
          yellow: '#fbbf24',
          orange: '#f97316',
          pink: '#ec4899',
          magenta: '#d946ef',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#0a0a0a',
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      backgroundImage: {
        // Nerdy brand gradients matching the logo
        'gradient-nerdy': 'linear-gradient(135deg, #fbbf24 0%, #f97316 25%, #ec4899 50%, #d946ef 75%, #06b6d4 100%)',
        'gradient-nerdy-bg': 'linear-gradient(135deg, #2d1b69 0%, #1a1b3a 50%, #0891b2 100%)',
        'gradient-yellow-pink': 'linear-gradient(135deg, #fbbf24 0%, #ec4899 100%)',
        'gradient-pink-cyan': 'linear-gradient(135deg, #ec4899 0%, #06b6d4 100%)',
        'gradient-orange-magenta': 'linear-gradient(135deg, #f97316 0%, #d946ef 100%)',
        // Keep existing gradients for backward compatibility
        'gradient-blue': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-purple': 'linear-gradient(135deg, #B565D8 0%, #5B4FE8 100%)',
        'gradient-orange': 'linear-gradient(135deg, #FFA500 0%, #FF6B6B 100%)',
        'gradient-green': 'linear-gradient(135deg, #00D9FF 0%, #00B4D8 100%)',
        'gradient-pink': 'linear-gradient(135deg, #FF6B9D 0%, #C44569 100%)',
        'gradient-cyan': 'linear-gradient(135deg, #00D9FF 0%, #00B4D8 100%)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'gradient-x': 'gradientX 3s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient-nerdy': 'gradientNerdy 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
            transform: 'scale(1)',
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.8)',
            transform: 'scale(1.05)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        gradientNerdy: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      transitionDuration: {
        '150': '150ms',
        '250': '250ms',
        '400': '400ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
} 