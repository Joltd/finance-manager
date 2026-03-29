import { createFetchStore } from '@/store/common/fetch'
import { accountUrls, currencyUrls } from '@/api/account'
import {
  Account,
  AccountBalance,
  AccountReference,
  AccountType,
  Currency,
} from '@/types/account'

export const useAccountListStore = createFetchStore<Account[], unknown, { type?: AccountType }>(
  accountUrls.root,
)

export const useAccountStore = createFetchStore<Account, unknown, unknown, { id: string }>(
  accountUrls.id,
)

export const useAccountReferenceStore = createFetchStore<
  AccountReference[],
  unknown,
  { mask?: string; type?: AccountType }
>(accountUrls.reference)

export const useAccountBalanceStore = createFetchStore<AccountBalance[], unknown>(
  accountUrls.balance,
)

export const useCurrencyListStore = createFetchStore<Currency[]>(currencyUrls.root)
