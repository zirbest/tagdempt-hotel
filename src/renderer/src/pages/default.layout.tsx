import Sidebar from '~/components/Sidebar'

export default function Layout(props) {
  return (
    <div class="grid grid-cols-[auto,1fr] bg-zinc-50 print:block print:bg-white">
      <Sidebar />
      <div class="ml-2 mt-2 overflow-y-auto max-h-screen ring-1 ring-zinc-200 rounded-tl-2xl print:ring-white [scrollbar-gutter:stable]">
        <div class="p-8 min-h-full bg-white print:p-0">
          {props.children}
        </div>
      </div>
    </div>
  )
}
