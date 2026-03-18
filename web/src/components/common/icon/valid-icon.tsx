import { CheckCircle2Icon, CircleAlertIcon, LucideProps, XCircleIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ValidIconProps extends Omit<LucideProps, 'ref'> {
  valid: boolean | null
}

export function ValidIcon({ valid, className, ...props }: ValidIconProps) {
  if (valid === null) {
    return (
      <CircleAlertIcon
        className={cn('size-3.5 text-amber-500 cursor-default', className)}
        {...props}
      />
    )
  }
  return valid ? (
    <CheckCircle2Icon className={cn('size-3.5 text-green-500 cursor-default', className)} {...props} />
  ) : (
    <XCircleIcon className={cn('size-3.5 text-destructive cursor-default', className)} {...props} />
  )
}
