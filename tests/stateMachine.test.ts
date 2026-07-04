import { describe, expect, it } from 'vitest'
import {
  deriveStatus,
  initialPipelineState,
  reducePipeline,
  type PipelineEvent,
  type PipelineState
} from '../src/core/stateMachine'

function run(events: PipelineEvent[], from: PipelineState = initialPipelineState): PipelineState {
  return events.reduce(reducePipeline, from)
}

describe('pipeline state machine', () => {
  it('starts stopped', () => {
    expect(deriveStatus(initialPipelineState)).toBe('stopped')
  })

  it('becomes ready after START', () => {
    expect(deriveStatus(run([{ type: 'START' }]))).toBe('ready')
  })

  it('shows listening while speech is captured', () => {
    const state = run([{ type: 'START' }, { type: 'SPEECH_START' }])
    expect(deriveStatus(state)).toBe('listening')
  })

  it('ignores speech events when not running', () => {
    const state = run([{ type: 'SPEECH_START' }])
    expect(deriveStatus(state)).toBe('stopped')
  })

  it('shows transcribing during STT', () => {
    const state = run([{ type: 'START' }, { type: 'STT_START' }])
    expect(deriveStatus(state)).toBe('transcribing')
  })

  it('prioritizes speaking over other in-flight stages', () => {
    const state = run([
      { type: 'START' },
      { type: 'STT_START' },
      { type: 'TRANSLATE_START' },
      { type: 'PLAYBACK_START' }
    ])
    expect(deriveStatus(state)).toBe('speaking')
  })

  it('returns to ready when all work completes', () => {
    const state = run([
      { type: 'START' },
      { type: 'STT_START' },
      { type: 'STT_END' },
      { type: 'TRANSLATE_START' },
      { type: 'TRANSLATE_END' },
      { type: 'TTS_START' },
      { type: 'TTS_END' },
      { type: 'PLAYBACK_START' },
      { type: 'PLAYBACK_END' }
    ])
    expect(deriveStatus(state)).toBe('ready')
  })

  it('handles overlapping phrases with counters', () => {
    const state = run([
      { type: 'START' },
      { type: 'TRANSLATE_START' },
      { type: 'TRANSLATE_START' },
      { type: 'TRANSLATE_END' }
    ])
    expect(deriveStatus(state)).toBe('translating')
    expect(deriveStatus(run([{ type: 'TRANSLATE_END' }], state))).toBe('ready')
  })

  it('never underflows counters', () => {
    const state = run([{ type: 'START' }, { type: 'STT_END' }, { type: 'STT_END' }])
    expect(state.transcribing).toBe(0)
  })

  it('reports errors and clears them', () => {
    const errored = run([{ type: 'START' }, { type: 'ERROR', message: 'boom' }])
    expect(deriveStatus(errored)).toBe('error')
    expect(deriveStatus(run([{ type: 'CLEAR_ERROR' }], errored))).toBe('ready')
  })

  it('STOP resets everything', () => {
    const state = run([
      { type: 'START' },
      { type: 'STT_START' },
      { type: 'ERROR', message: 'x' },
      { type: 'STOP' }
    ])
    expect(state).toEqual(initialPipelineState)
  })
})
