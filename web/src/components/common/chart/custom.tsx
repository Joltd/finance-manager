import React from 'react'
import * as RechartsPrimitive from 'recharts'
import { NameType, Payload, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import { Props } from 'recharts/types/component/Label'
import { AmountLabelNew } from '@/components/common/typography/amount-label'
import { BarProps } from 'recharts'
import { MIN_BAR_WIDTH } from '@/components/common/chart/constant'

export interface OneLineChartTooltipContentProps
  extends React.ComponentProps<typeof RechartsPrimitive.Tooltip> {
  name: (entry: Payload<ValueType, NameType>) => React.ReactNode
  value: (entry: Payload<ValueType, NameType>) => React.ReactNode
}

export function OneLineChartTooltipContent({
  name,
  value,
  payload,
}: OneLineChartTooltipContentProps) {
  if (!payload?.length) {
    return null
  }

  const [entry] = payload
  return (
    <div className="flex flex-col bg-background px-2.5 py-1.5 gap-1.5 rounded-lg border border-border">
      <div className="flex gap-1.5 items-center">
        <div
          className="shrink-0 rounded-sm h-2.5 w-2.5"
          style={{ backgroundColor: entry.fill || entry.payload.fill }}
        />
        {name(entry)}
      </div>
      {value(entry)}
    </div>
  )
}

export interface LabelContentProps extends Props {
  variant: 'above' | 'outsideRight'
  renderValue?: (value: any) => React.ReactNode
}

export function BarLabelContent({
  variant,
  x,
  y,
  width,
  height,
  value,
  renderValue,
}: LabelContentProps) {
  if (
    typeof x !== 'number' ||
    typeof y !== 'number' ||
    typeof width !== 'number' ||
    typeof height !== 'number'
  ) {
    return null
  }
  const actualProps: any =
    variant === 'above'
      ? {
          x,
          y,
          dy: -10,
          textAnchor: 'start',
          dominantBaseline: 'auto',
        }
      : variant === 'outsideRight'
        ? {
            x: (x as any) + Math.max(width as any, MIN_BAR_WIDTH),
            y,
            dx: 5,
            dy: (height as any) / 2,
            textAnchor: 'start',
            dominantBaseline: 'central',
          }
        : {}

  return (
    <text {...actualProps} fill="var(--muted-foreground)">
      {renderValue?.(value) || value}
    </text>
  )
}

export function BarShape({ x, y, width, height, fill }: BarProps) {
  return (
    <rect
      x={x}
      y={y}
      width={Math.max(width as any, MIN_BAR_WIDTH)}
      height={height}
      fill={fill}
      rx={5}
      ry={5}
    />
  )
}
