'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { cn } from '@/lib/utils'

interface ChartProps {
  className?: string
  data: any[]
  height?: number
  animate?: boolean
}

interface LineChartProps extends ChartProps {
  xDataKey: string
  yDataKey: string
  color?: string
  strokeWidth?: number
}

interface AreaChartProps extends ChartProps {
  xDataKey: string
  yDataKey: string
  color?: string
  gradient?: boolean
}

interface BarChartProps extends ChartProps {
  xDataKey: string
  yDataKey: string
  color?: string
}

interface PieChartProps extends ChartProps {
  dataKey: string
  nameKey: string
  colors?: string[]
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export const SimpleLineChart: React.FC<LineChartProps> = ({
  className,
  data,
  height = 300,
  xDataKey,
  yDataKey,
  color = '#06b6d4',
  strokeWidth = 3,
  animate = true
}) => {
  return (
    <motion.div
      className={cn('w-full', className)}
      initial={animate ? { opacity: 0, y: 20 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey={xDataKey} 
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey={yDataKey} 
            stroke={color} 
            strokeWidth={strokeWidth}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: color }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

export const SimpleAreaChart: React.FC<AreaChartProps> = ({
  className,
  data,
  height = 300,
  xDataKey,
  yDataKey,
  color = '#06b6d4',
  gradient = true,
  animate = true
}) => {
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`
  
  return (
    <motion.div
      className={cn('w-full', className)}
      initial={animate ? { opacity: 0, y: 20 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            {gradient && (
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
              </linearGradient>
            )}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey={xDataKey} 
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey={yDataKey}
            stroke={color}
            strokeWidth={2}
            fill={gradient ? `url(#${gradientId})` : color}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

export const SimpleBarChart: React.FC<BarChartProps> = ({
  className,
  data,
  height = 300,
  xDataKey,
  yDataKey,
  color = '#06b6d4',
  animate = true
}) => {
  return (
    <motion.div
      className={cn('w-full', className)}
      initial={animate ? { opacity: 0, y: 20 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey={xDataKey} 
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey={yDataKey} 
            fill={color}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

export const SimplePieChart: React.FC<PieChartProps> = ({
  className,
  data,
  height = 300,
  dataKey,
  nameKey,
  colors = ['#06b6d4', '#ec4899', '#f97316', '#10b981', '#8b5cf6'],
  animate = true
}) => {
  return (
    <motion.div
      className={cn('w-full', className)}
      initial={animate ? { opacity: 0, scale: 0.95 } : undefined}
      animate={animate ? { opacity: 1, scale: 1 } : undefined}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

// Nerdy-branded chart colors
export const NerdyChartColors = {
  primary: '#06b6d4',
  secondary: '#ec4899',
  accent: '#f97316',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  gradients: {
    nerdyPrimary: 'url(#nerdy-gradient-1)',
    nerdySecondary: 'url(#nerdy-gradient-2)',
  }
}

// Gradient definitions for Nerdy theme
export const ChartGradients: React.FC = () => (
  <defs>
    <linearGradient id="nerdy-gradient-1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
    </linearGradient>
    <linearGradient id="nerdy-gradient-2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1}/>
    </linearGradient>
  </defs>
)

export default {
  SimpleLineChart,
  SimpleAreaChart,
  SimpleBarChart,
  SimplePieChart,
  ChartGradients,
  NerdyChartColors
} 