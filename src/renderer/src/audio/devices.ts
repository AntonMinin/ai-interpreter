export interface AudioDevice {
  deviceId: string
  label: string
}

const VIRTUAL_CABLE_PATTERN = /cable input|vb-audio|virtual audio|voicemeeter/i

export async function listDevices(): Promise<{
  inputs: AudioDevice[]
  outputs: AudioDevice[]
}> {
  const devices = await navigator.mediaDevices.enumerateDevices()
  const inputs: AudioDevice[] = []
  const outputs: AudioDevice[] = []
  for (const device of devices) {
    const entry = {
      deviceId: device.deviceId,
      label: device.label || `${device.kind} (${device.deviceId.slice(0, 6)})`
    }
    if (device.kind === 'audioinput') inputs.push(entry)
    if (device.kind === 'audiooutput') outputs.push(entry)
  }
  return { inputs, outputs }
}

export function findVirtualCable(outputs: AudioDevice[]): AudioDevice | null {
  return outputs.find((d) => VIRTUAL_CABLE_PATTERN.test(d.label)) ?? null
}

export async function requestMicPermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach((t) => t.stop())
    return true
  } catch {
    return false
  }
}
