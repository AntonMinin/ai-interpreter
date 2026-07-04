const WORKLET_SOURCE = `
class CaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.buffer = new Float32Array(2048)
    this.offset = 0
  }
  process(inputs) {
    const channel = inputs[0] && inputs[0][0]
    if (!channel) return true
    let read = 0
    while (read < channel.length) {
      const space = this.buffer.length - this.offset
      const take = Math.min(space, channel.length - read)
      this.buffer.set(channel.subarray(read, read + take), this.offset)
      this.offset += take
      read += take
      if (this.offset === this.buffer.length) {
        this.port.postMessage(this.buffer)
        this.buffer = new Float32Array(2048)
        this.offset = 0
      }
    }
    return true
  }
}
registerProcessor('capture-processor', CaptureProcessor)
`

export type FrameHandler = (frame: Float32Array, sampleRate: number) => void

async function attachWorklet(
  context: AudioContext,
  stream: MediaStream,
  onFrame: FrameHandler
): Promise<AudioWorkletNode> {
  const blob = new Blob([WORKLET_SOURCE], { type: 'application/javascript' })
  const url = URL.createObjectURL(blob)
  try {
    await context.audioWorklet.addModule(url)
  } finally {
    URL.revokeObjectURL(url)
  }
  const source = context.createMediaStreamSource(stream)
  const node = new AudioWorkletNode(context, 'capture-processor')
  node.port.onmessage = (event: MessageEvent<Float32Array>) => {
    onFrame(event.data, context.sampleRate)
  }
  source.connect(node)
  return node
}

export class MicCapture {
  private context: AudioContext | null = null
  private stream: MediaStream | null = null

  get sampleRate(): number {
    return this.context?.sampleRate ?? 48000
  }

  async start(
    deviceId: string,
    noiseSuppression: boolean,
    onFrame: FrameHandler
  ): Promise<void> {
    await this.stop()
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: deviceId && deviceId !== 'default' ? { exact: deviceId } : undefined,
        noiseSuppression,
        echoCancellation: true,
        autoGainControl: true
      }
    })
    this.context = new AudioContext()
    await attachWorklet(this.context, this.stream, onFrame)
  }

  async stop(): Promise<void> {
    this.stream?.getTracks().forEach((t) => t.stop())
    this.stream = null
    if (this.context) {
      await this.context.close().catch(() => undefined)
      this.context = null
    }
  }
}

export class LoopbackCapture {
  private context: AudioContext | null = null
  private stream: MediaStream | null = null

  get sampleRate(): number {
    return this.context?.sampleRate ?? 48000
  }

  async start(onFrame: FrameHandler): Promise<void> {
    await this.stop()
    this.stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    })
    this.stream.getVideoTracks().forEach((t) => t.stop())
    if (this.stream.getAudioTracks().length === 0) {
      await this.stop()
      throw new Error('System audio capture returned no audio track.')
    }
    this.context = new AudioContext()
    const audioOnly = new MediaStream(this.stream.getAudioTracks())
    await attachWorklet(this.context, audioOnly, onFrame)
  }

  async stop(): Promise<void> {
    this.stream?.getTracks().forEach((t) => t.stop())
    this.stream = null
    if (this.context) {
      await this.context.close().catch(() => undefined)
      this.context = null
    }
  }
}
