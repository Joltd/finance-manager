'use client'
import { DateInput } from '@/components/common/input/date-input'
import { AskDialogBaseConfig, createAskDialog } from '@/components/common/ask-dialog'
import z from 'zod'

export interface AskDateDialogConfig extends AskDialogBaseConfig<string> {
  label: string
  value?: string
}

export const { AskDialogComponent: AskDateDialog, ask: askDate } = createAskDialog<
  AskDateDialogConfig,
  string
>(
  ({ value, onChange }) => (
    <DateInput value={value || undefined} onChange={(v) => onChange(v ?? '')} />
  ),
  z.string().optional().default(''),
  '',
  (v) => v ?? '',
)
