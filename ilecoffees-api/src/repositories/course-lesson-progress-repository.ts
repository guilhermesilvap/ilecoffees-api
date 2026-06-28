import { CourseLessonProgress } from '@/entities/course-lesson-progress'

export type CourseProgressSummary = {
  courseId: string
  totalLessons: number
  completedLessons: number
  completionPercent: number
  lessons: Array<{
    lessonId: string
    title: string
    order: number
    completed: boolean
    completedAt?: Date
  }>
}

export interface CourseLessonProgressRepository {
  markComplete(userId: string, lessonId: string): Promise<CourseLessonProgress>
  getCourseProgress(userId: string, courseId: string): Promise<CourseProgressSummary>
  listCompletedByUser(userId: string): Promise<CourseLessonProgress[]>
  listProgressForCourse(courseId: string): Promise<Array<{ userId: string; lessonId: string; completedAt: Date | null }>>
}
