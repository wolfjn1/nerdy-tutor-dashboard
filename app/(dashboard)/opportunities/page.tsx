'use client'

import React, { useState, useMemo } from 'react'
import { Search, Filter, MapPin, DollarSign, Clock, Calendar, Star, BookOpen, TrendingUp, Save, CheckCircle, AlertCircle, Users, Target, Info, Sliders, ChevronLeft, ChevronRight, MessageCircle, Award } from 'lucide-react'
import { Button, Badge, Avatar, Modal } from '@/components/ui'
import { cn } from '@/lib/utils'

// Extend the opportunities data - removed location field since all online
const opportunities = [
  {
    id: 'opp-001',
    studentName: 'Alex Thompson',
    studentAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=40&h=40&fit=crop&crop=face',
    subject: 'Linear Algebra',
    preferredTimes: ['Monday 3-5 PM', 'Wednesday 6-8 PM'],
    duration: 90,
    frequency: 'weekly',
    payRate: 95,
    urgency: 'high',
    studentLevel: 'College Sophomore',
    needs: 'Struggling with eigenvalues and eigenvectors, needs help before midterm exam',
    startDate: '2025-01-20',
    budget: '$380/month',
    matchScore: 92,
    interested: false,
    tags: ['College', 'Advanced Math', 'Urgent'],
    requirements: ['Linear Algebra expertise', 'Patient teaching style', 'Experience with college students'],
    additionalInfo: {
      currentGrade: 'C+',
      previousTutors: 2,
      learningStyle: 'Visual learner, needs lots of examples',
      goals: 'Achieve B+ or higher on midterm',
      availability: 'Very flexible, can adjust to tutor schedule',
      preferredPlatform: 'Zoom with screen sharing'
    }
  },
  {
    id: 'opp-002',
    studentName: 'Jessica Park',
    studentAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face',
    subject: 'Calculus II',
    preferredTimes: ['Tuesday 4-6 PM', 'Thursday 4-6 PM'],
    duration: 120,
    frequency: 'twice weekly',
    payRate: 80,
    urgency: 'medium',
    studentLevel: 'College Freshman',
    needs: 'Needs comprehensive help with series and sequences',
    startDate: '2025-01-25',
    budget: '$640/month',
    matchScore: 88,
    interested: false,
    tags: ['College', 'Calculus', 'Long-term'],
    requirements: ['Calculus II mastery', 'Clear communication', 'Flexible schedule'],
    additionalInfo: {
      currentGrade: 'B-',
      previousTutors: 1,
      learningStyle: 'Step-by-step approach preferred',
      goals: 'Master series convergence tests',
      availability: 'Fixed schedule preferred',
      preferredPlatform: 'Google Meet'
    }
  },
  {
    id: 'opp-003',
    studentName: 'Michael Chen',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    subject: 'SAT Math Prep',
    preferredTimes: ['Saturday 10 AM-12 PM', 'Sunday 2-4 PM'],
    duration: 120,
    frequency: 'twice weekly',
    payRate: 110,
    urgency: 'high',
    studentLevel: 'High School Junior',
    needs: 'Intensive SAT prep, aiming for 750+ math score. Test in 6 weeks.',
    startDate: '2025-01-18',
    budget: '$880/month',
    matchScore: 95,
    interested: true,
    tags: ['Test Prep', 'High School', 'Premium'],
    requirements: ['SAT expertise', 'Track record of score improvement', 'Test prep experience'],
    additionalInfo: {
      currentGrade: 'A- in Algebra II',
      previousTutors: 0,
      learningStyle: 'Fast-paced, challenge-seeking',
      goals: '750+ SAT Math score',
      availability: 'Weekends only due to sports',
      preferredPlatform: 'Zoom with digital whiteboard'
    }
  },
  {
    id: 'opp-004',
    studentName: 'Sophie Williams',
    studentAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
    subject: 'Statistics',
    preferredTimes: ['Monday 6-8 PM', 'Wednesday 6-8 PM', 'Friday 4-6 PM'],
    duration: 60,
    frequency: 'three times weekly',
    payRate: 75,
    urgency: 'low',
    studentLevel: 'High School Senior',
    needs: 'AP Statistics support, preparing for AP exam in May',
    startDate: '2025-02-01',
    budget: '$900/month',
    matchScore: 78,
    interested: false,
    tags: ['AP', 'High School', 'Flexible'],
    requirements: ['AP Statistics experience', 'Exam prep skills', 'Evening availability'],
    additionalInfo: {
      currentGrade: 'B+',
      previousTutors: 0,
      learningStyle: 'Conceptual understanding over memorization',
      goals: 'Score 5 on AP exam',
      availability: 'Evenings after school activities',
      preferredPlatform: 'Any platform works'
    }
  },
  {
    id: 'opp-005',
    studentName: 'Daniel Rodriguez',
    studentAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    subject: 'Algebra I',
    preferredTimes: ['Tuesday 3:30-4:30 PM', 'Thursday 3:30-4:30 PM'],
    duration: 60,
    frequency: 'twice weekly',
    payRate: 65,
    urgency: 'medium',
    studentLevel: 'Middle School (8th Grade)',
    needs: 'Foundational algebra help, building confidence in math',
    startDate: '2025-01-22',
    budget: '$520/month',
    matchScore: 82,
    interested: false,
    tags: ['Middle School', 'Foundational', 'Afternoon Sessions'],
    requirements: ['Middle school experience', 'Patient approach', 'Afternoon availability'],
    additionalInfo: {
      currentGrade: 'C',
      previousTutors: 1,
      learningStyle: 'Needs encouragement and positive reinforcement',
      goals: 'Build confidence and improve to B grade',
      availability: 'After school only',
      preferredPlatform: 'Zoom (parent will help with setup)'
    }
  },
  // Add more opportunities to demonstrate pagination
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `opp-00${i + 6}`,
    studentName: ['Emma Davis', 'Oliver Smith', 'Ava Johnson', 'Liam Brown', 'Isabella Wilson'][i % 5],
    studentAvatar: `https://images.unsplash.com/photo-${['1494790108377-be9c29b29330', '1500648767791-1d28b7ad5b20', '1534528741775-53994a69daeb', '1492562080023-ab3db95bfbce', '1517841905240-472988babdf9'][i % 5]}?w=40&h=40&fit=crop&crop=face`,
    subject: ['Pre-Calculus', 'Geometry', 'Algebra II', 'Trigonometry', 'College Algebra'][i % 5],
    preferredTimes: [['Monday 5-7 PM'], ['Tuesday 6-8 PM', 'Thursday 6-8 PM'], ['Wednesday 4-6 PM'], ['Friday 3-5 PM'], ['Saturday 9-11 AM']][i % 5],
    duration: [60, 90, 120][i % 3],
    frequency: ['weekly', 'twice weekly', 'three times weekly'][i % 3],
    payRate: 60 + (i % 5) * 10,
    urgency: ['high', 'medium', 'low'][i % 3],
    studentLevel: ['High School', 'College', 'Middle School'][i % 3],
    needs: 'General tutoring support and homework help',
    startDate: '2025-02-01',
    budget: `$${(60 + (i % 5) * 10) * 4}/month`,
    matchScore: 70 + (i % 4) * 5,
    interested: false,
    tags: ['General Support', 'Homework Help'],
    requirements: ['Subject expertise', 'Good communication'],
    additionalInfo: {
      currentGrade: ['B', 'B+', 'C+', 'A-'][i % 4],
      previousTutors: i % 3,
      learningStyle: 'Standard learning approach',
      goals: 'Improve understanding and grades',
      availability: 'Flexible schedule',
      preferredPlatform: 'Zoom'
    }
  }))
]

