import { useOperationListStore, useOperationSelectionStore } from '@/store/operation'
import { useOperationSheetStore } from '@/components/operation/operation-sheet'
import React, { useEffect, useRef, MouseEvent } from 'react'
import { DateLabel } from '@/components/common/typography/date-label'
import { Pointable } from '@/components/common/pointable'
import { OperationLabel } from '@/components/common/typography/operation-label'
import { Operation } from '@/types/operation'
import { Group } from '@/components/common/layout/group'
import { Stack } from '@/components/common/layout/stack'
import { Seek } from '@/components/common/layout/seek'

export function OperationBrowser() {
  const operationList = useOperationListStore(
    'loading',
    'dataFetched',
    'error',
    'forwardNoData',
    'backwardNoData',
    'data',
    'seekBackward',
    'seekForward',
    'queryParams',
    'setQueryParams',
  )
  const operationSeekList = useOperationListStore(
    'dataFetched',
    'forwardNoData',
    'backwardNoData',
    'seekBackward',
    'seekForward',
  )
  const operationSheet = useOperationSheetStore('openWith')
  const operationSelection = useOperationSelectionStore('selected', 'select', 'has', 'clear')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    operationList.seekBackward()
  }, [])

  const handleClick = (event: MouseEvent, operation: Operation) => {
    // if (event.ctrlKey) {
    //   operationSelection.select(operation)
    // } else {
    //   operationSelection.clear()
    //   operationSheet.openWith(operation.id)
    // }
  }

  const handleClickOutside = (event: MouseEvent) => {
    // if (event.ctrlKey) {
    //   return
    // }
    // operationSelection.clear()
  }

  return (
    // <DataPlaceholder {...operationList}>
    //   <Sse eventName={operationEvents.root} listener={operationList.fetch} />
    <Seek {...operationSeekList} gap={6} scrollable onClick={handleClickOutside}>
      {operationList.data?.map((group) => (
        <Group key={group.date} text={<DateLabel variant="h4" date={group.date} />}>
          <Stack>
            {group.operations.map((operation) => (
              <Pointable
                key={operation.id}
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
          </Stack>
        </Group>
      ))}
    </Seek>
    // </DataPlaceholder>
  )
}
