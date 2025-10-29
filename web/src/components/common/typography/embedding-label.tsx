import { Shorten } from '@/components/common/typography/shorten'
import { Button } from '@/components/ui/button'
import { CopyIcon } from 'lucide-react'
import { useRequest } from '@/hooks/use-request'
import { embeddingUrls } from '@/api/embedding'
import { toast } from 'sonner'
import { Embedding } from '@/types/common/embedding'

export interface EmbeddingLabelProps {
  embedding?: Embedding
  hideCopy?: boolean
}

export function EmbeddingLabel({ embedding, hideCopy }: EmbeddingLabelProps) {
  const getVector = useRequest(embeddingUrls.vector, { method: 'GET' })

  const handleCopyVector = () => {
    if (!embedding?.id) {
      return
    }
    getVector
      .submit({}, { id: embedding?.id })
      .then((result) => navigator.clipboard.writeText(result.vector))
      .then(() => toast('Vector copied'))
  }

  return (
    <div className="flex items-center gap-2 truncate">
      {embedding?.input ? <Shorten text={embedding?.input} /> : <div>No input</div>}
      <div className="grow" />
      {!hideCopy && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCopyVector}
          className="size-6"
        >
          <CopyIcon />
        </Button>
      )}
    </div>
  )
}
