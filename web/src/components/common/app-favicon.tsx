'use client'

import { useEffect } from 'react'
import { useUserStore } from '@/store/user'
import { buildCurrencyIconSvg } from '@/lib/currency-icon'

export function AppFavicon() {
  const currency = useUserStore((s) => s.data?.settings.operationDefaultCurrency)

  useEffect(() => {
    const dataUrl = buildCurrencyIconSvg(currency)

    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = dataUrl
  }, [currency])

  return null
}
