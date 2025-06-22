import React, { Fragment } from "react";
import { groupBy, pipe, sortBy } from "remeda";
import { cn } from "@/lib/utils";

export interface GroupedListProps<T> {
  items: T[] | undefined
  groupKey: string
  renderItem: (item: T) => React.ReactNode
  renderGroup: (group: string) => React.ReactNode
  className?: string
}

export function GroupedList<T extends Record<string, any>>({ items, groupKey, renderItem, renderGroup, className }: GroupedListProps<T>) {
  const result = pipe(
    items || [],
    groupBy<T>(it => it[groupKey]),
    groups => Object.entries(groups),
    entries => sortBy(entries, ([key]) => key)
  )

  return (
    <div className={cn("flex flex-col overflow-x-hidden overflow-y-auto scrollbar-hide", className)}>
      {result.map(([key, items]) => (
        <Fragment key={key}>
          {renderGroup(key)}
          {items.map((item, index) => <Fragment key={index}>
          {renderItem(item)}
          </Fragment>)}
        </Fragment>
      ))}
    </div>
  )
}