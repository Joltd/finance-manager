import { useOperationListStore, useOperationSelectionStore } from '@/store/operation'
import { OperationSheet, useOperationSheetStore } from '@/components/operation/operation-sheet'
import React, { useEffect, useRef, MouseEvent } from 'react'
import { subscribeSse } from '@/lib/notification'
import { operationEvents } from '@/api/operation'
import { TextLabel } from '@/components/common/text-label'
import { DateLabel } from '@/components/common/date-label'
import { Pointable } from '@/components/common/pointable'
import { OperationLabel } from '@/components/common/operation-label'
import { DataSection } from '@/components/common/data-section'
import { OperationActionBar } from '@/components/operation/operation-action-bar'
import { Operation } from '@/types/operation'

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
  const operationSelection = useOperationSelectionStore('selected', 'select', 'has', 'clear')

  useEffect(() => {
    operationList.fetch()
    return subscribeSse(operationEvents.root, {}, () => operationList.fetch())
  }, [])

  const handleClick = (event: MouseEvent, operation: Operation) => {
    if (event.ctrlKey) {
      operationSelection.select(operation)
    } else {
      operationSelection.clear()
      operationSheet.openWith(operation.id)
    }
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (event.ctrlKey) {
      return
    }
    operationSelection.clear()
  }

  return (
    <>
      <DataSection store={operationList}>
        <div className="relative flex flex-col gap-12 overflow-y-auto" onClick={handleClickOutside}>
          {operationList.data?.map((group) => (
            <div key={group.date} className="flex flex-col gap-6">
              <TextLabel variant="title">
                <DateLabel date={group.date} />
              </TextLabel>
              <div className="flex flex-col px-0.5 gap-2">
                {group.operations.map((operation) => (
                  <Pointable
                    key={operation.id}
                    className="py-1"
                    selected={operationSelection.has(operation)}
                    onClick={(event) => handleClick(event, operation)}
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
      <OperationActionBar />
    </>
  )
}
