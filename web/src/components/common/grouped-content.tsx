import React, { Fragment } from "react";
import { groupBy, pipe, sortBy } from "remeda";
import { cn } from "@/lib/utils";

export interface GroupedContentProps<T> {
  items: T[] | undefined
  getGroup: (item: T) => string | undefined
  renderGroup: (group: string, items: T[], index: number) => React.ReactNode
  className?: string
}

export function GroupedContent<T extends Record<string, any>>({ items, getGroup, renderGroup, className }: GroupedContentProps<T>) {
  const result = pipe(
    items || [],
    groupBy<T>(it => getGroup(it) || ''),
    groups => Object.entries(groups),
    entries => sortBy(entries, ([key]) => key)
  )

  return (
    <div className={cn("flex flex-col overflow-x-hidden overflow-y-auto scrollbar-hide", className)}>
      {result.map(([key, items], index) => (
        <Fragment key={key}>
          {renderGroup(key, items, index)}
        </Fragment>
      ))}
    </div>
  )
}

export interface GroupProps<T> {
  group: string
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  renderGroup: (group: string) => React.ReactNode
}

export function ListGroup<T>({ group, items, renderItem, renderGroup }: GroupProps<T>) {
  return (
    <div className="flex flex-col">
      {renderGroup(group)}
      {items.map((it, index) => (
        <Fragment key={index}>
          {renderItem(it, index)}
        </Fragment>
      ))}
    </div>
  )
}

export function GalleryGroup<T>({ group, items, renderItem, renderGroup }: GroupProps<T>) {
  return (
    <div className="flex flex-col gap-4">
      {renderGroup(group)}
      <div className="flex flex-wrap gap-2">
        {items.map((it, index) => (
          <Fragment key={index}>
            {renderItem(it, index)}
          </Fragment>
        ))}
      </div>
    </div>
  )
}