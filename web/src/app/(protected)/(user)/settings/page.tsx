'use client'

import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { useRequest } from '@/hooks/use-request'
import { Layout } from '@/components/common/layout/layout'
import { AccountInput } from '@/components/common/input/account-input'
import { CurrencyInput } from '@/components/common/input/currency-input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Typography } from '@/components/common/typography/typography'
import { userUrls } from '@/api/user'
import { useUserStore } from '@/store/user'
import { accountReferenceSchema } from '@/types/account'
import type { User } from '@/types/user'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  operationDefaultCurrency: z.string().optional(),
  operationDefaultCurrencyScale: z.number().int().min(0).optional(),
  operationDefaultAccount: accountReferenceSchema.optional(),
  operationCashAccount: accountReferenceSchema.optional(),
})

type SettingsForm = z.infer<typeof schema>

export default function SettingsPage() {
  const store = useUserStore()
  const saveReq = useRequest<void, User>(userUrls.root)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsForm>({ resolver: zodResolver(schema) })

  useEffect(() => {
    void store.fetch()
  }, [store.fetch])

  useEffect(() => {
    if (store.data) {
      const s = store.data.settings
      reset({
        name: store.data.name,
        operationDefaultCurrency: s.operationDefaultCurrency,
        operationDefaultCurrencyScale: s.operationDefaultCurrencyScale,
        operationDefaultAccount: s.operationDefaultAccount ?? undefined,
        operationCashAccount: s.operationCashAccount ?? undefined,
      })
    }
  }, [store.data, reset])

  const onSubmit = async (data: SettingsForm) => {
    if (!store.data) return
    await saveReq.submit({
      body: {
        ...store.data,
        name: data.name,
        settings: {
          version: store.data.settings.version,
          operationDefaultCurrency: data.operationDefaultCurrency,
          operationDefaultCurrencyScale: data.operationDefaultCurrencyScale,
          operationDefaultAccount: data.operationDefaultAccount,
          operationCashAccount: data.operationCashAccount,
        },
      },
    })
    toast.success('Settings saved')
    void store.fetch()
  }

  return (
    <Layout scrollable>
      <div className="flex flex-col gap-3 w-full max-w-xl self-center">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <Typography variant="h3">Settings</Typography>
            <Typography variant="muted">Manage your profile and operation defaults</Typography>
          </div>
          <Button
            type="submit"
            form="settings-form"
            size="sm"
            disabled={saveReq.loading || !store.data}
          >
            Save
          </Button>
        </div>

        <Card>
          <CardContent className="flex flex-col gap-4">
            <form id="settings-form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <FieldGroup>
                <Field data-invalid={errors.name ? 'true' : undefined}>
                  <FieldLabel>Name</FieldLabel>
                  <Input
                    placeholder="Your name"
                    aria-invalid={!!errors.name}
                    {...register('name')}
                  />
                  <FieldError>{errors.name?.message}</FieldError>
                </Field>

                <Field data-invalid={errors.operationDefaultCurrency ? 'true' : undefined}>
                  <FieldLabel>Default currency</FieldLabel>
                  <Controller
                    name="operationDefaultCurrency"
                    control={control}
                    render={({ field }) => (
                      <CurrencyInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select currency"
                      />
                    )}
                  />
                  <FieldError>{errors.operationDefaultCurrency?.message}</FieldError>
                </Field>

                <Field data-invalid={errors.operationDefaultCurrencyScale ? 'true' : undefined}>
                  <FieldLabel>Default currency scale</FieldLabel>
                  <Input
                    type="number"
                    placeholder="e.g. 2"
                    aria-invalid={!!errors.operationDefaultCurrencyScale}
                    {...register('operationDefaultCurrencyScale', {
                      setValueAs: (v) => (v === '' || v === undefined ? undefined : Number(v)),
                    })}
                  />
                  <FieldError>{errors.operationDefaultCurrencyScale?.message}</FieldError>
                </Field>

                <Field data-invalid={errors.operationDefaultAccount ? 'true' : undefined}>
                  <FieldLabel>Default account</FieldLabel>
                  <Controller
                    name="operationDefaultAccount"
                    control={control}
                    render={({ field }) => (
                      <AccountInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select account"
                      />
                    )}
                  />
                  <FieldError>{errors.operationDefaultAccount?.message}</FieldError>
                </Field>

                <Field data-invalid={errors.operationCashAccount ? 'true' : undefined}>
                  <FieldLabel>Cash account</FieldLabel>
                  <Controller
                    name="operationCashAccount"
                    control={control}
                    render={({ field }) => (
                      <AccountInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select account"
                      />
                    )}
                  />
                  <FieldError>{errors.operationCashAccount?.message}</FieldError>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
