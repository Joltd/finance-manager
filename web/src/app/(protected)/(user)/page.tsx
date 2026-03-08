'use client'

import { useState } from 'react'

import { Layout } from '@/components/common/layout/layout'
import { Stack } from '@/components/common/layout/stack'
import { MonthCalendar } from '@/components/common/calendar'
import { Calendar } from '@/components/ui/calendar'

export default function Page() {
  // const [account, setAccount] = useState<AccountReference | undefined>(undefined)
  // const [value, setValue] = useState<Amount | undefined>()
  const [day, setDay] = useState<any>()
  const [month, setMonth] = useState<any>()

  return (
    <Layout>
      <Stack gap={2}>
        <Calendar mode="range" selected={day} onSelect={setDay} />
        <MonthCalendar mode="range" selected={month} onSelect={setMonth} />
      </Stack>
    </Layout>
  )
}
