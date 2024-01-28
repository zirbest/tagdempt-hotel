import { sql } from 'drizzle-orm'
import { db, dbMigration } from '../db'
import { users } from '../db/schema'

export async function appInit() {
  dbMigration()
  await initUser()
}

async function initUser() {
  const user = db.select({
    count: sql`count(*)`,
  }).from(users).get()

  console.log('users', user?.count)

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

  console.log('searchStrToObj: ', object)
  return object
}
