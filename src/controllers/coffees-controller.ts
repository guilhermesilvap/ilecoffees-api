import { prisma } from "@/database/prisma"
import { AppError } from "@/utils/AppError"
import { Response, Request } from "express"
import { optional, z } from "zod"

class CoffeesControllers {
  async create(req: Request, res: Response) {
    const bodySchema = z
      .object({
        photoUrl: z.string().optional(),
        name: z.string().min(2),
        description: z.string().min(5),
        variety: z.string().min(2),
        process: z.string().min(2),
        region: z.string().min(2),
        altitude: z.number().min(1),
        farm: z.string().min(2),
        producer: z.string().min(2),
        score: z.number().min(1),
        sensory: z.string().min(2),
        roast: z.string().min(2),
        saleType: z.enum(["KG", "PACKAGE"]),
        pricePerKg: z.number().positive().optional(),
        packagePrice: z.number().positive().optional(),
        packageWeight: z.number().positive().optional(),
        stock: z.number().positive().optional(),
        supplierId: z.string(),
      })
      .refine(
        (data) => {
          if (data.saleType === "KG") {
            return !!data.pricePerKg
          } else {
            return !!data.packagePrice && !!data.packageWeight
          }
        },
        {
          message:
            "Campos de preço não foram preenchidos corretamente de acordo com o tipo de venda.",
        }
      )

    const {
      name,
      description,
      variety,
      process,
      region,
      altitude,
      farm,
      producer,
      score,
      sensory,
      roast,
      saleType,
      pricePerKg,
      packagePrice,
      packageWeight,
      stock,
      supplierId = req.user.id,
    } = bodySchema.parse(req.body)

    const photoUrl = req.file?.path

    if (req.user?.type === "USER") {
      throw new AppError("Você não tem permissão para acrescentar cafés")
    }

    const coffeeData: any = {
      name,
      description,
      variety,
      process,
      region,
      altitude,
      saleType,
      farm,
      producer,
      score,
      sensory,
      roast,
      stock,
      supplierId,
      photoUrl,
    }

    if (saleType === "KG" && pricePerKg !== undefined) {
      coffeeData.pricePerKg = pricePerKg
      coffeeData.packagePrice = null
      coffeeData.packageWeight = null
    }

    if (
      saleType === "PACKAGE" &&
      packagePrice !== undefined &&
      packageWeight !== undefined
    ) {
      coffeeData.packagePrice = packagePrice
      coffeeData.packageWeight = packageWeight
      coffeeData.pricePerKg = null
      coffeeData.stock = null
    }

    await prisma.coffee.create({
      data: coffeeData,
    })

    res.status(201).json()
  }

