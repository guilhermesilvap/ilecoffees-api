export interface ShippingOption {
  carrier: string
  service: string
  price: number
  deadlineDays: number
}

export interface ShippingProduct {
  weightGrams: number
  heightCm: number
  widthCm: number
  lengthCm: number
  quantity: number
  insuranceValue?: number
}

export interface ShippingCalculateInput {
  originCep: string
  destinationCep: string
  products: ShippingProduct[]
}

export interface ShippingService {
  calculate(input: ShippingCalculateInput): Promise<ShippingOption[]>
}
