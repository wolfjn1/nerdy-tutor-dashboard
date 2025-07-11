import { format, formatDistance, formatRelative, isToday, isTomorrow, isYesterday } from 'date-fns'

/**
 * Format currency values
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format large numbers with abbreviations
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format duration in minutes to human readable format
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) {
    return `${mins}m`
  }
  
  if (mins === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${mins}m`
}

/**
 * Format date for display
 */
export function formatDate(date: Date, formatString: string = 'MMM dd, yyyy'): string {
  return format(date, formatString)
}

/**
 * Format date relatively (today, tomorrow, yesterday, etc.)
 */
export function formatRelativeDate(date: Date): string {
  if (isToday(date)) {
    return 'Today'
  }
  
  if (isTomorrow(date)) {
    return 'Tomorrow'
  }
  
  if (isYesterday(date)) {
    return 'Yesterday'
  }
  
  return formatRelative(date, new Date())
}

/**
 * Format time for display
 */
export function formatTime(date: Date): string {
  return format(date, 'h:mm a')
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: Date): string {
  return format(date, 'MMM dd, yyyy h:mm a')
}

/**
 * Format time distance (2 hours ago, in 3 days, etc.)
 */
export function formatTimeDistance(date: Date): string {
  return formatDistance(date, new Date(), { addSuffix: true })
}

/**
 * Format XP with abbreviations
 */
export function formatXP(xp: number): string {
  return formatNumber(xp) + ' XP'
}

/**
 * Format level display
 */
export function formatLevel(level: number): string {
  return `Lv.${level}`
}

/**
 * Format student grade
 */
export function formatGrade(grade: string | number): string {
  if (typeof grade === 'number') {
    return `${grade}${getGradeOrdinal(grade)} Grade`
  }
  return grade
}

/**
 * Get ordinal suffix for grade numbers
 */
function getGradeOrdinal(grade: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd']
  const mod = grade % 100
  
  return suffixes[(mod - 20) % 10] || suffixes[mod] || suffixes[0]
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  
  return phone
}

/**
 * Format name for display
 */
export function formatName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`
}

/**
 * Format initials from name
 */
export function formatInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = (bytes / Math.pow(1024, i)).toFixed(2)
  
  return `${size} ${sizes[i]}`
}

/**
 * Format progress text
 */
export function formatProgress(current: number, total: number): string {
  return `${current} of ${total}`
}

/**
 * Format session status
 */
export function formatSessionStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'scheduled': 'Scheduled',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'no_show': 'No Show',
  }
  
  return statusMap[status] || status
}

/**
 * Format attendance rate
 */
export function formatAttendanceRate(attended: number, total: number): string {
  if (total === 0) return '0%'
  const rate = (attended / total) * 100
  return `${rate.toFixed(1)}%`
} 