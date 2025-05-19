import { Button } from "@/components/ui/button";
import { Check, DatabaseZap, Eye, EyeOff, Triangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CombinedIcon } from "@/components/ui/combined-icon";

export interface ImportDataToolbarProps {
  className?: string
}

export function ImportDataToolbar({ className }: ImportDataToolbarProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      <Button variant="secondary">
        <Eye />
      </Button>
      <Button variant="secondary">
        <EyeOff />
      </Button>

      <div className="grow"/>
      <Button variant="link" className="text-yellow-500">Prepare 15 records</Button>
      <Button variant="link" className="text-green-600">Commit 10 records</Button>
    </div>
  )
}