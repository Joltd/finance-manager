'use client'
import { useCurrencyListStore } from '@/store/account'
import { useEffect } from 'react'

export function CurrencyInitialFetcher() {
  const currencyList = useCurrencyListStore('dataFetched', 'fetch') // todo support loading, error

  useEffect(() => {
    if (!currencyList.dataFetched) {
      currencyList.fetch()
    }
  }, [])

  return null
}
