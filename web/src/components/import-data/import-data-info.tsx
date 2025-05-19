import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AmountLabel } from "@/components/common/amount-label";
import { Amount } from "@/types/amount";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ImportDataInfoProps {
  className?: string
}

export function ImportDataInfo({ className }: ImportDataInfoProps) {
  const balanceBefore: Amount = {
    value: 125365 * 10000,
    currency: 'USD'
  }
  const importBalance: Amount = {
    value: 12555 * 10000,
    currency: 'USD'
  }
  const balanceAfter: Amount = {
    value: balanceBefore.value + importBalance.value,
    currency: 'USD'
  }
  const actualBalance: Amount = {
    value: 137444 * 10000,
    currency: 'USD'
  }
  const diff: Amount = {
    value: balanceAfter.value - actualBalance.value,
    currency: 'USD'
  }
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <Card>
        <CardHeader>
          <CardTitle>
            Balance difference
          </CardTitle>
        </CardHeader>
        <CardContent className="flex grow items-end justify-end">
          <AmountLabel amount={diff} className="text-4xl" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col grow items-end justify-end">
          <AmountLabel amount={balanceBefore} />
          <AmountLabel amount={importBalance} />
          <AmountLabel amount={balanceAfter} className="text-2xl" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            Actual balance <Button variant="link" className="p-0 h-auto text-muted-foreground">Edit</Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex grow items-end justify-end">
          <AmountLabel amount={actualBalance} className="text-2xl" />
        </CardContent>
      </Card>
    </div>
  )
}