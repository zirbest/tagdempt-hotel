import { useSearchParams } from '@solidjs/router'
import type { JSXElement } from 'solid-js'
import { Index, Show } from 'solid-js'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { Input } from '@/components/ui/input'
import MingcuteInformationFill from '~icons/mingcute/information-fill'

export default function Header(props: { children: JSXElement, hints?: object }) {
  const [searchParams, setSearchParams] = useSearchParams()

  return (
    <>
      <h1 class="text-4xl font-extralight">
        { props.children }
      </h1>

      <div class="flex items-center gap-2">
        <Show when={props.hints}>
          <Tooltip>
            <TooltipTrigger>
              <MingcuteInformationFill class="opacity-50" />
            </TooltipTrigger>
            <TooltipContent>
              <ul>
                <Index each={Object.keys(props.hints || {})}>
                  { i => (
                    <li class="grid grid-cols-[1fr,2fr]">
                      <b>
                        {i()}
                        : &nbsp
                      </b>
                      {props?.hints?.[i()]}
                    </li>
                  )}
                </Index>
              </ul>
            </TooltipContent>
          </Tooltip>
        </Show>
        <Input
          class="max-w-sm"
          type="search"
          placeholder="Recherche"
          autofocus
          value={searchParams?.search ?? ''}
          onInput={e => setSearchParams({ search: e.target.value })}
        />
      </div>
    </>
  )
}
