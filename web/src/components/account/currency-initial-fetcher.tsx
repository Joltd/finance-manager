'use client'
import { useCurrencyListStore } from '@/store/account'
import { useEffect } from 'react'

export function CurrencyInitialFetcher() {
  const currencyList = useCurrencyListStore('dataFetched', 'fetch')

  useEffect(() => {
    if (!currencyList.dataFetched) {
      currencyList.fetch()
    }
  }, [])

  return null
}
