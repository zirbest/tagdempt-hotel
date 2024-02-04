import type * as v from 'valibot'
import type { invoices, invoicesToServices, services, users } from '../db/schema'
import type { InvoiceSchema, ServiceSchema } from '~/lib/validations'

export type User = typeof users.$inferInsert
export type Invoice = typeof invoices.$inferInsert
  & { invoiceToServices?: InvoiceToService[] }
export type Service = typeof services.$inferInsert
export type InvoiceToService = typeof invoicesToServices.$inferInsert

export type Auth = Omit<typeof users.$inferSelect, 'password'>

export type ServiceForm = v.Input<typeof ServiceSchema>
export type InvoiceForm = v.Input<typeof InvoiceSchema>
export type InvoiceToServiceForm = Pick<InvoiceToService, 'amount' | 'serviceId'>
