'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ArrowLeftIcon } from 'lucide-react'
import { toast } from 'sonner'

import { pricingOrderUrls } from '@/api/pricing-order'
import { Button } from '@/components/ui/button'
import { Layout } from '@/components/common/layout/layout'
import { Stack } from '@/components/common/layout/stack'
import { useRequest } from '@/hooks/use-request'
import { Amount } from '@/types/common/amount'
import { PricingItem } from '@/types/pricing-item'
import { PricingOrderDefaults } from '@/types/pricing-order'
import { ItemSearchStep } from './item-search-step'
import { ItemCreateStep } from './item-create-step'
import { PriceQuantityStep } from './price-quantity-step'
import { LocationStep, LocationValues } from './location-step'

type Step = 'search' | 'newItem' | 'priceQty' | 'details'

export default function PricingOrderNewPage() {
  const router = useRouter()
  const defaultsReq = useRequest<PricingOrderDefaults>(pricingOrderUrls.defaults, { method: 'GET' })
  const saveOrder = useRequest(pricingOrderUrls.root)

  const [step, setStep] = useState<Step>('search')
  const [entryKey, setEntryKey] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<PricingItem>()
  const [pending, setPending] = useState<{ price: Amount; quantity: number }>()
  const [currency, setCurrency] = useState<string>()
  const [location, setLocation] = useState<LocationValues>({
    date: new Date(),
    country: '',
    city: '',
    store: '',
    comment: '',
  })

  useEffect(() => {
    void defaultsReq.submit().then((defaults) => {
      setCurrency(defaults.currency)
      setLocation((prev) => ({
        ...prev,
        country: defaults.country,
        city: defaults.city,
        store: defaults.store,
        comment: defaults.comment ?? '',
      }))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const canSaveNow = Boolean(location.country && location.city && location.store)

  const doSave = async (price: Amount, quantity: number, values: LocationValues) => {
    if (!selectedItem) return
    try {
      await saveOrder.submit({
        body: {
          date: format(values.date, 'yyyy-MM-dd'),
          item: { id: selectedItem.id },
          price,
          quantity,
          country: values.country,
          city: values.city,
          store: values.store,
          comment: values.comment || undefined,
        },
      })
    } catch {
      // error toast already shown by useRequest; stay on the current step so the user can retry
      return
    }
    toast.success(`Saved: ${selectedItem.name}`)
    setLocation(values)
    setSelectedItem(undefined)
    setPending(undefined)
    setSearchQuery('')
    setEntryKey((prev) => prev + 1)
    setStep('search')
  }

  const handleSelect = (item: PricingItem) => {
    setSelectedItem(item)
    setStep('priceQty')
  }

  const handleNew = (query: string) => {
    setSearchQuery(query)
    setStep('newItem')
  }

  const handleItemCreated = (item: PricingItem) => {
    setSelectedItem(item)
    setStep('priceQty')
  }

  const handleNext = (price: Amount, quantity: number) => {
    setPending({ price, quantity })
    setStep('details')
  }

  const handleSaveNow = (price: Amount, quantity: number) => {
    void doSave(price, quantity, location)
  }

  const handleDetailsSave = (values: LocationValues) => {
    if (!pending) return
    void doSave(pending.price, pending.quantity, values)
  }

  return (
    <Layout scrollable className="max-w-md mx-auto w-full">
      {step === 'search' && (
        <Stack gap={4}>
          <Button type="button" variant="ghost" size="sm" className="self-start" onClick={() => router.push('/pricing-order')}>
            <ArrowLeftIcon />
            Back to list
          </Button>
          <ItemSearchStep onSelect={handleSelect} onNew={handleNew} />
        </Stack>
      )}

      {step === 'newItem' && (
        <ItemCreateStep initialName={searchQuery} onCreated={handleItemCreated} onBack={() => setStep('search')} />
      )}

      {step === 'priceQty' && selectedItem && (
        <PriceQuantityStep
          key={`${entryKey}-${selectedItem.id}`}
          item={selectedItem}
          defaultCurrency={currency}
          canSaveNow={canSaveNow}
          saving={saveOrder.loading}
          onNext={handleNext}
          onSaveNow={handleSaveNow}
          onBack={() => {
            setSelectedItem(undefined)
            setStep('search')
          }}
        />
      )}

      {step === 'details' && (
        <LocationStep
          key={entryKey}
          initial={location}
          saving={saveOrder.loading}
          onSave={handleDetailsSave}
          onBack={() => setStep('priceQty')}
        />
      )}
    </Layout>
  )
}
