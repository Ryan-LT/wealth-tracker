import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='skeleton'
      className={cn(
        'inline-block animate-pulse rounded-md bg-accent align-middle',
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
