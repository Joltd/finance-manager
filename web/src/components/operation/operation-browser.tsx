import { useOperationListStore, useOperationSelectionStore } from '@/store/operation'
import { useOperationSheetStore } from '@/components/operation/operation-sheet'
import React, { useEffect, MouseEvent } from 'react'
import { subscribeSse } from '@/lib/notification'
import { operationEvents } from '@/api/operation'
import { DateLabel } from '@/components/common/typography/date-label'
import { Pointable } from '@/components/common/pointable'
import { OperationLabel } from '@/components/common/typography/operation-label'
import { Operation } from '@/types/operation'
import { DataPlaceholder } from '@/components/common/data-placeholder'
import { Group } from '@/components/common/layout/group'
import { Stack } from '@/components/common/layout/stack'

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
    <DataPlaceholder {...operationList}>
      <Stack gap={6} scrollable onClick={handleClickOutside}>
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
      </Stack>
    </DataPlaceholder>
  )
}
