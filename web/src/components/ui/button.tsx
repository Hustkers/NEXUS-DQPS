import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-[transform,background-color,border-color,box-shadow] duration-150 active:duration-75 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none select-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring active:not-aria-[haspopup]:scale-[0.96] disabled:pointer-events-none disabled:bg-secondary disabled:text-muted-foreground disabled:border-secondary aria-invalid:border-border [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground font-semibold shadow-xs hover:shadow-sm hover:brightness-110 active:brightness-95 active:scale-[0.96] border border-primary/20',
        outline:
          'border-border bg-background/80 backdrop-blur-xs text-foreground shadow-xs hover:bg-secondary hover:border-foreground/40 aria-expanded:bg-secondary active:scale-[0.97]',
        secondary:
          'border border-border/80 bg-secondary/80 backdrop-blur-xs text-secondary-foreground shadow-xs hover:bg-secondary hover:border-foreground/30 aria-expanded:bg-background active:scale-[0.97]',
        ghost:
          'hover:bg-secondary/70 hover:text-foreground aria-expanded:bg-secondary active:scale-[0.96]',
        destructive:
          'bg-destructive text-destructive-foreground font-semibold border-border hover:brightness-110 active:brightness-95 active:scale-[0.96] shadow-xs focus-visible:border-ring focus-visible:ring-ring',
        link: 'text-primary underline-offset-4 hover:underline'
      },
      size: {
        default:
          'h-8 gap-1.5 px-3 rounded-lg has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5',
        xs: "h-6 gap-1 rounded-md px-2 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-lg px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: 'h-9.5 gap-2 px-3.5 rounded-xl text-sm font-semibold has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
        icon: 'size-8 rounded-lg',
        'icon-xs':
          "size-6 rounded-md in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3",
        'icon-sm':
          'size-7 rounded-lg in-data-[slot=button-group]:rounded-lg',
        'icon-lg': 'size-9.5 rounded-xl'
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
