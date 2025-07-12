# Tutor Portal Styling Guide

## Design System Overview

Our design system follows a clean, modern aesthetic with a purple/pink "nerdy" theme. The application uses a light color scheme with consistent spacing, typography, and component styling.

## Core Principles

1. **Consistency**: All pages should follow the same patterns
2. **Clarity**: Clean white backgrounds with subtle borders
3. **Hierarchy**: Clear visual hierarchy using size, color, and spacing
4. **Responsiveness**: Mobile-first design with responsive breakpoints

## Color Palette

### Primary Colors
- **Nerdy Purple**: `purple-600` - Primary brand color
- **Nerdy Pink**: `pink-500` - Secondary brand color
- **Gradient**: `bg-gradient-nerdy` - Purple to pink gradient

### UI Colors
- **Background**: `white` - Main background
- **Borders**: `gray-200` - Standard borders
- **Text Primary**: `gray-900` - Main text
- **Text Secondary**: `gray-600` - Secondary text
- **Text Muted**: `gray-400` - Muted text

### Status Colors
- **Blue**: `blue-[100/200/500/600]` - Scheduled, info
- **Green**: `green-[100/200/500/600]` - Success, completed
- **Red**: `red-[100/200/500/600]` - Error, warning
- **Yellow**: `yellow-[100/200/500/600]` - Caution, ratings
- **Purple**: `purple-[100/200/500/600]` - Primary actions
- **Pink**: `pink-[100/200/500/600]` - Secondary actions

## Component Patterns

### Page Layout
```jsx
<div className="space-y-4">
  {/* Header */}
  {/* Stats Cards */}
  {/* Controls/Filters */}
  {/* Main Content */}
</div>
```

### Stats Cards
```jsx
<div className="bg-white rounded-xl border border-[color]-200 p-4 shadow-sm">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-[color]-100 rounded-lg flex items-center justify-center">
      <Icon className="w-5 h-5 text-[color]-600" />
    </div>
    <div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  </div>
</div>
```

### Control/Filter Sections
```jsx
<div className="bg-white rounded-xl border border-gray-200 p-4">
  <div className="flex flex-col lg:flex-row gap-4">
    {/* Controls content */}
  </div>
</div>
```

### Content Cards
```jsx
<div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-lg transition-all duration-300">
  {/* Card content */}
</div>
```

### Buttons
```jsx
// Primary action
<Button variant="gradient" gradientType="nerdy">
  Action
</Button>

// Secondary action
<Button variant="outline">
  Action
</Button>

// Toggle states
<Button variant={isActive ? 'solid' : 'outline'}>
  Toggle
</Button>
```

### Form Elements
```jsx
// Input
<input className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500" />

// Select
<select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500">
  <option>Option</option>
</select>
```

## Typography

### Headings
- **Page Title**: `text-3xl font-bold text-gray-900`
- **Section Title**: `text-xl font-semibold text-gray-900`
- **Card Title**: `text-lg font-semibold text-gray-900`
- **Subtitle**: `text-sm text-gray-600`

### Body Text
- **Primary**: `text-sm text-gray-900`
- **Secondary**: `text-sm text-gray-600`
- **Muted**: `text-xs text-gray-500`

## Spacing

### Container Padding
- **Desktop**: `p-6`
- **Mobile**: `p-4`

### Card Padding
- **Standard**: `p-4`
- **Large**: `p-6`

### Gaps
- **Section Gap**: `space-y-4` or `gap-4`
- **Component Gap**: `gap-3`
- **Inline Gap**: `gap-2`

## Responsive Design

### Breakpoints
- **sm**: `640px`
- **md**: `768px`
- **lg**: `1024px`
- **xl**: `1280px`

### Grid Layouts
```jsx
// Stats grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

// Content grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
```

## Interactive States

### Hover Effects
- **Cards**: `hover:shadow-lg`
- **Buttons**: `hover:shadow-lg` (gradient), `hover:bg-gray-50` (outline)
- **Links**: `hover:text-purple-600`

### Transitions
- **Standard**: `transition-all duration-300`
- **Fast**: `transition-all duration-200`
- **Shadow**: `transition-shadow duration-200`

## Animation Guidelines

- Keep animations subtle and purposeful
- Use consistent easing functions
- Avoid animations that might get stuck (opacity: 0)
- Prefer CSS transitions over complex JS animations

## Accessibility

- Maintain proper color contrast ratios
- Use semantic HTML elements
- Include proper ARIA labels
- Ensure keyboard navigation works
- Provide focus indicators

## Do's and Don'ts

### Do's
- ✅ Use consistent spacing and sizing
- ✅ Follow the color palette
- ✅ Maintain visual hierarchy
- ✅ Test on multiple screen sizes
- ✅ Keep it simple and clean

### Don'ts
- ❌ Mix different card styles on the same page
- ❌ Use dark themes inconsistently
- ❌ Override the design system without good reason
- ❌ Add excessive animations
- ❌ Ignore accessibility guidelines 