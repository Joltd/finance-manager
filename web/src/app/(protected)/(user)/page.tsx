'use client'
import { Layout } from '@/components/common/layout/layout'
import { Stack } from '@/components/common/layout/stack'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ask } from '@/store/ask-dialog'

export default function Page() {
  const [day, setDay] = useState<any>(undefined)
  const [month, setMonth] = useState<any>(undefined)

  const handleAsk = () => {
    ask({
      type: 'number',
      label: 'Select a date',
    }).then((result) => console.log(result))
  }

  return (
    <Layout>
      <Stack gap={2}>
        <Button onClick={handleAsk}>Ask</Button>
      </Stack>
    </Layout>
  )
}
