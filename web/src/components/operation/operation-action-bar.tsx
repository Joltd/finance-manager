import { useOperationSelectionStore } from '@/store/operation'
import { ActionBar, ActionBarButton } from '@/components/common/action-bar'
import { TrashIcon } from 'lucide-react'
import { useRequest } from '@/hooks/use-request'
import { operationUrls } from '@/api/operation'

export function OperationActionBar() {
  const deleteOperations = useRequest(operationUrls.root, { method: 'DELETE' })
  const operationSelection = useOperationSelectionStore('selected', 'items', 'has', 'clear')

  const handleDelete = () => {
    if (operationSelection.selected.size === 0) {
      return
    }

    deleteOperations.submit([...operationSelection.selected]).then(() => {
      operationSelection.clear()
    })
  }

  const visible = !!operationSelection.selected.size
  const deleteDisabled = deleteOperations.loading || !operationSelection.selected.size

  return (
    <ActionBar open={visible}>
      <ActionBarButton
        hint="Delete operations"
        icon={<TrashIcon />}
        available={!deleteDisabled}
        perform={handleDelete}
      />
    </ActionBar>
  )
}
