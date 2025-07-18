import {z} from "zod"
import { Request, Response } from "express"
import { upload } from "@/configs/multer"
import { prisma } from "@/database/prisma"
import { AccountType } from "./../../node_modules/.prisma/client/index.d"
import { hash } from "bcrypt"
import { AppError } from "@/utils/AppError"


class SuppliersController{

async create(req:Request, res:Response){ 

 const bodySchema = z.object({
        photoUrl: z.string().optional(),
        name: z.string().min(2, {
          message: "Você precisa digitar um nome com pelo menos 2 caracteres",
        }),
        email: z.string().email({message:"Digite um e-mail válido"}),
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
      name,
      email,
      password,
      cep,
      street,
      number,
      district,
      city,
      state,
      complement,
    } = bodySchema.parse(req.body)

     const photoUrl = req.file?.path
     const passwordHash = await hash(password, 8)
     const userWithSameEmail = await prisma.user.findFirst({ where: { email } })
     const supplierWithSameEmail = await prisma.supplier.findFirst({ where: { email } })
    

      if (userWithSameEmail || supplierWithSameEmail) {
      throw new AppError("Já existe um usuário cadastrado com este e-mail")
    }


    await prisma.supplier.create({
      data: {
        name,
        email,
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

export {SuppliersController}