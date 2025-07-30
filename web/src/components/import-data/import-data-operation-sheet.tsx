import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  OperationForm,
  OperationFormData,
  useOperationForm,
} from '@/components/operation/operation-form'
import { Button } from '@/components/ui/button'
import { createStore } from 'zustand'
import { Operation } from '@/types/operation'
import { ImportDataOperation } from '@/types/import-data'
import { Form } from '@/components/ui/form'
import { ImportDataOperationLabel } from '@/components/import-data/import-data-operation-label'
import { Account } from '@/types/account'
import { Pointable } from '@/components/common/pointable'
import { openStoreSlice, OpenStoreState } from '@/store/common/open'
import { useStoreSelect } from '@/hooks/use-store-select'

export interface ImportDataOperationSheetProps {
  relatedAccount: Account
}

export interface ImportDataOperationSheetStoreState extends OpenStoreState {
  operation?: Operation
  suggestions?: ImportDataOperation[]
  openWith: (operation?: Operation, suggestions?: ImportDataOperation[]) => void
}

const importDataOperationSheetStore = createStore<ImportDataOperationSheetStoreState>(
  (set, get, store) => ({
    ...openStoreSlice(set, get, store),
    openWith: (operation?: Operation, suggestions?: ImportDataOperation[]) =>
      set({ operation, suggestions }),
  }),
)

export const useImportDataOperationSheetStore = <
  K extends keyof ImportDataOperationSheetStoreState,
>(
  ...fields: K[]
) => useStoreSelect<ImportDataOperationSheetStoreState, K>(importDataOperationSheetStore, ...fields)

export function ImportDataOperationSheet({ relatedAccount }: ImportDataOperationSheetProps) {
  const { opened, setOpened, operation, suggestions } = useImportDataOperationSheetStore(
    'opened',
    'setOpened',
    'operation',
    'suggestions',
  )
  const { form } = useOperationForm()

  const onSubmit = (data: OperationFormData) => {
    return
  }

  return (
    <Sheet open={opened} onOpenChange={setOpened}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Operation</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col h-full overflow-hidden"
          >
            <div className="flex flex-col grow overflow-auto gap-8 px-4">
              {!operation && !!suggestions?.length && (
                <div className="flex flex-col gap-2">
                  <div>Suggestions</div>
                  <div className="flex flex-col gap-2">
                    {suggestions?.map((it, index) => (
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
              <OperationForm form={form} />
            </div>
            <SheetFooter>
              <Button type="submit">Save</Button>
              <Button variant="secondary">Cancel</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
