import { createFetchStore } from '@/store/common/fetch'
import { User } from '@/types/user'
import { userUrls } from '@/api/user'

export const useUserStore = createFetchStore<User>(userUrls.root)
