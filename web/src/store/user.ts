import { createFetchStore } from '@/store/common/fetch'
import { AdminUser, User } from '@/types/user'
import { userUrls } from '@/api/user'

export const useUserStore = createFetchStore<User>(userUrls.root)

export const useAdminUserListStore = createFetchStore<AdminUser[]>(userUrls.adminRoot)

export const useAdminUserStore = createFetchStore<AdminUser, unknown, unknown, { id: string }>(
  userUrls.adminId,
)
