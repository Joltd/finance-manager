import { FilterPrimitive } from '@/components/common/filter-proto/filter'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { FilterOperator } from '@/types/entity'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { RangeValue } from '@/types/common'

export interface RangeFilterProps<T> extends FilterPrimitive<RangeValue<T>> {}

interface Preset {
  operator: FilterOperator
  label: string
}

const presets: Preset[] = [
  {
    operator: FilterOperator.GREATER_EQUALS,
    label: 'greater',
  },
  {
    operator: FilterOperator.LESS,
    label: 'less',
  },
]

export function RangeFilter<T>({ onFilterChange }: RangeFilterProps<T>) {
  const [preset, setPreset] = useState<Preset>(presets[0])
  const [value, setValue] = useState<number>()
  const [inputValue, setInputValue] = useState<string>('')

  useEffect(() => {
    // onFilterChange?.(false, preset.operator, value)
  }, [preset, value])

  const handleApplyValue = () => {
    setValue(+inputValue)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className="rounded-none">
            {preset.label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {presets.map((it, index) => (
            <DropdownMenuItem key={index} onClick={() => setPreset(it)}>
              {it.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary" className="rounded-none">
            {value !== undefined ? value : '...'}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter value</DialogTitle>
          </DialogHeader>
          <Input
            type="number"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button onClick={handleApplyValue}>Apply</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
