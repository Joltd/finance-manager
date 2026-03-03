import { createFetchStore } from '@/store/common/fetch'
import { accountUrls, currencyUrls, groupUrls } from '@/api/account'
import { AccountReference, Currency } from '@/types/account'
import { Reference } from '@/types/common/reference'

export const useAccountReferenceStore = createFetchStore<
  AccountReference[],
  unknown,
  { mask?: string }
>(accountUrls.reference)

export const useAccountGroupReferenceStore = createFetchStore<
  Reference[],
  unknown,
  { mask?: string }
>(groupUrls.reference)

export const useCurrencyStore = createFetchStore<Currency[]>(currencyUrls.root)

export const useCurrencyReferenceStore = createFetchStore<Reference[], unknown, { mask?: string }>(
  currencyUrls.reference,
)
