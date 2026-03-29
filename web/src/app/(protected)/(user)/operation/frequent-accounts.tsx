import { AccountReference, AccountType } from '@/types/account'
import { AccountUsage } from '@/store/operation-preset'

interface FrequentAccountsProps {
  usages: AccountUsage[]
  accountType?: AccountType
  onSelect: (account: AccountReference) => void
}

export function FrequentAccounts({ usages, accountType, onSelect }: FrequentAccountsProps) {
  const top = usages
    .filter((u) => !accountType || u.account.type === accountType)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  if (top.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1">
      {top.map((u) => (
        <button
          key={u.account.id}
          type="button"
          onClick={() => onSelect(u.account)}
          className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {u.account.name}
        </button>
      ))}
    </div>
  )
}
