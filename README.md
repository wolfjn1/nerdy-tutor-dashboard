# Nerdy Live+AI™ - Tutor Portal

A modern tutor dashboard application built with Next.js 14, TypeScript, and Tailwind CSS. Features a vibrant purple/pink "nerdy" theme with comprehensive student management, session scheduling, earnings tracking, and gamification elements.

🚀 **Live Demo**: [https://nerdy-tutor-dashboard.netlify.app/](https://nerdy-tutor-dashboard.netlify.app/)

## 🎨 Design System

The application follows a consistent design language with:
- **White card backgrounds** with subtle borders
- **Purple/Pink gradient accents** for active states and CTAs
- **Clean, modern UI** with proper spacing and typography
- **Responsive design** that works across all devices

## ✅ Implemented Features

### 📊 Dashboard
- Welcome section with tutor profile picture (synced across app)
- Gamification display (Level, XP, Streak)
- Today's statistics (Sessions, Earnings, Students, Success Rate)
- Next session preview with quick actions
- Three-column layout for Required Actions, Today's Schedule, and Quick Actions

### 👥 Students Management
- **Current Students** tab with active student cards
- **Previous Students** tab for historical records
- Student cards showing:
  - Profile picture and basic info
  - Performance metrics (Attendance, Performance, Engagement)
  - Next scheduled session
  - Tags for subjects and attributes
- **Filtering System**:
  - Search by name
  - Filter by subject
  - Filter by grade
  - "No Scheduled Sessions" checkbox
- **Student Detail Pages** with comprehensive information
- Warning indicators for students without scheduled sessions

### 📅 Sessions Calendar
- Monthly calendar view with week navigation
- Visual session blocks showing:
  - Student name
  - Subject
  - Time duration
- **Session Details Modal** with:
  - Student information
  - Session date/time/duration
  - Notes and ratings
  - Join session functionality
  - Meeting link management

### 💼 Opportunities
- Browse available tutoring opportunities
- **Advanced Filtering**:
  - Urgency level (High/Medium/Low)
  - Sort by match score, pay rate, urgency, or start date
- **Opportunity Cards** displaying:
  - Student info and requirements
  - Preferred times
  - Pay rate and duration
  - Match score with hover explanation
- **Detailed View Modal** for each opportunity
- **Preferences Modal** for setting tutor preferences
- Pagination controls with customizable items per page

### 💰 Earnings & Billing
- **Earnings Overview** with monthly/weekly/daily stats
- **Transaction History** with detailed records
- **Invoice Management**:
  - Create invoices from completed sessions
  - Select multiple sessions for bulk invoicing
  - Invoice preview and details
  - Payment status tracking
- **Uninvoiced Sessions** section
- Payment methods management
- Export functionality for financial records

### ⚙️ Settings
Comprehensive settings page with sections for:
- **Profile Management**:
  - Upload profile picture (synced across app)
  - Edit personal information
  - Bio management
- **Notification Preferences**:
  - Email notifications
  - Push notifications
  - Granular control over notification types
- **Privacy Settings**:
  - Profile visibility options
  - Information display preferences
- **Platform Preferences**:
  - Language and timezone
  - Session reminder timing
  - Auto-accept settings
- **Security**:
  - Password management
  - Two-factor authentication
  - Login activity monitoring
- **Billing & Payment**:
  - Payment method management
  - Tax information
  - Invoice settings
- **Account Management**:
  - Data export
  - Account deletion

### 🎮 Gamification System
- XP and leveling system
- Streak tracking
- Achievement badges
- Visual progress bars with animations
- Level 42 "Expert Tutor" status

## 🛠️ Technical Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations (with fixes for stuck states)

### State Management
- **Zustand** with persistence for:
  - User profile data
  - Avatar management
  - Gamification stats
  - UI preferences

### UI Components
- Custom component library with consistent styling
- Reusable Card, Button, Badge, Avatar components
- Modal system for overlays
- Toast notifications for user feedback

### Data
- Mock data system for development
- Structured JSON files for students, sessions, etc.
- Realistic sample data for testing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/[your-username]/tutor-profile.git
cd tutor-profile

# Install dependencies
npm install

# Set up environment variables (if needed)
cp .env.example .env.local

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 📱 Key Pages

- `/dashboard` - Main dashboard overview
- `/students` - Student management
- `/students/[studentId]` - Individual student details
- `/sessions` - Calendar and session management
- `/opportunities` - Browse tutoring opportunities
- `/earnings` - Financial overview and invoicing
- `/settings` - Account and preference management
- `/achievements` - Gamification and progress tracking

## 🎯 Recent Updates

### January 2025
- Fixed navigation and routing issues
- Implemented consistent avatar system across all pages
- Added functional photo upload in settings
- Created comprehensive opportunities page with filtering
- Built complete earnings/billing system with invoicing
- Developed full settings page with all sections
- Fixed Framer Motion animation issues
- Standardized design system across all pages
- Removed "New Session" button (all sessions are pre-scheduled)

## 🚢 Deployment

The application is deployed on Netlify:
- **Production URL**: https://nerdy-tutor-dashboard.netlify.app/
- **Auto-deployment**: Enabled from main branch
- **Environment**: Node.js 18.x

### Deploy Your Own
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/[your-username]/tutor-profile)

## 🤝 Contributing

This is a demonstration project showcasing modern web development practices. Feel free to explore the code and use it as inspiration for your own projects.

## 📄 License

This project is a prototype for Nerdy Live+AI™. All rights reserved.

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
