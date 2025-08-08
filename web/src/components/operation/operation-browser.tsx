import { useOperationListStore } from '@/store/operation'
import { OperationSheet, useOperationSheetStore } from '@/components/operation/operation-sheet'
import React, { useEffect, useRef } from 'react'
import { subscribeSse } from '@/lib/notification'
import { operationEvents } from '@/api/operation'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { AlertCircleIcon } from 'lucide-react'
import { EmptyLabel } from '@/components/common/empty-label'
import { TextLabel } from '@/components/common/text-label'
import { DateLabel } from '@/components/common/date-label'
import { Pointable } from '@/components/common/pointable'
import { OperationLabel } from '@/components/common/operation-label'

export function OperationBrowser() {
  const operationList = useOperationListStore(
    'loading',
    'dataFetched',
    'error',
    'data',
    'fetch',
    'queryParams',
    'setQueryParams',
  )
  const operationSheet = useOperationSheetStore('openWith')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    operationList.fetch()
    return subscribeSse(operationEvents.root, {}, () => operationList.fetch())
  }, [])

  return (
    <>
      {operationList.loading && !operationList.dataFetched ? (
        <Spinner className="m-6" />
      ) : operationList.error ? (
        <Alert variant="destructive" className="m-6">
          <AlertCircleIcon />
          <AlertTitle>{operationList.error}</AlertTitle>
        </Alert>
      ) : !operationList.data || !operationList.data?.length ? (
        <EmptyLabel className="m-6" />
      ) : (
        <div ref={ref} className="relative flex flex-col gap-12 overflow-y-auto">
          {operationList.data?.map((group) => (
            <div key={group.date} className="flex flex-col gap-6">
              <TextLabel variant="title">
                <DateLabel date={group.date} />
              </TextLabel>
              <div className="flex flex-col px-0.5">
                {group.operations.map((operation) => (
                  <Pointable
                    key={operation.id}
                    className="py-1"
                    onClick={() => operationSheet.openWith(operation.id)}
                  >
                    <OperationLabel
                      type={operation.type}
                      amountFrom={operation.amountFrom}
                      accountFrom={operation.accountFrom}
                      amountTo={operation.amountTo}
                      accountTo={operation.accountTo}
                    />
                  </Pointable>
                ))}
              </div>
            </div>
          ))}

          {/*<div className="absolute top-6 right-6 flex gap-2 items-center">*/}
          {/*  <DropdownMenu>*/}
          {/*    <DropdownMenuTrigger asChild>*/}
          {/*      <Button size="sm" variant="outline">*/}
          {/*        <ListFilterPlusIcon />*/}
          {/*      </Button>*/}
          {/*    </DropdownMenuTrigger>*/}
          {/*    <DropdownMenuContent>*/}
          {/*      <DropdownMenuItem onClick={handleToggleFilters}>*/}
          {/*        Toggle filters*/}
          {/*      </DropdownMenuItem>*/}
          {/*    </DropdownMenuContent>*/}
          {/*  </DropdownMenu>*/}
          {/*  <Button size="sm" onClick={handleAddOperation}>*/}
          {/*    <PlusIcon />*/}
          {/*    Add operation*/}
          {/*  </Button>*/}
          {/*</div>*/}
        </div>
      )}
      <OperationSheet />
    </>
  )
}
