import { createFetchStore, FetchStoreState } from '@/store/common/fetch'
import { userUrls } from '@/api/user'
import { AdminUser, User } from '@/types/user'
import { useStoreSelect } from '@/hooks/use-store-select'

const userStore = createFetchStore<User>(userUrls.user)

export const useUserStore = <K extends keyof FetchStoreState<User>>(...fields: K[]) =>
  useStoreSelect<FetchStoreState<User>, K>(userStore, ...fields)

const adminUserListStore = createFetchStore<AdminUser[]>(userUrls.adminUser)

export const useAdminUserListStore = <K extends keyof FetchStoreState<AdminUser[]>>(
  ...fields: K[]
) => useStoreSelect<FetchStoreState<AdminUser[]>, K>(adminUserListStore, ...fields)

const adminUserStore = createFetchStore<AdminUser>(userUrls.adminUserId)

export const useAdminUserStore = <K extends keyof FetchStoreState<AdminUser>>(...fields: K[]) =>
  useStoreSelect<FetchStoreState<AdminUser>, K>(adminUserStore, ...fields)
