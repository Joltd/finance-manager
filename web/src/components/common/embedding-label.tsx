import { Embedding } from '@/types/common'
import { Shorten } from '@/components/common/shorten'
import { Button } from '@/components/ui/button'
import { CopyIcon } from 'lucide-react'
import { useRequest } from '@/hooks/use-request'
import { embeddingUrls } from '@/api/embedding'
import { toast } from 'sonner'

export interface EmbeddingLabelProps {
  embedding?: Embedding
}

export function EmbeddingLabel({ embedding }: EmbeddingLabelProps) {
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
    <div className="flex items-center gap-2">
      {embedding?.input ? <Shorten text={embedding?.input} /> : <div>No input</div>}
      <div className="grow" />
      <Button type="button" variant="ghost" size="sm" onClick={handleCopyVector}>
        <CopyIcon />
      </Button>
    </div>
  )
}
