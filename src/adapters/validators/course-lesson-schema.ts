import { z } from 'zod'

export const createCourseLessonSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  videoUrl: z.string().url(),
  order: z.coerce.number().int().min(1),
  isLocked: z.boolean().default(true),
  durationMinutes: z.coerce.number().int().min(1).optional().nullable(),
})

export const updateCourseLessonSchema = createCourseLessonSchema.partial()
