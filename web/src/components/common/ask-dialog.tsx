'use client'

import * as React from 'react'
import { useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DateInput } from '@/components/common/input/date-input'
import { AmountInput } from '@/components/common/input/amount-input'
import { type AskType, useAskDialogStore } from '@/store/common/ask-dialog'
import { Amount } from '@/types/common/amount'

interface InputRendererProps {
  type: AskType
  value: unknown
  onChange: (value: unknown) => void
}

function AskInputRenderer({ type, value, onChange }: InputRendererProps) {
  if (type === 'date') {
    return (
      <DateInput value={value as Date | undefined} onChange={onChange} />
    )
  }

  if (type === 'number') {
    return (
      <Input
        type="number"
        value={value != null ? String(value as number) : ''}
        onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
        autoFocus
      />
    )
  }

  if (type === 'amount') {
    return (
      <AmountInput value={value as Amount | undefined} onChange={onChange} />
    )
  }

  return (
    <Input
      type="text"
      value={(value as string) ?? ''}
      onChange={(e) => onChange(e.target.value)}
      autoFocus
    />
  )
}

export function AskDialog() {
  const { entry, open, confirm, dismiss } = useAskDialogStore()
  const [value, setValue] = React.useState<unknown>(undefined)

  useEffect(() => {
    if (open && entry) {
      setValue(entry.params.initialValue ?? (entry.params.type === 'string' ? '' : undefined))
    }
  }, [open, entry])

  const handleConfirm = () => {
    if (!entry) return
    confirm(value as never)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) dismiss()
      }}
    >
      <DialogContent onKeyDown={handleKeyDown} className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{entry?.params.label ?? ''}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {entry && (
            <AskInputRenderer type={entry.params.type} value={value} onChange={setValue} />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={dismiss}>
            Отмена
          </Button>
          <Button onClick={handleConfirm}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}