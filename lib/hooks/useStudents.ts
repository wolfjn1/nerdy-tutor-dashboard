import { useTutorStore } from '@/lib/stores/tutorStore'
import { Student, FilterOptions, SortOptions } from '@/lib/types'
import { formatName, formatGrade, calculatePerformanceScore } from '@/lib/utils'

export const useStudents = () => {
  const {
    students,
    addStudent,
    updateStudent,
    removeStudent,
    getActiveStudents,
    getStudentById
  } = useTutorStore()

  const createStudent = (studentData: Omit<Student, 'id' | 'createdAt'>) => {
    const newStudent: Student = {
      ...studentData,
      id: crypto.randomUUID(),
      createdAt: new Date()
    }
    addStudent(newStudent)
    return newStudent
  }

  const editStudent = (id: string, updates: Partial<Student>) => {
    updateStudent(id, updates)
  }

  const deleteStudent = (id: string) => {
    removeStudent(id)
  }

  const getStudent = (id: string) => {
    return getStudentById(id)
  }

  const getActiveStudentsList = () => {
    return getActiveStudents()
  }

  const getInactiveStudents = () => {
    return students.filter(student => !student.isActive)
  }

  const getStudentsBySubject = (subject: string) => {
    return students.filter(student => 
      student.subjects.includes(subject) && student.isActive
    )
  }

  const getStudentsByGrade = (grade: string) => {
    return students.filter(student => 
      student.grade.toString() === grade && student.isActive
    )
  }

  const searchStudents = (query: string) => {
    const searchTerm = query.toLowerCase()
    return students.filter(student => {
      const fullName = formatName(student.firstName, student.lastName).toLowerCase()
      const subjects = student.subjects.join(' ').toLowerCase()
      const grade = student.grade.toString().toLowerCase()
      const tags = student.tags.join(' ').toLowerCase()
      
      return fullName.includes(searchTerm) ||
             subjects.includes(searchTerm) ||
             grade.includes(searchTerm) ||
             tags.includes(searchTerm)
    })
  }

  const filterStudents = (filters: FilterOptions) => {
    let filteredStudents = students

    if (filters.search) {
      filteredStudents = searchStudents(filters.search)
    }

    if (filters.subjects && filters.subjects.length > 0) {
      filteredStudents = filteredStudents.filter(student =>
        filters.subjects!.some(subject => student.subjects.includes(subject))
      )
    }

    if (filters.grades && filters.grades.length > 0) {
      filteredStudents = filteredStudents.filter(student =>
        filters.grades!.includes(student.grade.toString())
      )
    }

    if (filters.tags && filters.tags.length > 0) {
      filteredStudents = filteredStudents.filter(student =>
        filters.tags!.some(tag => student.tags.includes(tag))
      )
    }

    return filteredStudents
  }

  const sortStudents = (students: Student[], sortOptions: SortOptions) => {
    return [...students].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortOptions.field) {
        case 'name':
          aValue = formatName(a.firstName, a.lastName)
          bValue = formatName(b.firstName, b.lastName)
          break
        case 'grade':
          aValue = a.grade
          bValue = b.grade
          break
        case 'performance':
          aValue = calculatePerformanceScore(a.progress.attendance, a.progress.performance, a.progress.engagement)
          bValue = calculatePerformanceScore(b.progress.attendance, b.progress.performance, b.progress.engagement)
          break
        case 'nextSession':
          aValue = a.nextSession?.getTime() || 0
          bValue = b.nextSession?.getTime() || 0
          break
        case 'createdAt':
          aValue = a.createdAt.getTime()
          bValue = b.createdAt.getTime()
          break
        default:
          aValue = a.firstName
          bValue = b.firstName
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOptions.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return sortOptions.direction === 'asc' 
        ? aValue - bValue
        : bValue - aValue
    })
  }

  const getStudentStats = () => {
    const total = students.length
    const active = getActiveStudents().length
    const inactive = total - active
    
    const averagePerformance = students.reduce((acc, student) => {
      const performance = calculatePerformanceScore(
        student.progress.attendance,
        student.progress.performance,
        student.progress.engagement
      )
      return acc + performance
    }, 0) / (total || 1)

    const subjectCounts = students.reduce((acc, student) => {
      student.subjects.forEach(subject => {
        acc[subject] = (acc[subject] || 0) + 1
      })
      return acc
    }, {} as Record<string, number>)

    const gradeCounts = students.reduce((acc, student) => {
      const grade = student.grade.toString()
      acc[grade] = (acc[grade] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total,
      active,
      inactive,
      averagePerformance: Math.round(averagePerformance),
      subjectCounts,
      gradeCounts
    }
  }

  const getUpcomingStudents = () => {
    const now = new Date()
    return students
      .filter(student => student.nextSession && student.nextSession > now)
      .sort((a, b) => {
        const aTime = a.nextSession?.getTime() || 0
        const bTime = b.nextSession?.getTime() || 0
        return aTime - bTime
      })
  }

  const getStudentsWithLowPerformance = (threshold: number = 60) => {
    return students.filter(student => {
      const performance = calculatePerformanceScore(
        student.progress.attendance,
        student.progress.performance,
        student.progress.engagement
      )
      return performance < threshold
    })
  }

  const getStudentPerformanceScore = (studentId: string) => {
    const student = getStudentById(studentId)
    if (!student) return 0
    
    return calculatePerformanceScore(
      student.progress.attendance,
      student.progress.performance,
      student.progress.engagement
    )
  }

  const formatStudentName = (studentId: string) => {
    const student = getStudentById(studentId)
    if (!student) return 'Unknown Student'
    return formatName(student.firstName, student.lastName)
  }

  const formatStudentGrade = (studentId: string) => {
    const student = getStudentById(studentId)
    if (!student) return 'Unknown Grade'
    return formatGrade(student.grade)
  }

  return {
    // State
    students,
    
    // Actions
    createStudent,
    editStudent,
    deleteStudent,
    
    // Queries
    getStudent,
    getActiveStudentsList,
    getInactiveStudents,
    getStudentsBySubject,
    getStudentsByGrade,
    searchStudents,
    filterStudents,
    sortStudents,
    getUpcomingStudents,
    getStudentsWithLowPerformance,
    
    // Computed values
    stats: getStudentStats(),
    
    // Helpers
    getStudentPerformanceScore,
    formatStudentName,
    formatStudentGrade
  }
} 