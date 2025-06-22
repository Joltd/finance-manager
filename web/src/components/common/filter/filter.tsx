'use client'
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ListFilterPlusIcon, XIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { produce } from "immer";

import { FilterExpression, FilterOperator } from "@/types/entity";

export interface FilterProps {
  onFilterChange?: (expressions: FilterExpression[]) => void
  children: React.ReactNode
}

export interface FilterPrimitive<T> {
  id: string
  label: string
  onFilterChange?: (negate: boolean, operator: FilterOperator, value?: T) => void
}

interface Definition {
  id: string
  label: string
  prototype: any
}

interface Instance {
  id: string
  definition: Definition
  negate?: boolean
  operator?: FilterOperator
  value?: any
}

export function Filter({ onFilterChange, children }: FilterProps) {
  const [instances, setInstances] = useState<Record<string, Instance>>({})

  const definitions = useMemo(() => {
    const definitions: Record<string, Definition> = {}

    for (const child of React.Children.toArray(children)) {
      if (!React.isValidElement(child)) {
        continue
      }

      const childProps = child.props as FilterPrimitive<any>

      definitions[childProps.id] = {
        id: childProps.id,
        label: childProps.label,
        prototype: child
      }
    }

    return definitions
  }, [])

  useEffect(() => {
    const expressions = Object.values(instances)
      .filter((it) => it.operator && it.value)
      .map((it) => ({
        negate: it.negate || false,
        id: it.definition.id,
        operator: it.operator!!,
        value: it.value,
      }))

    // onFilterChange?.(expressions)
  }, [instances]);

  const handleFilterChange = (id: string, negate: boolean, operator: FilterOperator, value: any) => {
    setInstances((previous) =>
      produce(previous, (draft) => {
        const instance = draft[id]
        instance.negate = negate
        instance.operator = operator
        instance.value = value
      }))
  }

  const handleAddFilter = (definition: Definition) => {
    const id = `${definition.id}-${Math.floor(Math.random() * 1000000)}`
    setInstances((previous) => produce(previous, (draft) => {
      draft[id] = {
        id,
        definition,
      }
    }))
  }

  const handleRemoveFilter = (id: string) => {
    setInstances((previous) => produce(previous, (draft) => {
      delete draft[id]
    }))
  }

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(instances).map(([ id, instance ]) => (
        <div key={id} className="flex gap-0.5">
          <Button variant="secondary" className="rounded-r-none">{instance.definition.label}</Button>
          {React.cloneElement(instance.definition.prototype, {
            onFilterChange: (negate: boolean, operator: FilterOperator, value: any) => handleFilterChange(id, negate, operator, value)
          })}
          <Button variant="secondary" className="rounded-l-none" onClick={() => handleRemoveFilter(id)}>
            <XIcon />
          </Button>
        </div>
      ))}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary">
            <ListFilterPlusIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {Object.values(definitions).map((it) => (
            <DropdownMenuItem key={it.id} onClick={() => handleAddFilter(it)}>{it.label}</DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}