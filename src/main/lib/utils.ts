import { sql } from 'drizzle-orm'
import { db, dbMigration } from '../db'
import { users } from '../db/schema'

export async function appInit() {
  await dbMigration()
  await initUser()
}

async function initUser() {
  const user = await db.select({
    count: sql`count(*)`,
  }).from(users).get()

  if (user?.count === 0) {
    await db.insert(users).values({
      username: 'admin',
      password: 'admin',
      role: 'admin',
    })
  }
}

export function searchStrToObj(str: string = ''): Record<string, string> {
  const parts = str.split(',').map(part => part.trim())
  const object: any = {}

  for (const part of parts) {
    const [key, value] = part.split(':')
    if (value)
      object[key] = value
    else if (/^!?paye/.test(key))
      object.ps = key === 'paye' ? 'paid' : 'unpaid'
    else
      object.q = key
  }

  return object
}
