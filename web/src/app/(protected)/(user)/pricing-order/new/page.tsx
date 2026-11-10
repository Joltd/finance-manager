'use client'

import { useRouter } from 'next/navigation'

import { Layout } from '@/components/common/layout/layout'
import { QuickAdd } from './quick-add'

export default function PricingOrderNewPage() {
  const router = useRouter()

  return (
    <Layout scrollable className="max-w-md mx-auto w-full">
      <QuickAdd exitLabel="Back to list" onExit={() => router.push('/pricing-order')} />
    </Layout>
  )
}
