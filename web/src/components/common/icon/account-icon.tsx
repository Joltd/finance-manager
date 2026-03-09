import { Landmark, ShoppingCart, Wallet, LucideProps } from 'lucide-react'
import { AccountType } from '@/types/account'
import { cn } from '@/lib/utils'

const icons: Record<AccountType, React.FC<LucideProps>> = {
  ACCOUNT: Landmark,
  EXPENSE: ShoppingCart,
  INCOME: Wallet,
}

const colors: Record<AccountType, string> = {
  ACCOUNT: 'text-blue-500',
  EXPENSE: 'text-red-500',
  INCOME: 'text-emerald-500',
}

interface AccountIconProps extends LucideProps {
  type: AccountType
  colored?: boolean
}

export function AccountIcon({ type, colored, className, ...props }: AccountIconProps) {
  const Icon = icons[type]
  return <Icon className={cn(colored && colors[type], className)} {...props} />
}
