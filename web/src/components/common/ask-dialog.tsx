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
import { type AskType, useAskDialogStore } from '@/store/ask-dialog'

interface InputRendererProps {
  type: AskType
  value: string
  onChange: (raw: string) => void
}

function AskInputRenderer({ type, value, onChange }: InputRendererProps) {
  if (type === 'date') {
    const dateValue = value ? new Date(value) : undefined
    return (
      <DateInput value={dateValue} onChange={(date) => onChange(date ? date.toISOString() : '')} />
    )
  }

  if (type === 'number') {
    return (
      <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} autoFocus />
    )
  }

  return <Input type="text" value={value} onChange={(e) => onChange(e.target.value)} autoFocus />
}

function parseValue(type: AskType, raw: string): unknown {
  if (type === 'number') return Number(raw)
  if (type === 'date') return raw ? new Date(raw) : undefined
  return raw
}

export function AskDialog() {
  const { entry, open, confirm, dismiss } = useAskDialogStore()
  const [rawValue, setRawValue] = React.useState<string>('')

  useEffect(() => {
    if (open && entry) {
      const init = entry.params.initialValue
      if (init instanceof Date) {
        setRawValue(init.toISOString())
      } else if (init !== undefined && init !== null) {
        setRawValue(String(init))
      } else {
        setRawValue('')
      }
    }
  }, [open, entry])

  const handleConfirm = () => {
    if (!entry) return
    const parsed = parseValue(entry.params.type, rawValue)
    confirm(parsed as never)
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
            <AskInputRenderer type={entry.params.type} value={rawValue} onChange={setRawValue} />
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
