import { Account, AccountType } from '@/types/account'
import { useEffect, useState } from 'react'
import { useAccountListStore } from '@/store/account'
import { useDebounce } from '@/hooks/use-debounce'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import { CheckIcon, Loader2Icon, XIcon } from 'lucide-react'
import { useRequest } from '@/hooks/use-request'
import { accountUrls } from '@/api/account'
import { askText } from '@/components/common/ask-text-dialog'
import { ErrorLabel } from '@/components/common/error-label'
import { AccountLabel } from '@/components/common/account-label'

export interface AccountInputProps {
  type: AccountType
  placeholder?: string
  value?: Account
  onChange?: (value?: Account) => void
}

export function AccountInput({
  type = AccountType.ACCOUNT,
  placeholder,
  value,
  onChange,
}: AccountInputProps) {
  const accountList = useAccountListStore(
    'data',
    'dataFetched',
    'loading',
    'error',
    'updateQueryParams',
    'fetch',
  )
  const newAccount = useRequest(accountUrls.root)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const actualQuery = useDebounce(query)

  useEffect(() => {
    if (open) {
      accountList.updateQueryParams({ type, mask: actualQuery ? actualQuery : undefined })
      accountList.fetch()
    } else {
      setQuery('')
    }
  }, [open, actualQuery])

  const addNewAccount = async () => {
    const name = await askText('Name')
    const created = await newAccount.submit({ name, type })
    await accountList.fetch()
    onChange?.(created)
  }

  const handleSelect = (account: Account) => {
    onChange?.(account)
    setOpen(false)
  }

  const handleNew = () => {
    setOpen(false)
    addNewAccount().then()
  }

  const handleClear = () => {
    onChange?.(undefined)
  }

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start px-3 py-1">
          {newAccount.loading && <Loader2Icon className="animate-spin size-4" />}
          {newAccount.error && <ErrorLabel error={newAccount.error} />}
          {value ? <AccountLabel account={value} /> : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <Command shouldFilter={false} className="gap-4">
          <div className="relative">
            <CommandInput placeholder="Search" value={query} onValueChange={setQuery} />
            <div className="absolute top-0 bottom-0 right-0 flex items-center">
              {accountList.loading && <Loader2Icon className="animate-spin size-4" />}
              {!!query && (
                <Button size="sm" onClick={() => setQuery('')}>
                  <XIcon />
                </Button>
              )}
            </div>
          </div>
          <CommandList>
            <ErrorLabel error={accountList.error} />
            {accountList.dataFetched && <CommandEmpty>Not found</CommandEmpty>}
            {accountList.data?.map((it) => (
              <CommandItem key={it.id} value={it.id} onSelect={() => handleSelect(it)}>
                {it.name}
                <CheckIcon className={cn('ml-auto', value?.id !== it.id && 'opacity-0')} />
              </CommandItem>
            ))}
          </CommandList>
          <div className="flex">
            <Button variant="link" className="p-0" onClick={handleNew}>
              New Account
            </Button>
            <div className="flex-grow" />
            <Button variant="link" className="p-0" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
