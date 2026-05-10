import { z } from 'zod'

export const createCourseSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.coerce.number().min(0),
  workloadHours: z.coerce.number().int().min(1),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
})

export const updateCourseSchema = createCourseSchema.partial()
