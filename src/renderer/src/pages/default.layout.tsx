import { Outlet } from '@solidjs/router'
import Sidebar from '~/components/Sidebar'

export default function Layout() {
  return (
    <div class="grid grid-cols-[auto,1fr] bg-zinc-50">
      <Sidebar />
      <div class="ml-2 mt-2 overflow-y-auto max-h-screen ring-1 ring-zinc-200 rounded-tl-2xl [scrollbar-gutter:stable]">
        <div class="p-8 min-h-full bg-white">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
