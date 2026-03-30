import { createFetchStore } from '@/store/common/fetch'
import { tagUrls } from '@/api/tag'
import { Tag } from '@/types/tag'

export const useTagListStore = createFetchStore<Tag[], unknown, { mask?: string }>(tagUrls.root)

export const useTagStore = createFetchStore<Tag, unknown, unknown, { id: string }>(tagUrls.id)
