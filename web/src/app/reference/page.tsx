'use client'
import { AccountType } from '@/types/account'
import { AccountGroupListSection } from '@/components/account/account-group-list-section'
import { AccountListSection } from '@/components/account/account-list-section'
import { CurrencyListSection } from '@/components/account/currency-list-section'

export default function Page() {
  return (
    <div className="flex flex-col gap-12 p-6 overflow-y-auto">
      <AccountGroupListSection />
      <AccountListSection title="Expenses" accountType={AccountType.EXPENSE} />
      <AccountListSection title="Incomes" accountType={AccountType.INCOME} />
      <CurrencyListSection />
    </div>
  )
}
