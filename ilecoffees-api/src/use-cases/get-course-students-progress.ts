import { AppError } from '@/utils/AppError'
import { CoursesRepository } from '@/repositories/courses-repository'
import { CourseEnrollmentsRepository } from '@/repositories/course-enrollments-repository'
import { CourseLessonProgressRepository } from '@/repositories/course-lesson-progress-repository'
import { CourseLessonsRepository } from '@/repositories/course-lessons-repository'

export interface StudentProgress {
  userId: string
  userName: string
  userEmail: string
  enrolledAt: Date
  completedLessons: number
  totalLessons: number
  completionPercent: number
  lastActivityAt: Date | null
}

export class GetCourseStudentsProgressUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private courseEnrollmentsRepository: CourseEnrollmentsRepository,
    private courseLessonsRepository: CourseLessonsRepository,
    private progressRepository: CourseLessonProgressRepository,
  ) {}

  async execute(courseId: string): Promise<StudentProgress[]> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) throw new AppError('Curso não encontrado', 404)

    const [enrollments, lessons, allProgress] = await Promise.all([
      this.courseEnrollmentsRepository.listByCourse(courseId),
      this.courseLessonsRepository.listByCourse(courseId),
      this.progressRepository.listProgressForCourse(courseId),
    ])

    const totalLessons = lessons.length

    const progressByUser = new Map<string, { count: number; lastAt: Date | null }>()
    for (const p of allProgress) {
      const entry = progressByUser.get(p.userId) ?? { count: 0, lastAt: null }
      entry.count++
      if (!entry.lastAt || (p.completedAt && p.completedAt > entry.lastAt)) {
        entry.lastAt = p.completedAt
      }
      progressByUser.set(p.userId, entry)
    }

    return enrollments.map(e => {
      const prog = progressByUser.get(e.userId) ?? { count: 0, lastAt: null }
      return {
        userId: e.userId,
        userName: e.user.name,
        userEmail: e.user.email,
        enrolledAt: e.enrolledAt,
        completedLessons: prog.count,
        totalLessons,
        completionPercent: totalLessons > 0 ? Math.round((prog.count / totalLessons) * 100) : 0,
        lastActivityAt: prog.lastAt,
      }
    })
  }
}
