import { Flow } from '@/components/common/layout/flow'
import { ListFilterPlusIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
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

interface FilterStateContextValue {
  filters: FilterDefinition[]
  value: Record<string, any>
}

interface FilterActionsContextValue {
  register: (id: string, label: string, visible?: boolean, defaultValue?: any) => void
  unregister: (id: string) => void
  show: (id: string) => void
  hide: (id: string) => void
  updateValue: (id: string, value: any) => void
  deleteValue: (id: string) => void
}

const FilterStateContext = createContext<FilterStateContextValue | null>(null)
const FilterActionsContext = createContext<FilterActionsContextValue | null>(null)

export function useFilterStateContext() {
  const context = useContext(FilterStateContext)
  if (!context) {
    throw new Error('useFilterStateContext must be used within a Filter component')
  }
  return context
}

export function useFilterActionsContext() {
  const context = useContext(FilterActionsContext)
  if (!context) {
    throw new Error('useFilterActionsContext must be used within a Filter component')
  }
  return context
}

export function useFilterContext() {
  return { ...useFilterStateContext(), ...useFilterActionsContext() }
}

export interface FilterProps {
  value?: Record<string, any>
  onChange?: (value: Record<string, any>) => void
  children?: React.ReactNode
}

export function Filter({ value, onChange, children }: FilterProps) {
  const [filters, setFilters] = useState<FilterDefinition[]>([])

  const valueRef = useRef(value)
  const onChangeRef = useRef(onChange)
  useLayoutEffect(() => {
    valueRef.current = value
    onChangeRef.current = onChange
  })

  const register = useCallback(
    (id: string, label: string, visible?: boolean, defaultValue?: any) => {
      setFilters((previous) =>
        produce(previous, (draft) => {
          const existing = draft.find((it) => it.id === id)
          if (existing) {
            existing.label = label
            existing.visible = !!visible
            existing.defaultValue = defaultValue
          } else {
            draft.push({ id, label, visible: !!visible, defaultValue })
          }
        }),
      )
    },
    [],
  )

  const unregister = useCallback((id: string) => {
    setFilters((previous) => previous.filter((it) => it.id !== id))
  }, [])

  const updateValue = useCallback((id: string, v: any) => {
    const result = produce(valueRef.current || {}, (draft) => {
      draft[id] = v
    })
    onChangeRef.current?.(result)
  }, [])

  const deleteValue = useCallback((id: string) => {
    const result = produce(valueRef.current || {}, (draft) => {
      delete draft[id]
    })
    onChangeRef.current?.(result)
  }, [])

  const show = useCallback(
    (id: string) => {
      let defaultValue = undefined
      setFilters((previous) =>
        produce(previous, (draft) => {
          const target = draft.find((it) => it.id === id)
          if (target) {
            target.visible = true
            defaultValue = target.defaultValue
          }
        }),
      )
      if (defaultValue !== undefined) {
        updateValue(id, defaultValue)
      }
    },
    [updateValue],
  )

  const hide = useCallback(
    (id: string) => {
      setFilters((previous) =>
        produce(previous, (draft) => {
          draft.filter((it) => it.id === id).forEach((it) => (it.visible = false))
        }),
      )
      deleteValue(id)
    },
    [deleteValue],
  )

  const stateContext = useMemo<FilterStateContextValue>(
    () => ({ filters, value: value || {} }),
    [filters, value],
  )

  const actionsContext = useMemo<FilterActionsContextValue>(
    () => ({ register, unregister, show, hide, updateValue, deleteValue }),
    [register, unregister, show, hide, updateValue, deleteValue],
  )

  return (
    <FilterActionsContext.Provider value={actionsContext}>
      <FilterStateContext.Provider value={stateContext}>
        <Flow className="bg-accent p-4 rounded-sm">
          {children}
          {filters.some((it) => !it.visible) && (
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
      </FilterStateContext.Provider>
    </FilterActionsContext.Provider>
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
  const { register, unregister, hide } = useFilterActionsContext()
  const { filters } = useFilterStateContext()

  useEffect(() => {
    register(id, label, alwaysVisible, defaultValue)
    return () => unregister(id)
  }, [id, label, alwaysVisible, defaultValue, register, unregister])

  const isVisible = filters.some((it) => it.id === id && it.visible)

  if (!isVisible) {
    return null
  }

  return (
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
}
