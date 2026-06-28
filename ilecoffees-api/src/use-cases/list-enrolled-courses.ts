import { CourseEnrollmentsRepository } from '@/repositories/course-enrollments-repository'
import { CourseLessonProgressRepository } from '@/repositories/course-lesson-progress-repository'
import { CoursesRepository } from '@/repositories/courses-repository'
import { CourseLevel } from '@/entities/course'

export type EnrolledCourseWithDetails = {
  courseId: string
  title: string
  description: string
  imageUrl: string | null
  price: number
  workloadHours: number
  level: CourseLevel
  enrolledAt: Date | undefined
  totalLessons: number
  completedLessons: number
  progress: number
}

export class ListEnrolledCoursesUseCase {
  constructor(
    private courseEnrollmentsRepository: CourseEnrollmentsRepository,
    private progressRepository: CourseLessonProgressRepository,
    private coursesRepository: CoursesRepository,
  ) {}

  async execute(userId: string): Promise<EnrolledCourseWithDetails[]> {
    const enrollments = await this.courseEnrollmentsRepository.listByUser(userId)

    const results = await Promise.all(
      enrollments.map(async (e) => {
        const [course, summary] = await Promise.all([
          this.coursesRepository.findById(e.courseId),
          this.progressRepository.getCourseProgress(userId, e.courseId),
        ])
        if (!course) return null
        return {
          courseId: e.courseId,
          title: course.title,
          description: course.description,
          imageUrl: course.imageUrl ?? null,
          price: course.price,
          workloadHours: course.workloadHours,
          level: course.level,
          enrolledAt: e.enrolledAt,
          totalLessons: summary.totalLessons,
          completedLessons: summary.completedLessons,
          progress: summary.completionPercent,
        }
      }),
    )

    return results.filter((r): r is EnrolledCourseWithDetails => r !== null)
  }
}
