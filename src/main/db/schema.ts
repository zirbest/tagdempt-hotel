import { integer, numeric, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// import { init } from '@paralleldrive/cuid2'

// const createId = init({
//   random: Math.random,
//   length: 6,
//   // fingerprint: 'a-custom-host-fingerprint',
// })

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  role: text('role', { enum: ['admin', 'user'] }).notNull().default('user'),
})

export const invoices = sqliteTable('invoices', {
  id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
  number: integer('number').notNull(),
  date: numeric('date').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  amount: real('amount').notNull(),
  paymentStatus: text('payment_status', { enum: ['paid', 'unpaid'] }).notNull().default('unpaid'),
  paymentDate: numeric('payment_date').notNull(),
  paymentType: text('payment_type').notNull(),

  createdAt: numeric('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: numeric('updated_at').notNull(),
})

export type User = typeof users.$inferInsert
export type Invoice = typeof invoices.$inferInsert

export type Auth = Omit<typeof users.$inferSelect, 'password'>
