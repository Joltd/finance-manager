import { useOperationListStore } from '@/store/operation'
import { OperationSheet, useOperationSheetStore } from '@/components/operation/operation-sheet'
import React, { useEffect, useRef } from 'react'
import { subscribeSse } from '@/lib/notification'
import { operationEvents } from '@/api/operation'
import { TextLabel } from '@/components/common/text-label'
import { DateLabel } from '@/components/common/date-label'
import { Pointable } from '@/components/common/pointable'
import { OperationLabel } from '@/components/common/operation-label'
import { DataSection } from '@/components/common/data-section'

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
      <DataSection store={operationList}>
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
        </div>
      </DataSection>
      <OperationSheet />
    </>
  )
}
