import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { FetchStoreState } from "@/store/common";
import { Reference } from "@/types/common";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Check, CheckIcon, Loader } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReferenceSelectProps {
  store: FetchStoreState<Reference[]>
  placeholder?: string
  value?: Reference
  onChange?: (value?: Reference) => void
}

export function ReferenceSelect({ store, placeholder, value, onChange }: ReferenceSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      store.updateQueryParams({ mask: query ? query : undefined })
      store.fetch()
    }, 300)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [query]);

  const changePopoverOpen = (open: boolean) => {
    setOpen(open)
    if (open) {
      store.updateQueryParams({ mask: undefined })
      store.fetch()
    }
  }

  return (
    <Popover modal open={open} onOpenChange={changePopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">{value?.name || placeholder || 'Select'}</Button>
      </PopoverTrigger>
      <PopoverContent>
        <Command shouldFilter={false} className="gap-4">
          <CommandInput placeholder="Search" onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>Not found</CommandEmpty>
            {store.data?.map((it) => (
              <CommandItem
                key={it.id}
                value={it.id}
                onSelect={() => {
                  onChange?.(it)
                  changePopoverOpen(false)
                }}
              >
                {it.name}
                <CheckIcon className={cn("ml-auto", value?.id !== it.id && "opacity-0")} />
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}