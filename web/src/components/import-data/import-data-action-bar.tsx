import {
  useImportDataOperationSelectionStore,
  useImportDataEntrySelectionStore,
  useImportDataStore,
} from '@/store/import-data'
import { ActionBar, ActionBarButton } from '@/components/common/action-bar'
import { EyeClosedIcon, EyeIcon, Link2Icon, Link2OffIcon, TrashIcon } from 'lucide-react'
import { useRequest } from '@/hooks/use-request'
import { importDataUrls } from '@/api/import-data'
import { operationUrls } from '@/api/operation'

export function ImportDataActionBar() {
  const importData = useImportDataStore('data')
  const visibility = useRequest(importDataUrls.entryVisibility)
  const link = useRequest(importDataUrls.entryLink)
  const unlink = useRequest(importDataUrls.entryUnlink)
  const deleteOperations = useRequest(operationUrls.root, { method: 'DELETE' })
  const operationSelection = useImportDataOperationSelectionStore(
    'selected',
    'items',
    'has',
    'clear',
  )
  const entrySelection = useImportDataEntrySelectionStore('selected', 'items', 'has', 'clear')

  const handleVisibility = (visible: boolean) => {
    if (!importData.data) {
      return
    }

    const data = {
      operations: Array.from(operationSelection.selected),
      entries: Array.from(entrySelection.selected),
      visible,
    }
    visibility.submit(data, { id: importData.data.id }).then(() => {
      operationSelection.clear()
      entrySelection.clear()
    })
  }

  const handleLink = () => {
    if (!importData.data) {
      return
    }

    const data = {
      operationId: Object.values(operationSelection.items)[0].id,
      entryId: Object.values(entrySelection.items)[0].id,
    }
    link.submit(data, { id: importData.data.id }).then(() => {
      operationSelection.clear()
      entrySelection.clear()
    })
  }

  const handleUnlink = () => {
    if (!importData.data) {
      return
    }

    const entryIds = Object.values(entrySelection.items)
      .filter((it) => it.linked)
      .map((it) => it.id)
    unlink.submit({ entryIds }, { id: importData.data.id }).then(() => {
      operationSelection.clear()
      entrySelection.clear()
    })
  }

  const handleDelete = () => {
    if (operationSelection.selected.size === 0) {
      return
    }

    deleteOperations.submit([...operationSelection.selected]).then(() => {
      operationSelection.clear()
    })
  }

  const visible = !!operationSelection.selected.size || !!entrySelection.selected.size
  const progress =
    visibility.loading ||
    link.loading ||
    unlink.loading ||
    deleteOperations.loading ||
    !importData.data ||
    !!importData.data?.progress

  const linkDisabled =
    progress ||
    operationSelection.selected.size !== 1 ||
    entrySelection.selected.size !== 1 ||
    !!Object.values(entrySelection.items).find((it) => it.linked)

  const unlinkDisabled =
    progress ||
    !entrySelection.selected.size ||
    !Object.values(entrySelection.items).find((it) => it.linked)

  const deleteDisabled = progress || !operationSelection.selected.size

  return (
    <ActionBar open={visible}>
      <ActionBarButton
        hint="Show entries"
        icon={<EyeIcon />}
        disabled={progress}
        onClick={() => handleVisibility(true)}
      />
      <ActionBarButton
        hint="Hide entries"
        icon={<EyeClosedIcon />}
        disabled={progress}
        onClick={() => handleVisibility(false)}
      />
      <ActionBarButton
        hint="Link operation to entry"
        icon={<Link2Icon />}
        disabled={linkDisabled}
        onClick={handleLink}
      />
      <ActionBarButton
        hint="Break the link of operation and entry"
        icon={<Link2OffIcon />}
        disabled={unlinkDisabled}
        onClick={handleUnlink}
      />
      <ActionBarButton
        hint="Delete operations"
        icon={<TrashIcon />}
        disabled={deleteDisabled}
        onClick={handleDelete}
      />
    </ActionBar>
  )
}
