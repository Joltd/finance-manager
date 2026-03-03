'use client'

import { useState } from 'react'

import { Layout } from '@/components/common/layout/layout'
import { Stack } from '@/components/common/layout/stack'
import { ReferenceInput } from '@/components/common/input/reference-input'
import { useAccountReferenceStore } from '@/store/account'
import { AccountReference } from '@/types/account'

export default function Page() {
  const [account, setAccount] = useState<AccountReference | undefined>(undefined)

  return (
    <Layout>
      <Stack gap={2}>
        <ReferenceInput
          useStore={useAccountReferenceStore}
          value={account}
          onChange={setAccount}
          getLabel={(a) => a.name}
          getId={(a) => a.id}
          onNew={(name) =>
            Promise.resolve({
              id: '',
              name,
              deleted: false,
              type: 'ACCOUNT',
              reviseDate: undefined,
            })
          }
        />
      </Stack>
    </Layout>
  )
}
