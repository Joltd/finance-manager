import { Account } from '@/types/account'
import { Spinner } from '@/components/ui/spinner'

export interface ImportDataHeaderProps {
  account: Account
  progress?: boolean
}

export function ImportDataHeader({ account, progress }: ImportDataHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-3xl">{account.name}</div>
      {progress && <Spinner />}
    </div>
  )
}
