import * as v from 'valibot'

export const ServiceSchema = v.object({
  id: v.optional(v.string()),
  name: v.string([
    v.minLength(3),
  ]),
  label: v.string([
    v.minLength(3),
  ]),
  description: v.string([
    v.minLength(3),
  ]),
})

export const InvoiceSchema = v.object({
  id: v.optional(v.coerce(v.string(), i => String(i))),
  number: v.coerce(v.string([v.minLength(1)]), i => String(i)),
  date: v.string([v.minLength(10)]),
  amount: v.coerce(v.string([v.minLength(1)]), i => String(i)),
  paymentStatus: v.picklist(['paid', 'unpaid']),
  paymentDate: v.string([v.minLength(10)]),
  paymentType: v.string([v.minLength(2)]),
  invoicesToServices: v.optional(v.array(v.object({
    serviceId: v.coerce(v.string(), i => String(i)),
    amount: v.coerce(v.string(), i => String(i)),
  }))),
})
