import { create } from "zustand";
import { createFetchStore, FetchStoreState, observable } from "@/store/common";
import { accountUrls } from "@/api/account";
import { AccountBalance } from "@/types/account";
import { Reference } from "@/types/common";
import { createOpenStore, OpenStoreState } from "@/store/open";

interface AccountStoreState {
  accountList: FetchStoreState<AccountBalance[]>
  groupList: FetchStoreState<Reference[]>
  accountSheet: OpenStoreState
  newGroupDialog: OpenStoreState
}

export const useAccountStore = create<AccountStoreState>()((set, get) => {
  const accountList = createFetchStore<AccountBalance[]>(accountUrls.balance)
  const groupList = createFetchStore<Reference[]>(accountUrls.groupReference)
  const accountSheet = createOpenStore()
  const newGroupDialog = createOpenStore()

  return {
    accountList: observable(accountList, set, 'accountList'),
    groupList: observable(groupList, set, 'groupList'),
    accountSheet: observable(accountSheet, set, 'accountSheet'),
    newGroupDialog: observable(newGroupDialog, set, 'newGroupDialog'),
  }
})