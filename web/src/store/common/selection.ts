import { createStore } from 'zustand'

export interface SelectionStoreState<T> {
  selected: Set<string>
  items: Record<string, T>
  has: (item?: T) => boolean
  select: (item: T) => void
  clear: () => void
}

export const createSelectionStore = <T>(getId: (item: T) => string) =>
  createStore<SelectionStoreState<T>>((set, get) => {
    const has = (item?: T) => !!item && get().selected.has(getId(item))

    const select = (item: T) => {
      const id = getId(item)
      const selected = new Set(get().selected)
      const items = { ...get().items }
      if (selected.has(id)) {
        selected.delete(id)
        delete items[id]
      } else {
        selected.add(id)
        items[id] = item
      }
      set({ selected, items })
    }

    const clear = () => set({ selected: new Set(), items: {} })

    return {
      selected: new Set(),
      items: {},
      has,
      select,
      clear,
    }
  })
