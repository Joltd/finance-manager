'use client'

import { useState } from 'react'

import { Layout } from '@/components/common/layout/layout'
import { Stack } from '@/components/common/layout/stack'
import { AmountInput } from '@/components/common/input/amount-input'
import { Amount, toDisplayString } from '@/types/common/amount'
import { Typography } from '@/components/common/typography/typography'

export default function Page() {
  // const [account, setAccount] = useState<AccountReference | undefined>(undefined)
  const [value, setValue] = useState<Amount | undefined>()

  return (
    <Layout>
      <Stack gap={2}>
        <Typography>{value ? toDisplayString(value) : 'No amount'}</Typography>
        <AmountInput value={value} onChange={setValue} />
      </Stack>
    </Layout>
  )
}
