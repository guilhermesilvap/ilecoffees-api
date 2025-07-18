import { Request, Response } from "express"
import { z } from "zod"
import { prisma } from "@/database/prisma"
import { AppError } from "../utils/AppError"

class SubscriptionControllers {
  async create(req: Request, res: Response) {
    const bodySchema = z.object({
      name: z.string().min(2),
      description: z.string().min(5),
      monthlyPrice: z.number().positive(),
      annualPrice: z.number().positive(),
      quantity: z.number().positive().optional(),
      coffeeIds: z
        .array(z.string().uuid())
        .min(1, "Pelo menos um café deve ser selecionado"),
    })

    const {
      name,
      description,
      monthlyPrice,
      annualPrice,
      quantity,
      coffeeIds,
    } = bodySchema.parse(req.body)

    if (!req.user || !req.user.id) {
      throw new AppError("Usuário não autenticado", 401)
    }

    if (req.user?.type === "USER") {
      throw new AppError("Você não tem permissão para criar assinaturas")
    }

    const supplierId = req.user.id

    const coffees = await prisma.coffee.findMany({
      where: {
        id: { in: coffeeIds },
        supplierId: supplierId,
        deletedAt: null,
      },
    })

    if (coffees.length !== coffeeIds.length) {
      throw new AppError(
        "Um ou mais cafés não foram encontrados ou não pertencem ao supplier"
      )
    }

    const kgCoffees = coffees.filter((coffee) => coffee.saleType === "KG")
    if (kgCoffees.length > 0) {
      throw new AppError(
        "Cafés vendidos por KG não podem ser adicionados em assinaturas. Apenas cafés em pacotes são permitidos."
      )
    }

    const subscription = await prisma.subscription.create({
      data: {
        name,
        description,
        monthlyPrice: monthlyPrice,
        annualPrice: annualPrice,
        quantity: quantity || undefined,
        supplierId,
        coffees: {
          connect: coffeeIds.map((id) => ({ id })),
        },
      },
      include: {
        coffees: {
          select: {
            id: true,
            name: true,
            description: true,
            variety: true,
            photoUrl: true,
          },
        },
      },
    })

    res.status(201).json(subscription)
  }

  async delete(req: Request, res: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(req.params)

    if (!req.user || !req.user.id) {
      throw new AppError("Usuário não autenticado", 401)
    }

    if (req.user?.type === "USER") {
      throw new AppError("Você não tem permissão para deletar assinaturas")
    }

    const supplierId = req.user.id

    const subscription = await prisma.subscription.findFirst({
      where: {
        id,
        supplierId,
        deletedAt: null,
      },
    })

    if (!subscription) {
      throw new AppError("Assinatura não encontrada")
    }

    await prisma.subscription.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    res.status(204).send()
  }

  async index(req: Request, res: Response) {
  
    const querySchema = z.object({
      name: z.string().trim().optional(),
      description: z.string().trim().optional(),
      monthlyPrice: z.coerce.number().min(0).optional(),
      annualPrice: z.coerce.number().min(0).optional(),
      quantity: z.coerce.number().min(0).optional(),
      supplierId: z.string().uuid().optional(),
    })

    const query = querySchema.parse(req.query)

    // Construção do filtro base
    const baseFilter = {
      deletedAt: null,
      ...(query.name && { 
        name: { 
          contains: query.name, 
          mode: "insensitive" as const 
        } 
      }),
      ...(query.description && { 
        description: { 
          contains: query.description, 
          mode: "insensitive" as const 
        } 
      }),
      ...(query.monthlyPrice !== undefined && { monthlyPrice: query.monthlyPrice }),
      ...(query.annualPrice !== undefined && { annualPrice: query.annualPrice }),
      ...(query.quantity !== undefined && { quantity: query.quantity }),
      
      // Filtros baseados no tipo de usuário
      ...(req.user?.type === "SUPPLIER" && { supplierId: req.user.id }),
      ...(req.user?.type === "USER" && query.supplierId && { supplierId: query.supplierId }),
    }

    // Busca as subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: baseFilter,
      orderBy: { createdAt: "desc" },
      include: {
        coffees: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    res.status(200).json(subscriptions)
  }
}

export { SubscriptionControllers }
