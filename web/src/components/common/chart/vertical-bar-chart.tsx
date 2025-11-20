import { Bar, BarChart, BarProps, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import {
  BarLabelContent,
  BarShape,
  OneLineChartTooltipContent,
} from '@/components/common/chart/custom'
import { ChartTooltip } from '@/components/ui/chart'
import * as React from 'react'
import { BAR_SIZE, LANE_SIZE } from '@/components/common/chart/constant'

export interface VerticalBarChartProps<T> {
  data: T[]
  resolveId: (entry: T) => string
  resolveBarSize: (entry: T) => number
  renderName: (entry: T, as?: 'tspan') => React.ReactNode
  renderValue: (entry: T, as?: 'tspan') => React.ReactNode
  onBarClick?: (entry: T) => void
}

export function VerticalBarChart<T>({
  data,
  resolveId,
  resolveBarSize,
  renderName,
  renderValue,
  onBarClick,
}: VerticalBarChartProps<T>) {
  return (
    <ResponsiveContainer width={300} height={data.length * LANE_SIZE}>
      <BarChart accessibilityLayer data={data} layout="vertical" margin={{ right: 120 }}>
        <XAxis type="number" dataKey={(entry) => resolveBarSize(entry)} hide />
        <YAxis type="category" dataKey={(entry) => resolveId(entry)} hide />
        <Bar
          dataKey={(entry) => resolveBarSize(entry)}
          fill="var(--primary)"
          radius={5}
          onClick={onBarClick}
          barSize={BAR_SIZE}
          shape={(props: BarProps) => <BarShape {...props} />}
        >
          <LabelList
            dataKey={(entry) => entry}
            content={(props) => (
              <BarLabelContent
                variant="above"
                renderValue={(value) => renderName(value as T, 'tspan')}
                {...props}
              />
            )}
          />
          <LabelList
            dataKey={(entry) => entry}
            content={(props) => (
              <BarLabelContent
                variant="outsideRight"
                renderValue={(value) => renderValue(value as T, 'tspan')}
                {...props}
              />
            )}
          />
        </Bar>
        <ChartTooltip
          cursor={false}
          content={
            <OneLineChartTooltipContent
              name={(entry) => renderName(entry.payload)}
              value={(entry) => renderValue(entry.payload)}
            />
          }
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
