import { AccountType } from '@/types/account'
import { Squircle } from 'lucide-react'

export interface AccountTypeIconProps {
  type?: AccountType
}

export function AccountTypeIcon({ type }: AccountTypeIconProps) {
  switch (type) {
    case AccountType.EXPENSE:
      return <Squircle size={14} className="text-red-500 shrink-0" />
    case AccountType.INCOME:
      return <Squircle size={14} className="text-green-500 shrink-0" />
    default:
      return <Squircle size={14} className="text-muted-foreground shrink-0" />
  }
}
