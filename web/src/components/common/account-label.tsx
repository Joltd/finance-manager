'use client'
import { Account, AccountReference } from '@/types/account'
import { AccountTypeIcon } from '@/components/common/account-type-icon'
import { useEffect, useRef, useState } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface AccountProps {
  account?: Account | AccountReference
  icon?: boolean
  className?: string
}

export function AccountLabel({ account, icon, className }: AccountProps) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [truncated, setTruncated] = useState(false)

  useEffect(() => {
    setTruncated((ref.current?.scrollWidth || 0) > (ref.current?.offsetWidth || 0))
  }, [account])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn('flex items-center gap-1', className)}>
          {icon && <AccountTypeIcon type={account?.type} />}
          <p ref={ref} className={cn('truncate', !account && 'text-muted-foreground')}>
            {account?.name || 'None'}
          </p>
        </span>
      </TooltipTrigger>
      {truncated && account && (
        <TooltipContent>
          <p className="max-w-80">{account.name}</p>
        </TooltipContent>
      )}
    </Tooltip>
  )
}
