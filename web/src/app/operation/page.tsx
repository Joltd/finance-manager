'use client'
import { PlusIcon } from 'lucide-react'
import React from 'react'
import { TextLabel } from '@/components/common/text-label'
import { Button } from '@/components/ui/button'
import { OperationBrowser } from '@/components/operation/operation-browser'
import { OperationFilter } from '@/components/operation/operation-filter'
import { useOperationSheetStore } from '@/components/operation/operation-sheet'

export default function Page() {
  const operationSheet = useOperationSheetStore()

  const handleAddOperation = () => {
    operationSheet.openWith()
  }

  return (
    <div className="flex flex-col gap-4 p-6 overflow-y-hidden">
      <div className="flex gap-2 items-center">
        <TextLabel variant="title" className="grow">
          Operation
        </TextLabel>
        <Button onClick={handleAddOperation}>
          <PlusIcon />
          Add operation
        </Button>
      </div>
      <OperationFilter />
      <OperationBrowser />
    </div>
  )
}
