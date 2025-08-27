import {
  useImportDataOperationSelectionStore,
  useImportDataEntrySelectionStore,
} from '@/store/import-data'
import { ActionBar, ActionBarButton } from '@/components/common/action-bar'
import {
  useDeleteAction,
  useHideAction,
  useLinkAction,
  useShowAction,
  useUnlinkAction,
} from '@/components/import-data/actions'

export function ImportDataActionBar() {
  const showAction = useShowAction()
  const hideAction = useHideAction()
  const linkAction = useLinkAction()
  const unlinkAction = useUnlinkAction()
  const deleteAction = useDeleteAction()

  const operationSelection = useImportDataOperationSelectionStore('selected')
  const entrySelection = useImportDataEntrySelectionStore('selected')

  const visible = !!operationSelection.selected.size || !!entrySelection.selected.size
  const actions = [showAction, hideAction, linkAction, unlinkAction, deleteAction]

  return (
    <ActionBar open={visible}>
      {actions.map((action) => (
        <ActionBarButton key={action.title} {...action} />
      ))}
    </ActionBar>
  )
}
