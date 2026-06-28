import { AppError } from '@/utils/AppError'
import { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'

export const errorHandling: ErrorRequestHandler = (error, request, response, next) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({ message: error.message })
    return
  }

  if (error instanceof ZodError) {
    response.status(400).json({ message: 'Dados inválidos', issues: error.format() })
    return
  }

  console.error('[unhandled error]', error)
  response.status(500).json({ message: 'Erro interno do servidor' })
}
