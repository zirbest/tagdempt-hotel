import type { RouteDataFuncArgs } from '@solidjs/router'
import { useRouteData } from '@solidjs/router'
import { For, createResource, createSignal } from 'solid-js'
import { createStore, reconcile } from 'solid-js/store'
import type { Invoice } from 'src/main/db/schema'
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
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '~/components/ui/button'
import Header from '~/components/Header'
import { Switch, SwitchControl, SwitchInput, SwitchLabel, SwitchThumb } from '@/components/ui/switch'

export function InvoicesData({ location }: RouteDataFuncArgs) {
  const fetcher = async ([search]) => await window.electron.ipcRenderer.invoke('invoices-read', search)

  return createResource<Invoice[]>(
    // @ts-expect-error any
    () => ([location.query.search] as const),
    fetcher,
  )
};

function Invoices() {
  const [invoices, { refetch }] = useRouteData<typeof InvoicesData>()
  const [invoice, setInvoice] = createStore<any>()
  const [isSheetOpen, setIsSheetOpen] = createSignal(false)

  return (
    <div class="grid gap-8 grid-rows-[auto,auto,1fr]">
      <div class="flex justify-between">
        <Header> Creances </Header>
      </div>

      <div class="flex justify-end gap-3">
        <Button
          onClick={() => {
            setIsSheetOpen(v => !v)
            setInvoice(reconcile({}))
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
              <TableHead>N</TableHead>
              <TableHead class="text-right">Date</TableHead>
              <TableHead class="text-right">Montant</TableHead>
              <TableHead class="text-right">Date Paiment</TableHead>
              <TableHead class="text-right">Genre de Paiement</TableHead>
              <TableHead class="text-right">Etat Paiement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <For each={invoices()}>
              { it => (
                <TableRow onClick={() => {
                  setInvoice(it)
                  setIsSheetOpen(true)
                }}
                >
                  <TableCell class="tabular-nums">
                    { it.number }
                  </TableCell>
                  <TableCell class="text-right font-medium tabular-nums">
                    { it.date }
                  </TableCell>
                  <TableCell class="text-right tabular-nums">
                    { it.amount }
                  </TableCell>
                  <TableCell class="text-right tabular-nums">
                    { it.paymentDate }
                  </TableCell>
                  <TableCell class="text-right">
                    { it.paymentType }
                  </TableCell>
                  <TableCell class="text-right">
                    { it.paymentStatus }
                  </TableCell>
                </TableRow>
              ) }
            </For>
          </TableBody>
        </Table>
      </div>

      <Sheet open={isSheetOpen()} onOpenChange={setIsSheetOpen}>
        <SheetContent size="content">
          <SheetHeader>
            <SheetTitle>
              { invoice.id ? 'mise à jour' : 'creer' }
              &nbspune Creance
            </SheetTitle>
            {/* <SheetDescription> */}
            {/* </SheetDescription> */}
            {/* <pre> */}
            {/*   { JSON.stringify(invoice, null, 2) } */}
            {/* </pre> */}

            <Input
              type="text"
              placeholder="N"
              value={invoice?.number || ''}
              onInput={e => setInvoice('number', e.target.value)}
            />
            <Input
              type="date"
              placeholder="Date"
              value={invoice?.date || ''}
              onInput={e => setInvoice('date', e.target.value)}
            />
            <Input
              type="text"
              placeholder="Montant"
              value={invoice?.amount || ''}
              onInput={e => setInvoice('amount', e.target.value)}
            />
            <Input
              type="date"
              placeholder="Date Paiment"
              value={invoice?.paymentDate || ''}
              onInput={e => setInvoice('paymentDate', e.target.value)}
            />
            <Input
              type="text"
              placeholder="Genre de Paiment"
              value={invoice?.paymentType || ''}
              onInput={e => setInvoice('paymentType', e.target.value)}
            />
            <div>
              <Switch
                class="flex gap-4 items-center justify-between"
                checked={invoice?.paymentStatus === 'paid'}
                value={invoice?.paymentStatus}
                onChange={e => setInvoice('paymentStatus', e ? 'paid' : 'unpaid')}
              >
                <SwitchLabel class="flex-auto text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Etat Paiement
                </SwitchLabel>
                <SwitchInput />
                <SwitchControl>
                  <SwitchThumb />
                </SwitchControl>
              </Switch>
            </div>

          </SheetHeader>
          <SheetFooter>
            <Button
              class="mt-4 max-w-[8rem] ml-auto"
              onClick={() => {
                invoice.id
                  ? window.electron.ipcRenderer.invoke('invoice-update', { ...invoice })
                  : window.electron.ipcRenderer.invoke('invoice-create', { ...invoice })
                setInvoice(reconcile({}))
                refetch()
              }}
            >
              { invoice.id ? 'mise à jour' : 'Enregistrer' }
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

    </div>
  )
}

export default Invoices
