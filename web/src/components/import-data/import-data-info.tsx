import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Spinner } from '@/components/ui/spinner'
import { ValidityIcon } from '@/components/common/validity-icon'
import { TextLabel } from '@/components/common/text-label'
import { useImportDataStore } from '@/store/import-data'
import { Pointable } from '@/components/common/pointable'
import { useRequest } from '@/hooks/use-request'
import { importDataUrls } from '@/api/import-data'

export interface ImportDataInfoProps {}

export function ImportDataInfo({}: ImportDataInfoProps) {
  const importData = useImportDataStore('data')
  const { submit, loading, error } = useRequest(importDataUrls.finish) // todo handle error

  const handleFinish = (revise = false) => {
    submit({ revise }, { id: importData.data?.id })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Pointable className="py-2">
          <TextLabel variant="title">
            {importData.data?.account?.name}
            {!importData.data?.progress ? (
              <ValidityIcon
                valid={importData.data?.valid}
                message="Totals by import file doesn't mathced to totals in database with suggested records or actual balance is different"
                collapseIfEmpty
              />
            ) : (
              <Spinner />
            )}
          </TextLabel>
        </Pointable>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleFinish()}>Finish</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleFinish(true)}>Finish & revise</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
