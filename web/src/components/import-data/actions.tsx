import {
  useImportDataEntrySelectionStore,
  useImportDataLockStore,
  useImportDataOperationSelectionStore,
  useImportDataStore,
} from '@/store/import-data'
import { useRequest } from '@/hooks/use-request'
import { importDataUrls } from '@/api/import-data'
import { operationUrls } from '@/api/operation'
import { Action } from '@/types/common/action'
import {
  EyeClosedIcon,
  EyeIcon,
  Link2Icon,
  Link2OffIcon,
  LinkIcon,
  TrashIcon,
  UnlinkIcon,
} from 'lucide-react'

const useVisibilityAction = () => {
  const importData = useImportDataStore('data')
  const { submit } = useRequest(importDataUrls.entryVisibility)
  const operationSelection = useImportDataOperationSelectionStore('selected', 'clear')
  const entrySelection = useImportDataEntrySelectionStore('selected', 'clear')
  const lockStore = useImportDataLockStore()

  const perform = (visible: boolean) => {
    if (!importData.data || lockStore.locked) {
      return
    }

    lockStore.lock()
    const data = {
      operations: Array.from(operationSelection.selected),
      entries: Array.from(entrySelection.selected),
      visible,
    }
    submit(data, { id: importData.data.id })
      .then(() => {
        operationSelection.clear()
        entrySelection.clear()
      })
      .finally(() => lockStore.unlock())
  }

  return {
    available:
      (!lockStore.locked && !!operationSelection.selected.size) || !!entrySelection.selected.size,
    perform,
  }
}

export const useShowAction = (): Action => {
  const { available, perform } = useVisibilityAction()
  return {
    title: 'Show',
    hint: 'Show entries',
    icon: <EyeIcon />,
    available,
    perform: () => perform(true),
  }
}

export const useHideAction = (): Action => {
  const { available, perform } = useVisibilityAction()
  return {
    title: 'Hide',
    hint: 'Hide entries',
    icon: <EyeClosedIcon />,
    available,
    perform: () => perform(false),
  }
}

export const useLinkAction = (): Action => {
  const importData = useImportDataStore('data')
  const { submit } = useRequest(importDataUrls.entryLink)
  const operationSelection = useImportDataOperationSelectionStore('selected', 'items', 'clear')
  const entrySelection = useImportDataEntrySelectionStore('selected', 'items', 'clear')
  const lockStore = useImportDataLockStore()

  const perform = (operationId?: string, entryId?: string) => {
    if (!importData.data || lockStore.locked) {
      return
    }

    lockStore.lock()
    const data = {
      operationId: operationId || Object.values(operationSelection.items)[0].id,
      entryId: entryId || Object.values(entrySelection.items)[0].id,
    }
    submit(data, { id: importData.data.id })
      .then(() => {
        operationSelection.clear()
        entrySelection.clear()
      })
      .finally(() => lockStore.unlock())
  }

  return {
    title: 'Link',
    hint: 'Link operation to entry',
    icon: <LinkIcon />,
    available:
      !lockStore.locked &&
      operationSelection.selected.size === 1 &&
      entrySelection.selected.size === 1 &&
      !Object.values(entrySelection.items).find((it) => it.linked),
    perform,
  }
}

export const useUnlinkAction = (): Action => {
  const importData = useImportDataStore('data')
  const { submit } = useRequest(importDataUrls.entryUnlink)
  const operationSelection = useImportDataOperationSelectionStore('selected', 'items', 'clear')
  const entrySelection = useImportDataEntrySelectionStore('selected', 'items', 'clear')
  const lockStore = useImportDataLockStore()

  const perform = (entryId?: string) => {
    if (!importData.data || lockStore.locked) {
      return
    }

    const entryIds = entryId
      ? [entryId]
      : Object.values(entrySelection.items)
          .filter((it) => it.linked)
          .map((it) => it.id)
    if (!entryIds.length) {
      return
    }

    lockStore.lock()
    submit({ entryIds }, { id: importData.data.id })
      .then(() => {
        operationSelection.clear()
        entrySelection.clear()
      })
      .finally(() => lockStore.unlock())
  }

  return {
    title: 'Unlink',
    hint: 'Break the link of operation and entry',
    icon: <UnlinkIcon />,
    available:
      !lockStore.locked &&
      !!entrySelection.selected.size &&
      Object.values(entrySelection.items).filter((it) => it.linked).length ===
        entrySelection.selected.size,
    perform,
  }
}

export const useDeleteAction = (): Action => {
  const { submit } = useRequest(operationUrls.root, { method: 'DELETE' })
  const operationSelection = useImportDataOperationSelectionStore('selected', 'clear')
  const lockStore = useImportDataLockStore()

  const perform = () => {
    if (operationSelection.selected.size === 0 || lockStore.locked) {
      return
    }

    lockStore.lock()
    submit([...operationSelection.selected])
      .then(() => {
        operationSelection.clear()
      })
      .finally(() => lockStore.unlock())
  }

  return {
    title: 'Delete',
    hint: 'Delete operations',
    icon: <TrashIcon />,
    available: !lockStore.locked && !!operationSelection.selected.size,
    perform,
  }
}
