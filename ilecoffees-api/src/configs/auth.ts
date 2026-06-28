import { env } from '@/env'

export const authConfig = {
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: '1h',
    refreshSecret: env.JWT_SECRET + ':refresh',
    refreshExpiresIn: '7d',
  },
}