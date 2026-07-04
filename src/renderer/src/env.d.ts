import type { InterpreterApi } from '../../preload/index'

declare global {
  interface Window {
    interpreter: InterpreterApi
  }
}

export {}
