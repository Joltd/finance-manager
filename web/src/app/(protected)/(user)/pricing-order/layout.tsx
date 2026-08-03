import React from 'react'
import { FeatureGuard } from '@/components/user/feature-guard'

export default function PricingOrderLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <FeatureGuard flag="pricingFeature">{children}</FeatureGuard>
}
