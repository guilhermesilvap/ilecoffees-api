import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET deve ter ao menos 16 caracteres'),
  PORT: z.coerce.number().default(3333),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  FRONTEND_URL: z.string().default('https://ilecoffees.com.br'),
  RESEND_API_KEY: z.string().default(''),
  MAIL_FROM: z.string().default(''),
  MP_ACCESS_TOKEN: z.string().default(''),
  MP_PUBLIC_KEY: z.string().default(''),
  MP_WEBHOOK_SECRET: z.string().default(''),
  MP_APP_ID: z.string().default(''),
  MP_CLIENT_SECRET: z.string().default(''),
  MP_REDIRECT_URI: z.string().default(''),
})

export const env = envSchema.parse(process.env)