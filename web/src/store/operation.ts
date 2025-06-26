import { create } from "zustand";
import { createOpenStore, OpenStoreState } from "@/store/open";
import { observable } from "@/store/common";

interface OperationStoreState {
  operationSheet: OpenStoreState,
}

export const useOperationStore = create<OperationStoreState>()((set, get) => {
  const operationSheet = createOpenStore()

  return {
    operationSheet: observable(operationSheet, set, 'operationSheet')
  }
})