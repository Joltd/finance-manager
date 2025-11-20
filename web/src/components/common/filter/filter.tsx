import { Flow } from '@/components/common/layout/flow'
import { ListFilterPlusIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ButtonGroup } from '@/components/ui/button-group'
import { produce } from 'immer'

interface FilterDefinition {
  id: string
  label: string
  visible: boolean
  defaultValue?: any
}

interface FilterContextValue {
  filters: FilterDefinition[]
  register: (id: string, label: string, visible?: boolean, defaultValue?: any) => void
  unregister: (id: string) => void
  show: (id: string) => void
  hide: (id: string) => void
  value: Record<string, any>
  updateValue: (id: string, value: any) => void
  deleteValue: (id: string) => void
}

const FilterContext = createContext<FilterContextValue | null>(null)

export function useFilterContext() {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error('useFilterContext must be used within a Filter component')
  }
  return context
}

export interface FilterProps {
  value?: Record<string, any>
  onChange?: (value: Record<string, any>) => void
  children?: React.ReactNode
}

export function Filter({ value, onChange, children }: FilterProps) {
  const [filters, setFilters] = useState<FilterDefinition[]>([])

  const register = useCallback(
    (id: string, label: string, visible?: boolean, defaultValue?: any) => {
      setFilters((previous) =>
        produce(previous, (draft) => {
          draft.push({ id, label, visible: !!visible, defaultValue })
        }),
      )
    },
    [],
  )

  const unregister = useCallback((id: string) => {
    setFilters((previous) => previous.filter((it) => it.id !== id))
  }, [])

  const show = useCallback((id: string) => {
    setFilters((previous) =>
      produce(previous, (draft) => {
        draft
          .filter((it) => it.id === id)
          .forEach((it) => {
            it.visible = true
            if (it.defaultValue) {
              updateValue(id, it.defaultValue)
            }
          })
      }),
    )
  }, [])

  const hide = useCallback((id: string) => {
    setFilters((previous) =>
      produce(previous, (draft) => {
        draft.filter((it) => it.id === id).forEach((it) => (it.visible = false))
      }),
    )
    deleteValue(id)
  }, [])

  const updateValue = useCallback(
    (id: string, v: any) => {
      const result = produce(value || {}, (draft) => {
        draft[id] = v
      })
      onChange?.(result)
    },
    [value],
  )

  const deleteValue = useCallback(
    (id: string) => {
      const result = produce(value || {}, (draft) => {
        delete draft[id]
      })
      onChange?.(result)
    },
    [value],
  )

  const context: FilterContextValue = {
    filters,
    register,
    unregister,
    show,
    hide,
    value: value || {},
    updateValue,
    deleteValue,
  }

  return (
    <FilterContext.Provider value={context}>
      <Flow className="bg-accent p-4 rounded-sm">
        {children}
        {!!filters.filter((it) => !it.visible).length && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <ListFilterPlusIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {filters
                .filter((it) => !it.visible)
                .map((it) => (
                  <DropdownMenuItem key={it.id} onSelect={() => show(it.id)}>
                    {it.label}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </Flow>
    </FilterContext.Provider>
  )
}

export interface FilterButtonProps {
  id: string
  label?: string
  alwaysVisible?: boolean
  defaultValue?: any
  children?: React.ReactNode
}

export function FilterButton({
  id,
  label = 'Filter',
  alwaysVisible,
  defaultValue,
  children,
}: FilterButtonProps) {
  const { filters, register, unregister, hide } = useFilterContext()

  useEffect(() => {
    register(id, label, alwaysVisible, defaultValue)
    return () => unregister(id)
  }, [])

  return (
    !!filters.filter((it) => it.id === id && it.visible).length && (
      <ButtonGroup>
        <Button variant="outline" size="sm">
          {label}
        </Button>
        {children}
        {!alwaysVisible && (
          <Button variant="outline" size="sm" onClick={() => hide(id)}>
            <XIcon />
          </Button>
        )}
      </ButtonGroup>
    )
  )
}
