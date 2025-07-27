# AI-Driven Tutor Onboarding & Gamification Design Document

## 1. Executive Summary

This design document outlines the technical implementation approach for the AI-Driven Tutor Onboarding & Gamification system. The design leverages the existing Next.js/React/Supabase architecture while introducing new components for onboarding workflows, AI integration, behavioral tracking, and gamification mechanics.

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │  Onboarding │  │   Dashboard  │  │  Gamification Center │ │
│  │    Wizard   │  │  (Enhanced)  │  │    (Points/Badges)   │ │
│  └─────────────┘  └──────────────┘  └───────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                         API Layer                                │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │   Next.js   │  │   AI Service │  │   Gamification       │ │
│  │   API Routes│  │   Gateway    │  │   Engine             │ │
│  └─────────────┘  └──────────────┘  └───────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                      Data & Services Layer                       │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │  Supabase   │  │   OpenAI     │  │   Background Jobs    │ │
│  │  Database   │  │   API        │  │   (Nudges/Tracking)  │ │
│  └─────────────┘  └──────────────┘  └───────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Architecture

```typescript
// Core modules structure
/lib
  /onboarding
    - OnboardingService.ts
    - OnboardingSteps.ts
    - ProgressTracker.ts
  /gamification
    - GamificationEngine.ts
    - PointsCalculator.ts
    - BadgeManager.ts
    - TierSystem.ts
  /ai-tools
    - AIToolsGateway.ts
    - LessonPlanGenerator.ts
    - StudentAnalytics.ts
  /nudges
    - NudgeEngine.ts
    - NudgeTemplates.ts
    - DeliveryManager.ts
  /tracking
    - BehaviorTracker.ts
    - OutcomeAnalyzer.ts
    - MetricsCollector.ts
```

## 3. Data Models

### 3.1 Database Schema Extensions

```sql
-- Onboarding progress tracking
CREATE TABLE tutor_onboarding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  step_completed VARCHAR(50) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB,
  UNIQUE(tutor_id, step_completed)
);

-- Gamification points and transactions
CREATE TABLE gamification_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason VARCHAR(100) NOT NULL,
  reference_id UUID, -- Links to session, student, etc.
  reference_type VARCHAR(50), -- 'session', 'retention', 'review', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Badge achievements
CREATE TABLE tutor_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB,
  UNIQUE(tutor_id, badge_type)
);

-- Performance tiers
CREATE TABLE tutor_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  current_tier VARCHAR(20) NOT NULL DEFAULT 'standard',
  tier_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_sessions INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2),
  retention_rate DECIMAL(5,2),
  last_evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monetary bonuses tracking
CREATE TABLE tutor_bonuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  bonus_type VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  reference_id UUID,
  reference_type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, paid
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- AI tool usage tracking
CREATE TABLE ai_tool_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tool_type VARCHAR(50) NOT NULL,
  session_id UUID REFERENCES tutoring_sessions(id),
  student_id UUID REFERENCES students(id),
  outcome_metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nudge delivery tracking
CREATE TABLE nudge_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  nudge_type VARCHAR(50) NOT NULL,
  delivery_channel VARCHAR(20) NOT NULL, -- 'in_app', 'email'
  delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded BOOLEAN DEFAULT FALSE,
  responded_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);

-- Student outcome metrics
CREATE TABLE student_outcomes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  tutor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  metric_type VARCHAR(50) NOT NULL,
  metric_value DECIMAL(10,2),
  measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);
```

### 3.2 TypeScript Interfaces

```typescript
// Core interfaces
interface TutorProfile extends BaseProfile {
  onboardingStatus: OnboardingStatus;
  gamificationStats: GamificationStats;
  currentTier: TutorTier;
  monetaryBalance: MonetaryBalance;
}

interface OnboardingStatus {
  completedSteps: string[];
  currentStep: string;
  startedAt: Date;
  completedAt?: Date;
}

interface GamificationStats {
  totalPoints: number;
  currentLevel: TutorLevel;
  badges: Badge[];
  recentAchievements: Achievement[];
  leaderboardRank?: number;
}

interface TutorTier {
  current: 'standard' | 'silver' | 'gold' | 'elite';
  startedAt: Date;
  progress: TierProgress;
  benefits: TierBenefit[];
}

interface MonetaryBalance {
  pendingBonuses: number;
  approvedBonuses: number;
  paidBonuses: number;
  nextPayout: Date;
}

interface Badge {
  type: BadgeType;
  earnedAt: Date;
  progress?: number; // For progressive badges
  metadata?: Record<string, any>;
}

interface Achievement {
  type: AchievementType;
  points: number;
  timestamp: Date;
  description: string;
}

interface Nudge {
  id: string;
  type: NudgeType;
  priority: 'low' | 'medium' | 'high';
  message: string;
  actionUrl?: string;
  expiresAt?: Date;
}
```

