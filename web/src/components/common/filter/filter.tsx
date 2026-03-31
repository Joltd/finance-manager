'use client'

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
import { ListFilter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ButtonGroup, ButtonGroupText } from '@/components/ui/button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Flow } from '@/components/common/layout/flow'
import { cn } from '@/lib/utils'

interface FilterRegistration {
  id: string
  label: string
  required?: boolean
}

interface FilterContextValue {
  register: (entry: FilterRegistration) => void
  unregister: (id: string) => void
  isActive: (id: string) => boolean
  getValue: (id: string) => unknown
  handleChange: (id: string, val: unknown) => void
  removeFilter: (id: string) => void
}

const FilterContext = createContext<FilterContextValue | null>(null)

export function useFilterContext(): FilterContextValue {
  const ctx = useContext(FilterContext)
  if (!ctx) throw new Error('useFilterContext must be used within <Filter>')
  return ctx
}

export interface FilterItemProps {
  id: string
  label: string
  children: React.ReactNode
  className?: string
  required?: boolean
}

export function FilterItem({ id, label, children, className, required }: FilterItemProps) {
  const { register, unregister, isActive, removeFilter } = useFilterContext()

  useLayoutEffect(() => {
    register({ id, label, required })
    return () => unregister(id)
  }, [id, label, required, register, unregister])

  if (!isActive(id)) return null

  return (
    <ButtonGroup className={cn('h-8 overflow-hidden text-sm', className)}>
      <ButtonGroupText className="px-2.5 font-normal text-muted-foreground shadow-none whitespace-nowrap shrink-0">
        {label}
      </ButtonGroupText>
      <div className={cn('flex flex-1 items-center border border-input **:data-[slot=input]:h-full **:data-[slot=input]:rounded-none **:data-[slot=input]:border-0 **:data-[slot=input]:shadow-none', required && 'rounded-r-md')}>
        {children}
      </div>
      {!required && (
        <Button
          variant="outline"
          size="icon-xs"
          onClick={() => removeFilter(id)}
          className="shrink-0 h-full w-8"
        >
          <X />
        </Button>
      )}
    </ButtonGroup>
  )
}

export interface FilterProps {
  value?: Record<string, unknown>
  onChange?: (value: Record<string, unknown>) => void
  children: React.ReactNode
}

export function Filter({ value = {}, onChange, children }: FilterProps) {
  const [registrations, setRegistrations] = useState<FilterRegistration[]>([])
  const [activeIds, setActiveIds] = useState<string[]>([])

  // Sync activeIds when value prop gains new non-null keys (e.g. after preset load)
  useEffect(() => {
    setActiveIds((prev) => {
      const newKeys = Object.keys(value).filter((k) => value[k] != null && !prev.includes(k))
      return newKeys.length > 0 ? [...prev, ...newKeys] : prev
    })
  }, [value])

  // Ref keeps the latest value to avoid stale closures in callbacks
  const valueRef = useRef(value)
  valueRef.current = value

  const register = useCallback((entry: FilterRegistration) => {
    setRegistrations((prev) => (prev.some((r) => r.id === entry.id) ? prev : [...prev, entry]))
  }, [])

  const unregister = useCallback((id: string) => {
    setRegistrations((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const isActive = useCallback(
    (id: string) =>
      activeIds.includes(id) || registrations.some((r) => r.id === id && r.required),
    [activeIds, registrations],
  )

  const getValue = useCallback((id: string) => valueRef.current[id], [])

  const handleChange = useCallback(
    (id: string, val: unknown) => {
      onChange?.({ ...valueRef.current, [id]: val })
    },
    [onChange],
  )

  const removeFilter = useCallback(
    (id: string) => {
      setActiveIds((prev) => prev.filter((i) => i !== id))
      const next = { ...valueRef.current }
      delete next[id]
      onChange?.(next)
    },
    [onChange],
  )

  const addFilter = (id: string) => setActiveIds((prev) => [...prev, id])

  const ctx = useMemo<FilterContextValue>(
    () => ({ register, unregister, isActive, getValue, handleChange, removeFilter }),
    [register, unregister, isActive, getValue, handleChange, removeFilter],
  )

  const inactiveRegistrations = registrations.filter((r) => !r.required && !activeIds.includes(r.id))

  return (
    <FilterContext.Provider value={ctx}>
      <Flow align="center" className="bg-muted/50 rounded-md p-2">
        {children}
        {inactiveRegistrations.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ListFilter />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {inactiveRegistrations.map((r) => (
                <DropdownMenuItem key={r.id} onClick={() => addFilter(r.id)}>
                  {r.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </Flow>
    </FilterContext.Provider>
  )
}
