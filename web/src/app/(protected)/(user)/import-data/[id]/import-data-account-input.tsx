'use client'

import { useState } from 'react'
import { SparklesIcon } from 'lucide-react'

import { accountUrls } from '@/api/account'
import { importDataUrls } from '@/api/import-data'
import { ComboboxGroup, ComboboxInput } from '@/components/common/input/combobox-input'
import { useRequest } from '@/hooks/use-request'
import { useImportDataStore } from '@/store/import-data'
import { useOperationPresetStore } from '@/store/operation-preset'
import { Account, AccountReference, AccountType } from '@/types/account'
import { ImportDataEntryData, ImportDataEntryUpdate, ImportDataParsingStatus } from '@/types/import-data'
import { OperationType } from '@/types/operation'

type CounterpartSide = 'accountFrom' | 'accountTo'

const SUGGESTED_GROUP = 'suggested'

const counterpartTypes: Record<OperationType, AccountType> = {
  [OperationType.EXPENSE]: AccountType.EXPENSE,
  [OperationType.INCOME]: AccountType.INCOME,
  [OperationType.TRANSFER]: AccountType.ACCOUNT,
  [OperationType.EXCHANGE]: AccountType.ACCOUNT,
}

/**
 * Side of the entry the counterpart account belongs to. For transfers and exchanges the direction
 * is known only when the import account is already on one of the sides.
 */
export function resolveCounterpartSide(
  entry: ImportDataEntryData,
  mainAccountId: string,
): CounterpartSide | undefined {
  switch (entry.type) {
    case OperationType.EXPENSE:
      return 'accountTo'
    case OperationType.INCOME:
      return 'accountFrom'
    case OperationType.TRANSFER:
    case OperationType.EXCHANGE:
      if (entry.accountFrom?.id === mainAccountId) return 'accountTo'
      if (entry.accountTo?.id === mainAccountId) return 'accountFrom'
      return undefined
    default:
      return undefined
  }
}

/**
 * Counterpart account picker for an import entry row. Shows the suggestions computed during
 * import processing above the regular account search and allows creating an account
 * from the typed query. The choice is saved to the entry right away.
 */
export function ImportDataAccountInput({
  entry,
  mainAccount,
  side,
}: {
  entry: ImportDataEntryData
  mainAccount: AccountReference
  side: CounterpartSide
}) {
  const { data: importData } = useImportDataStore()
  const presetStore = useOperationPresetStore()
  const accountType = counterpartTypes[entry.type!]

  const searchReq = useRequest<AccountReference[], unknown, { type?: AccountType; mask?: string }>(
    accountUrls.reference,
    { method: 'GET' },
  )
  const createReq = useRequest<Account, Account>(accountUrls.root)
  const updateReq = useRequest<void, ImportDataEntryUpdate, never, { id: string; entryId: string }>(
    importDataUrls.entryById,
  )

  // the row is refreshed by SSE after the save, until then the picked account is shown locally
  const [pending, setPending] = useState<{ entry: ImportDataEntryData; account: AccountReference }>()
  const value = pending?.entry === entry ? pending.account : entry[side]

  // suggestions are computed for the type at processing time and may include deleted accounts
  const validSuggestions = entry.suggestions.filter(
    (suggestion) => suggestion.account.type === accountType && !suggestion.account.deleted,
  )
  const suggestions = validSuggestions.map((suggestion) => suggestion.account)
  const totalScore = validSuggestions.reduce((sum, suggestion) => sum + suggestion.score, 0)
  const shareById = new Map(
    validSuggestions.map((suggestion) => [
      suggestion.account.id,
      totalScore > 0 ? suggestion.score / totalScore : 0,
    ]),
  )

  const search = (mask: string) =>
    searchReq.submit({ queryParams: { type: accountType, mask: mask || undefined } })

  const create = async (name: string): Promise<AccountReference> => {
    const account = await createReq.submit({
      body: { name, type: accountType, deleted: false },
    })
    return {
      id: account.id!,
      name: account.name,
      type: account.type,
      deleted: account.deleted,
      reviseDate: account.reviseDate,
    }
  }

  const handleChange = async (account: AccountReference) => {
    if (!importData || !entry.date || !entry.type) return
    const mainSide: CounterpartSide = side === 'accountTo' ? 'accountFrom' : 'accountTo'
    setPending({ entry, account })
    try {
      await updateReq.submit({
        pathParams: { id: importData.id, entryId: entry.id },
        body: {
          date: entry.date,
          type: entry.type,
          amountFrom: entry.amountFrom,
          amountTo: entry.amountTo,
          description: entry.description,
          [mainSide]: mainAccount,
          [side]: account,
        } as ImportDataEntryUpdate,
      })
      presetStore.registerAccountUsage(account)
    } catch {
      setPending(undefined)
    }
  }

  const groups: ComboboxGroup<AccountReference>[] = [
    {
      key: SUGGESTED_GROUP,
      label: (
        <span className="flex items-center gap-1">
          <SparklesIcon className="size-3" />
          Suggested
        </span>
      ),
      items: suggestions,
      renderMeta: (account) => <SuggestionShare share={shareById.get(account.id) ?? 0} />,
    },
    { key: 'accounts', label: 'Accounts', search },
  ]

  return (
    <ComboboxInput<AccountReference>
      size="sm"
      className="w-auto max-w-64"
      value={value}
      onChange={handleChange}
      getId={(account) => account.id}
      getLabel={(account) => account.name}
      groups={groups}
      onCreate={create}
      disabled={importData?.parsingStatus !== ImportDataParsingStatus.DONE}
      createLabel={(query) => `Create "${query}"`}
      placeholder={
        <>
          Choose account
          {suggestions.length > 0 && (
            <span className="rounded-sm bg-primary/10 px-1 text-primary">
              {suggestions.length} suggested
            </span>
          )}
        </>
      }
      renderValue={(account, { group }) => (
        <>
          {group === SUGGESTED_GROUP && <SparklesIcon className="size-3 shrink-0 text-primary" />}
          <span className="truncate">{account.name}</span>
        </>
      )}
    />
  )
}

function SuggestionShare({ share }: { share: number }) {
  return (
    <span className="flex shrink-0 items-center gap-1.5">
      <span className="h-1 w-10 overflow-hidden rounded-full bg-muted">
        <span className="block h-full bg-primary/60" style={{ width: `${share * 100}%` }} />
      </span>
      <span className="w-8 text-right text-xs text-muted-foreground">{Math.round(share * 100)}%</span>
    </span>
  )
}
