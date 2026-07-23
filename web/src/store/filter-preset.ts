import { createFetchStore } from '@/store/common/fetch'
import { filterPresetUrls } from '@/api/filter-preset'
import { FilterPreset } from '@/types/filter-preset'

export const useFilterPresetListStore = createFetchStore<FilterPreset[], unknown, { presetKey: string }>(
  filterPresetUrls.root,
)
