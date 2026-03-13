'use client'

import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { AccountInput } from '@/components/common/input/account-input'
import { CurrencyInput } from '@/components/common/input/currency-input'
import { useRequest } from '@/hooks/use-request'
import { importDataUrls } from '@/api/import-data'
import { accountReferenceSchema } from '@/types/account'
import { createDialogStore } from '@/store/common/dialog'

const useImportDataBeginDialogStore = createDialogStore()

export function openImportDataBeginDialog() {
  useImportDataBeginDialogStore.getState().openDialog()
}

const schema = z.object({
  account: accountReferenceSchema,
  currency: z.string().optional(),
  file: z.custom<FileList>().refine((v) => v instanceof FileList && v.length > 0),
})

type BeginForm = z.infer<typeof schema>

export function ImportDataBeginDialog() {
  const router = useRouter()
  const { open, closeDialog } = useImportDataBeginDialogStore()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BeginForm>({ resolver: zodResolver(schema) })

  const { loading, error, submit } = useRequest<string>(importDataUrls.begin, {
    multipart: true,
  })

  const onSubmit = async (data: BeginForm) => {
    const formData = new FormData()
    formData.append('file', data.file[0])
    formData.append(
      'data',
      new Blob([JSON.stringify({ account: data.account.id, currency: data.currency })], {
        type: 'application/json',
      }),
    )

    const result = await submit({ body: formData as unknown })
    closeDialog()
    router.push(`/import-data/${result}`)
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!loading && !isOpen) {
      reset()
      closeDialog()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>New Import</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={errors.account ? 'true' : undefined}>
              <FieldLabel>Account</FieldLabel>
              <Controller
                name="account"
                control={control}
                render={({ field }) => (
                  <AccountInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select account..."
                    disabled={loading}
                  />
                )}
              />
              <FieldError>{errors.account?.message}</FieldError>
            </Field>

            <Field data-invalid={errors.currency ? 'true' : undefined}>
              <FieldLabel>Currency (optional)</FieldLabel>
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <CurrencyInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select currency..."
                    disabled={loading}
                  />
                )}
              />
              <FieldError>{errors.currency?.message}</FieldError>
            </Field>

            <Field data-invalid={errors.file ? 'true' : undefined}>
              <FieldLabel>File</FieldLabel>
              <Input
                id="import-file"
                type="file"
                aria-invalid={!!errors.file}
                disabled={loading}
                {...register('file')}
              />
              <FieldError>{errors.file?.message}</FieldError>
            </Field>

            {error && <FieldError>{error}</FieldError>}
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Spinner />}
              Import
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
