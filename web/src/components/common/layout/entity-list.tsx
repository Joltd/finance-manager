'use client'

import * as React from 'react'
import { AlertCircleIcon, PlusIcon } from 'lucide-react'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Typography } from '@/components/common/typography/typography'

export interface EntityListProps<TItem> {
  data: TItem[] | undefined
  loading: boolean
  error: string | null
  title?: string
  subtitle?: string
  renderRow: (item: TItem) => React.ReactNode
  getId: (item: TItem) => string | number
  onAdd?: () => Promise<void>
}

export function EntityList<TItem>({
  data,
  loading,
  error,
  title,
  subtitle,
  renderRow,
  getId,
  onAdd,
}: EntityListProps<TItem>) {

  const count = data?.length ?? 0

  return (
    <div className="flex flex-col gap-3 w-full max-w-xl self-center">
      {(title || subtitle) && (
        <div className="flex flex-col gap-1">
          {title && <Typography variant="h3">{title}</Typography>}
          {subtitle && <Typography variant="muted">{subtitle}</Typography>}
        </div>
      )}

      <Card className="gap-0">
        <CardHeader className="border-b">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {loading ? 'Loading…' : `${count} ${count === 1 ? 'record' : 'records'}`}
          </CardTitle>
          {onAdd && (
            <CardAction>
              <Button size="icon-sm" variant="ghost" onClick={onAdd}>
                <PlusIcon />
              </Button>
            </CardAction>
          )}
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col gap-2 px-6">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-4/5" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 px-6 text-destructive">
              <AlertCircleIcon className="size-4 shrink-0" />
              <Typography variant="small">{error}</Typography>
            </div>
          ) : !count ? (
            <Typography variant="muted" className="px-6">
              No records found
            </Typography>
          ) : (
            <div className="divide-y">
              {data!.map((item) => (
                <div key={getId(item)}>{renderRow(item)}</div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
