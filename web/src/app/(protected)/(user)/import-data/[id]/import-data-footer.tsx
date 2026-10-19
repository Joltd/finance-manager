import { ImportDataTotal } from '@/types/import-data'
import { useImportDataActions } from '@/app/(protected)/(user)/import-data/[id]/import-data-actions'
import { Stack } from '@/components/common/layout/stack'
import { Typography } from '@/components/common/typography/typography'
import { add } from '@/types/common/amount'
import { Button } from '@/components/ui/button'
import { ImportDataAmounts } from '@/app/(protected)/(user)/import-data/[id]/import-data-amounts'

export function ImportDataFooter({ id, totals }: { id: string; totals: ImportDataTotal[] }) {
  const { loading, commit } = useImportDataActions()

  return (
    <Stack gap={3} className="shrink-0">
      <ImportDataAmounts
        label={<Typography variant="large">Total</Typography>}
        amounts={totals.map((total) => add(total.balance, total.parsed))}
      />
      <Stack orientation="horizontal" justify="end">
        <Button type="button" disabled={loading} onClick={() => void commit(id)}>
          Commit
        </Button>
      </Stack>
    </Stack>
  )
}