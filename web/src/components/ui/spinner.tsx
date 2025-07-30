import { LoaderCircleIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SpinnerProps {
  className?: string
}

export function Spinner({ className }: SpinnerProps) {
  return <LoaderCircleIcon className={cn('animate-spin', className)} />
}
