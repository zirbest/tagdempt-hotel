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
              <TableHead>Client</TableHead>
              <TableHead>N</TableHead>
              <TableHead class="text-right">Date</TableHead>
              <TableHead class="text-right">Montant</TableHead>
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
                    { it.customer }
                  </TableCell>
                  <TableCell>
                    { it.number }
                  </TableCell>
                  <TableCell class="text-right font-medium tabular-nums">
                    { it.date }
                  </TableCell>
                  <TableCell class="text-right tabular-nums">
                    { it.amount }
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
            <SheetTitle>Ajouter une Creance</SheetTitle>
            {/* <SheetDescription> */}
            {/* </SheetDescription> */}
            {/* <pre> */}
            {/*   { JSON.stringify(invoice, null, 2) } */}
            {/* </pre> */}

            <Input
              type="text"
              placeholder="Client"
              value={invoice?.customer || ''}
              onInput={e => setInvoice('customer', e.target.value)}
            />
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
