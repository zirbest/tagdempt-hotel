import { cache, createAsync, revalidate } from '@solidjs/router'
import { For, createSignal } from 'solid-js'
import type { Service, ServiceForm } from 'src/main/lib/types'
import { createForm, getValue, reset, setValues, valiForm } from '@modular-forms/solid'
import { ServiceSchema } from '~/lib/validations'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
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
import { showToast } from '~/components/ui/toast'

const getServices = cache(async (search) => {
  return await window.electron.ipcRenderer.invoke('services-read', search)
}, 'services')

export function loadServices({ location }) {
  void getServices(location.query.search)
}

function Services(props) {
  const services = createAsync<Service[]>(() => getServices(props.location.query.search))
  const [isSheetOpen, setIsSheetOpen] = createSignal(false)

  const [serviceForm, { Form, Field }] = createForm<ServiceForm>({
    validate: valiForm(ServiceSchema),
  })

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
                  const { id, ...rest } = it
                  setValues(serviceForm, { id: String(id), ...rest })
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
                  <TableCell class="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger>...</DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onSelect={() => {
                            const response = window.electron.ipcRenderer.invoke('service-delete', JSON.stringify(it.id))
                            response.then(() => {
                              reset(serviceForm)
                              revalidate(getServices.key)

                              showToast({
                                description: 'opération réussie',
                              })
                            })
                          }}
                        >
                          Supprime
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ) }
            </For>
          </TableBody>
        </Table>
      </div>

      <Sheet open={isSheetOpen()} onOpenChange={setIsSheetOpen}>
        <SheetContent class="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              { getValue(serviceForm, 'id')?.toString() !== '' ? 'mise à jour' : 'creer' }
              &nbspune Service
            </SheetTitle>
            <SheetDescription>
              Modifiez ici votre Service. Cliquez sur Enregistrer lorsque vous avez terminé.
            </SheetDescription>
          </SheetHeader>
          <div class="py-4">
            <Form
              shouldDirty
              id="serviceForm"
              class="space-y-2"
              onSubmit={(v, _e) => {
                const response = v.id
                  ? window.electron.ipcRenderer.invoke('service-update', JSON.stringify(v))
                  : window.electron.ipcRenderer.invoke('service-create', JSON.stringify(v))

                response.then(() => {
                  reset(serviceForm)
                  revalidate(getServices.key)

                  showToast({
                    description: 'Enregistré avec succès',
                  })
                })
                response.catch(() => {
                  showToast({
                    variant: 'destructive',
                    description: 'Une erreur s\'est produite lors de l\'enregistrement',
                  })
                })
              }}
            >
              <Field
                name="id"
              >
                {(field, props) => (
                  <>
                    <Input {...props} type="hidden" value={field.value || -1} />
                  </>
                )}
              </Field>
              <Field
                name="name"
              >
                {(field, props) => (
                  <>
                    <Input
                      class={field.error && 'border-error-foreground focus-visible:ring-error'}
                      {...props}
                      type="text"
                      value={field.value || ''}
                      placeholder="Nom"
                      required
                    />
                  </>
                )}
              </Field>
              <Field
                name="label"
              >
                {(field, props) => (
                  <>
                    <Input
                      class={field.error && 'border-error-foreground focus-visible:ring-error'}
                      {...props}
                      type="text"
                      value={field.value || ''}
                      placeholder="Label"
                      required
                    />
                  </>
                )}
              </Field>
              <Field
                name="description"
              >
                {(field, props) => (
                  <>
                    <Input
                      class={field.error && 'border-error-foreground focus-visible:ring-error'}
                      {...props}
                      type="text"
                      value={field.value || ''}
                      placeholder="Description"
                      required
                    />
                  </>
                )}
              </Field>
            </Form>
          </div>
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
