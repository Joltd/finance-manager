import React, { useMemo } from 'react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { FilterPrimitiveProps } from '@/types/common/filter'

export interface SelectFilterProps extends FilterPrimitiveProps {
  name: string
  label: string
  value?: any
  onChange?: (value: any) => void
  children?: React.ReactNode
}

export function SelectFilter({ value, onChange, children }: SelectFilterProps) {
  const definitions = useMemo(() => {
    return React.Children.toArray(children)
      .filter((it) => React.isValidElement(it))
      .map((it) => {
        const props = it.props as SelectFilterOptionProps
        return {
          value: props.value,
          label: props.label,
        }
      })
  }, [children])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" className="rounded-none">
          {definitions.find((it) => it.value === value)?.label || 'Invalid value'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {definitions.map((it) => (
          <DropdownMenuCheckboxItem
            key={it.value}
            checked={it.value === value}
            onCheckedChange={() => onChange?.(it.value)}
          >
            {it.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export interface SelectFilterOptionProps {
  value: any
  label: string
  checked?: boolean
  onCheckedChange?: () => void
}

export function SelectFilterOption({}: SelectFilterOptionProps) {
  return null
}
