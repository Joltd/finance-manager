'use client'
import { useSettingStore } from '@/store/setting'
import { useEffect } from 'react'

export function SettingInitialFetcher() {
  const setting = useSettingStore('dataFetched', 'fetch')

  useEffect(() => {
    if (!setting.dataFetched) {
      setting.fetch()
    }
  }, [])

  return null
}
