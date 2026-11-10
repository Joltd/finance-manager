'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRightIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'

import { usePricingSurveyListStore } from '@/store/pricing-survey'
import { Layout } from '@/components/common/layout/layout'
import { Stack } from '@/components/common/layout/stack'
import { Typography } from '@/components/common/typography/typography'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useRequest } from '@/hooks/use-request'
import { pricingSurveyUrls } from '@/api/pricing-survey'
import { PricingSurveySummary } from '@/types/pricing-survey'
import { PricingSurveySheet, openPricingSurveySheet } from './pricing-survey-sheet'
import { SurveyProgress, formatSurveyPeriod } from './survey-progress'

export default function PricingSurveyPage() {
  const router = useRouter()
  const store = usePricingSurveyListStore()
  const deletePricingSurvey = useRequest(pricingSurveyUrls.id, { method: 'DELETE' })

  useEffect(() => {
    void store.fetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAdd = () => {
    openPricingSurveySheet()
  }

  const handleEdit = (id: string) => {
    openPricingSurveySheet(id)
  }

  const handleOpen = (id: string) => {
    router.push(`/pricing-survey/${id}`)
  }

  const handleDelete = async (id: string) => {
    await deletePricingSurvey.submit({ pathParams: { id } })
    void store.fetch()
  }

  const surveys = store.data ?? []

  return (
    <Layout scrollable width="narrow">
      <PricingSurveySheet />

      <Stack orientation="horizontal" align="center" gap={2}>
        <Typography variant="h3" className="grow">
          Pricing Surveys
        </Typography>
        <Button size="sm" onClick={handleAdd}>
          <PlusIcon />
          Survey
        </Button>
      </Stack>

      {store.loading && !store.data ? (
        <LoadingSkeleton />
      ) : surveys.length === 0 ? (
        <EmptyPlaceholder onAdd={handleAdd} />
      ) : (
        <Stack gap={0} className="divide-y">
          {surveys.map((summary) => (
            <PricingSurveyRow
              key={summary.survey.id}
              summary={summary}
              onEdit={handleEdit}
              onOpen={handleOpen}
              onDelete={(id) => void handleDelete(id)}
            />
          ))}
        </Stack>
      )}
    </Layout>
  )
}

interface PricingSurveyRowProps {
  summary: PricingSurveySummary
  onEdit: (id: string) => void
  onOpen: (id: string) => void
  onDelete: (id: string) => void
}

function PricingSurveyRow({ summary, onEdit, onOpen, onDelete }: PricingSurveyRowProps) {
  const { survey } = summary

  return (
    <Stack gap={2} className="group py-3">
      <Stack orientation="horizontal" align="center" gap={2}>
        <Typography as="span" variant="small" className="min-w-0 truncate leading-snug">
          {survey.country}, {survey.city}
        </Typography>

        <Stack orientation="horizontal" gap={0}>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 w-5 h-5 group-hover:opacity-100 transition-opacity"
            onClick={() => onEdit(survey.id!)}
          >
            <PencilIcon className="w-3! h-3!" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 w-5 h-5 group-hover:opacity-100 transition-opacity"
            onClick={() => onOpen(survey.id!)}
          >
            <ArrowRightIcon className="w-3! h-3!" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 w-5 h-5 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
            onClick={() => onDelete(survey.id!)}
          >
            <Trash2Icon className="w-3! h-3!" />
          </Button>
        </Stack>

        <div className="grow" />

        <Typography as="span" variant="muted" className="shrink-0">
          {survey.currency}
        </Typography>
      </Stack>
      <Typography as="span" variant="muted">
        {formatSurveyPeriod(summary)}
      </Typography>
      <SurveyProgress filled={summary.filled} total={summary.total} />
    </Stack>
  )
}

interface EmptyPlaceholderProps {
  onAdd: () => void
}

function EmptyPlaceholder({ onAdd }: EmptyPlaceholderProps) {
  return (
    <Stack align="center" gap={4} className="py-12 text-center">
      <Stack align="center" gap={1}>
        <Typography variant="large">No surveys yet</Typography>
        <Typography variant="muted">
          A survey collects prices for every pricing item in one country and city and shows what is still missing.
        </Typography>
      </Stack>
      <Button size="lg" onClick={onAdd}>
        <PlusIcon />
        Start a survey
      </Button>
    </Stack>
  )
}

function LoadingSkeleton() {
  return (
    <Stack gap={0}>
      {[1, 2, 3].map((i) => (
        <Stack key={i} gap={2} className="py-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-1 w-full" />
        </Stack>
      ))}
    </Stack>
  )
}
