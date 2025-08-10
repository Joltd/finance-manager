import { accountUrls } from '@/api/account'
import {
  Account,
  AccountBalanceGroup,
  AccountGroup,
  AccountReference,
  Currency,
} from '@/types/account'
import { Reference } from '@/types/common'
import { createFetchStore, FetchStoreState } from '@/store/common/fetch'
import { useStoreSelect } from '@/hooks/use-store-select'

const accountListStore = createFetchStore<Account[]>(accountUrls.root)

export const useAccountListStore = <K extends keyof FetchStoreState<Account[]>>(...fields: K[]) =>
  useStoreSelect<FetchStoreState<Account[]>, K>(accountListStore, ...fields)

const accountGroupListStore = createFetchStore<AccountGroup[]>(accountUrls.group)

export const useAccountGroupListStore = <K extends keyof FetchStoreState<AccountGroup[]>>(
  ...fields: K[]
) => useStoreSelect<FetchStoreState<AccountGroup[]>, K>(accountGroupListStore, ...fields)

const currencyListStore = createFetchStore<Currency[]>(accountUrls.currency)

export const useCurrencyListStore = <K extends keyof FetchStoreState<Currency[]>>(...fields: K[]) =>
  useStoreSelect<FetchStoreState<Currency[]>, K>(currencyListStore, ...fields)

//

const accountReferenceStore = createFetchStore<AccountReference[]>(accountUrls.reference)

export const useAccountReferenceStore = <K extends keyof FetchStoreState<AccountReference[]>>(
  ...fields: K[]
) => useStoreSelect<FetchStoreState<AccountReference[]>, K>(accountReferenceStore, ...fields)

//

const accountGroupReferenceStore = createFetchStore<Reference[]>(accountUrls.groupReference)

export const useAccountGroupReferenceStore = <K extends keyof FetchStoreState<Reference[]>>(
  ...fields: K[]
) => useStoreSelect<FetchStoreState<Reference[]>, K>(accountGroupReferenceStore, ...fields)

//

const accountBalanceStore = createFetchStore<AccountBalanceGroup[]>(accountUrls.balance)

export const useAccountBalanceStore = <K extends keyof FetchStoreState<AccountBalanceGroup[]>>(
  ...fields: K[]
) => useStoreSelect<FetchStoreState<AccountBalanceGroup[]>, K>(accountBalanceStore, ...fields)

//

const accountStore = createFetchStore<Account>(accountUrls.id)

export const useAccountStore = <K extends keyof FetchStoreState<Account>>(...fields: K[]) =>
  useStoreSelect<FetchStoreState<Account>, K>(accountStore, ...fields)
