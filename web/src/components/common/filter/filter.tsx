import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ListFilterPlusIcon, XIcon } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { FilterPrimitiveProps } from '@/types/filter'
import { cn } from '@/lib/utils'
import { produce, WritableDraft } from 'immer'

export interface FilterProps {
  value?: Record<string, any>
  onChange?: (value: Record<string, any>) => void
  className?: string
  children: React.ReactNode
}

interface FilterDefinition {
  name: string
  label?: string
  alwaysVisible: boolean
  defaultValue?: any
  component: React.ReactNode
}

export function Filter({ value, onChange, className, children }: FilterProps) {
  const [visible, setVisible] = useState<string[]>([])

  const definitions: FilterDefinition[] = useMemo(() => {
    return React.Children.toArray(children)
      .filter((it) => React.isValidElement(it))
      .map((it) => {
        const props = it.props as FilterPrimitiveProps
        return {
          name: props.name,
          label: props.label,
          alwaysVisible: !!props.alwaysVisible,
          defaultValue: props.defaultValue,
          component: it,
        }
      })
  }, [children])

  function setFilter(updater: (draft: WritableDraft<Record<string, any>>) => void) {
    const filter = produce(value || {}, updater)
    if (JSON.stringify(filter) === JSON.stringify(value)) {
      return
    }
    onChange?.(filter)
  }

  const handleShow = (filter: FilterDefinition) => {
    setFilter((draft) => {
      draft[filter.name] = filter.defaultValue
    })
    setVisible((prev) => (prev.indexOf(filter.name) !== -1 ? prev : [...prev, filter.name]))
  }

  const handleHide = (filter: FilterDefinition) => {
    setFilter((draft) => {
      delete draft[filter.name]
    })
    setVisible((prev) => prev.filter((it) => it !== filter.name))
  }

  const handleFilterChange = (name: string, value: any) => {
    setFilter((draft) => {
      draft[name] = value
    })
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {definitions
        .filter((it) => it.alwaysVisible || visible.includes(it.name))
        .map((it) => (
          <div className="flex" key={it.name}>
            {it.label && (
              <Button size="sm" variant="outline" className="rounded-r-none">
                {it.label}
              </Button>
            )}
            {React.cloneElement(it.component as any, {
              value: value?.[it.name],
              onChange: (value: any) => handleFilterChange(it.name, value),
            })}
            {!it.alwaysVisible && (
              <Button
                size="sm"
                variant="outline"
                className="rounded-l-none"
                onClick={() => handleHide(it)}
              >
                <XIcon />
              </Button>
            )}
          </div>
        ))}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline">
            <ListFilterPlusIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {definitions
            .filter((it) => !it.alwaysVisible)
            .map((it) => (
              <DropdownMenuItem key={it.name} onClick={() => handleShow(it)}>
                {it.label}
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
