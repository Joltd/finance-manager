import { OperationType } from "@/types/operation";
import { ArrowDown, ArrowRight, ArrowUp, Shuffle } from "lucide-react";

export interface OperationTypeIconProps {
  type: OperationType
}

export function OperationTypeIcon({ type }: OperationTypeIconProps) {
  switch (type) {
    case OperationType.EXCHANGE:
      return <Shuffle className="text-muted-foreground shrink-0" />
    case OperationType.TRANSFER:
      return <ArrowRight className="text-blue-500 shrink-0" />
    case OperationType.EXPENSE:
      return <ArrowUp className="text-red-500 shrink-0" />
    case OperationType.INCOME:
      return <ArrowDown className="text-green-500 shrink-0" />
  }
}