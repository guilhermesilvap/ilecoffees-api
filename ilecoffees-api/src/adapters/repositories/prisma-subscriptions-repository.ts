import { PrismaClient } from '@prisma/client'
import { Subscription, SubscriptionData } from '@/entities/subscription'
import { Coffee, CoffeeData } from '@/entities/coffee'
import {
  SubscriptionsRepository,
  CreateSubscriptionDTO,
  UpdateSubscriptionDTO,
  ListSubscriptionsFilters,
} from '@/repositories/subscriptions-repository'

export class PrismaSubscriptionsRepository implements SubscriptionsRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateSubscriptionDTO): Promise<Subscription> {
    const record = await this.prisma.subscription.create({
      data: {
        name: data.name,
        description: data.description,
        monthlyPrice: data.monthlyPrice,
        annualPrice: data.annualPrice,
        coffeeshopMonthlyPrice: data.coffeeshopMonthlyPrice,
        coffeeshopAnnualPrice: data.coffeeshopAnnualPrice,
        quantity: data.quantity,
        supplierId: data.supplierId,
        coffees: { connect: data.coffeeIds.map((id) => ({ id })) },
      },
      include: { coffees: true },
    })

    return new Subscription({
      ...(record as unknown as SubscriptionData),
      coffees: record.coffees.map((c) => new Coffee(c as unknown as CoffeeData)),
    })
  }

  async update(id: string, data: UpdateSubscriptionDTO): Promise<Subscription> {
    const { coffeeIds, ...fields } = data

    const record = await this.prisma.subscription.update({
      where: { id },
      data: {
        ...fields,
        ...(coffeeIds && { coffees: { set: coffeeIds.map((cid) => ({ id: cid })) } }),
      },
      include: { coffees: true },
    })

    return new Subscription({
      ...(record as unknown as SubscriptionData),
      coffees: record.coffees.map((c) => new Coffee(c as unknown as CoffeeData)),
    })
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.subscription.update({ where: { id }, data: { deletedAt: new Date() } })
  }

  async findById(id: string, supplierId?: string): Promise<Subscription | null> {
    const record = await this.prisma.subscription.findFirst({
      where: { id, deletedAt: null, ...(supplierId && { supplierId }) },
      include: {
        coffees: { select: { id: true, name: true, photoUrl: true } },
        supplier: { select: { id: true, name: true, email: true } },
      },
    })
    if (!record) return null
    return new Subscription({
      ...(record as unknown as SubscriptionData),
      coffees: record.coffees.map((c) => new Coffee(c as unknown as CoffeeData)),
    })
  }

  async list(filters: ListSubscriptionsFilters): Promise<Subscription[]> {
    const records = await this.prisma.subscription.findMany({
      where: {
        deletedAt: null,
        ...(filters.supplierId && { supplierId: filters.supplierId }),
        ...(filters.name && { name: { contains: filters.name, mode: 'insensitive' } }),
        ...(filters.description && {
          description: { contains: filters.description, mode: 'insensitive' },
        }),
        ...(filters.monthlyPrice !== undefined && { monthlyPrice: filters.monthlyPrice }),
        ...(filters.annualPrice !== undefined && { annualPrice: filters.annualPrice }),
        ...(filters.quantity !== undefined && { quantity: filters.quantity }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        coffees: { select: { id: true, name: true, photoUrl: true } },
        supplier: { select: { id: true, name: true, email: true } },
      },
    })

    return records.map(
      (r) =>
        new Subscription({
          ...(r as unknown as SubscriptionData),
          coffees: r.coffees.map((c) => new Coffee(c as unknown as CoffeeData)),
        }),
    )
  }
}
