import { createAsync, revalidate } from '@solidjs/router'
import { For, Show, createSignal } from 'solid-js'
import type { OrganizationForm } from 'src/main/lib/types'
import { createForm, getValue, getValues, reset, setValues, valiForm } from '@modular-forms/solid'
import { As } from '@kobalte/core'
import { getOrganizations } from './route.data'
import MingcuteDelete2Fill from '~icons/mingcute/delete-2-fill'
import MingcuteAddLine from '~icons/mingcute/add-line'
import { OrganizationSchema } from '~/lib/validations'
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

export function loadOrganizations({ location }) {
  void getOrganizations(location.query.search)
}

function Organizations(props) {
  const organizations = createAsync<OrganizationForm[]>(() => getOrganizations(props.location.query.search))
  const [isSheetOpen, setIsSheetOpen] = createSignal(false)

  const [organizationForm, { Form, Field }] = createForm<OrganizationForm>({
    validate: valiForm(OrganizationSchema),
  })

  return (
    <div class="grid gap-8 grid-rows-[auto,auto,1fr]">
      <div class="flex justify-between">
        <Header> Organizations </Header>
      </div>

      <div class="flex justify-end gap-3">
        <Button
          onClick={() => {
            setIsSheetOpen(v => !v)
            reset(organizationForm)
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
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <Show when={(organizations() || []).length > 0} fallback={<TableNoItems />}>
              <For each={organizations()}>
                { it => (
                  <TableRow onClick={() => {
                    setIsSheetOpen(true)
                    const { id, ...rest } = it
                    setValues(organizationForm, { id: String(id), ...rest })
                  }}
                  >
                    <TableCell>
                      { it.name }
                    </TableCell>
                    <TableCell>
                      { it.phone }
                    </TableCell>
                    <TableCell>
                      { it.email }
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
                              const response = window.electron.ipcRenderer.invoke('organization-delete', it.id)
                              response.then(() => {
                                reset(organizationForm)
                                revalidate(getOrganizations.key)

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
              { getValue(organizationForm, 'id')?.toString() !== '' ? 'mise à jour' : 'creer' }
              &nbspune Organization
            </SheetTitle>
            <SheetDescription>
              Modifiez ici votre Organization. Cliquez sur Enregistrer lorsque vous avez terminé.
            </SheetDescription>
          </SheetHeader>
          <div class="py-4">
            <Form
              shouldDirty
              id="organizationForm"
              class="space-y-2"
              onSubmit={(v, _e) => {
                const response = v.id
                  ? window.electron.ipcRenderer.invoke('organization-update', v)
                  : window.electron.ipcRenderer.invoke('organization-create', v)

                response.then(() => {
                  reset(organizationForm)
                  revalidate(getOrganizations.key)

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
                name="phone"
              >
                {(field, props) => (
                  <>
                    <Input
                      class={field.error && 'border-error-foreground focus-visible:ring-error'}
                      {...props}
                      type="text"
                      value={field.value || ''}
                      placeholder="Phone"
                      required
                    />
                  </>
                )}
              </Field>
              <Field
                name="email"
              >
                {(field, props) => (
                  <>
                    <Input
                      class={field.error && 'border-error-foreground focus-visible:ring-error'}
                      {...props}
                      type="text"
                      value={field.value || ''}
                      placeholder="Email"
                      required
                    />
                  </>
                )}
              </Field>
            </Form>
          </div>
          <SheetFooter>
            <Button
              class="mt-4"
              type="submit"
              form="organizationForm"
            >
              Enregistrer
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

    </div>
  )
}

export default Organizations
