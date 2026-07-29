'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface RawDataDisclosureProps {
  raw?: string | null
}

export function RawDataDisclosure({ raw }: RawDataDisclosureProps) {
  const [expanded, setExpanded] = useState(false)

  if (!raw) return null

  return (
    <div>
      <button
        type="button"
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
        Raw source data
      </button>
      {expanded && (
        <pre className="mt-2 rounded-md bg-muted px-3 py-2 font-mono text-xs text-muted-foreground whitespace-pre-wrap break-all">
          {raw}
        </pre>
      )}
    </div>
  )
}