export default function OpportunitiesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    urgency: 'all',
    subject: 'all',
    showInterested: false,
    minPayRate: 0,
    maxPayRate: 200
  })
  const [sortBy, setSortBy] = useState('matchScore')
  const [showPreferencesModal, setShowPreferencesModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedOpportunity, setSelectedOpportunity] = useState<typeof opportunities[0] | null>(null)
  const [showMatchTooltip, setShowMatchTooltip] = useState<string | null>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Preferences state
  const [preferences, setPreferences] = useState({
    subjects: [] as string[],
    minPayRate: 50,
    maxPayRate: 150,
    preferredTimes: {
      mornings: false,
      afternoons: false,
      evenings: false,
      weekends: false
    },
    studentLevels: [] as string[],
    maxStudents: 15
  })

  // Filter and sort opportunities
  const filteredOpportunities = useMemo(() => {
    let filtered = opportunities.filter(opp => {
      // Search filter
      if (searchTerm && !opp.studentName.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !opp.subject.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !opp.needs.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Urgency filter
      if (filters.urgency !== 'all' && opp.urgency !== filters.urgency) {
        return false
      }

      // Subject filter
      if (filters.subject !== 'all' && !opp.subject.toLowerCase().includes(filters.subject.toLowerCase())) {
        return false
      }

      // Interested filter
      if (filters.showInterested && !opp.interested) {
        return false
      }

      // Pay rate filter
      if (opp.payRate < filters.minPayRate || opp.payRate > filters.maxPayRate) {
        return false
      }

      return true
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'matchScore':
          return b.matchScore - a.matchScore
        case 'payRate':
          return b.payRate - a.payRate
        case 'urgency':
          const urgencyOrder: Record<string, number> = { high: 3, medium: 2, low: 1 }
          return urgencyOrder[b.urgency] - urgencyOrder[a.urgency]
        case 'startDate':
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [searchTerm, filters, sortBy])

  // Pagination calculations
  const totalPages = Math.ceil(filteredOpportunities.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedOpportunities = filteredOpportunities.slice(startIndex, endIndex)

  const stats = {
    newThisWeek: 12,
    totalOpen: 47,
    interestedCount: 3,
    interviewScheduled: 1
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'border-red-200 bg-red-50 text-red-700'
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 text-yellow-700'
      case 'low':
        return 'border-green-200 bg-green-50 text-green-700'
      default:
        return 'border-gray-200 bg-gray-50 text-gray-700'
    }
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 80) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    if (score >= 70) return 'text-orange-600 bg-orange-50 border-orange-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const handleViewDetails = (opportunity: typeof opportunities[0]) => {
    setSelectedOpportunity(opportunity)
    setShowDetailsModal(true)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tutoring Opportunities</h1>
          <p className="text-gray-600 mt-1">Find your next perfect student match</p>
        </div>
        <Button variant="gradient" gradientType="nerdy" onClick={() => setShowPreferencesModal(true)}>
          <Target className="w-4 h-4 mr-2" />
          Set Preferences
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" style={{ opacity: '1 !important', transform: 'none !important' }}>
        <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{stats.newThisWeek}</div>
              <div className="text-sm text-gray-600">New This Week</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-purple-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{stats.totalOpen}</div>
              <div className="text-sm text-gray-600">Total Open</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-green-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{stats.interestedCount}</div>
              <div className="text-sm text-gray-600">Interested</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-yellow-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{stats.interviewScheduled}</div>
              <div className="text-sm text-gray-600">Interviews</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by student, subject, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={filters.urgency}
              onChange={(e) => setFilters({ ...filters, urgency: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Urgency</option>
              <option value="high">High Urgency</option>
              <option value="medium">Medium Urgency</option>
              <option value="low">Low Urgency</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="matchScore">Best Match</option>
              <option value="payRate">Highest Pay</option>
              <option value="urgency">Most Urgent</option>
              <option value="startDate">Starting Soon</option>
            </select>

            <Button
              variant={filters.showInterested ? 'solid' : 'outline'}
              size="sm"
              onClick={() => setFilters({ ...filters, showInterested: !filters.showInterested })}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Interested
            </Button>
          </div>
        </div>
      </div>

      {/* Results count and pagination controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredOpportunities.length)} of {filteredOpportunities.length} opportunities
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>
          </div>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {paginatedOpportunities.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No opportunities found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          paginatedOpportunities.map((opportunity) => (
            <div key={opportunity.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300" style={{ opacity: '1 !important', transform: 'none !important' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <Avatar
                    src={opportunity.studentAvatar}
                    fallback={opportunity.studentName.split(' ').map(n => n[0]).join('')}
                    size="lg"
                    animate={false}
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{opportunity.studentName}</h3>
                    <p className="text-gray-600">{opportunity.subject}</p>
                    <p className="text-sm text-gray-500">{opportunity.studentLevel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {opportunity.interested && (
                    <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200" animate={false}>
                      Responded Interested
                    </Badge>
                  )}
                  <Badge variant="secondary" className={getUrgencyColor(opportunity.urgency)} animate={false}>
                    {opportunity.urgency} urgency
                  </Badge>
                  <div 
                    className={cn('relative flex items-center gap-1 px-2 py-1 rounded-full border cursor-help', getMatchScoreColor(opportunity.matchScore))}
                    onMouseEnter={() => setShowMatchTooltip(opportunity.id)}
                    onMouseLeave={() => setShowMatchTooltip(null)}
                  >
                    <Star className="w-4 h-4" />
                    <span className="text-sm font-bold">{opportunity.matchScore}%</span>
                    {showMatchTooltip === opportunity.id && (
                      <div className="absolute z-10 bottom-full mb-2 right-0 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 w-64 shadow-lg">
                        <div className="font-semibold mb-1">Match Score Factors:</div>
                        <div className="space-y-1">
                          <div>• Your subject expertise alignment</div>
                          <div>• Schedule compatibility</div>
                          <div>• Student level experience</div>
                          <div>• Pay rate vs. your preferences</div>
                          <div>• Past success with similar students</div>
                        </div>
                        <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 font-medium">${opportunity.payRate}/hr</span>
                  <span className="text-gray-500">• {opportunity.budget}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{opportunity.duration} min • {opportunity.frequency}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">Starts {new Date(opportunity.startDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Student Needs */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Student needs:</span> {opportunity.needs}
                </p>
              </div>

              {/* Preferred Times */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Preferred times:</p>
                <div className="flex flex-wrap gap-2">
                  {opportunity.preferredTimes.map((time, i) => (
                    <Badge key={i} variant="secondary" size="sm" className="bg-purple-50 text-purple-700 border-purple-200" animate={false}>
                      {time}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {opportunity.tags.map((tag, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {opportunity.interested ? (
                  <Button variant="solid" className="flex-1" disabled>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Responded Interested
                  </Button>
                ) : (
                  <Button variant="gradient" gradientType="nerdy" className="flex-1">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Respond as Interested
                  </Button>
                )}
                <Button variant="outline" onClick={() => handleViewDetails(opportunity)}>
                  View Details
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              
              return (
                <Button
                  key={i}
                  variant={currentPage === pageNum ? 'solid' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className="min-w-[40px]"
                >
                  {pageNum}
                </Button>
              )
            })}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={selectedOpportunity ? `${selectedOpportunity.studentName} - ${selectedOpportunity.subject}` : ''}
        size="lg"
      >
        {selectedOpportunity && (
          <div className="space-y-6">
            {/* Student Info Header */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <Avatar
                  src={selectedOpportunity.studentAvatar}
                  fallback={selectedOpportunity.studentName.split(' ').map(n => n[0]).join('')}
                  size="xl"
                  animate={false}
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedOpportunity.studentName}</h3>
                  <p className="text-gray-600">{selectedOpportunity.studentLevel} • {selectedOpportunity.subject}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="secondary" className={getUrgencyColor(selectedOpportunity.urgency)} animate={false}>
                      {selectedOpportunity.urgency} urgency
                    </Badge>
                    <div className={cn('flex items-center gap-1 px-2 py-1 rounded-full border text-sm', getMatchScoreColor(selectedOpportunity.matchScore))}>
                      <Star className="w-3 h-3" />
                      <span className="font-bold">{selectedOpportunity.matchScore}% match</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Compensation</p>
                  <p className="text-lg font-semibold text-gray-900">${selectedOpportunity.payRate}/hour</p>
                  <p className="text-sm text-gray-600">{selectedOpportunity.budget}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Schedule</p>
                  <p className="text-sm font-medium text-gray-900">{selectedOpportunity.duration} minutes</p>
                  <p className="text-sm text-gray-600">{selectedOpportunity.frequency}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Start Date</p>
                  <p className="text-sm font-medium text-gray-900">{new Date(selectedOpportunity.startDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Current Grade</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedOpportunity.additionalInfo.currentGrade}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Previous Tutors</p>
                  <p className="text-sm font-medium text-gray-900">{selectedOpportunity.additionalInfo.previousTutors}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Platform</p>
                  <p className="text-sm font-medium text-gray-900">{selectedOpportunity.additionalInfo.preferredPlatform}</p>
                </div>
              </div>
            </div>

            {/* Detailed Needs */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Student Needs</h4>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{selectedOpportunity.needs}</p>
            </div>

            {/* Learning Style & Goals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Learning Style</h4>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{selectedOpportunity.additionalInfo.learningStyle}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Goals</h4>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{selectedOpportunity.additionalInfo.goals}</p>
              </div>
            </div>

            {/* Availability */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Availability</h4>
              <p className="text-sm text-gray-700 mb-2">{selectedOpportunity.additionalInfo.availability}</p>
              <div className="flex flex-wrap gap-2">
                {selectedOpportunity.preferredTimes.map((time, i) => (
                  <Badge key={i} variant="secondary" size="sm" className="bg-purple-50 text-purple-700 border-purple-200" animate={false}>
                    {time}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Requirements</h4>
              <ul className="space-y-1">
                {selectedOpportunity.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              {selectedOpportunity.interested ? (
                <Button variant="solid" className="flex-1" disabled>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Already Responded
                </Button>
              ) : (
                <Button variant="gradient" gradientType="nerdy" className="flex-1">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Respond as Interested
                </Button>
              )}
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Preferences Modal */}
      <Modal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        title="Set Your Tutoring Preferences"
        description="Help us match you with the perfect opportunities"
        size="lg"
      >
        <div className="space-y-6">
          {/* Subjects */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Preferred Subjects</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Algebra', 'Calculus', 'Statistics', 'Linear Algebra', 'SAT Math', 'AP Math', 'Geometry', 'Trigonometry', 'Pre-Calculus'].map((subject) => (
                <label key={subject} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preferences.subjects.includes(subject)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPreferences({ ...preferences, subjects: [...preferences.subjects, subject] })
                      } else {
                        setPreferences({ ...preferences, subjects: preferences.subjects.filter(s => s !== subject) })
                      }
                    }}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{subject}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pay Rate */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Hourly Rate Range</h4>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-xs text-gray-600">Minimum</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">$</span>
                  <input
                    type="number"
                    value={preferences.minPayRate}
                    onChange={(e) => setPreferences({ ...preferences, minPayRate: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-gray-600">/hr</span>
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-600">Maximum</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">$</span>
                  <input
                    type="number"
                    value={preferences.maxPayRate}
                    onChange={(e) => setPreferences({ ...preferences, maxPayRate: parseInt(e.target.value) || 200 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-gray-600">/hr</span>
                </div>
              </div>
            </div>
          </div>

          {/* Preferred Times */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Preferred Times</h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries({
                mornings: 'Mornings (6 AM - 12 PM)',
                afternoons: 'Afternoons (12 PM - 6 PM)',
                evenings: 'Evenings (6 PM - 10 PM)',
                weekends: 'Weekends'
              }).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preferences.preferredTimes[key as keyof typeof preferences.preferredTimes]}
                    onChange={(e) => {
                      setPreferences({
                        ...preferences,
                        preferredTimes: {
                          ...preferences.preferredTimes,
                          [key]: e.target.checked
                        }
                      })
                    }}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Student Levels */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Student Levels</h4>
            <div className="grid grid-cols-2 gap-3">
              {['Middle School', 'High School', 'College', 'Graduate', 'Adult Learner'].map((level) => (
                <label key={level} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preferences.studentLevels.includes(level)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPreferences({ ...preferences, studentLevels: [...preferences.studentLevels, level] })
                      } else {
                        setPreferences({ ...preferences, studentLevels: preferences.studentLevels.filter(l => l !== level) })
                      }
                    }}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Max Students */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Maximum Active Students</h4>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="30"
                value={preferences.maxStudents}
                onChange={(e) => setPreferences({ ...preferences, maxStudents: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-900 w-8">{preferences.maxStudents}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="gradient" gradientType="nerdy" className="flex-1">
              Save Preferences
            </Button>
            <Button variant="outline" onClick={() => setShowPreferencesModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
} 