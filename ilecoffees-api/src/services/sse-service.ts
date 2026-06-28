import { Response } from 'express'

type ClientId = string

class SseService {
  private clients = new Map<ClientId, Response>()

  add(id: ClientId, res: Response): void {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')
    res.flushHeaders()

    const keepAlive = setInterval(() => res.write(': ping\n\n'), 25_000)
    this.clients.set(id, res)

    res.on('close', () => {
      clearInterval(keepAlive)
      this.clients.delete(id)
    })
  }

  send(id: ClientId, event: string, data: unknown): void {
    const res = this.clients.get(id)
    if (!res) return
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
  }

  has(id: ClientId): boolean {
    return this.clients.has(id)
  }
}

export const sseService = new SseService()
