import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

export interface AppNotification {
  id: string
  type: string
  title: string
  body: string
  data?: Record<string, unknown>
  readAt: string | null
  createdAt: string
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'

export function useNotifications() {
  const { isAuthenticated, token } = useAuth()
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  useEffect(() => {
    if (!isAuthenticated) return
    api.get<AppNotification[]>('/notifications').then((r) => setNotifications(r.data))
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated || !token) return

    const es = new EventSource(`${API_URL}/notifications/stream?token=${token}`)

    es.addEventListener('notification', (e) => {
      const n: AppNotification = JSON.parse(e.data)
      setNotifications((prev) => [n, ...prev])
    })

    es.onerror = () => es.close()

    return () => es.close()
  }, [isAuthenticated, token])

  const markRead = useCallback(async (id: string) => {
    await api.patch(`/notifications/${id}/read`)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
    )
  }, [])

  const markAllRead = useCallback(async () => {
    await api.patch('/notifications/read-all')
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })))
  }, [])

  const unreadCount = notifications.filter((n) => !n.readAt).length

  return { notifications, unreadCount, markRead, markAllRead }
}
