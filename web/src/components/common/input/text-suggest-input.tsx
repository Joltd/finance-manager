'use client'

import * as React from 'react'
import { XIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { ReferenceInput, ReferenceInputSingleProps } from '@/components/common/input/reference-input'
import { useRequest } from '@/hooks/use-request'

type OmitFetched<T> = Omit<T, 'loading' | 'data' | 'onSearch' | 'getLabel' | 'getId' | 'onNew' | 'newLabel'>

export type TextSuggestInputProps = OmitFetched<ReferenceInputSingleProps<string>> & {
  url: string
  // shows a clear button that resets the value to an empty string
  clearable?: boolean
}

export function TextSuggestInput({ url, clearable = false, ...props }: TextSuggestInputProps) {
  const listReq = useRequest<string[], unknown, { mask?: string }>(url, { method: 'GET' })

  const handleSearch = (val: string) => {
    void listReq.submit({ queryParams: { mask: val || undefined } })
  }

  // the trigger has `has-[>svg]:px-3` because of its chevron, so the variant is overridden too
  const triggerClassName = cn(clearable && props.value && 'pr-8 has-[>svg]:pr-8', props.className)

  const input = (
    <ReferenceInput<string>
      loading={listReq.loading}
      data={listReq.data}
      onSearch={handleSearch}
      getLabel={(s) => s}
      getId={(s) => s}
      onNew={async (name) => name}
      newLabel="Use custom value"
      {...props}
      value={clearable ? props.value || undefined : props.value}
      className={triggerClassName}
    />
  )

  if (!clearable) {
    return input
  }

  return (
    <div className="relative w-full">
      {input}
      {props.value && (
        <button
          type="button"
          aria-label="Clear"
          disabled={props.disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:pointer-events-none"
          onClick={() => props.onChange?.('')}
        >
          <XIcon className="size-4" />
        </button>
      )}
    </div>
  )
}
