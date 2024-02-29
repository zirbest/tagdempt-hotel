import * as v from 'valibot'

export const OrganizationSchema = v.object({
  id: v.optional(v.string()),
  name: v.string([
    v.minLength(3),
  ]),
  phone: v.union([v.optional(v.string([v.minLength(9)])), v.literal(''), v.null_()]),
  email: v.union([v.string([v.email()]), v.literal(''), v.null_()]),
})

export const ServiceSchema = v.object({
  id: v.optional(v.string()),
  name: v.string([
    v.minLength(3),
  ]),
  description: v.union([v.optional(v.string([v.minLength(3)])), v.literal(''), v.null_()]),
})

export const InvoiceSchema = v.object({
  id: v.optional(v.coerce(v.string(), i => String(i))),
  organizationId: v.string([v.minLength(1)]),
  number: v.coerce(v.string([v.minLength(1)]), i => String(i)),
  date: v.string([v.minLength(10)]),
  amount: v.coerce(v.string([v.minLength(1)]), i => String(i)),
  paymentStatus: v.picklist(['paid', 'unpaid']),
  paymentDate: v.string([v.minLength(10)]),
  paymentType: v.string([v.minLength(2)]),
  organization: v.optional(v.object({
    name: v.coerce(v.string(), i => String(i)),
  })),
  invoicesToServices: v.optional(v.array(v.object({
    serviceId: v.coerce(v.string(), i => String(i)),
    amount: v.coerce(v.string(), i => String(i)),
  }))),
})
