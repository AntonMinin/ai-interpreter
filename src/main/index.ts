import { app, BrowserWindow, desktopCapturer, session } from 'electron'
import path from 'node:path'
import { registerIpcHandlers } from './ipcHandlers'
import { log } from './logger'

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1080,
    height: 780,
    minWidth: 860,
    minHeight: 600,
    title: 'AI Interpreter',
    backgroundColor: '#101418',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  window.setMenuBarVisibility(false)

  if (process.env.ELECTRON_RENDERER_URL) {
    window.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    window.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  registerIpcHandlers()

  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    callback(permission === 'media' || permission === 'display-capture')
  })

  session.defaultSession.setDisplayMediaRequestHandler(
    (_request, callback) => {
      desktopCapturer
        .getSources({ types: ['screen'] })
        .then((sources) => {
          callback({ video: sources[0], audio: 'loopback' })
        })
        .catch((error) => {
          log('error', `Loopback capture failed: ${String(error)}`)
          callback({})
        })
    },
    { useSystemPicker: false }
  )

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  log('info', `AI Interpreter started (v${app.getVersion()})`)
})

app.on('window-all-closed', () => {
  app.quit()
})
