import { base64ToArrayBuffer } from '../../../core/audio'

interface QueueItem {
  base64: string
  mimeType: string
  resolve: () => void
  reject: (error: Error) => void
}

export class AudioQueuePlayer {
  private queue: QueueItem[] = []
  private current: HTMLAudioElement | null = null
  private busy = false
  private currentUrl: string | null = null
  private resolveCurrent: (() => void) | null = null

  constructor(
    private readonly getSinkId: () => string,
    private readonly onStateChange?: (playing: boolean) => void
  ) {}

  get playing(): boolean {
    return this.busy
  }

  enqueue(base64: string, mimeType: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.queue.push({ base64, mimeType, resolve, reject })
      void this.drain()
    })
  }

  stop(): void {
    for (const item of this.queue) item.resolve()
    this.queue = []
    if (this.current) {
      this.current.onended = null
      this.current.onerror = null
      this.current.pause()
      this.current.src = ''
      this.current = null
    }
    if (this.resolveCurrent) {
      this.resolveCurrent()
      this.resolveCurrent = null
    }
    if (this.currentUrl) {
      URL.revokeObjectURL(this.currentUrl)
      this.currentUrl = null
    }
    if (this.busy) {
      this.busy = false
      this.onStateChange?.(false)
    }
  }

  private async drain(): Promise<void> {
    if (this.busy) return
    const item = this.queue.shift()
    if (!item) return
    this.busy = true
    this.onStateChange?.(true)
    try {
      await this.playItem(item)
      item.resolve()
    } catch (error) {
      item.reject(error instanceof Error ? error : new Error(String(error)))
    } finally {
      this.busy = false
      if (this.queue.length > 0) void this.drain()
      else this.onStateChange?.(false)
    }
  }

  private playItem(item: QueueItem): Promise<void> {
    return new Promise((resolve, reject) => {
      const blob = new Blob([base64ToArrayBuffer(item.base64)], { type: item.mimeType })
      const url = URL.createObjectURL(blob)
      const audio = new Audio()
      this.current = audio
      this.currentUrl = url
      this.resolveCurrent = resolve

      const cleanup = (): void => {
        URL.revokeObjectURL(url)
        if (this.current === audio) this.current = null
        this.currentUrl = null
        this.resolveCurrent = null
      }

      audio.onended = () => {
        cleanup()
        resolve()
      }
      audio.onerror = () => {
        cleanup()
        reject(new Error('err.playbackFailed'))
      }

      const sinkId = this.getSinkId()
      const setSink =
        sinkId && sinkId !== 'default'
          ? audio.setSinkId(sinkId).catch(() => {
              throw new Error('err.sinkFailed')
            })
          : Promise.resolve()

      setSink
        .then(() => {
          audio.src = url
          return audio.play()
        })
        .catch((error) => {
          cleanup()
          reject(error instanceof Error ? error : new Error(String(error)))
        })
    })
  }
}
