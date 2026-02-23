'use client'
import { Input } from '@/components/ui/input'
import { AskDialogBaseConfig, createAskDialog } from '@/components/common/ask-dialog'
import z from 'zod'

export interface AskTextDialogConfig extends AskDialogBaseConfig<string> {
  label: string
  value?: string
}

export const { AskDialogComponent: AskTextDialog, ask: askText } = createAskDialog<
  AskTextDialogConfig,
  string
>(
  ({ value, onChange }) => <Input value={value} onChange={(e) => onChange(e.target.value)} />,
  z.string(),
  '',
  (v) => v ?? '',
)
