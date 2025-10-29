import { DateLabel } from '@/components/common/typography/date-label'
import { useEffect, useRef, MouseEvent } from 'react'
import {
  ImportDataEntryBrowserOperationRow,
  ImportDataEntryBrowserRow,
} from '@/components/import-data/import-data-entry-browser-row'
import {
  useImportDataEntryListStore,
  useImportDataOperationSelectionStore,
  useImportDataEntrySelectionStore,
  useImportDataStore,
} from '@/store/import-data'
import { ImportDataActionBar } from '@/components/import-data/import-data-action-bar'
import { ValidityIcon } from '@/components/common/icon/validity-icon'
import { ImportDataGroupHeader } from '@/components/import-data/import-data-group'
import { subscribeGlobal } from '@/lib/global-event'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { useLinkAction } from '@/components/import-data/actions'
import { DataPlaceholder } from '@/components/common/data-placeholder'
import { Stack } from '@/components/common/layout/stack'
import { Group } from '@/components/common/layout/group'

export interface ImportDataOperationBrowserProps {}

export function ImportDataEntryBrowser({}: ImportDataOperationBrowserProps) {
  const importData = useImportDataStore('data')
  const importDataEntryList = useImportDataEntryListStore(
    'loading',
    'dataFetched',
    'error',
    'data',
    'queryParams',
  )
  const operationSelection = useImportDataOperationSelectionStore(
    'selected',
    'has',
    'select',
    'clear',
  )
  const entrySelection = useImportDataEntrySelectionStore('selected', 'has', 'select', 'clear')
  const ref = useRef<HTMLDivElement>(null)
  const linkAction = useLinkAction()

  useEffect(() => {
    return subscribeGlobal('click', (event: MouseEvent) => {
      if (!event.ctrlKey) {
        operationSelection.clear()
        entrySelection.clear()
      }
    })
  }, [])

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTo({ behavior: 'smooth', top: 0 })
    }
  }, [importDataEntryList.queryParams])

  const handleDrag = (event: DragEndEvent) => {
    const operation = event.active.id
    const entry = event.collisions?.[0]?.id

    if (!operation || !entry) {
      return
    }

    linkAction.perform(operation, entry)
  }

  return (
    <DataPlaceholder {...importDataEntryList}>
      <Stack ref={ref} scrollable>
        <DndContext onDragEnd={handleDrag}>
          {importDataEntryList.data?.map((group) => (
            <Group
              text={
                <>
                  <ValidityIcon valid={group.valid} message="Some totals doesn't matched" />
                  <DateLabel date={group.date} />
                </>
              }
            >
              <ImportDataGroupHeader group={group} />
              <Stack>
                {group.entries.map((entry) =>
                  entry.id ? (
                    <ImportDataEntryBrowserRow
                      key={entry.id}
                      entry={entry}
                      linked={entry.linked}
                      operation={entry.operation}
                      parsed={entry.parsed}
                      suggestions={entry.suggestions}
                      relatedAccount={importData.data!!.account}
                      visible={entry.parsedVisible}
                      selected={entrySelection.has(entry)}
                      disabled={importData.data?.progress}
                    />
                  ) : entry.operation ? (
                    <ImportDataEntryBrowserOperationRow
                      key={entry.operation.id}
                      operation={entry.operation}
                      relatedAccount={importData.data!!.account}
                      visible={entry.operationVisible}
                      selected={operationSelection.has(entry.operation)}
                      disabled={importData.data?.progress}
                    />
                  ) : null,
                )}
              </Stack>
            </Group>
          ))}
        </DndContext>

        <ImportDataActionBar />
      </Stack>
    </DataPlaceholder>
  )
}
