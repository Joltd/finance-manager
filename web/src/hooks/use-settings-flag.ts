import { useUserStore } from '@/store/user'
import type { Settings } from '@/types/user'

export function useSettingsFlag(flag: keyof Settings): boolean {
  return useUserStore((state) => Boolean(state.data?.settings?.[flag]))
}
