import { AppError } from '@/utils/AppError'
import { CoursesRepository } from '@/repositories/courses-repository'
import { CourseEnrollmentsRepository } from '@/repositories/course-enrollments-repository'
import { OrdersRepository } from '@/repositories/orders-repository'

interface EnrollInCourseInput {
  userId: string
  courseId: string
}

interface EnrollInCourseResult {
  enrolled: boolean
  orderId?: string
}

export class EnrollInCourseUseCase {
  constructor(
    private coursesRepository: CoursesRepository,
    private courseEnrollmentsRepository: CourseEnrollmentsRepository,
    private ordersRepository: OrdersRepository,
  ) {}

  async execute({ userId, courseId }: EnrollInCourseInput): Promise<EnrollInCourseResult> {
    const course = await this.coursesRepository.findById(courseId)
    if (!course) throw new AppError('Curso não encontrado', 404)

    const existingEnrollment = await this.courseEnrollmentsRepository.findByUserAndCourse(userId, courseId)
    if (existingEnrollment) throw new AppError('Você já está matriculado neste curso')

    if (course.price === 0) {
      await this.courseEnrollmentsRepository.create({ userId, courseId })
      return { enrolled: true }
    }

    const order = await this.ordersRepository.create({
      userId,
      courseId,
      totalPrice: course.price,
      type: 'COURSE',
    })

    return { enrolled: false, orderId: order.id }
  }
}
