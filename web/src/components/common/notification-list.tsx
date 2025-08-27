import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { subscribeSse } from '@/lib/notification'
import { BellIcon, CircleAlertIcon, InfoIcon, TriangleAlertIcon } from 'lucide-react'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Notification, NotificationType } from '@/types/common/notification'

export interface NotificationListProps {}

export function NotificationList({}: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    return subscribeSse('/notification', {}, (notification: Notification) => {
      if (notification.type === NotificationType.ERROR) {
        toast.error(notification.message)
      } else if (notification.type === NotificationType.WARNING) {
        toast.warning(notification.message)
      } else {
        toast.info(notification.message)
      }
      setNotifications((previous) => {
        return [...previous, notification]
      })
    })
  }, [])

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="ghost">
          <BellIcon />
        </Button>
      </HoverCardTrigger>
      {!!notifications.length && (
        <HoverCardContent className="flex flex-col min-w-[400px] max-h-[600px] gap-2 overflow-y-auto">
          {notifications.map((it) => (
            <Alert variant={it.type === NotificationType.ERROR ? 'destructive' : 'default'}>
              {it.type === NotificationType.ERROR ? (
                <CircleAlertIcon />
              ) : it.type === NotificationType.WARNING ? (
                <TriangleAlertIcon />
              ) : (
                <InfoIcon />
              )}
              <AlertTitle>{it.message}</AlertTitle>
            </Alert>
          ))}
        </HoverCardContent>
      )}
    </HoverCard>
  )
}
