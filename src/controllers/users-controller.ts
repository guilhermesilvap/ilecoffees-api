import { Request, Response } from "express"
import { z } from "zod"
import { upload } from "@/configs/multer"
import { prisma } from "@/database/prisma"
import { AccountType } from "./../../node_modules/.prisma/client/index.d"
import { hash } from "bcrypt"
import { AppError } from "@/utils/AppError"

class UsersRoutes {
  async create(req: Request, res: Response) {
    const bodySChema = z.object({
      photoUrl: z.string().optional(),
      accountType: z.enum(["INDIVIDUAL", "COMPANY"]),
      name: z.string().min(2, {
        message: "Você precisa digitar um nome com pelo menos 2 caracteres",
      }),
      email: z.string().email(),
      phoneNumber: z
        .string()
        .min(10)
        .max(15)
        .regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, {
          message: "Número de telefone inválido",
        }),
      password: z
        .string()
        .min(8, "Senha deve ter no mínimo 8 caracteres")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
          message:
            "Senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais",
        }),
      cep: z.string().length(8, { message: "CEP deve ter 8 dígitos" }),
      street: z.string(),
      number: z.string(),
      district: z.string(),
      city: z.string(),
      state: z.string().length(2, "UF deve ter 2 letras"),
      complement: z.string().optional(),
    })

    const {
      accountType,
      name,
      email,
      phoneNumber,
      password,
      cep,
      street,
      number,
      district,
      city,
      state,
      complement,
    } = bodySChema.parse(req.body)
    const photoUrl = req.file?.path
    const passwordHash = await hash(password, 8)
    const userWithSameEmail = await prisma.user.findFirst({ where: { email } })

    if (userWithSameEmail) {
      throw new AppError("Já existe um usuário cadastrado com este e-mail")
    }


    await prisma.user.create({
      data: {
        accountType,
        name,
        email,
        phoneNumber,
        passwordHash,
        cep,
        street,
        number,
        district,
        city,
        state,
        complement,
        photoUrl,
      },
    })

    res.status(201).json()
  }
}

export { UsersRoutes }
