'use client'

import type * as React from 'react'
import { useRef, useState } from 'react'

import { useDebounce } from '@/hooks/use-debounce'

export const COMBOBOX_CREATE_KEY = '__create__'

type ComboboxGroupBase<T> = {
  /** Unique within the combobox, also a prefix of the option keys */
  key: string
  label?: React.ReactNode
  /** Extra content on the right side of an item (score, rating, etc.) */
  renderMeta?: (item: T) => React.ReactNode
}

/**
 * A section of the option list. Either static `items`, filtered locally by the query,
 * or a remote `search`, whose responses for an outdated query are dropped.
 */
export type ComboboxGroup<T> = ComboboxGroupBase<T> &
  (
    | { items: T[]; search?: never }
    | { search: (query: string) => Promise<T[]>; items?: never }
  )

export interface ComboboxOption<T> {
  key: string
  item: T
}

export interface ComboboxVisibleGroup<T> {
  group: ComboboxGroup<T>
  loading: boolean
  options: ComboboxOption<T>[]
}

export interface UseComboboxOptions<T> {
  getId: (item: T) => string
  getLabel: (item: T) => string
  /** Rendered in order; an item present in several groups is shown only in the first one */
  groups: ComboboxGroup<T>[]
  onSelect: (item: T) => void
  /** When set, the typed query can be turned into a new item */
  onCreate?: (name: string) => Promise<T>
}

/**
 * Selection and keyboard logic of a combobox built from groups of options
 * plus a "create from query" option.
 *
 * Keyboard: arrows/Enter are handled by cmdk, on top of that
 * Tab accepts the active option, Ctrl/Cmd+Enter creates an item from the query.
 * The active option is reset to the first one whenever the visible option list changes,
 * so Enter always acts on what is on the screen.
 */
export function useCombobox<T>({
  getId,
  getLabel,
  groups,
  onSelect,
  onCreate,
}: UseComboboxOptions<T>) {
  const [open, setOpenState] = useState(false)
  const [query, setQueryState] = useState('')
  const [results, setResults] = useState<Record<string, { query: string; items: T[] }>>({})
  const [creating, setCreating] = useState(false)
  const [active, setActive] = useState('')
  const [activeSignature, setActiveSignature] = useState<string | null>(null)
  const latestQueryRef = useRef('')
  const creatingRef = useRef(false)

  const runSearch = (q: string) => {
    if (q !== latestQueryRef.current) return
    for (const group of groups) {
      if (!group.search) continue
      const accept = (items: T[]) => {
        if (q !== latestQueryRef.current) return
        setResults((prev) => ({ ...prev, [group.key]: { query: q, items } }))
      }
      group.search(q).then(accept, () => accept([]))
    }
  }

  const debouncedSearch = useDebounce((q: string) => runSearch(q), 300)

  const trimmed = query.trim()
  const normalized = trimmed.toLocaleLowerCase()

  const seen = new Set<string>()
  const visibleGroups: ComboboxVisibleGroup<T>[] = groups.map((group) => {
    let loading = false
    let items: T[]
    if (group.search) {
      const result = results[group.key]
      loading = result?.query !== trimmed
      items = result && !loading ? result.items : []
    } else {
      items = normalized
        ? group.items.filter((item) => getLabel(item).toLocaleLowerCase().includes(normalized))
        : group.items
    }
    const options = items
      .filter((item) => {
        const id = getId(item)
        if (seen.has(id)) return false
        seen.add(id)
        return true
      })
      .map((item) => ({ key: `${group.key}:${getId(item)}`, item }))
    return { group, loading, options }
  })

  const allOptions = visibleGroups.flatMap((group) => group.options)
  const loading = visibleGroups.some((group) => group.loading)

  const exactMatch = allOptions.some(
    (option) => getLabel(option.item).trim().toLocaleLowerCase() === normalized,
  )
  const canCreate = !!onCreate && trimmed !== '' && !exactMatch

  // while results are loading, Enter must not create an item that may already exist
  const createDisabled = loading || creating

  const keys = [
    ...allOptions.map((option) => option.key),
    ...(canCreate && !loading ? [COMBOBOX_CREATE_KEY] : []),
  ]
  const signature = open ? `${loading}:${keys.join('|')}` : null
  if (signature !== activeSignature) {
    setActiveSignature(signature)
    setActive(keys[0] ?? '')
  }

  const setOpen = (next: boolean, initialQuery = '') => {
    if (next) {
      const q = initialQuery.trim()
      latestQueryRef.current = q
      setQueryState(initialQuery)
      setResults({})
      runSearch(q)
    }
    setOpenState(next)
  }

  const setQuery = (value: string) => {
    latestQueryRef.current = value.trim()
    setQueryState(value)
    debouncedSearch(value.trim())
  }

  const create = async () => {
    if (!onCreate || !canCreate || creatingRef.current) return
    creatingRef.current = true
    setCreating(true)
    try {
      const item = await onCreate(trimmed)
      onSelect(item)
      setOpenState(false)
    } catch {
      // the error is reported by the caller, the popover stays open with the typed query
    } finally {
      creatingRef.current = false
      setCreating(false)
    }
  }

  const select = (key: string) => {
    if (creatingRef.current) return
    if (key === COMBOBOX_CREATE_KEY) {
      if (!loading) void create()
      return
    }
    const option = allOptions.find((it) => it.key === key)
    if (!option) return
    onSelect(option.item)
    setOpenState(false)
  }

  /** Attach to the cmdk root; runs before cmdk's own handling */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing) return
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      void create()
      return
    }
    if (e.key === 'Enter' && creatingRef.current) {
      e.preventDefault()
      return
    }
    if (e.key === 'Tab') {
      // the popover is portaled, so native Tab would move focus to the end of the document;
      // close instead and let the focus return to the trigger
      e.preventDefault()
      if (!e.shiftKey && active) {
        select(active)
      } else {
        setOpenState(false)
      }
    }
  }

  return {
    open,
    setOpen,
    query,
    setQuery,
    loading,
    creating,
    groups: visibleGroups,
    canCreate,
    createDisabled,
    active,
    setActive,
    select,
    handleKeyDown,
  }
}
