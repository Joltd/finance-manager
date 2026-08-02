'use client'

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Stack } from '@/components/common/layout/stack'
import { Typography } from '@/components/common/typography/typography'

export interface PagerProps {
  page: number
  size: number
  total: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pager({ page, size, total, onPageChange, className }: PagerProps) {
  const pageCount = Math.max(1, Math.ceil(total / size))

  if (pageCount <= 1) return null

  return (
    <Stack orientation="horizontal" align="center" justify="center" gap={2} className={className}>
      <Button
        variant="outline"
        size="icon-sm"
        disabled={page <= 0}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeftIcon />
      </Button>
      <Typography variant="muted" as="span">
        Page {page + 1} of {pageCount}
      </Typography>
      <Button
        variant="outline"
        size="icon-sm"
        disabled={page >= pageCount - 1}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRightIcon />
      </Button>
    </Stack>
  )
}
