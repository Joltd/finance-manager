import { ChartTooltip } from '@/components/ui/chart'
import { Cell, Label, Pie, PieChart, ResponsiveContainer } from 'recharts'
import * as React from 'react'
import { OneLineChartTooltipContent } from '@/components/common/chart/custom'

export interface AdvancedPieChartProps<T> {
  data: T[]
  resolveId: (data: T) => string
  resolveSegmentSize: (entry: T) => number
  renderName: (entry: T) => React.ReactNode
  renderValue: (entry: T) => React.ReactNode
  renderAccentValue: () => React.ReactNode
  onSegmentClick?: (entry: T) => void
}

export function RingChart<T>({
  data,
  resolveId,
  resolveSegmentSize,
  renderName,
  renderValue,
  renderAccentValue,
  onSegmentClick,
}: AdvancedPieChartProps<T>) {
  return (
    <ResponsiveContainer aspect={1} width={300}>
      <PieChart>
        <Pie
          data={data}
          nameKey={(entry) => resolveId(entry)}
          dataKey={(entry) => resolveSegmentSize(entry)}
          startAngle={90}
          endAngle={-270}
          innerRadius={95}
          onClick={(data) => onSegmentClick?.(data)}
        >
          {data.map((entry, index) => (
            <Cell
              key={resolveId(entry)}
              fill={`var(--chart-${index + 1})`}
              stroke={`var(--chart-${index + 1})`}
            />
          ))}
          <Label
            content={({ viewBox }) =>
              viewBox &&
              'cx' in viewBox &&
              'cy' in viewBox && (
                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                  {renderAccentValue()}
                </text>
              )
            }
          />
        </Pie>
        <ChartTooltip
          content={
            <OneLineChartTooltipContent
              name={(entry) => renderName(entry.payload)}
              value={(entry) => renderValue(entry.payload)}
            />
          }
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
