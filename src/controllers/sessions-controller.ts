import { prisma } from "@/database/prisma"
import { AppError } from "@/utils/AppError"
import { Request, Response } from "express"
import { z } from "zod"
import { compare } from "bcrypt"
import { authConfig } from "@/configs/auth"
import { sign } from "jsonwebtoken"

class SessionsController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      email: z.string().email({ message: "E-mail inválido" }),
      password: z.string(),
    })

    const { email, password } = bodySchema.parse(request.body)

    let account: any = await prisma.user.findFirst({ where: { email } })
    let type: "USER" | "SUPPLIER" = "USER"

    if (!account) {
      account = await prisma.supplier.findFirst({ where: { email } })
      type = "SUPPLIER"
    }

    if (!account) {
      throw new AppError("E‑mail ou senha inválidos", 401)
    }

    const passwordMatched = await compare(password, account.passwordHash)
    if (!passwordMatched) {
      throw new AppError("E‑mail ou senha inválidos", 401)
    }

    const { secret, expiresIn } = authConfig.jwt

    const token = sign({ id: account.id, type }, secret, { expiresIn })

    const { passwordHash: _, ...accountSafe } = account

    response.json({ token, account: accountSafe, type })
  }
}

export { SessionsController }