## 4. Component Design

### 4.1 Onboarding Wizard Component

```typescript
// components/onboarding/OnboardingWizard.tsx
interface OnboardingWizardProps {
  tutor: TutorProfile;
  onComplete: () => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ tutor, onComplete }) => {
  // Multi-step wizard with:
  // 1. Welcome & Platform Overview
  // 2. Profile Completion
  // 3. Best Practices Tutorial
  // 4. AI Tools Introduction
  // 5. First Student Setup Guide
  
  const steps = [
    <WelcomeStep />,
    <ProfileSetupStep />,
    <BestPracticesStep />,
    <AIToolsIntroStep />,
    <FirstStudentGuide />
  ];
  
  return <StepWizard steps={steps} onComplete={onComplete} />;
};
```

### 4.2 Gamification Center

```typescript
// components/gamification/GamificationCenter.tsx
interface GamificationCenterProps {
  tutorId: string;
}

const GamificationCenter: React.FC<GamificationCenterProps> = ({ tutorId }) => {
  // Displays:
  // - Current points and level
  // - Badge collection
  // - Progress to next tier
  // - Recent achievements
  // - Leaderboard position
  // - Monetary bonus tracking
  
  return (
    <div className="gamification-center">
      <PointsDisplay />
      <TierProgress />
      <BadgeShowcase />
      <AchievementsFeed />
      <BonusTracker />
    </div>
  );
};
```

### 4.3 AI Tools Integration

```typescript
// components/ai-tools/AIToolsPanel.tsx
interface AIToolsPanelProps {
  sessionId?: string;
  studentId: string;
}

const AIToolsPanel: React.FC<AIToolsPanelProps> = ({ sessionId, studentId }) => {
  // Provides access to:
  // - Lesson plan generator
  // - Student analytics dashboard
  // - Practice problem generator
  // - Progress insights
  
  return (
    <div className="ai-tools-panel">
      <LessonPlanGenerator studentId={studentId} />
      <StudentInsights studentId={studentId} />
      <PracticeMaterialsGen sessionId={sessionId} />
    </div>
  );
};
```

### 4.4 Nudge Display System

```typescript
// components/nudges/NudgeDisplay.tsx
interface NudgeDisplayProps {
  tutorId: string;
}

const NudgeDisplay: React.FC<NudgeDisplayProps> = ({ tutorId }) => {
  const { nudges, dismissNudge, actionTaken } = useNudges(tutorId);
  
  return (
    <div className="nudge-container">
      {nudges.map(nudge => (
        <NudgeCard
          key={nudge.id}
          nudge={nudge}
          onDismiss={() => dismissNudge(nudge.id)}
          onAction={() => actionTaken(nudge.id)}
        />
      ))}
    </div>
  );
};
```

## 5. Service Layer Design

### 5.1 Gamification Engine

```typescript
// lib/gamification/GamificationEngine.ts
export class GamificationEngine {
  async awardPoints(
    tutorId: string,
    reason: PointsReason,
    referenceId?: string
  ): Promise<void> {
    const points = this.calculatePoints(reason);
    await this.recordPoints(tutorId, points, reason, referenceId);
    await this.checkForBadges(tutorId);
    await this.checkForLevelUp(tutorId);
    await this.checkForTierPromotion(tutorId);
  }
  
  async calculateMonetaryBonus(
    tutorId: string,
    type: BonusType,
    referenceId: string
  ): Promise<number> {
    // Calculate bonus based on type and business rules
    const amount = BONUS_AMOUNTS[type];
    await this.recordBonus(tutorId, type, amount, referenceId);
    return amount;
  }
  
  private async checkForTierPromotion(tutorId: string): Promise<void> {
    const stats = await this.getTutorStats(tutorId);
    const newTier = this.calculateTier(stats);
    
    if (newTier !== stats.currentTier) {
      await this.promoteTier(tutorId, newTier);
      await this.adjustBaseRate(tutorId, newTier);
    }
  }
}
```

### 5.2 Nudge Engine

```typescript
// lib/nudges/NudgeEngine.ts
export class NudgeEngine {
  async checkAndDeliverNudges(tutorId: string): Promise<void> {
    const behaviors = await this.analyzeBehaviors(tutorId);
    const nudges = this.determineNudges(behaviors);
    
    for (const nudge of nudges) {
      await this.deliverNudge(tutorId, nudge);
    }
  }
  
  private determineNudges(behaviors: TutorBehaviors): Nudge[] {
    const nudges: Nudge[] = [];
    
    // Check for missing learning plans
    if (behaviors.studentsWithoutPlans.length > 0) {
      nudges.push({
        type: 'missing_learning_plan',
        priority: 'high',
        message: `🎓 Don't forget to set a goal plan for ${behaviors.studentsWithoutPlans[0].name}!`
      });
    }
    
    // Check for scheduling gaps
    if (behaviors.daysSinceLastSession > 3) {
      nudges.push({
        type: 'schedule_reminder',
        priority: 'medium',
        message: '📅 Your students miss you! Schedule your next sessions to maintain momentum.'
      });
    }
    
    return nudges;
  }
}
```

### 5.3 AI Tools Gateway

```typescript
// lib/ai-tools/AIToolsGateway.ts
export class AIToolsGateway {
  private openai: OpenAI;
  
