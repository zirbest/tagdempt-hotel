import { createSignal } from 'solid-js'
import { A, useNavigate } from '@solidjs/router'
import { cn } from '@/lib/utils'
import MingcuteDocument2Fill from '~icons/mingcute/document-2-fill'
import MingcuteDocumentsFill from '~icons/mingcute/documents-fill'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '~/composables/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import MingcuteRightLine from '~icons/mingcute/right-line'
import avatar_01 from '@/assets/avatars/02.png'

export default function Sidebar(props) {
  const [sidebarIsOpen, setSidebarIsOpen] = createSignal(true)
  const [user, { logOut }] = useAuth()
  const navigate = useNavigate()

  return (
    <div class={cn('h-screen flex flex-col bg-zinc-50 relative transition-[width,transform] print:hidden', sidebarIsOpen() ? 'w-48' : 'w-0', props.class)}>
      <div class="flex-auto">
        <div
          onClick={() => setSidebarIsOpen(v => !v)}
          class={cn('absolute duration-100 grid grid-rows-[1.25rem,0.5rem,1.25rem] place-content-center w-4 h-full right-0 translate-x-full group cursor-pointer', !sidebarIsOpen() && 'hover:w-10')}
        >
          <span
            class={cn('duration-200 rounded-full bg-gray-200 w-2 row-start-1 col-start-1 row-span-2 origin-bottom', sidebarIsOpen() && 'group-hover:rotate-[20deg]')}
          />
          <span
            class={cn('duration-200 rounded-full bg-gray-200 row-start-2 row-span-2 col-start-1 w-2 origin-top', sidebarIsOpen() && ' group-hover:-rotate-[20deg]')}
          />
        </div>

        <div class="space-y-4 py-4 overflow-hidden">
          <div class="px-3 py-2">
            {/* <h2 class="mb-2 px-4 text-lg font-semibold tracking-tight"> */}
            {/*   Dashboards */}
            {/* </h2> */}
            <div class="space-y-1">
              <NavLink href="/">
                <MingcuteDocument2Fill class="mr-2 h-4 w-4" />
                Creances
              </NavLink>
              <NavLink href="/services">
                <MingcuteDocumentsFill class="mr-2 h-4 w-4" />
                Services
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      <div class="px-3 py-2 mb-4 overflow-hidden">
        <DropdownMenu sameWidth>
          <DropdownMenuTrigger class="[&[data-expanded]>svg]:-rotate-90 w-full overflow-hidden mt-auto group flex items-center gap-2 px-4">
            <Avatar class="w-8 h-8">
              <AvatarImage src={avatar_01} alt="avatar" />
              <AvatarFallback class="select-none bg-black text-white">
                { user()?.username.substring(0, 2).toUpperCase() }
              </AvatarFallback>
            </Avatar>
            <span class="font-medium">
              { user()?.username }
            </span>
            <MingcuteRightLine class="ml-auto transition-transform" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              as="button"
              class="w-full"
              onSelect={() => {
                logOut()
                navigate('/login')
              }}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

    </div>
  )
}

function NavLink(props) {
  return (
    <A
      end
      activeClass="bg-primary text-primary-foreground"
      inactiveClass="hover:bg-accent hover:text-accent-foreground"
      class="inline-flex rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 items-center w-full justify-start h-10 px-4 py-2"
      {...props}
    />
  )
}
