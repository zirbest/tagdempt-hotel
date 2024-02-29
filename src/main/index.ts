import { join } from 'path'
import { BrowserWindow, app, ipcMain, shell } from 'electron'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { and, desc, eq, like, sql } from 'drizzle-orm'
import icon from '../../resources/icon.png?asset'
import { db } from './db'
import { invoices, invoicesToServices, organizations, services, users } from './db/schema'
import { appInit, searchStrToObj } from './lib/utils'
import type { Auth } from './lib/types'

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

// #### Invoices {{{

ipcMain.handle('invoice-create', async (_, req) => {
  const { invoicesToServices: invoicesToServicesReq, ...invoiceReq } = JSON.parse(req)

  const rowCount = await db.select({ count: sql<number>`count()` }).from(invoices).get()

  // TODO: remove it
  if (rowCount && rowCount?.count > 10)
    return

  const res = await db.insert(invoices).values({
    ...invoiceReq,
    updatedAt: sql`CURRENT_TIMESTAMP`,
  })

  if (invoicesToServicesReq && invoicesToServicesReq.length > 0) {
    for (const it of invoicesToServicesReq) {
      it.amount && it?.amount !== ''
      && await db.insert(invoicesToServices).values({
        ...it,
        invoiceId: res.lastInsertRowid,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
    }
  }

  return res
})

ipcMain.handle('invoice-update', async (_, req) => {
  const { id, invoicesToServices: invoicesToServicesReq, ...invoiceReq } = JSON.parse(req)

  const res = await db.update(invoices).set({
    ...invoiceReq,
    updatedAt: sql`CURRENT_TIMESTAMP`,
  },
  ).where(eq(invoices.id, id))

  if (invoicesToServicesReq && invoicesToServicesReq.length > 0) {
    for (const it of invoicesToServicesReq) {
      !it.amount
        ? await db.delete(invoicesToServices)
          .where(and(
            eq(invoicesToServices.invoiceId, id),
            eq(invoicesToServices.serviceId, it.serviceId),
          ))

        : await db.insert(invoicesToServices).values({
          ...it,
          invoiceId: id,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
          .onConflictDoUpdate({
            target: [invoicesToServices.invoiceId, invoicesToServices.serviceId],
            set: { ...it },
          })
    }
  }

  return res
})

ipcMain.handle('invoices-read', async (_, search) => {
  search = searchStrToObj(search)

  const orgIds = !search.q
    ? []
    : (await db.select({ id: organizations.id }).from(organizations)
        .where(like(organizations.name, `%${search.q}%`)))
        .map(v => v.id.toString())

  const result = await db.query.invoices.findMany({
    where(fields, { like, and, inArray }) {
      return and(
        orgIds.length < 1 ? undefined : inArray(fields.organizationId, orgIds),
        !search.n ? undefined : like(fields.number, `%${search.n}%`),
        !search.d ? undefined : like(fields.date, `%${search.d}%`),
        !search.m ? undefined : like(fields.amount, `%${search.m}%`),
        !search.dp ? undefined : like(fields.paymentDate, `%${search.dp}%`),
        !search.ps ? undefined : eq(fields.paymentStatus, search.ps),
      )
    },
    with: {
      organization: true,
      invoicesToServices: {
        with: {
          service: true,
        },
        orderBy({ serviceId }, { desc }) {
          return desc(serviceId)
        },
      },
    },
    orderBy: [desc(invoices.id)],
  })
  return result
})

ipcMain.handle('invoice-delete', async (_, id) => {
  const result = await db.delete(invoices).where(eq(invoices.id, id))
  return result
})

// }}}

// #### Services {{{

ipcMain.handle('service-create', async (_, req) => {
  const serviceReq = JSON.parse(req)

  const res = await db.insert(services).values({
    ...serviceReq,
    updatedAt: sql`CURRENT_TIMESTAMP`,
  })

  return res
})

ipcMain.handle('services-read', async (_, search) => {
  search = searchStrToObj(search)

  const result = db.query.services.findMany({
    where(fields, { like, and }) {
      return and(
        !search.q ? undefined : like(fields.name, `%${search.q}%`),
      )
    },
    orderBy: [desc(services.id)],
  })
  return result
})

ipcMain.handle('service-update', async (_, req) => {
  const { id, ...serviceReq } = JSON.parse(req)

  const res = await db.update(services).set({
    ...serviceReq,
    updatedAt: sql`CURRENT_TIMESTAMP`,
  },
  ).where(eq(services.id, id))

  return res
})

ipcMain.handle('service-delete', async (_, id) => {
  const result = await db.delete(services).where(eq(services.id, id))
  return result
})

// }}}
//
// #### Organizations {{{

ipcMain.handle('organization-create', async (_, req) => {
  const serviceReq = JSON.parse(req)

  const res = await db.insert(organizations).values({
    ...serviceReq,
    updatedAt: sql`CURRENT_TIMESTAMP`,
  })

  return res
})

ipcMain.handle('organizations-read', async (_, search) => {
  search = searchStrToObj(search)

  const result = db.query.organizations.findMany({
    where(fields, { like, and }) {
      return and(
        !search.q ? undefined : like(fields.name, `%${search.q}%`),
      )
    },
    orderBy: [desc(organizations.id)],
  })
  return result
})

ipcMain.handle('organization-update', async (_, req) => {
  const { id, ...bodyReq } = JSON.parse(req)

  const res = await db.update(organizations).set({
    ...bodyReq,
    updatedAt: sql`CURRENT_TIMESTAMP`,
  },
  ).where(eq(organizations.id, id))

  return res
})

ipcMain.handle('organization-delete', async (_, id) => {
  const result = await db.delete(organizations).where(eq(organizations.id, id))
  return result
})

/// }}}

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

  return auth
})

ipcMain.handle('logout', async (_) => {
  auth = null
})
