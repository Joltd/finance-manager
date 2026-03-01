import { createFetchStore } from '@/store/common/fetch'
import { User } from '@/types/user'

export const useUserStore = createFetchStore<User>('/api/v1/user')