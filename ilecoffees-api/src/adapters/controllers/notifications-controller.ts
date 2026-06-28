import { Request, Response } from 'express'
import { sseService } from '@/services/sse-service'
import { NotificationsRepository } from '@/repositories/notifications-repository'

export class NotificationsController {
  constructor(private notificationsRepository: NotificationsRepository) {}

  stream = async (req: Request, res: Response): Promise<void> => {
    sseService.add(req.user!.id, res)
  }

  index = async (req: Request, res: Response): Promise<void> => {
    const { id, type } = req.user!
    const notifications =
      type === 'USER'
        ? await this.notificationsRepository.listByUser(id)
        : await this.notificationsRepository.listBySupplier(id)
    res.json(notifications)
  }

  markRead = async (req: Request, res: Response): Promise<void> => {
    await this.notificationsRepository.markRead(req.params.id, req.user!.id)
    res.status(204).send()
  }

  markAllRead = async (req: Request, res: Response): Promise<void> => {
    const { id, type } = req.user!
    if (type === 'USER') {
      await this.notificationsRepository.markAllRead(id, undefined)
    } else {
      await this.notificationsRepository.markAllRead(undefined, id)
    }
    res.status(204).send()
  }
}
