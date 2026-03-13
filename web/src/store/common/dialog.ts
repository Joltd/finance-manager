import { create, StateCreator } from 'zustand'

export interface DialogState {
  open: boolean
}

export interface DialogActions {
  openDialog: () => void
  closeDialog: () => void
}

export type DialogSlice = DialogState & DialogActions

export function createDialogSlice(): StateCreator<DialogSlice> {
  return (set) => ({
    open: false,
    openDialog: () => set({ open: true }),
    closeDialog: () => set({ open: false }),
  })
}

export function createDialogStore() {
  return create<DialogSlice>(createDialogSlice())
}