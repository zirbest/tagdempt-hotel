import { integer, numeric, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { relations, sql } from 'drizzle-orm'

// import { init } from '@paralleldrive/cuid2'

// const createId = init({
//   random: Math.random,
//   length: 6,
//   // fingerprint: 'a-custom-host-fingerprint',
// })

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  role: text('role', { enum: ['admin', 'user'] }).notNull().default('user'),
})

export const invoices = sqliteTable('invoices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  organization: text('organization').notNull(),
  number: integer('number').notNull(),
  date: numeric('date').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  amount: real('amount').notNull(),
  paymentStatus: text('payment_status', { enum: ['paid', 'unpaid'] }).notNull().default('unpaid'),
  paymentDate: numeric('payment_date').notNull(),
  paymentType: text('payment_type').notNull(),

  createdAt: numeric('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: numeric('updated_at').notNull(),
})

export const services = sqliteTable('services', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').unique().notNull(),
  label: text('label').unique().notNull(),
  description: text('description').notNull(),
  enabled: integer('enabled').notNull().default(0),

  // deletedAt: numeric('deleted_at').notNull(),
  createdAt: numeric('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: numeric('updated_at').notNull(),
})

export const invoicesToServices = sqliteTable('invoices_to_services', {
  invoiceId: integer('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  serviceId: integer('service_id').notNull().references(() => services.id, { onDelete: 'cascade' }),

  amount: real('amount').notNull(),
  createdAt: numeric('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: numeric('updated_at').notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.invoiceId, table.serviceId] }),
  }
})

export const invoicesRelations = relations(invoices, ({ many }) => ({
  invoicesToServices: many(invoicesToServices),
}))

export const servicesRelations = relations(services, ({ many }) => ({
  invoicesToServices: many(invoicesToServices),
}))

export const invoicesToServicesRelations = relations(invoicesToServices, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoicesToServices.invoiceId],
    references: [invoices.id],
  }),
  service: one(services, {
    fields: [invoicesToServices.serviceId],
    references: [services.id],
  }),
}))
