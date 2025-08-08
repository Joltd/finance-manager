import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  OperationForm,
  OperationFormData,
  useOperationForm,
} from '@/components/operation/operation-form'
import { Button } from '@/components/ui/button'
import { createStore } from 'zustand'
import { Operation } from '@/types/operation'
import { ImportDataEntry, ImportDataOperation } from '@/types/import-data'
import { Form } from '@/components/ui/form'
import { ImportDataOperationLabel } from '@/components/import-data/import-data-operation-label'
import { Account } from '@/types/account'
import { Pointable } from '@/components/common/pointable'
import { openStoreSlice, OpenStoreState } from '@/store/common/open'
import { useStoreSelect } from '@/hooks/use-store-select'
import { useRequest } from '@/hooks/use-request'
import { operationUrls } from '@/api/operation'
import { importDataUrls } from '@/api/import-data'

export interface ImportDataOperationSheetProps {
  importDataId: string
  relatedAccount: Account
}

export interface ImportDataOperationSheetStoreState extends OpenStoreState {
  entry?: ImportDataEntry
  openWith: (entry: ImportDataEntry) => void
}

const importDataOperationSheetStore = createStore<ImportDataOperationSheetStoreState>(
  (set, get, store) => ({
    ...openStoreSlice(set, get, store),
    openWith: (entry: ImportDataEntry) => set({ opened: true, entry }),
  }),
)

export const useImportDataOperationSheetStore = <
  K extends keyof ImportDataOperationSheetStoreState,
>(
  ...fields: K[]
) => useStoreSelect<ImportDataOperationSheetStoreState, K>(importDataOperationSheetStore, ...fields)

export function ImportDataOperationSheet({
  importDataId,
  relatedAccount,
}: ImportDataOperationSheetProps) {
  const { opened, setOpened, close, entry } = useImportDataOperationSheetStore(
    'opened',
    'setOpened',
    'close',
    'entry',
  )
  const { form } = useOperationForm((entry?.operation || entry?.parsed) as any)
  const operationRequest = useRequest(operationUrls.root)
  const operationLinkRequest = useRequest(importDataUrls.entryIdLink)

  const onSubmit = (data: OperationFormData) => {
    if (!!entry?.operation) {
      operationRequest.submit(data)
    } else if (!!entry?.id) {
      operationLinkRequest.submit(data, { id: importDataId, entryId: entry?.id })
    } else {
      operationRequest.submit(data)
    }
    close()
  }

  const onOpenChange = (value: boolean) => {
    setOpened(value)
    form.reset()
    operationRequest.reset()
    operationLinkRequest.reset()
  }

  return (
    <Sheet open={opened} onOpenChange={onOpenChange}>
      <SheetContent aria-describedby="">
        <SheetHeader>
          <SheetTitle>Operation</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col h-full overflow-hidden"
          >
            <div className="flex flex-col grow overflow-auto gap-8 px-4">
              {!entry?.operation && !!entry?.suggestions?.length && (
                <div className="flex flex-col gap-2">
                  <div>Suggestions</div>
                  <div className="flex flex-col gap-2">
                    {entry?.suggestions?.map((it, index) => (
                      <Pointable key={index}>
                        <ImportDataOperationLabel
                          type={it.type}
                          accountFrom={it.accountFrom}
                          amountFrom={it.amountFrom}
                          accountTo={it.accountTo}
                          amountTo={it.amountTo}
                          relatedAccount={relatedAccount}
                        />
                      </Pointable>
                    ))}
                  </div>
                </div>
              )}
              <OperationForm
                form={form}
                error={operationRequest.error || operationLinkRequest.error}
              />
            </div>
            <SheetFooter>
              <Button
                type="submit"
                disabled={operationRequest.loading || operationLinkRequest.loading}
              >
                Save
              </Button>
              <Button variant="secondary">Cancel</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
