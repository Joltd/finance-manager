'use client'
import { Layout } from '@/components/common/layout/layout'
import { Stack } from '@/components/common/layout/stack'
import { useState } from 'react'
import {DateInput} from "@/components/common/input/date-input";

export default function Page() {
  const [day, setDay] = useState<any>(undefined)
  const [month, setMonth] = useState<any>(undefined)

  return (
    <Layout>
      <Stack gap={2}>

        <DateInput value={day} onChange={setDay} />

      </Stack>
    </Layout>
  )
}
