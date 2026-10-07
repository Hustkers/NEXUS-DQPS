import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-[4px] border border-transparent px-2 py-0.5 text-xs font-mono font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-border aria-invalid:ring-1 aria-invalid:ring-ring [&>svg]:pointer-events-none [&>svg]:size-3!',
  {
    variants: {
      variant: {
        default: 'border border-border bg-secondary text-secondary-foreground [a]:hover:bg-background',
        secondary: 'border border-border bg-secondary text-secondary-foreground [a]:hover:bg-background',
        destructive: 'bg-primary text-primary-foreground font-semibold [a]:hover:bg-muted-foreground',
        outline: 'border border-border bg-background text-muted-foreground [a]:hover:bg-secondary [a]:hover:text-foreground',
        ghost: 'text-foreground hover:bg-secondary hover:text-foreground',
        link: 'text-primary underline-offset-4 hover:underline'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

function Badge({
  className,
  variant = 'default',
  render,
  ...props
}: useRender.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      {
        className: cn(badgeVariants({ variant }), className)
      },
      props
    ),
    render,
    state: {
      slot: 'badge',
      variant
    }
  });
}

export { Badge, badgeVariants };
