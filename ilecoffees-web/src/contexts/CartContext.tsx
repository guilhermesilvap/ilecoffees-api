import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { api } from '@/lib/api'
import { useAuth } from './AuthContext'

interface CartCoffee {
  id: string
  name: string
  photoUrl: string | null
  saleType: 'KG' | 'PACKAGE'
  pricePerKg: number | null
  packagePrice: number | null
  packageWeight: number | null
}

export interface CartItem {
  coffeeId: string
  quantity: number
  coffee: CartCoffee
}

interface CartContextValue {
  items: CartItem[]
  count: number
  total: number
  isLoading: boolean
  refresh: () => Promise<void>
  addItem: (coffeeId: string, quantity?: number) => Promise<void>
  removeItem: (coffeeId: string) => Promise<void>
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function getItemPrice(item: CartItem): number {
  const c = item.coffee
  if (c.saleType === 'KG') return (c.pricePerKg ?? 0) * item.quantity
  return (c.packagePrice ?? 0) * item.quantity
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { type } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  const refresh = useCallback(async () => {
    if (type !== 'USER' && type !== 'SUPPLIER') return
    try {
      const { data } = await api.get<CartItem[]>('/cart')
      setItems(data)
    } catch {
      // keep existing items on error
    }
  }, [type])

  const addItem = useCallback(async (coffeeId: string, quantity = 1) => {
    setIsLoading(true)
    try {
      await api.post('/cart/items', { coffeeId, quantity })
      const { data } = await api.get<CartItem[]>('/cart')
      setItems(data)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const removeItem = useCallback(async (coffeeId: string) => {
    setIsLoading(true)
    try {
      await api.delete(`/cart/items/${coffeeId}`)
      setItems(prev => prev.filter(i => i.coffeeId !== coffeeId))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const count = items.length
  const total = items.reduce((acc, i) => acc + getItemPrice(i), 0)

  return (
    <CartContext.Provider value={{ items, count, total, isLoading, refresh, addItem, removeItem, isCartOpen, openCart: () => setIsCartOpen(true), closeCart: () => setIsCartOpen(false) }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
