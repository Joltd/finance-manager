import { createFetchStore, FetchStoreState } from '@/store/common/fetch'
import { useStoreSelect } from '@/hooks/use-store-select'
import { Setting } from '@/types/setting'
import { settingUrls } from '@/api/setting'

const settingStore = createFetchStore<Setting>(settingUrls.root)

export const useSettingStore = <K extends keyof FetchStoreState<Setting>>(...fields: K[]) =>
  useStoreSelect<FetchStoreState<Setting>, K>(settingStore, ...fields)