  async generateLessonPlan(
    studentProfile: StudentProfile,
    objectives: string[]
  ): Promise<LessonPlan> {
    const prompt = this.buildLessonPlanPrompt(studentProfile, objectives);
    const response = await this.openai.createCompletion({
      model: 'gpt-4',
      prompt,
      max_tokens: 1000
    });
    
    return this.parseLessonPlan(response);
  }
  
  async analyzeStudentProgress(
    studentId: string,
    sessionHistory: Session[]
  ): Promise<StudentInsights> {
    const analysis = await this.performAnalysis(sessionHistory);
    await this.recordAIUsage('student_analysis', studentId);
    return analysis;
  }
}
```

## 6. API Design

### 6.1 RESTful API Endpoints

```typescript
// Onboarding APIs
POST   /api/onboarding/complete-step
GET    /api/onboarding/status/:tutorId

// Gamification APIs
GET    /api/gamification/stats/:tutorId
GET    /api/gamification/leaderboard
POST   /api/gamification/claim-achievement

// AI Tools APIs
POST   /api/ai-tools/generate-lesson-plan
GET    /api/ai-tools/student-insights/:studentId
POST   /api/ai-tools/track-usage

// Nudge APIs
GET    /api/nudges/pending/:tutorId
POST   /api/nudges/dismiss/:nudgeId
POST   /api/nudges/action-taken/:nudgeId

// Bonus APIs
GET    /api/bonuses/balance/:tutorId
GET    /api/bonuses/history/:tutorId
POST   /api/bonuses/calculate
```

### 6.2 Real-time Updates

```typescript
// Supabase Realtime subscriptions
const gamificationSubscription = supabase
  .channel('gamification')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'gamification_points',
    filter: `tutor_id=eq.${tutorId}`
  }, (payload) => {
    // Update UI with new points/achievements
  })
  .subscribe();
```

## 7. Background Jobs

### 7.1 Scheduled Jobs

```typescript
// Daily jobs
- calculateDailyBonuses()      // Run at 2 AM
- checkForInactiveTutors()     // Run at 9 AM
- updateLeaderboards()         // Run at midnight

// Hourly jobs
- deliverScheduledNudges()     // Every hour
- checkStudentEngagement()     // Every hour

// Weekly jobs
- evaluateTierPromotions()     // Sunday at 3 AM
- generateWeeklyReports()      // Monday at 6 AM
```

### 7.2 Event-Driven Jobs

```typescript
// Triggered by specific events
onSessionCompleted -> awardSessionPoints()
onStudentReview -> processFeedbackBonus()
onStudentRetention -> calculateRetentionBonus()
onReferralSignup -> processReferralBonus()
```

## 8. Security & Privacy

### 8.1 Data Protection
- All gamification data encrypted at rest
- PII isolated from leaderboard displays
- Opt-in/opt-out mechanisms for public features
- Rate limiting on AI tool usage

### 8.2 Access Control
- Row-level security on all tutor-specific data
- API authentication via Supabase Auth
- Separate permissions for viewing vs. modifying gamification data

## 9. Performance Optimization

### 9.1 Caching Strategy
- Redis cache for leaderboard data (5-minute TTL)
- In-memory cache for badge definitions
- CDN caching for static gamification assets

### 9.2 Database Optimization
- Indexed columns for frequent queries
- Materialized views for complex calculations
- Partitioned tables for historical data

## 10. Migration Plan

### 10.1 Phase 1: Foundation (Weeks 1-2)
- Database schema creation
- Basic gamification engine
- Points tracking system

### 10.2 Phase 2: Onboarding (Weeks 3-4)
- Onboarding wizard UI
- Progress tracking
- Initial badge awards

### 10.3 Phase 3: AI Integration (Weeks 5-6)
- AI tools gateway
- Lesson plan generator
- Student analytics

### 10.4 Phase 4: Nudges & Monitoring (Weeks 7-8)
- Nudge engine
- Behavior tracking
- Automated delivery

### 10.5 Phase 5: Advanced Features (Weeks 9-10)
- Tier system
- Monetary bonuses
- Leaderboards

---

*Document Version: 1.0*  
*Last Updated: January 2025*  
*Status: Initial Design* 