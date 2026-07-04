import type { PipelineStatus } from '../shared/types'

export interface PipelineState {
  running: boolean
  capturing: boolean
  transcribing: number
  translating: number
  synthesizing: number
  playing: boolean
  error: string | null
}

export const initialPipelineState: PipelineState = {
  running: false,
  capturing: false,
  transcribing: 0,
  translating: 0,
  synthesizing: 0,
  playing: false,
  error: null
}

export type PipelineEvent =
  | { type: 'START' }
  | { type: 'STOP' }
  | { type: 'SPEECH_START' }
  | { type: 'SPEECH_END' }
  | { type: 'STT_START' }
  | { type: 'STT_END' }
  | { type: 'TRANSLATE_START' }
  | { type: 'TRANSLATE_END' }
  | { type: 'TTS_START' }
  | { type: 'TTS_END' }
  | { type: 'PLAYBACK_START' }
  | { type: 'PLAYBACK_END' }
  | { type: 'ERROR'; message: string }
  | { type: 'CLEAR_ERROR' }

export function reducePipeline(state: PipelineState, event: PipelineEvent): PipelineState {
  switch (event.type) {
    case 'START':
      return { ...initialPipelineState, running: true }
    case 'STOP':
      return { ...initialPipelineState }
    case 'SPEECH_START':
      return state.running ? { ...state, capturing: true } : state
    case 'SPEECH_END':
      return { ...state, capturing: false }
    case 'STT_START':
      return { ...state, transcribing: state.transcribing + 1 }
    case 'STT_END':
      return { ...state, transcribing: Math.max(0, state.transcribing - 1) }
    case 'TRANSLATE_START':
      return { ...state, translating: state.translating + 1 }
    case 'TRANSLATE_END':
      return { ...state, translating: Math.max(0, state.translating - 1) }
    case 'TTS_START':
      return { ...state, synthesizing: state.synthesizing + 1 }
    case 'TTS_END':
      return { ...state, synthesizing: Math.max(0, state.synthesizing - 1) }
    case 'PLAYBACK_START':
      return { ...state, playing: true }
    case 'PLAYBACK_END':
      return { ...state, playing: false }
    case 'ERROR':
      return { ...state, error: event.message }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
  }
}

export function deriveStatus(state: PipelineState): PipelineStatus {
  if (state.error) return 'error'
  if (!state.running) return 'stopped'
  if (state.playing) return 'speaking'
  if (state.synthesizing > 0 || state.translating > 0) return 'translating'
  if (state.transcribing > 0) return 'transcribing'
  if (state.capturing) return 'listening'
  return 'ready'
}
