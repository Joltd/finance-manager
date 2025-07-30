import { accountUrls } from '@/api/account'
import { Account } from '@/types/account'
import { Reference } from '@/types/common'
import { createFetchStore, FetchStoreState } from '@/store/common/fetch'
import { useStoreSelect } from '@/hooks/use-store-select'

const accountListStore = createFetchStore<Account[]>(accountUrls.reference)

export const useAccountListStore = <K extends keyof FetchStoreState<Account[]>>(...fields: K[]) =>
  useStoreSelect<FetchStoreState<Account[]>, K>(accountListStore, ...fields)

//

const accountGroupListStore = createFetchStore<Reference[]>(accountUrls.groupReference)

export const useAccountGroupListStore = <K extends keyof FetchStoreState<Reference[]>>(
  ...fields: K[]
) => useStoreSelect<FetchStoreState<Reference[]>, K>(accountGroupListStore, ...fields)
