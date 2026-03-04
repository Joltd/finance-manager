import { createFetchStore } from '@/store/common/fetch'
import { accountUrls, currencyUrls, groupUrls } from '@/api/account'
import { Account, AccountGroup, AccountReference, AccountType, Currency } from '@/types/account'
import { Reference } from '@/types/common/reference'

export const useAccountListStore = createFetchStore<Account[], unknown, { type?: AccountType }>(
  accountUrls.root,
)

export const useAccountReferenceStore = createFetchStore<
  AccountReference[],
  unknown,
  { mask?: string }
>(accountUrls.reference)

export const useAccountGroupListStore = createFetchStore<AccountGroup[]>(groupUrls.root)

export const useAccountGroupReferenceStore = createFetchStore<
  Reference[],
  unknown,
  { mask?: string }
>(groupUrls.reference)

export const useCurrencyListStore = createFetchStore<Currency[]>(currencyUrls.root)
