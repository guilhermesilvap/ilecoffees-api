import { Request, Response } from 'express'
import { AppError } from '@/utils/AppError'
import { createCourseSchema, updateCourseSchema } from '@/adapters/validators/course-schema'
import { createCourseLessonSchema, updateCourseLessonSchema } from '@/adapters/validators/course-lesson-schema'
import { CreateCourseUseCase } from '@/use-cases/create-course'
import { UpdateCourseUseCase } from '@/use-cases/update-course'
import { DeleteCourseUseCase } from '@/use-cases/delete-course'
import { ListCoursesUseCase } from '@/use-cases/list-courses'
import { CreateCourseLessonUseCase } from '@/use-cases/create-course-lesson'
import { UpdateCourseLessonUseCase } from '@/use-cases/update-course-lesson'
import { DeleteCourseLessonUseCase } from '@/use-cases/delete-course-lesson'
import { GetCourseWithLessonsUseCase } from '@/use-cases/get-course-with-lessons'
import { EnrollInCourseUseCase } from '@/use-cases/enroll-in-course'
import { ListEnrolledCoursesUseCase } from '@/use-cases/list-enrolled-courses'

export class CoursesController {
  constructor(
    private createCourseUseCase: CreateCourseUseCase,
    private updateCourseUseCase: UpdateCourseUseCase,
    private deleteCourseUseCase: DeleteCourseUseCase,
    private listCoursesUseCase: ListCoursesUseCase,
    private createCourseLessonUseCase: CreateCourseLessonUseCase,
    private updateCourseLessonUseCase: UpdateCourseLessonUseCase,
    private deleteCourseLessonUseCase: DeleteCourseLessonUseCase,
    private getCourseWithLessonsUseCase: GetCourseWithLessonsUseCase,
    private enrollInCourseUseCase: EnrollInCourseUseCase,
    private listEnrolledCoursesUseCase: ListEnrolledCoursesUseCase,
  ) {}

  // Admin: create course
  create = async (req: Request, res: Response): Promise<void> => {
    const data = createCourseSchema.parse(req.body)
    const imageUrl = req.file ? (req.file as Express.Multer.File & { path: string }).path : null
    const course = await this.createCourseUseCase.execute({ ...data, imageUrl })
    res.status(201).json(course)
  }

  // Admin: update course
  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const data = updateCourseSchema.parse(req.body)
    const imageUrl = req.file ? (req.file as Express.Multer.File & { path: string }).path : undefined
    const course = await this.updateCourseUseCase.execute({ id, ...data, ...(imageUrl !== undefined && { imageUrl }) })
    res.status(200).json(course)
  }

  // Admin: delete course
  delete = async (req: Request, res: Response): Promise<void> => {
    await this.deleteCourseUseCase.execute(req.params.id)
    res.status(204).send()
  }

  // Public (auth required): list all courses
  index = async (_req: Request, res: Response): Promise<void> => {
    const courses = await this.listCoursesUseCase.execute()
    res.status(200).json(courses)
  }

  // Public (auth required): get course details with lessons
  show = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new AppError('Não autorizado', 401)
    const result = await this.getCourseWithLessonsUseCase.execute(req.params.id, req.user.id)
    res.status(200).json(result)
  }

  // Admin: create lesson
  createLesson = async (req: Request, res: Response): Promise<void> => {
    const data = createCourseLessonSchema.parse(req.body)
    const lesson = await this.createCourseLessonUseCase.execute({ courseId: req.params.id, ...data })
    res.status(201).json(lesson)
  }

  // Admin: update lesson
  updateLesson = async (req: Request, res: Response): Promise<void> => {
    const data = updateCourseLessonSchema.parse(req.body)
    const lesson = await this.updateCourseLessonUseCase.execute({ id: req.params.lessonId, ...data })
    res.status(200).json(lesson)
  }

  // Admin: delete lesson
  deleteLesson = async (req: Request, res: Response): Promise<void> => {
    await this.deleteCourseLessonUseCase.execute(req.params.lessonId)
    res.status(204).send()
  }

  // User: enroll in course (free = immediate; paid = returns orderId)
  enroll = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'USER') throw new AppError('Apenas usuários podem se matricular em cursos', 403)
    const result = await this.enrollInCourseUseCase.execute({ userId: req.user.id, courseId: req.params.id })
    res.status(result.enrolled ? 200 : 201).json(result)
  }

  // User: list enrolled courses
  myEnrollments = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.type !== 'USER') throw new AppError('Apenas usuários podem ver suas matrículas', 403)
    const enrollments = await this.listEnrolledCoursesUseCase.execute(req.user.id)
    res.status(200).json(enrollments)
  }
}
