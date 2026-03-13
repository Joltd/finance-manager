import { createFetchStore } from '@/store/common/fetch'
import { accountUrls, currencyUrls, groupUrls } from '@/api/account'
import {
  Account,
  AccountBalanceGroup,
  AccountGroup,
  AccountReference,
  AccountType,
  Currency,
} from '@/types/account'
import { Reference } from '@/types/common/reference'

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

export const useAccountBalanceStore = createFetchStore<AccountBalanceGroup[], unknown>(
  accountUrls.balance,
)

export const useAccountGroupListStore = createFetchStore<AccountGroup[]>(groupUrls.root)

export const useAccountGroupReferenceStore = createFetchStore<
  Reference[],
  unknown,
  { mask?: string }
>(groupUrls.reference)

export const useCurrencyListStore = createFetchStore<Currency[]>(currencyUrls.root)
