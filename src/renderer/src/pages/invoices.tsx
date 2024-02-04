import { cache, createAsync, revalidate } from '@solidjs/router'
import { For, createSignal } from 'solid-js'
import type { InvoiceForm, InvoiceToServiceForm, ServiceForm } from 'src/main/lib/types'
import { createForm, getValue, getValues, reset, setValue, setValues, valiForm } from '@modular-forms/solid'
import * as v from 'valibot'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '~/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '~/components/ui/button'
import Header from '~/components/Header'
import { Switch, SwitchControl, SwitchInput, SwitchLabel, SwitchThumb } from '@/components/ui/switch'
import { Badge } from '~/components/ui/badge'
import { InvoiceSchema } from '~/lib/validations'

const getInvoice = cache(async (search) => {
  return await window.electron.ipcRenderer.invoke('invoices-read', search)
}, 'invoices')

export function loadInvoice({ location }) {
  void getInvoice(location.query.search)
}

const getServices = cache(async () => {
  return await window.electron.ipcRenderer.invoke('services-read')
}, 'invoices')

function Invoices(props) {
  const invoices = createAsync(() => getInvoice(props.location.query.search))
  const services = createAsync(() => getServices())

  const [invoiceForm, { Form, Field, FieldArray }] = createForm<InvoiceForm>({
    validate: valiForm(InvoiceSchema),
  })

  const [isSheetOpen, setIsSheetOpen] = createSignal(false)

  function setEmptyState() {
    const values = services()?.map((v: ServiceForm) => ({ serviceId: v.id }))
    setValues(invoiceForm, { paymentStatus: 'unpaid', invoicesToServices: values })
  }

  return (
    <div class="grid gap-8 grid-rows-[auto,auto,1fr]">
      <div class="flex justify-between">
        <Header> Creances </Header>
      </div>

      <div class="flex justify-end gap-3">
        <Button
          onClick={() => {
            setIsSheetOpen(v => !v)
            reset(invoiceForm)

            setEmptyState()
          }}
        >
          Créer
        </Button>

        <Button
          onClick={() => { window.print() }}
        >
          Imprimer
        </Button>
      </div>

      <div class="border rounded-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Organisme</TableHead>
              <TableHead>Date</TableHead>
              <TableHead class="text-right">Montant</TableHead>
              <TableHead class="text-center">Date Paiment</TableHead>
              <TableHead class="text-center">Genre de Paiement</TableHead>
              <TableHead class="text-center">Etat Paiement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <For each={invoices()}>
              { it => (
                <TableRow onClick={() => {
                  setIsSheetOpen(true)
                  const { invoicesToServices: a, ...rest } = it

                  const stuck: any = []
                  for (const it of services() || []) {
                    const res = a?.some((i: InvoiceToServiceForm) => i.serviceId === it.id)
                    !res && stuck.push({ serviceId: it.id, amount: '' })
                  }

                  let defaultValues: any = v.safeParse(InvoiceSchema, {
                    ...rest,
                    invoicesToServices: [...a, ...stuck],
                  }).output

                  defaultValues.invoicesToServices?.sort((a: InvoiceToServiceForm, b: InvoiceToServiceForm) => b.serviceId - a.serviceId)
                  setValues(invoiceForm, defaultValues)
                  defaultValues = { invoicesToServices: [] }
                }}
                >
                  <TableCell class="tabular-nums">
                    { it.number }
                  </TableCell>
                  <TableCell>
                    { it.organization }
                  </TableCell>
                  <TableCell class="tabular-nums">
                    { format(new Date(it.date), 'dd-MM-yyyy') }
                  </TableCell>
                  <TableCell class="text-right tabular-nums">
                    { it.amount }
                  </TableCell>
                  <TableCell class="text-center tabular-nums">
                    { format(new Date(it.paymentDate), 'dd-MM-yyyy') }
                  </TableCell>
                  <TableCell class="text-center">
                    { it.paymentType }
                  </TableCell>
                  <TableCell class="text-center">
                    <Badge
                      variant="secondary"
                      class={it.paymentStatus === 'unpaid' ? 'bg-red-100 text-red-900' : 'bg-green-100 text-green-900'}
                    >
                      { it.paymentStatus === 'paid' ? 'paye' : 'non paye' }
                    </Badge>
                  </TableCell>
                </TableRow>
              ) }
            </For>
          </TableBody>
        </Table>
      </div>

      <Sheet open={isSheetOpen()} onOpenChange={setIsSheetOpen}>
        <SheetContent class="overflow-y-scroll">
          <SheetHeader>
            <SheetTitle>
              { getValue(invoiceForm, 'id')?.toString() !== '' ? 'mise à jour' : 'creer' }
              &nbspune Creance
            </SheetTitle>
            <SheetDescription>
              Modifiez ici votre Creance. Cliquez sur Enregistrer lorsque vous avez terminé.
            </SheetDescription>
          </SheetHeader>

          <div class="py-4">
            <Form
              shouldDirty
              id="invoiceForm"
              class="space-y-2"
              onSubmit={(v, _e) => {
                v.id
                  ? window.electron.ipcRenderer.invoke('invoice-update', JSON.stringify(v))
                  : window.electron.ipcRenderer.invoke('invoice-create', JSON.stringify(v))

                reset(invoiceForm)
                setEmptyState()
                revalidate(getInvoice.key)
              }}
            >
              <Field name="id">
                {(field, props) => (
                  <>
                    <Input
                      class={field.error && 'border-error-foreground focus-visible:ring-error'}
                      {...props}
                      type="hidden"
                      value={field.value || '-1'}
                    />
                  </>
                )}
              </Field>
              <Field
                name="number"
              >
                {(field, props) => (
                  <>
                    <Input
                      class={field.error && 'border-error-foreground focus-visible:ring-error'}
                      {...props}
                      type="text"
                      value={field.value || ''}
                      placeholder="N' Facture"
                    />
                  </>
                )}
              </Field>
              <Field
                name="organization"
              >
                {(field, props) => (
                  <>
                    <Input
                      class={field.error && 'border-error-foreground focus-visible:ring-error'}
                      {...props}
                      type="text"
                      value={field.value || ''}
                      placeholder="Organisme"
                    />
                  </>
                )}
              </Field>
              <Field
                name="date"
              >
                {(field, props) => (
                  <>
                    <Input
                      class={field.error && 'border-error-foreground focus-visible:ring-error'}
                      {...props}
                      type="date"
                      value={field.value || ''}
                    />
                  </>
                )}
              </Field>
              <Field
                name="amount"
              >
                {(field, props) => (
                  <>
                    <Input
                      class={field.error && 'border-error-foreground focus-visible:ring-error'}
                      {...props}
                      type="text"
                      value={field.value || ''}
                      placeholder="Montant"
                    />
                  </>
                )}
              </Field>
              <Field
                name="paymentStatus"
              >
                {(field, _props) => (
                  <>
                    <div class="pt-5 pb-2">
                      <Switch
                        class="flex gap-4 items-center justify-between"
                        checked={field.value === 'paid'}
                        value={field.value}
                        onChange={e => setValue(invoiceForm, 'paymentStatus', e ? 'paid' : 'unpaid')}
                      >
                        <SwitchLabel
                          class="flex-auto text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Etat Paiement
                        </SwitchLabel>
                        <SwitchInput />
                        <SwitchControl>
                          <SwitchThumb />
                        </SwitchControl>
                      </Switch>
                    </div>
                  </>
                )}
              </Field>
              <Field
                name="paymentDate"
              >
                {(field, props) => (
                  <>
                    <Input
                      class={field.error && 'border-error-foreground focus-visible:ring-error'}
                      {...props}
                      type="date"
                      value={field.value || ''}
                      placeholder="Montant"
                    />
                  </>
                )}
              </Field>
              <Field
                name="paymentType"
              >
                {(field, props) => (
                  <>
                    <Input
                      class={field.error && 'border-error-foreground focus-visible:ring-error'}
                      {...props}
                      type="text"
                      value={field.value || ''}
                      placeholder="Genre de Paiement"
                    />
                  </>
                )}
              </Field>

              <p class="text-md font-semibold pt-3">
                Autres Servisses
              </p>
              <div class="space-y-2">
                <FieldArray name="invoicesToServices">
                  {fieldArray => (
                    <For each={fieldArray.items}>
                      {(_, index) => (
                        <>
                          <Field name={`invoicesToServices.${index()}.serviceId`}>
                            {(field, props) => (
                              <Input
                                class={field.error && 'border-error-foreground focus-visible:ring-error'}
                                {...props}
                                type="hidden"
                                value={field.value || '-1'}
                              />
                            )}
                          </Field>
                          <Field name={`invoicesToServices.${index()}.amount`}>
                            {(field, props) => (
                              <>
                                <Input
                                  class={field.error && 'border-error-foreground focus-visible:ring-error'}
                                  {...props}
                                  type="text"
                                  value={field.value || ''}
                                  placeholder={services?.()?.[index()].label}
                                />
                              </>
                            )}
                          </Field>
                        </>
                      )}
                    </For>
                  )}
                </FieldArray>
              </div>
            </Form>
          </div>

          <SheetFooter>
            <Button
              class="mt-4"
              type="submit"
              form="invoiceForm"
            >
              Enregistrer
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

    </div>
  )
}

export default Invoices
