import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'

interface Account {
  id: string
  name: string
  email: string
  accountType?: 'CUSTOMER' | 'COFFEESHOP'
  supplierType?: 'PRODUCER' | 'ROASTER'
  photoUrl?: string | null
  cnpj?: string | null
  cpf?: string | null
  phoneNumber?: string
  cep?: string
  street?: string
  number?: string
  district?: string
  city?: string
  state?: string
  complement?: string | null
  planId?: string | null
  isActive?: boolean
  [key: string]: unknown
}

type AccountType = 'USER' | 'SUPPLIER' | 'ADMIN' | 'EMPLOYEE'

interface AuthContextValue {
  token: string | null
  user: Account | null
  type: AccountType | null
  supplierType: 'PRODUCER' | 'ROASTER' | null
  coffeeshopId: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (partial: Partial<Account>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getDashboardRoute(type: AccountType, accountType?: string, supplierType?: string) {
  if (type === 'ADMIN') return '/dashboard/admin'
  if (type === 'EMPLOYEE') return '/dashboard/employee'
  if (type === 'SUPPLIER') return supplierType === 'PRODUCER' ? '/dashboard/producer' : '/dashboard/supplier'
  if (accountType === 'COFFEESHOP') return '/dashboard/coffeeshop'
  return '/dashboard/customer'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('@ilecoffees:token'),
  )
  const [user, setUser] = useState<Account | null>(() => {
    const stored = localStorage.getItem('@ilecoffees:user')
    return stored ? (JSON.parse(stored) as Account) : null
  })
  const [type, setType] = useState<AccountType | null>(
    () => localStorage.getItem('@ilecoffees:type') as AccountType | null,
  )
  const [supplierType, setSupplierType] = useState<'PRODUCER' | 'ROASTER' | null>(
    () => localStorage.getItem('@ilecoffees:supplierType') as 'PRODUCER' | 'ROASTER' | null,
  )
  const [coffeeshopId, setCoffeeshopId] = useState<string | null>(
    () => localStorage.getItem('@ilecoffees:coffeeshopId'),
  )

  const navigate = useNavigate()

  useEffect(() => {
    function handleForceLogout() {
      setToken(null)
      setUser(null)
      setType(null)
      setSupplierType(null)
      setCoffeeshopId(null)
      navigate('/login', { replace: true })
    }
    window.addEventListener('auth:logout', handleForceLogout)
    return () => window.removeEventListener('auth:logout', handleForceLogout)
  }, [navigate])

  async function login(email: string, password: string) {
    const { data } = await api.post<{ token: string; refreshToken: string; account: Account; type: AccountType; supplierType?: 'PRODUCER' | 'ROASTER'; coffeeshopId?: string }>(
      '/sessions',
      { email, password },
    )

    localStorage.setItem('@ilecoffees:token', data.token)
    localStorage.setItem('@ilecoffees:refreshToken', data.refreshToken)
    localStorage.setItem('@ilecoffees:user', JSON.stringify(data.account))
    localStorage.setItem('@ilecoffees:type', data.type)
    if (data.supplierType) {
      localStorage.setItem('@ilecoffees:supplierType', data.supplierType)
    } else {
      localStorage.removeItem('@ilecoffees:supplierType')
    }
    if (data.coffeeshopId) {
      localStorage.setItem('@ilecoffees:coffeeshopId', data.coffeeshopId)
    } else {
      localStorage.removeItem('@ilecoffees:coffeeshopId')
    }

    setToken(data.token)
    setUser(data.account)
    setType(data.type)
    setSupplierType(data.supplierType ?? null)
    setCoffeeshopId(data.coffeeshopId ?? null)

    navigate(getDashboardRoute(data.type, data.account.accountType, data.supplierType))
  }

  function logout() {
    localStorage.removeItem('@ilecoffees:token')
    localStorage.removeItem('@ilecoffees:refreshToken')
    localStorage.removeItem('@ilecoffees:user')
    localStorage.removeItem('@ilecoffees:type')
    localStorage.removeItem('@ilecoffees:supplierType')
    localStorage.removeItem('@ilecoffees:coffeeshopId')
    setToken(null)
    setUser(null)
    setType(null)
    setSupplierType(null)
    setCoffeeshopId(null)
    navigate('/login')
  }

  function updateUser(partial: Partial<Account>) {
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, ...partial }
      localStorage.setItem('@ilecoffees:user', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <AuthContext.Provider value={{ token, user, type, supplierType, coffeeshopId, isAuthenticated: !!token && !!user && !!type, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
