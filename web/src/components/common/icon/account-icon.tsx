import { LucideProps, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { AccountType } from '@/types/account'
import { cn } from '@/lib/utils'
import React from 'react'

const icons: Record<AccountType, React.FC<LucideProps>> = {
  [AccountType.ACCOUNT]: Wallet,
  [AccountType.EXPENSE]: TrendingDown,
  [AccountType.INCOME]: TrendingUp,
}

const colors: Record<AccountType, string> = {
  [AccountType.ACCOUNT]: 'text-blue-500',
  [AccountType.EXPENSE]: 'text-red-500',
  [AccountType.INCOME]: 'text-emerald-500',
}

interface AccountIconProps extends LucideProps {
  type: AccountType
  colored?: boolean
}

export function AccountIcon({ type, colored, className, ...props }: AccountIconProps) {
  const Icon = icons[type]
  return <Icon className={cn(colored && colors[type], className)} {...props} />
}
