import { authConfig } from "@/configs/auth"
import { AppError } from "@/utils/AppError"
import { NextFunction, Request, Response } from "express"
import { verify } from "jsonwebtoken"

interface TokenPayload {
  id: string
  type: `SUPPLIER` | `USER`
}

function requireAuth(request: Request, response: Response, next: NextFunction) {
  const authHeader = request.headers.authorization

  try {
    if (!authHeader) {
      throw new AppError("Token not found", 404)
    }

    const [, token] = authHeader.split(" ")

    const { id, type } = verify(token, authConfig.jwt.secret) as TokenPayload

    request.user = {
      id,
      type
    }
    return next()
  } catch (error) {
    throw new AppError("Invalid JWT token", 401)
  }
}

export { requireAuth }
