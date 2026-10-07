import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[4px] border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring active:not-aria-[haspopup]:scale-[0.98] disabled:pointer-events-none disabled:bg-secondary disabled:text-muted-foreground disabled:border-secondary aria-invalid:border-border [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground font-semibold hover:bg-muted-foreground hover:text-primary-foreground active:scale-[0.98]',
        outline:
          'border-border bg-background text-foreground hover:bg-secondary hover:border-foreground aria-expanded:bg-secondary',
        secondary:
          'border border-border bg-secondary text-secondary-foreground hover:bg-background hover:border-primary aria-expanded:bg-background active:scale-[0.98]',
        ghost:
          'hover:bg-secondary hover:text-foreground aria-expanded:bg-secondary',
        destructive:
          'bg-destructive text-destructive-foreground font-semibold border-border hover:bg-muted-foreground hover:text-destructive-foreground focus-visible:border-ring focus-visible:ring-ring',
        link: 'text-primary underline-offset-4 hover:underline'
      },
      size: {
        default:
          'h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        xs: "h-6 gap-1 rounded-[4px] px-2 text-xs in-data-[slot=button-group]:rounded-[4px] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[4px] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-[4px] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: 'h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        icon: 'size-8',
        'icon-xs':
          "size-6 rounded-[4px] in-data-[slot=button-group]:rounded-[4px] [&_svg:not([class*='size-'])]:size-3",
        'icon-sm':
          'size-7 rounded-[4px] in-data-[slot=button-group]:rounded-[4px]',
        'icon-lg': 'size-9'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot='button'
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
