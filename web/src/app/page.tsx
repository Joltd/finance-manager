'use client'
import { useBalanceStore } from '@/store/balance'
import { AccountLabel } from '@/components/common/account-label'
import { AmountLabel } from '@/components/common/amount-label'
import { LoaderCircleIcon } from 'lucide-react'
import { balanceEvents } from '@/api/balance'
import { OperationSheet, useOperationSheetStore } from '@/components/operation/operation-sheet'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'
import { subscribeSse } from '@/lib/notification'

export default function Home() {
  const { data, fetch, applyPatch } = useBalanceStore('data', 'fetch', 'applyPatch')
  const { open } = useOperationSheetStore()

  useEffect(() => {
    fetch()

    return subscribeSse(balanceEvents.root, {}, applyPatch)
  }, [])

  return (
    <div className="flex flex-col gap-4 p-6 overflow-y-auto">
      <div className="flex gap-2 items-center">
        <div className="text-3xl grow">Balances</div>
        <Button onClick={() => open()}>New operation</Button>
      </div>
      <div className="flex flex-col gap-2">
        {data
          // ?.sort((left, right) => left.account.name.localeCompare(right.account.name))
          ?.map((it) => (
            <div key={`${it.account.id}-${it.amount.currency}`} className="flex items-center gap-2">
              <AccountLabel account={it.account} />
              <AmountLabel amount={it.amount} />
              {it.progress && <LoaderCircleIcon />}
            </div>
          ))}
      </div>
      <OperationSheet />
    </div>
  )
}
