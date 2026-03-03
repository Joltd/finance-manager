'use client'
import { Layout } from '@/components/common/layout/layout'
import { Stack } from '@/components/common/layout/stack'
import { useState } from 'react'

export default function Page() {
  const [day, setDay] = useState<any>(undefined)
  const [month, setMonth] = useState<any>(undefined)

  return (
    <Layout>
      <Stack gap={2}></Stack>
    </Layout>
  )
}
