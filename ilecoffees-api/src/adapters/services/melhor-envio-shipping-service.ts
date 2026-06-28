import { AppError } from '@/utils/AppError'
import { ShippingCalculateInput, ShippingOption, ShippingService } from '@/repositories/shipping-service'

const DEFAULT_WEIGHT_GRAMS = 500
const DEFAULT_HEIGHT_CM = 10
const DEFAULT_WIDTH_CM = 15
const DEFAULT_LENGTH_CM = 20

interface MelhorEnvioProduct {
  id: string
  width: number
  height: number
  length: number
  weight: number
  insurance_value: number
  quantity: number
}

interface MelhorEnvioResponse {
  id: number
  name: string
  company: { name: string }
  price: string
  delivery_time: number
  error?: string
}

export class MelhorEnvioShippingService implements ShippingService {
  private readonly baseUrl: string
  private readonly token: string

  constructor() {
    this.token = process.env.MELHOR_ENVIO_TOKEN ?? ''
    this.baseUrl =
      process.env.MELHOR_ENVIO_SANDBOX === 'true'
        ? 'https://sandbox.melhorenvio.com.br'
        : 'https://melhorenvio.com.br'
  }

  async calculate(input: ShippingCalculateInput): Promise<ShippingOption[]> {
    const products: MelhorEnvioProduct[] = input.products.map((p, i) => ({
      id: String(i + 1),
      width: p.widthCm ?? DEFAULT_WIDTH_CM,
      height: p.heightCm ?? DEFAULT_HEIGHT_CM,
      length: p.lengthCm ?? DEFAULT_LENGTH_CM,
      weight: (p.weightGrams ?? DEFAULT_WEIGHT_GRAMS) / 1000,
      insurance_value: p.insuranceValue ?? 0,
      quantity: p.quantity,
    }))

    const body = {
      from: { postal_code: input.originCep.replace(/\D/g, '') },
      to: { postal_code: input.destinationCep.replace(/\D/g, '') },
      products,
      options: { receipt: false, own_hand: false },
    }

    const response = await fetch(`${this.baseUrl}/api/v2/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${this.token}`,
        'User-Agent': 'ilecoffees/1.0 (contato@ilecoffees.com.br)',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errBody = await response.text().catch(() => '')
      console.error(`[MelhorEnvio] ${response.status} ${response.statusText}: ${errBody}`)
      throw new AppError('Serviço de frete indisponível', 503)
    }

    const data = (await response.json()) as MelhorEnvioResponse[]

    return data
      .filter((item) => !item.error && item.price)
      .map((item) => ({
        carrier: item.company.name,
        service: item.name,
        price: parseFloat(item.price),
        deadlineDays: item.delivery_time,
      }))
      .sort((a, b) => a.price - b.price)
  }
}
