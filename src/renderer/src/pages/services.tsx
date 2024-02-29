import { cache, createAsync, revalidate } from '@solidjs/router'
import { For, Show, createSignal } from 'solid-js'
import type { ServiceForm } from 'src/main/lib/types'
import { createForm, getValue, reset, setValues, valiForm } from '@modular-forms/solid'
import { As } from '@kobalte/core'
import { getServices } from './route.data'
import MingcuteDelete2Fill from '~icons/mingcute/delete-2-fill'
import MingcuteAddLine from '~icons/mingcute/add-line'
import { ServiceSchema } from '~/lib/validations'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import MingcuteMore1Fill from '~icons/mingcute/more-1-line'
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
import { TableNoItems } from '~/components/TableNoItems'

function Services(props) {
  const services = createAsync<ServiceForm[]>(() => getServices(props.location.query.search))
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
          <MingcuteAddLine class="mr-2 size-4" />
          Créer
        </Button>
      </div>

      <div class="border rounded-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <Show when={(services() || []).length > 0} fallback={<TableNoItems />}>
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
                      { it.description }
                    </TableCell>
                    <TableCell class="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <As component={Button} variant="ghost" size="sm">
                            <MingcuteMore1Fill />
                          </As>
                        </DropdownMenuTrigger>
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
                            <MingcuteDelete2Fill class="mr-2 size-4" />
                            Supprime
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ) }
              </For>
            </Show>
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
                  ? window.electron.ipcRenderer.invoke('service-update', v)
                  : window.electron.ipcRenderer.invoke('service-create', v)

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
