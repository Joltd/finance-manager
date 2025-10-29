'use client'
import { PlusIcon } from 'lucide-react'
import React from 'react'
import { OperationBrowser } from '@/components/operation/operation-browser'
import { OperationFilter } from '@/components/operation/operation-filter'
import { OperationSheet, useOperationSheetStore } from '@/components/operation/operation-sheet'
import { Layout } from '@/components/common/layout/layout'
import { SectionHeader } from '@/components/common/layout/section'
import { ResponsiveButton } from '@/components/common/responsive-button'
import { OperationActionBar } from '@/components/operation/operation-action-bar'

export default function Page() {
  const operationSheet = useOperationSheetStore()

  const handleAddOperation = () => {
    operationSheet.openWith()
  }

  return (
    <Layout>
      <SectionHeader
        text="Operation"
        actions={
          <ResponsiveButton
            label="Add operation"
            icon={<PlusIcon />}
            onClick={handleAddOperation}
          />
        }
      />
      <OperationFilter />
      <OperationBrowser />
      <OperationSheet />
      <OperationActionBar />
    </Layout>
  )
}
