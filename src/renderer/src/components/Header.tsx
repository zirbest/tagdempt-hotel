import { useSearchParams } from '@solidjs/router'
import { Input } from '@/components/ui/input'

export default function Header(props) {
  const [searchParams, setSearchParams] = useSearchParams()

  return (
    <>
      <h1 class="text-4xl font-extralight">
        { props.children }
      </h1>

      <Input
        class="max-w-sm"
        type="search"
        placeholder="Recherche"
        autofocus
        value={searchParams?.search ?? ''}
        onInput={e => setSearchParams({ search: e.target.value })}
      />
    </>
  )
}
