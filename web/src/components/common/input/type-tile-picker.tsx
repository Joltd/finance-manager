import { cn } from '@/lib/utils'

export interface TypeTileItem<T extends string> {
  value: T
  label: string
  icon: React.ReactNode
}

export interface TypeTilePickerProps<T extends string> {
  items: TypeTileItem<T>[]
  value?: T
  onChange: (value: T) => void
  columns?: 1 | 2
  className?: string
}

export function TypeTilePicker<T extends string>({
  items,
  value,
  onChange,
  columns = 1,
  className,
}: TypeTilePickerProps<T>) {
  return (
    <div className={cn('grid gap-3', columns === 2 ? 'grid-cols-2' : 'grid-cols-1', className)}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={cn(
            'flex flex-col items-center justify-center gap-3 rounded-md border p-8 select-none transition-colors',
            item.value === value
              ? 'border-primary bg-primary/5'
              : 'bg-background hover:bg-accent',
          )}
        >
          {item.icon}
          <span className="text-base font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  )
}
