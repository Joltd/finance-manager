import { CheckCircle2Icon, LucideProps, XCircleIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ValidIconProps extends Omit<LucideProps, 'ref'> {
  valid: boolean
}

export function ValidIcon({ valid, className, ...props }: ValidIconProps) {
  return valid ? (
    <CheckCircle2Icon className={cn('size-3.5 text-green-500 cursor-default', className)} {...props} />
  ) : (
    <XCircleIcon className={cn('size-3.5 text-destructive cursor-default', className)} {...props} />
  )
}
