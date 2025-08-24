import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '../ui/button'
import { Form } from '@/components/ui/form'
import { useRequest } from '@/hooks/use-request'
import { operationUrls } from '@/api/operation'
import { useEffect, useRef } from 'react'
import { useOperationStore } from '@/store/operation'
import {
  OperationForm,
  OperationFormData,
  useOperationForm,
} from '@/components/operation/operation-form'
import { createStore } from 'zustand'
import { openStoreSlice, OpenStoreState } from '@/store/common/open'
import { useStoreSelect } from '@/hooks/use-store-select'

export interface OperationSheetStoreState extends OpenStoreState {
  operationId?: string
  openWith: (operationId?: string) => void
}

const operationSheetStore = createStore<OperationSheetStoreState>((set, get, store) => ({
  ...openStoreSlice(set, get, store),
  openWith: (operationId?: string) => set({ opened: true, operationId }),
  close: () => set({ opened: false, operationId: undefined }),
}))

export const useOperationSheetStore = <K extends keyof OperationSheetStoreState>(...fields: K[]) =>
  useStoreSelect<OperationSheetStoreState, K>(operationSheetStore, ...fields)

export function OperationSheet() {
  const operation = useOperationStore('updatePathParams', 'fetch', 'data') // todo support loading, error
  const { opened, operationId, close } = useOperationSheetStore('opened', 'operationId', 'close')
  const { loading, error, submit, reset } = useRequest(operationUrls.root, { noErrorToast: true })
  const { form, setData, clear } = useOperationForm()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    operation.updatePathParams({ id: operationId })
    if (operationId) {
      operation.fetch()
    }
  }, [operationId])

  useEffect(() => {
    if (operation.data) {
      setData(operation.data as any)
    }
  }, [operation.data])

  const onSubmit = (data: OperationFormData) => {
    submit(data).then(() => closeSheet())
  }

  const onOpenChange = (value: boolean) => {
    if (!value) {
      closeSheet()
    }
  }

  const closeSheet = () => {
    close()
    clear()
    reset()
  }

  return (
    <Sheet open={opened} onOpenChange={onOpenChange}>
      <SheetContent ref={ref} aria-describedby="">
        <SheetHeader>
          <SheetTitle>Operation</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
            <OperationForm form={form} error={error} className="grow px-4" />
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="secondary">Cancel</Button>
              </SheetClose>
              <Button type="submit" disabled={loading}>
                Save
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
