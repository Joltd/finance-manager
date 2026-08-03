import React from 'react'
import { FeatureGuard } from '@/components/user/feature-guard'

export default function PricingItemLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <FeatureGuard flag="pricingFeature">{children}</FeatureGuard>
}