  async delete(req: Request, res: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid({ message: "ID inválido" }),
    })
    const { id } = paramsSchema.parse(req.params)

    if (!req.user || req.user.type === "USER") {
      throw new AppError("Você não tem permissão para acrescentar cafés")
    }

    await prisma.coffee.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    res.status(204).json()
  }

  async update(req: Request, res: Response) {
    const bodySchema = z
      .object({
        photoUrl: z.string().optional(),
        name: z.string().min(2).optional(),
        description: z.string().min(5).optional(),
        variety: z.string().min(2).optional(),
        process: z.string().min(2).optional(),
        region: z.string().min(2).optional(),
        altitude: z.number().min(1).optional(),
        farm: z.string().min(2).optional(),
        producer: z.string().min(2).optional(),
        score: z.number().min(1).optional(),
        sensory: z.string().min(2).optional(),
        roast: z.string().min(2).optional(),
        saleType: z.enum(["KG", "PACKAGE"]).optional(),
        pricePerKg: z.number().positive().optional(),
        packagePrice: z.number().positive().optional(),
        packageWeight: z.number().positive().optional(),
        stock: z.number().positive().optional(),
        supplierId: z.string().optional(),
      })
      .refine(
        (data) => {
          if (data.saleType === "KG") {
            return !!data.pricePerKg
          } else if (data.saleType === "PACKAGE") {
            return !!data.packagePrice && !!data.packageWeight
          }
          return true
        },
        {
          message:
            "Campos de preço não foram preenchidos corretamente de acordo com o tipo de venda.",
        }
      )

    const parsedBody = bodySchema.parse(req.body)
    const { id } = req.params

    const photoUrl = req.file?.path

    if (req.user?.type === "USER") {
      throw new AppError("Você não tem permissão para acrescentar cafés")
    }

    const coffeeData: Record<string, any> = {
      ...parsedBody,
      supplierId: req.user.id,
      photoUrl,
    }

    const coffee = await prisma.coffee.findFirst({where:{id}})

     if (!coffee || coffee.deletedAt) {
    throw new AppError("Café inexistente")
  }
   const newType = parsedBody.saleType
  const oldType = coffee.saleType

  if (newType && newType !== oldType) {
    if (newType === "KG") {
      coffeeData.packagePrice = null
      coffeeData.packageWeight = null
      coffee.packagePrice = null
      coffee.packageWeight = null
    } else if (newType === "PACKAGE") {
      coffeeData.pricePerKg = null
      coffeeData.stock = null
      coffee.pricePerKg = null
      coffee.stock = null
    }
  }

    await prisma.coffee.update({
      where: { id },
      data: coffeeData,
    })


    res.status(201).json()
  }

  async index(req:Request, res:Response) {
    const querySchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      variety: z.string().optional(),
      process: z.string().optional(),
      region: z.string().optional(),
      altitude: z.coerce.number().optional(),
      farm: z.string().optional(),
      producer: z.string().optional(),
      score: z.coerce.number().optional(),
      sensory: z.string().optional(),
      roast: z.string().optional(),
      saleType: z.enum(["KG", "PACKAGE"]).optional(),
      pricePerKg: z.coerce.number().optional(),
      packagePrice: z.coerce.number().optional(),
      packageWeight: z.coerce.number().optional(),
      stock: z.coerce.number().optional(),
      supplierId: z.string().optional(),
    })

    const query = querySchema.parse(req.query)

    const baseFilter: any = {
      deletedAt: null,
      ...(query.name && { name: { contains: query.name, mode: "insensitive" } }),
      ...(query.description && { description: { contains: query.description, mode: "insensitive" } }),
      ...(query.variety && { variety: { contains: query.variety, mode: "insensitive" } }),
      ...(query.process && { process: { contains: query.process, mode: "insensitive" } }),
      ...(query.region && { region: { contains: query.region, mode: "insensitive" } }),
      ...(query.altitude && { altitude: query.altitude }),
      ...(query.farm && { farm: { contains: query.farm, mode: "insensitive" } }),
      ...(query.producer && { producer: { contains: query.producer, mode: "insensitive" } }),
      ...(query.score && { score: query.score }),
      ...(query.sensory && { sensory: { contains: query.sensory, mode: "insensitive" } }),
      ...(query.roast && { roast: { contains: query.roast, mode: "insensitive" } }),
      ...(query.saleType && { saleType: query.saleType }),
      ...(query.pricePerKg && { pricePerKg: query.pricePerKg }),
      ...(query.packagePrice && { packagePrice: query.packagePrice }),
      ...(query.packageWeight && { packageWeight: query.packageWeight }),
      ...(query.stock && { stock: query.stock }),
    }

    if (req.user?.type === "SUPPLIER") {
      baseFilter.supplierId = req.user.id
    }

    if (req.user?.type === "USER" && query.supplierId) {
      baseFilter.supplierId = query.supplierId
    }

    const coffees = await prisma.coffee.findMany({
      where: baseFilter,
      orderBy: { createdAt: "desc" },
    })

    res.status(200).json(coffees)

  }
}

export { CoffeesControllers }
