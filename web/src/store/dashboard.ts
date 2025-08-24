import { createFetchStore, FetchStoreState } from '@/store/common/fetch'
import { Balance } from '@/types/balance'
import { useStoreSelect } from '@/hooks/use-store-select'
import { dashboardUrls } from '@/api/dashboard'
import { Dashboard } from '@/types/dashboard'

const dashboardStore = createFetchStore<Dashboard>(dashboardUrls.root)

export const useDashboardStore = <K extends keyof FetchStoreState<Balance[]>>(...fields: K[]) =>
  useStoreSelect<FetchStoreState<Dashboard>, K>(dashboardStore, ...fields)
