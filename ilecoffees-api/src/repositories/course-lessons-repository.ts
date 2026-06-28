import { CourseLesson } from '@/entities/course-lesson'

export type CreateCourseLessonDTO = {
  courseId: string
  title: string
  description?: string | null
  videoUrl: string
  order: number
  isLocked: boolean
  durationMinutes?: number | null
}

export type UpdateCourseLessonDTO = Partial<Omit<CreateCourseLessonDTO, 'courseId'>>

export interface CourseLessonsRepository {
  create(data: CreateCourseLessonDTO): Promise<CourseLesson>
  findById(id: string): Promise<CourseLesson | null>
  listByCourse(courseId: string): Promise<CourseLesson[]>
  update(id: string, data: UpdateCourseLessonDTO): Promise<CourseLesson>
  delete(id: string): Promise<void>
}
