'use client'
import { TextLabel } from '@/components/common/text-label'
import { DataSection } from '@/components/common/data-section'
import { Chip } from '@/components/common/chip'
import { useCurrencyListStore } from '@/store/account'
import { useEffect } from 'react'
import { Currency } from '@/types/account'
import { askText } from '@/components/common/ask-text-dialog'
import { useRequest } from '@/hooks/use-request'
import { accountEvents, accountUrls } from '@/api/account'
import { subscribeSse } from '@/lib/notification'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <TextLabel variant="title" className="grow">
          Currencies
        </TextLabel>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <PlusIcon />
              Add currency
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleNew(false)}>Fiat</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNew(true)}>Crypto</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <DataSection store={currencyList}>
        <div className="flex flex-wrap gap-2">
          {currencyList.data?.map((it) => (
            <Chip
              key={it.id}
              text={it.name}
              onClick={() => handleEdit(it)}
              onDismiss={() => handleDelete(it)}
            />
          ))}
        </div>
      </DataSection>
    </div>
  )
}
