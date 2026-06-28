import { AppError } from '@/utils/AppError'
import { Payment, PaymentMethod } from '@/entities/payment'
import { Order } from '@/entities/order'
import { Supplier } from '@/entities/supplier'
import { PaymentsRepository } from '@/repositories/payments-repository'
import { OrdersRepository } from '@/repositories/orders-repository'
import { SuppliersRepository } from '@/repositories/suppliers-repository'
import { FulfillApprovedOrderUseCase } from './fulfill-approved-order'
import { mpPaymentService, PixResult } from '@/services/mercadopago-payment-service'
import { env } from '@/env'

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

interface CreatePaymentInput {
  orderId: string
  method: PaymentMethod
  userId: string
  cardToken?: string
  installments?: number
  paymentMethodId?: string
  issuerId?: string
}

export interface CreatePaymentResult {
  payment: Payment
  pix?: {
    qrCode: string
    copyPaste: string
    expiresAt: Date
  }
}

export class CreatePaymentUseCase {
  constructor(
    private paymentsRepository: PaymentsRepository,
    private ordersRepository: OrdersRepository,
    private suppliersRepository: SuppliersRepository,
    private fulfillApprovedOrderUseCase: FulfillApprovedOrderUseCase,
  ) {}

  async execute(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const { orderId, method, userId } = input

    const order = await this.ordersRepository.findById(orderId)
    if (!order) throw new AppError('Pedido não encontrado', 404)

    // Autorização: userId para pedidos de usuário, buyerSupplierId para B2B
    const isB2B = !!order.buyerSupplierId && !order.userId
    if (isB2B) {
      if (order.buyerSupplierId !== userId) throw new AppError('Você não tem permissão para pagar este pedido', 403)
    } else {
      if (order.userId !== userId) throw new AppError('Você não tem permissão para pagar este pedido', 403)
    }
    if (order.status !== 'PENDING') throw new AppError('Este pedido já foi processado')

    // Payer info: user para B2C, buyerSupplier para B2B
    const payer = order.user ?? order.buyerSupplier
    if (!payer) throw new AppError('Dados do comprador não encontrados', 500)
    const user = { ...payer, cpf: (order.user as any)?.cpf ?? null }

    const supplier = await this.resolveSupplier(order)
    const supplierAccessToken = supplier ? await this.getValidAccessToken(supplier) : null

    const mpEnabled = !!env.MP_ACCESS_TOKEN

    let payment: Payment
    let pixResult: PixResult | undefined

    // ── PIX ──────────────────────────────────────────────────────────────────
    if (method === 'PIX') {
      if (mpEnabled) {
        try {
          pixResult = await mpPaymentService.createPix(order.totalPrice, orderId, {
            email: user.email,
            firstName: user.name?.split(' ')[0] ?? 'Cliente',
            lastName: user.name?.split(' ').slice(1).join(' ') ?? '',
            cpf: user.cpf ?? null,
          }, supplierAccessToken)

          payment = await this.paymentsRepository.create({
            orderId,
            amount: order.totalPrice,
            method,
            status: 'PENDING',
            externalId: pixResult.externalId,
            pixQrCode: pixResult.qrCode,
            pixCopiaECola: pixResult.copyPaste,
            pixExpiresAt: pixResult.expiresAt,
          })
        } catch (e: any) {
          if (e?.code === 'P2002') throw new AppError('Este pedido já possui um pagamento registrado', 409)
          throw new AppError(`Erro ao gerar PIX: ${e?.message ?? 'tente novamente'}`, 502)
        }
      } else {
        // Modo simulado (sem credenciais MP)
        payment = await this.paymentsRepository.create({
          orderId,
          amount: order.totalPrice,
          method,
          status: 'PENDING',
        })
        pixResult = {
          externalId: 'SIMULADO',
          qrCode: '',
          copyPaste: '00020126580014br.gov.bcb.pix0136simulado-pix-ile-coffees5204000053039865802BR5925ILE COFFEES TORREFACAO6009SAO PAULO62070503***6304AAAA',
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        }
      }

      return {
        payment,
        pix: { qrCode: pixResult.qrCode, copyPaste: pixResult.copyPaste, expiresAt: pixResult.expiresAt },
      }
    }

    // ── CARTÃO DE CRÉDITO ─────────────────────────────────────────────────────
    if (method === 'CREDIT_CARD') {
      if (!input.cardToken) throw new AppError('Token do cartão é obrigatório', 400)

      let mpStatus: 'approved' | 'rejected' | 'pending' | 'in_process' = 'approved'
      let externalId: string | undefined

      if (mpEnabled) {
        try {
          const cardResult = await mpPaymentService.createCard(
            order.totalPrice,
            orderId,
            { email: user.email, firstName: user.name?.split(' ')[0] ?? 'Cliente', lastName: user.name?.split(' ').slice(1).join(' ') ?? '' },
            input.cardToken,
            input.installments ?? 1,
            input.paymentMethodId ?? 'visa',
            input.issuerId,
            supplierAccessToken,
          )
          mpStatus = cardResult.status
          externalId = cardResult.externalId
        } catch (e: any) {
          throw new AppError(`Erro ao processar cartão: ${e?.message ?? 'tente novamente'}`, 502)
        }
      }

      const isApproved = mpStatus === 'approved'

      try {
        if (isApproved) {
          payment = await this.paymentsRepository.createWithOrderUpdate(
            { orderId, amount: order.totalPrice, method, status: 'SUCCESS', paidAt: new Date(), externalId },
            orderId,
          )
          await this.fulfillApprovedOrderUseCase.execute(order)
        } else {
          payment = await this.paymentsRepository.create({
            orderId, amount: order.totalPrice, method,
            status: mpStatus === 'rejected' ? 'FAILED' : 'PENDING',
            externalId,
          })
          if (mpStatus === 'rejected') {
            throw new AppError('Pagamento recusado pelo banco. Verifique os dados do cartão.', 402)
          }
          return { payment }
        }
      } catch (e: any) {
        if (e?.code === 'P2002') throw new AppError('Este pedido já possui um pagamento registrado', 409)
        throw e
      }

      return { payment }
    }

    throw new AppError('Método de pagamento não suportado', 400)
  }

  private async resolveSupplier(order: Order): Promise<Supplier | null> {
    const supplierId =
      order.coffee?.supplierId ??
      order.subscription?.supplierId ??
      order.course?.supplierId ??
      null

    if (!supplierId) return null
    return this.suppliersRepository.findById(supplierId)
  }

  private async getValidAccessToken(supplier: Supplier): Promise<string | null> {
    if (!supplier.mpAccessToken) return null

    const nearExpiry = supplier.mpTokenExpiresAt
      ? supplier.mpTokenExpiresAt.getTime() - Date.now() < SEVEN_DAYS_MS
      : false

    if (nearExpiry && supplier.mpRefreshToken) {
      try {
        const refreshed = await mpPaymentService.refreshToken(supplier.mpRefreshToken)
        await this.suppliersRepository.updateMpTokens(supplier.id!, {
          mpAccessToken: refreshed.accessToken,
          mpRefreshToken: refreshed.refreshToken,
          mpUserId: refreshed.userId,
          mpTokenExpiresAt: refreshed.expiresAt,
        })
        return refreshed.accessToken
      } catch {
        // Se o refresh falhar, usa o token atual — pode já ter expirado, mas tentamos
      }
    }

    return supplier.mpAccessToken
  }
}
