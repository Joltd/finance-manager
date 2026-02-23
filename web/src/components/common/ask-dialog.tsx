'use client'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form, FormBody } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import z, { ZodTypeAny } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useStoreSelect } from '@/hooks/use-store-select'
import { AskDialogStoreState, createAskDialogStore } from '@/store/common/ask-dialog'
import { ReactNode, useEffect } from 'react'

export interface AskDialogBaseConfig<V> {
  label: string
  value?: V
}

export interface AskDialogProps<C extends AskDialogBaseConfig<V>, V> {
  store: ReturnType<typeof createAskDialogStore<C, V>>
  schema: ZodTypeAny
  defaultValue: V
  renderInput: (field: { value: V; onChange: (value: V) => void }) => ReactNode
  toFormValue?: (value: V | undefined) => V
  fromFormValue?: (value: V) => V
}

export function AskDialog<C extends AskDialogBaseConfig<V>, V>({
  store,
  schema,
  defaultValue,
  renderInput,
  toFormValue,
  fromFormValue,
}: AskDialogProps<C, V>) {
  const formSchema = z.object({ value: schema })

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const useAskStore = <K extends keyof AskDialogStoreState<C, V>>(...fields: K[]) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useStoreSelect<AskDialogStoreState<C, V>, K>(store, ...fields)

  const { config, opened, close, resolve } = useAskStore('config', 'opened', 'close', 'resolve')

  const form = useForm<{ value: unknown }>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: { value: defaultValue },
  })

  useEffect(() => {
    const initial = toFormValue ? toFormValue(config?.value) : (config?.value ?? defaultValue)
    form.setValue('value', initial)
  }, [config])

  const onSubmit = (data: { value: unknown }) => {
    const result = fromFormValue ? fromFormValue(data.value as V) : (data.value as V)
    close()
    resolve(result)
  }

  const onOpenChange = (open: boolean) => {
    if (!open) {
      close()
      form.reset()
    }
  }

  return (
    <Dialog open={opened} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="">
        <Form {...(form as any)}>
          <form onSubmit={form.handleSubmit(onSubmit as any)}>
            {config?.label && (
              <DialogHeader>
                <DialogTitle>{config.label}</DialogTitle>
              </DialogHeader>
            )}
            <FormBody className="py-4">
              {renderInput({
                value: form.watch('value') as V,
                onChange: (val) => form.setValue('value', val),
              })}
            </FormBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit">Ok</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export function createAskDialog<C extends AskDialogBaseConfig<V>, V>(
  renderInput: (field: { value: V; onChange: (value: V) => void }) => ReactNode,
  schema: ZodTypeAny,
  defaultValue: V,
  toFormValue?: (value: V | undefined) => V,
  fromFormValue?: (value: V) => V,
) {
  const store = createAskDialogStore<C, V>()

  function AskDialogComponent() {
    return (
      <AskDialog
        store={store}
        schema={schema}
        defaultValue={defaultValue}
        renderInput={renderInput}
        toFormValue={toFormValue}
        fromFormValue={fromFormValue}
      />
    )
  }

  const ask = (label: string, value?: V): Promise<V> =>
    new Promise<V>((resolve) => {
      store.getState().ask(resolve, { label, value } as C)
    })

  return { AskDialogComponent, ask, store }
}
