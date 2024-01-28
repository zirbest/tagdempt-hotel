import { join } from 'path'
import { BrowserWindow, app, ipcMain, shell } from 'electron'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { and, desc, eq, sql } from 'drizzle-orm'
import icon from '../../resources/icon.png?asset'
import { db } from './db'
import type { Auth } from './db/schema'
import { invoices, users } from './db/schema'
import { appInit, searchStrToObj } from './lib/utils'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env.ELECTRON_RENDERER_URL)
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  else
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0)
      createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin')
    app.quit()
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

let auth: Auth | null = null

appInit()

ipcMain.handle('invoice-create', async (_, req) => {
  return await db.insert(invoices).values({
    ...req,
    updatedAt: sql`CURRENT_TIMESTAMP`,
  })
})

ipcMain.handle('invoice-update', async (_, req) => {
  const { id, ...rest } = req

  return await db.update(invoices).set({
    ...rest,
    updatedAt: sql`CURRENT_TIMESTAMP`,
  },
  ).where(eq(invoices.id, id))
})

ipcMain.handle('invoices-read', async (_, search) => {
  search = searchStrToObj(search)

  const result = db.query.invoices.findMany({
    where(fields, { like, and }) {
      return and(
        !search.q ? undefined : like(fields.number, `%${search.q}%`),
        !search.d ? undefined : like(fields.date, `%${search.d}%`),
        !search.m ? undefined : like(fields.amount, `%${search.m}%`),
        !search.dp ? undefined : like(fields.paymentDate, `%${search.dp}%`),
        !search.ps ? undefined : eq(fields.paymentStatus, search.ps),
      )
    },
    orderBy: [desc(invoices.id)],
  })
  return result
})

ipcMain.handle('login', async (_, credential: { username: string, password: string }) => {
  if (!auth && credential?.username && credential?.password) {
    const user = await db.query.users.findFirst({
      where: and(
        eq(users.username, credential.username),
        eq(users.password, credential.password),
      ),
    })

    if (!user)
      return

    const { password: _password, ...rest } = user
    auth = rest
  }

  console.log('auth: ', auth)
  return auth
})

ipcMain.handle('logout', async (_) => {
  auth = null
})
