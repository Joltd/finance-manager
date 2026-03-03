import { createFetchStore } from '@/store/common/fetch'
import { accountUrls } from '@/api/account'
import { AccountReference } from '@/types/account'

export const useAccountReferenceStore = createFetchStore<AccountReference[], unknown, { mask?: string }>(
  accountUrls.reference,
)