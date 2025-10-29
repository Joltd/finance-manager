import { AccountType } from '@/types/account'
import { SquircleIcon } from 'lucide-react'

export interface AccountTypeIconProps {
  type?: AccountType
}

export function AccountTypeIcon({ type }: AccountTypeIconProps) {
  switch (type) {
    case AccountType.EXPENSE:
      return <SquircleIcon size={14} className="text-red-500 shrink-0" />
    case AccountType.INCOME:
      return <SquircleIcon size={14} className="text-green-500 shrink-0" />
    default:
      return <SquircleIcon size={14} className="text-muted-foreground shrink-0" />
  }
}
