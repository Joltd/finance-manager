'use client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Reference } from '@/types/common'
import { useEffect, useState } from 'react'
import { FilterPrimitive } from '@/components/common/filter-proto/filter'
import { trim } from '@/lib/utils'
import { FilterOperator, FilterOperatorVariant } from '@/types/entity'

export interface ReferenceFilterProps<T> extends FilterPrimitive<T[]> {
  references?: Reference[]
}

const operatorVariants: FilterOperatorVariant[] = [
  {
    negate: false,
    operator: FilterOperator.IN_LIST,
    label: 'is any of',
  },
  {
    negate: true,
    operator: FilterOperator.IN_LIST,
    label: 'is none of',
  },
]

export function ReferenceFilter<T>({ onFilterChange, references }: ReferenceFilterProps<T>) {
  const [operator, setOperator] = useState<FilterOperatorVariant>(operatorVariants[0])
  const [values, setValues] = useState<string[]>([])

  useEffect(() => {
    // onFilterChange?.(operator.negate, operator.operator, values)
  }, [operator, values])

  const handleChangeValues = (id: string, checked: boolean) => {
    setValues((previous) => (checked ? [...previous, id] : previous.filter((it) => it !== id)))
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className="rounded-none">
            {operator.label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {operatorVariants.map((it, index) => (
            <DropdownMenuItem key={index} onClick={() => setOperator(it)}>
              {it.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className="rounded-none">
            {values.length > 1
              ? `${values.length} selected`
              : values.length > 0
                ? trim(references?.find((it) => it.id === values[0])?.name)
                : '...'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {references?.map((it) => (
            <DropdownMenuCheckboxItem
              key={it.id}
              checked={values.includes(it.id)}
              onCheckedChange={(checked) => handleChangeValues(it.id, checked)}
            >
              {trim(it.name, 20)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
