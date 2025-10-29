import { Typography, TypographyProps } from '@/components/common/typography/typography'

export interface EmptyStateProps extends TypographyProps {}

export function EmptyState({ children, ...props }: EmptyStateProps) {
  return (
    <Typography variant="muted" {...props}>
      {children || 'No data'}
    </Typography>
  )
}
