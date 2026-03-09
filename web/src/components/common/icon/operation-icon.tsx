import { TrendingDown, TrendingUp, Repeat2, MoveRight, LucideProps } from 'lucide-react'
import { OperationType } from '@/types/operation'
import { cn } from '@/lib/utils'

const icons: Record<OperationType, React.FC<LucideProps>> = {
  EXPENSE: TrendingDown,
  INCOME: TrendingUp,
  EXCHANGE: Repeat2,
  TRANSFER: MoveRight,
}

const colors: Record<OperationType, string> = {
  EXPENSE: 'text-red-500',
  INCOME: 'text-emerald-500',
  EXCHANGE: 'text-amber-500',
  TRANSFER: 'text-sky-500',
}

interface OperationIconProps extends LucideProps {
  type: OperationType
  colored?: boolean
}

export function OperationIcon({ type, colored, className, ...props }: OperationIconProps) {
  const Icon = icons[type]
  return <Icon className={cn(colored && colors[type], className)} {...props} />
}
