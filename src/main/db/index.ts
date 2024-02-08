import { resolve } from 'path'
import { app } from 'electron'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { createClient } from '@libsql/client'
import * as schema from './schema'

const dbFolder = app?.isPackaged
  ? app.getPath('userData')
  : '.'

const client = createClient({ url: `file:${dbFolder}/drizzle.db` })

export const db = drizzle(client, { schema, logger: !app?.isPackaged })

export async function dbMigration() {
  const migrationsFolder = app?.isPackaged
    ? resolve(app?.getAppPath(), '../app.asar.unpacked/migration')
    : './migration'

  await migrate(db, { migrationsFolder })
}
