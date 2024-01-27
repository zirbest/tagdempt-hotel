import { resolve } from 'path'
import { app } from 'electron'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import Database from 'better-sqlite3'
import * as schema from './schema'

const dbFolder = app?.isPackaged
  ? app.getPath('userData')
  : '.'
const client = new Database(`${dbFolder}/drizzle.db`)
// const client = new Database(':memory:');
export const db = drizzle(client, { schema, logger: !app?.isPackaged })

export async function dbMigration() {
  const migrationsFolder = app?.isPackaged
    ? resolve(app?.getAppPath(), '../app.asar.unpacked/migration')
    : './migration'

  migrate(db, { migrationsFolder })
}
