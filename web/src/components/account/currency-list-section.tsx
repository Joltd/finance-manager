'use client'
import { Chip } from '@/components/common/chip'
import { useCurrencyListStore } from '@/store/account'
import { useEffect } from 'react'
import { Currency } from '@/types/account'
import { askText } from '@/components/common/ask-text-dialog'
import { useRequest } from '@/hooks/use-request'
import { accountEvents, accountUrls } from '@/api/account'
import { subscribeSse } from '@/lib/notification'
import { PlusIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Section } from '@/components/common/layout/section'
import { ResponsiveButton } from '@/components/common/responsive-button'
import { DataPlaceholder } from '@/components/common/data-placeholder'
import { Flow } from '@/components/common/layout/flow'

export function CurrencyListSection() {
  const currencyList = useCurrencyListStore(
    'fetch',
    'data',
    'loading',
    'dataFetched',
    'data',
    'error',
  )
  const saveCurrency = useRequest(accountUrls.currency)
  const deleteCurrency = useRequest(accountUrls.currencyId, { method: 'DELETE' })

  useEffect(() => {
    currencyList.fetch()
    return subscribeSse(accountEvents.currency, {}, () => currencyList.fetch())
  }, [])

  const handleNew = async (crypto: boolean) => {
    const name = await askText('Name')
    await saveCurrency.submit({ name, crypto })
  }

  const handleEdit = async (it: Currency) => {
    const name = await askText('Name', it.name)
    await saveCurrency.submit({ ...it, name })
  }

  const handleDelete = async (it: Currency) => {
    await deleteCurrency.submit({}, { id: it.id })
  }

  return (
    <Section
      text="Currencies"
      actions={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ResponsiveButton size="sm" label="Add account" icon={<PlusIcon />} />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleNew(false)}>Fiat</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNew(true)}>Crypto</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    >
      <Flow>
        <DataPlaceholder {...currencyList}>
          {currencyList.data?.map((it) => (
            <Chip
              key={it.id}
              text={it.name}
              onClick={() => handleEdit(it)}
              onDismiss={() => handleDelete(it)}
            />
          ))}
        </DataPlaceholder>
      </Flow>
    </Section>
  )
}
