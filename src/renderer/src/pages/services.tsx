import { cache, createAsync, revalidate } from '@solidjs/router'
import { For, createSignal } from 'solid-js'
import type { Service, ServiceForm } from 'src/main/db/schema'
import { createForm, getValue, required, reset, setValues } from '@modular-forms/solid'

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

const getServices = cache(async (search) => {
  return await window.electron.ipcRenderer.invoke('services-read', search)
}, 'services')

export function loadServices({ location }) {
  void getServices(location.query.search)
}

function Services(props) {
  const services = createAsync<Service[]>(() => getServices(props.location.query.search))
  const [isSheetOpen, setIsSheetOpen] = createSignal(false)

  const [serviceForm, { Form, Field }] = createForm<ServiceForm>()

  return (
    <div class="grid gap-8 grid-rows-[auto,auto,1fr]">
      <div class="flex justify-between">
        <Header> Services </Header>
      </div>

      <div class="flex justify-end gap-3">
        <Button
          onClick={() => {
            setIsSheetOpen(v => !v)
            reset(serviceForm)
          }}
        >
          Créer
        </Button>
      </div>

      <div class="border rounded-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <For each={services()}>
              { it => (
                <TableRow onClick={() => {
                  setIsSheetOpen(true)
                  setValues(serviceForm, it)
                }}
                >
                  <TableCell>
                    { it.name }
                  </TableCell>
                  <TableCell>
                    { it.label }
                  </TableCell>
                  <TableCell>
                    { it.description }
                  </TableCell>
                </TableRow>
              ) }
            </For>
          </TableBody>
        </Table>
      </div>

      <Sheet open={isSheetOpen()} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              { getValue(serviceForm, 'id')?.toString() !== '' ? 'mise à jour' : 'creer' }
              &nbspune Service
            </SheetTitle>
            <SheetDescription>
              Modifiez ici votre Service. Cliquez sur Enregistrer lorsque vous avez terminé.
            </SheetDescription>
          </SheetHeader>
          <Form
            id="serviceForm"
            class="space-y-2"
            onSubmit={(v, _e) => {
              v.id?.toString() === ''
              && delete v.id

              v.id
                ? window.electron.ipcRenderer.invoke('service-update', JSON.stringify(v))
                : window.electron.ipcRenderer.invoke('service-create', JSON.stringify(v))

              reset(serviceForm)
              revalidate(getServices.key)
            }}
          >
            <Field
              name="id"
              type="string"
            >
              {(field, props) => (
                <>
                  <Input {...props} type="hidden" value={field.value || ''} />
                </>
              )}
            </Field>
            <Field
              name="name"
              validate={[
                required('Ce champ est requis.'),
              ]}
            >
              {(field, props) => (
                <>
                  <Input {...props} type="text" value={field.value || ''} placeholder="Nom" required />
                  {field.error && <div class="text-error-foreground">{field.error}</div>}
                </>
              )}
            </Field>
            <Field
              name="label"
              validate={[
                required('Ce champ est requis.'),
              ]}
            >
              {(field, props) => (
                <>
                  <Input {...props} type="text" value={field.value || ''} placeholder="Label" required />
                  {field.error && <div class="text-error-foreground">{field.error}</div>}
                </>
              )}
            </Field>
            <Field
              name="description"
              validate={[
                required('Ce champ est requis.'),
              ]}
            >
              {(field, props) => (
                <>
                  <Input {...props} type="text" value={field.value || ''} placeholder="Description" required />
                  {field.error && <div class="text-error-foreground">{field.error}</div>}
                </>
              )}
            </Field>
          </Form>
          <SheetFooter>
            <Button class="mt-4" type="submit" form="serviceForm">
              Enregistrer
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

    </div>
  )
}

export default Services
