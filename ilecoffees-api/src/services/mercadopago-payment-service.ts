import { MercadoPagoConfig, Payment } from 'mercadopago'
import { env } from '@/env'

export interface PixResult {
  externalId: string
  qrCode: string
  copyPaste: string
  expiresAt: Date
}

export interface CardResult {
  externalId: string
  status: 'approved' | 'rejected' | 'pending' | 'in_process'
  statusDetail: string
}

export interface MPPayerData {
  email: string
  firstName: string
  lastName: string
  cpf?: string | null
}

export interface MpOAuthTokens {
  accessToken: string
  refreshToken: string
  userId: string
  expiresAt: Date
}

const PLATFORM_FEE_RATE = 0.03

let _platformClient: MercadoPagoConfig | null = null

function getPlatformClient() {
  if (!_platformClient) {
    _platformClient = new MercadoPagoConfig({ accessToken: env.MP_ACCESS_TOKEN })
  }
  return _platformClient
}

function getSupplierClient(accessToken: string) {
  return new MercadoPagoConfig({ accessToken })
}

export class MercadoPagoPaymentService {

  // ── OAuth ──────────────────────────────────────────────────────────────────

  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: env.MP_APP_ID,
      response_type: 'code',
      platform_id: 'mp',
      state,
      redirect_uri: env.MP_REDIRECT_URI,
    })
    return `https://auth.mercadopago.com.br/authorization?${params}`
  }

  async exchangeCode(code: string): Promise<MpOAuthTokens> {
    const resp = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_secret: env.MP_CLIENT_SECRET,
        client_id: env.MP_APP_ID,
        grant_type: 'authorization_code',
        code,
        redirect_uri: env.MP_REDIRECT_URI,
      }),
    })
    if (!resp.ok) {
      const err = await resp.text()
      throw new Error(`MP OAuth error: ${err}`)
    }
    const data = await resp.json() as {
      access_token: string
      refresh_token: string
      user_id: number
      expires_in: number
    }
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      userId: String(data.user_id),
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    }
  }

  async refreshToken(refreshToken: string): Promise<MpOAuthTokens> {
    const resp = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_secret: env.MP_CLIENT_SECRET,
        client_id: env.MP_APP_ID,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })
    if (!resp.ok) {
      const err = await resp.text()
      throw new Error(`MP refresh error: ${err}`)
    }
    const data = await resp.json() as {
      access_token: string
      refresh_token: string
      user_id: number
      expires_in: number
    }
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      userId: String(data.user_id),
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    }
  }

  // ── PIX ───────────────────────────────────────────────────────────────────

  async createPix(
    amount: number,
    orderId: string,
    payer: MPPayerData,
    supplierAccessToken?: string | null,
  ): Promise<PixResult> {
    const client = supplierAccessToken ? getSupplierClient(supplierAccessToken) : getPlatformClient()
    const payment = new Payment(client)

    const marketplaceFee = supplierAccessToken
      ? Math.round(amount * PLATFORM_FEE_RATE * 100) / 100
      : undefined

    const response = await payment.create({
      body: {
        transaction_amount: Number(amount.toFixed(2)),
        description: `Pedido Ilé Coffees #${orderId.slice(0, 8).toUpperCase()}`,
        payment_method_id: 'pix',
        ...(marketplaceFee !== undefined && { marketplace_fee: marketplaceFee }),
        payer: {
          email: payer.email,
          first_name: payer.firstName,
          last_name: payer.lastName || 'Cliente',
          identification: payer.cpf
            ? { type: 'CPF', number: payer.cpf.replace(/\D/g, '') }
            : undefined,
        },
      },
    })

    const txData = response.point_of_interaction?.transaction_data
    if (!txData?.qr_code_base64 || !txData?.qr_code) {
      throw new Error('Mercado Pago não retornou dados do PIX')
    }

    return {
      externalId: String(response.id),
      qrCode: txData.qr_code_base64,
      copyPaste: txData.qr_code,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    }
  }

  // ── Cartão ────────────────────────────────────────────────────────────────

  async createCard(
    amount: number,
    orderId: string,
    payer: MPPayerData,
    cardToken: string,
    installments: number,
    paymentMethodId: string,
    issuerId?: string,
    supplierAccessToken?: string | null,
  ): Promise<CardResult> {
    const client = supplierAccessToken ? getSupplierClient(supplierAccessToken) : getPlatformClient()
    const payment = new Payment(client)

    const marketplaceFee = supplierAccessToken
      ? Math.round(amount * PLATFORM_FEE_RATE * 100) / 100
      : undefined

    const response = await payment.create({
      body: {
        transaction_amount: Number(amount.toFixed(2)),
        description: `Pedido Ilé Coffees #${orderId.slice(0, 8).toUpperCase()}`,
        token: cardToken,
        installments,
        payment_method_id: paymentMethodId,
        issuer_id: issuerId ? Number(issuerId) : undefined,
        ...(marketplaceFee !== undefined && { marketplace_fee: marketplaceFee }),
        payer: { email: payer.email },
      },
    })

    return {
      externalId: String(response.id),
      status: response.status as CardResult['status'],
      statusDetail: response.status_detail ?? '',
    }
  }

  // ── Status ─────────────────────────────────────────────────────────────────

  async getStatus(externalId: string): Promise<'approved' | 'rejected' | 'pending' | 'in_process' | 'cancelled'> {
    const payment = new Payment(getPlatformClient())
    const response = await payment.get({ id: externalId })
    return (response.status ?? 'pending') as CardResult['status'] | 'cancelled'
  }
}

export const mpPaymentService = new MercadoPagoPaymentService()
