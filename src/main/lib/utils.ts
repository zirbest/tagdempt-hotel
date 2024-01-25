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
