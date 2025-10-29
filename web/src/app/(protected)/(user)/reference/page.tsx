import { AccountType } from '@/types/account'
import { AccountGroupListSection } from '@/components/account/account-group-list-section'
import { AccountListSection } from '@/components/account/account-list-section'
import { CurrencyListSection } from '@/components/account/currency-list-section'
import { Layout } from '@/components/common/layout/layout'

export default function Page() {
  return (
    <Layout scrollable>
      <AccountGroupListSection />
      <AccountListSection title="Expenses" accountType={AccountType.EXPENSE} />
      <AccountListSection title="Incomes" accountType={AccountType.INCOME} />
      <CurrencyListSection />
    </Layout>
  )
}
