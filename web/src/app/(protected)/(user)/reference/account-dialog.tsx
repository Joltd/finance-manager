'use client'

import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { create } from 'zustand'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { useRequest } from '@/hooks/use-request'
import { accountUrls } from '@/api/account'
import type { Account } from '@/types/account'

// ─── Store ────────────────────────────────────────────────────────────────────

interface AccountDialogState {
  open: boolean
  item: Account | null
  onSuccess?: () => void
}

interface AccountDialogActions {
  openDialog: (item: Account, onSuccess?: () => void) => void
  closeDialog: () => void
}

const useAccountDialogStore = create<AccountDialogState & AccountDialogActions>((set) => ({
  open: false,
  item: null,
  onSuccess: undefined,
  openDialog: (item, onSuccess) => set({ open: true, item, onSuccess }),
  closeDialog: () => set({ open: false, item: null, onSuccess: undefined }),
}))

export function openAccountDialog(item: Account, onSuccess?: () => void) {
  useAccountDialogStore.getState().openDialog(item, onSuccess)
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  deleted: z.boolean(),
})

type AccountForm = z.infer<typeof schema>

// ─── Dialog ───────────────────────────────────────────────────────────────────

export function AccountDialog() {
  const { open, item, onSuccess, closeDialog } = useAccountDialogStore()

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AccountForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', deleted: false },
  })

  const deleted = useWatch({ control, name: 'deleted' })

  useEffect(() => {
    if (open && item) {
      reset({
        name: item.name,
        deleted: item.deleted,
      })
    }
  }, [open, item, reset])

  const { loading, error, submit } = useRequest<Account, Account>(accountUrls.root)

  const onSubmit = async (data: AccountForm) => {
    if (!item) return
    await submit({ body: { ...item, ...data } })
    onSuccess?.()
    handleClose()
  }

  const handleClose = () => {
    if (!loading) {
      reset()
      closeDialog()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose() }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit account</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={errors.name ? 'true' : undefined}>
              <FieldLabel>Name</FieldLabel>
              <Input {...register('name')} disabled={loading} autoFocus />
              <FieldError>{errors.name?.message}</FieldError>
            </Field>

            <Field orientation="horizontal">
              <Checkbox
                id="account-deleted"
                checked={deleted}
                onCheckedChange={(checked) => setValue('deleted', !!checked)}
                disabled={loading}
              />
              <FieldLabel htmlFor="account-deleted">Deleted</FieldLabel>
            </Field>

            {error && <FieldError>{error}</FieldError>}
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Spinner />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
