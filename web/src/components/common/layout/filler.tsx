import { cn } from '@/lib/utils'

export function Filler({ className }: { className?: string }) {
  return <div className={cn('grow', className)} />
}