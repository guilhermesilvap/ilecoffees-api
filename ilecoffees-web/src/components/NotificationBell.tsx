import { Bell } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return 'agora'
  if (diff < 3600) return `${Math.floor(diff / 60)}min`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

export function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">Notificações</span>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              Marcar todas como lidas
            </button>
          )}
        </div>
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhuma notificação
            </p>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => !n.readAt && markRead(n.id)}
                className={`w-full border-b px-4 py-3 text-left hover:bg-muted/50 transition-colors ${
                  !n.readAt ? 'bg-blue-50/60' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-tight">{n.title}</p>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {timeAgo(n.createdAt)}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground leading-snug">{n.body}</p>
                {!n.readAt && (
                  <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
                )}
              </button>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
