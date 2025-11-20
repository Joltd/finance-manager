import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { produce } from 'immer'
import { Button } from '@/components/ui/button'

interface SelectInputOptionDefinition {
  id: any
  label: string
}

interface SelectInputContextValue {
  register: (id: string, label: string) => void
  unregister: (id: string) => void
}

const SelectInputContext = createContext<SelectInputContextValue | null>(null)

export function useSelectInputContext() {
  const context = useContext(SelectInputContext)
  if (!context) {
    throw new Error('useSelectInputContext must be used within a SelectInput component')
  }
  return context
}

export interface SelectInputProps {
  value?: any
  onChange?: (value: any) => void
  children?: React.ReactNode
}

export function SelectInput({ value, onChange, children }: SelectInputProps) {
  const [options, setOptions] = useState<SelectInputOptionDefinition[]>([])

  const register = useCallback((id: string, label: string) => {
    setOptions((previous) =>
      produce(previous, (draft) => {
        draft.push({ id, label })
      }),
    )
  }, [])

  const unregister = useCallback((id: string) => {
    setOptions((previous) => previous.filter((it) => it.id !== id))
  }, [])

  const context: SelectInputContextValue = {
    register,
    unregister,
  }

  return (
    <SelectInputContext.Provider value={context}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline">
            {options
              .filter((it) => it.id === value)
              .map((it) => it.label)
              .join(', ')}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {options.map((it) => (
            <DropdownMenuCheckboxItem
              key={it.id}
              checked={it.id === value}
              onCheckedChange={() => onChange?.(it.id)}
            >
              {it.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {children}
    </SelectInputContext.Provider>
  )
}

export interface SelectInputOptionProps {
  id: any
  label: string
}

export function SelectInputOption({ id, label }: SelectInputOptionProps) {
  const { register, unregister } = useSelectInputContext()

  useEffect(() => {
    register(id, label)
    return () => unregister(id)
  }, [])

  return null
}
