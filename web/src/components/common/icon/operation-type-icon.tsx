import { OperationType } from '@/types/operation'
import { ArrowDown, ArrowRight, ArrowUp, Shuffle } from 'lucide-react'

export interface OperationTypeIconProps {
  type: OperationType
}

export function OperationTypeIcon({ type }: OperationTypeIconProps) {
  switch (type) {
    case OperationType.EXCHANGE:
      return <Shuffle size={14} className="htext-muted-foreground shrink-0" />
    case OperationType.TRANSFER:
      return <ArrowRight size={14} className="text-blue-500 shrink-0" />
    case OperationType.EXPENSE:
      return <ArrowUp size={14} className="text-red-500 shrink-0" />
    case OperationType.INCOME:
      return <ArrowDown size={14} className="text-green-500 shrink-0" />
  }
}
